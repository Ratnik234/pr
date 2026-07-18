#!/usr/bin/env node

/**
 * translate-locales.mjs
 *
 * Usage:
 *   node scripts/translate-locales.mjs <lang> [--force]
 *
 * Examples:
 *   node scripts/translate-locales.mjs ua          # translate only missing keys
 *   node scripts/translate-locales.mjs ua --force   # re-translate all keys
 *   npm run translate -- ua
 *   npm run translate -- ua --force
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import translate from 'google-translate-api-x';

// ─── Paths ────────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const LOCALES_DIR = path.resolve(__dirname, '..', 'src', 'locales');

// ─── Language-code mapping (app code → Google Translate code) ─────────────────
const LANG_MAP = {
  ua: 'uk',  // Ukrainian
};

// ─── Helpers: flatten / unflatten nested objects ──────────────────────────────

/** Flatten { a: { b: "x" } } → { "a.b": "x" } */
function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

/** Unflatten { "a.b": "x" } → { a: { b: "x" } }, preserving key order from `orderedKeys` */
function unflatten(flat, orderedKeys) {
  const result = {};
  for (const dotKey of orderedKeys) {
    if (!(dotKey in flat)) continue;
    const parts = dotKey.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = flat[dotKey];
  }
  return result;
}

// ─── Helpers: variable protection ─────────────────────────────────────────────

/** Replace {{var}} with __VAR0__, __VAR1__ etc. Returns { text, map } */
function protectVariables(text) {
  const map = [];
  const replaced = text.replace(/\{\{(\s*\w+\s*)\}\}/g, (_match, inner) => {
    const token = `__VAR${map.length}__`;
    map.push(`{{${inner}}}`);
    return token;
  });
  return { text: replaced, map };
}

/** Restore __VAR0__ → original {{var}} */
function restoreVariables(text, map) {
  let restored = text;
  for (let i = 0; i < map.length; i++) {
    // Google Translate sometimes adds spaces around tokens
    const regex = new RegExp(`__\\s*VAR\\s*${i}\\s*__`, 'gi');
    restored = restored.replace(regex, map[i]);
  }
  return restored;
}

// ─── Small delay helper ───────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Parse CLI args
  const args = process.argv.slice(2);
  const lang = args.find((a) => !a.startsWith('--'));
  const force = args.includes('--force');

  if (!lang) {
    console.error('Usage: node scripts/translate-locales.mjs <lang> [--force]');
    process.exit(1);
  }

  const googleLang = LANG_MAP[lang] || lang;

  // 1. Read en.json (source of truth)
  const enPath = path.join(LOCALES_DIR, 'en.json');
  const enData = JSON.parse(await readFile(enPath, 'utf-8'));
  const enFlat = flatten(enData);
  const enKeys = Object.keys(enFlat);

  // 2. Read target lang file (if exists)
  const targetPath = path.join(LOCALES_DIR, `${lang}.json`);
  let targetFlat = {};
  if (existsSync(targetPath)) {
    try {
      const targetData = JSON.parse(await readFile(targetPath, 'utf-8'));
      targetFlat = flatten(targetData);
    } catch {
      console.warn(`⚠  Could not parse ${targetPath}, starting from scratch.`);
    }
  }

  // Preserve any extra keys in target that are NOT in en.json
  const extraKeys = Object.keys(targetFlat).filter((k) => !enKeys.includes(k));

  // 3. Determine which keys to translate
  const keysToTranslate = force
    ? enKeys
    : enKeys.filter((k) => !(k in targetFlat));

  if (keysToTranslate.length === 0) {
    console.log('✅ All keys are already translated. Nothing to do.');
    process.exit(0);
  }

  console.log(
    `\n🌐 Translating ${keysToTranslate.length} key(s) from en → ${lang} (Google Translate code: ${googleLang})${force ? ' [--force]' : ''}\n`
  );

  // 4. Translate missing/all keys
  let translated = 0;
  let failed = 0;

  for (let i = 0; i < keysToTranslate.length; i++) {
    const key = keysToTranslate[i];
    const original = enFlat[key];
    const idx = `[${i + 1}/${keysToTranslate.length}]`;

    // Protect {{variables}}
    const { text: safeText, map: varMap } = protectVariables(String(original));

    try {
      const res = await translate(safeText, { from: 'en', to: googleLang });
      const translatedText = restoreVariables(res.text, varMap);
      targetFlat[key] = translatedText;
      translated++;
      console.log(`  ${idx} ${key} → ${translatedText}`);
    } catch (err) {
      failed++;
      console.warn(`  ${idx} ⚠ FAILED ${key}: ${err.message}`);
      // Leave key untranslated so a re-run will pick it up
    }

    // Rate-limit delay (skip after last item)
    if (i < keysToTranslate.length - 1) {
      await sleep(400);
    }
  }

  // 5. Build ordered key list: en keys first (in order), then any extra target keys
  const allKeys = [...enKeys, ...extraKeys];

  // 6. Unflatten and write
  const finalObj = unflatten(targetFlat, allKeys);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, JSON.stringify(finalObj, null, 2) + '\n', 'utf-8');

  console.log(`\n✅ Done! Translated: ${translated}, Failed: ${failed}`);
  console.log(`   Written to: ${targetPath}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
