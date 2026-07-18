import { useRef, useState, useEffect } from 'react'
import { Moon, Sun, Monitor, Download, Upload, Trash2, Info, ChevronRight, Palette, Database, ShieldAlert, Heart, Activity, Globe } from 'lucide-react'
import { exportData, importData, resetData, getSettings, updateSettings } from '../../utils/storage'
import { useTranslation } from 'react-i18next'

// Helper for classes
function clsx(...args) { return args.filter(Boolean).join(' ') }

function SettingsSection({ title, icon: Icon, children, colorClass }) {
  return (
    <section className="mb-8 anim-up">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon size={16} className={colorClass} />
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">{title}</h2>
      </div>
      <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
        <div className="divide-y divide-white/5">
          {children}
        </div>
      </div>
    </section>
  )
}

function SettingsItem({ icon: Icon, title, description, rightElement, onClick, isDestructive }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between p-4 sm:px-5 transition-colors text-left",
        onClick ? "hover:bg-white/[0.03] cursor-pointer" : ""
      )}
    >
      <div className="flex items-center gap-4">
        <div className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5",
          isDestructive ? "bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]" : "bg-white/5"
        )}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[15px] font-semibold" style={{ color: isDestructive ? '#f87171' : 'var(--t-1)' }}>{title}</p>
          {description && (
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--t-3)' }}>{description}</p>
          )}
        </div>
      </div>
      {rightElement && (
        <div className="flex-shrink-0 ml-4">
          {rightElement}
        </div>
      )}
      {!rightElement && onClick && (
        <ChevronRight size={18} className="flex-shrink-0" style={{ color: 'var(--t-3)' }} />
      )}
    </Component>
  )
}

// ─── Status Toast ─────────────────────────────────────────────────────────────
function StatusToast({ message, type }) {
  if (!message) return null
  const colors = {
    ok: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.2)' },
    err: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.2)' },
  }
  const c = colors[type] || colors.ok
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-[13px] font-medium shadow-lg anim-up"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)' }}
    >
      {message}
    </div>
  )
}

export default function SettingsPage() {
  const { i18n, t } = useTranslation()
  const importRef = useRef(null)
  const [status, setStatus] = useState({ message: '', type: 'ok' })
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState(i18n.language || 'en')
  const [goals, setGoals] = useState({ calories: 2200, protein: 120, fat: 70, carbs: 250 })
  const [profile, setProfile] = useState({ height: '', weight: '', age: '', gender: 'male', activityLevel: 'medium' })

  useEffect(() => {
    getSettings().then(s => {
      if (s) {
        if (s.theme) setTheme(s.theme)
        if (s.goals) setGoals(s.goals)
        if (s.profile) setProfile(s.profile)
        if (s.language) {
          setLanguage(s.language)
          i18n.changeLanguage(s.language)
        }
      }
    })
  }, [i18n])

  function showStatus(message, type = 'ok') {
    setStatus({ message, type })
    setTimeout(() => setStatus({ message: '', type: 'ok' }), 4000)
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleThemeChange(newTheme) {
    setTheme(newTheme)
    await updateSettings({ theme: newTheme })
    if (newTheme === 'light') {
      document.documentElement.classList.add('theme-light')
    } else {
      document.documentElement.classList.remove('theme-light')
    }
  }

  async function handleLanguageChange(lang) {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    localStorage.setItem('app_lang', lang)
    await updateSettings({ language: lang })
  }

  async function handleGoalChange(field, value) {
    const val = parseInt(value, 10) || 0
    const newGoals = { ...goals, [field]: val }
    setGoals(newGoals)
    await updateSettings({ goals: newGoals })
  }

  async function handleProfileChange(field, value) {
    const newProfile = { ...profile, [field]: value }
    setProfile(newProfile)
    await updateSettings({ profile: newProfile })
  }

  async function handleExport() {
    const ok = await exportData()
    showStatus(
      ok ? t('settings.backupImported') : t('settings.exportError'),
      ok ? 'ok' : 'err'
    )
  }

  function handleImportClick() {
    importRef.current?.click()
  }

  async function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    const result = await importData(file)
    showStatus(result.message, result.ok ? 'ok' : 'err')
    if (result.ok) {
      const s = await getSettings()
      if (s.theme) handleThemeChange(s.theme)
      if (s.goals) setGoals(s.goals)
    }
  }

  async function handleReset() {
    if (!confirm(t('settings.confirmReset'))) return
    await resetData()
    const s = await getSettings()
    if (s.theme) handleThemeChange(s.theme)
    if (s.goals) setGoals(s.goals)
    showStatus(t('settings.dataCleared'), 'ok')
  }

  const goalFields = [
    { field: 'calories', labelKey: 'settings.caloriesKcal' },
    { field: 'protein', labelKey: 'settings.proteinG' },
    { field: 'fat', labelKey: 'settings.fatG' },
    { field: 'carbs', labelKey: 'settings.carbsG' },
  ]

  return (
    <main
      id="main-content"
      aria-label={t('settings.title', 'Settings')}
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8" style={{ paddingBottom: 'calc(6rem + 24px)' }}>

        {/* Header */}
        <div className="mb-8 anim-down">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--t-1)' }}>{t('settings.title', 'Settings')}</h1>
          <p className="text-[14px]" style={{ color: 'var(--t-3)' }}>{t('settings.subtitle', 'Manage your preferences and app data.')}</p>
        </div>

        {/* Appearance */}
        <SettingsSection title={t('settings.appearance', 'Appearance')} icon={Palette} colorClass="text-violet-400">
          <SettingsItem
            icon={Monitor}
            title={t('settings.themeTitle', 'Theme')}
            description={t('settings.themeDescription', 'Select your preferred color theme.')}
            rightElement={
              <div className="flex items-center rounded-lg p-1 border border-white/10" style={{ background: 'var(--bg-raised)' }}>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-[12px] font-medium border",
                    theme === 'dark'
                      ? "bg-white/10 shadow-sm border-white/10"
                      : "text-gray-400 hover:text-white border-transparent"
                  )}
                  style={theme === 'dark' ? { color: 'var(--t-1)' } : {}}
                >
                  <Moon size={14} /> {t('settings.dark', 'Dark')}
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-[12px] font-medium border",
                    theme === 'light'
                      ? "bg-white/10 shadow-sm border-white/10"
                      : "text-gray-400 hover:text-white border-transparent"
                  )}
                  style={theme === 'light' ? { color: 'var(--t-1)' } : {}}
                >
                  <Sun size={14} /> {t('settings.light', 'Light')}
                </button>
              </div>
            }
          />
          <SettingsItem
            icon={Globe}
            title={t('settings.language', 'Language')}
            description={t('settings.languageDescription', 'Select your preferred language.')}
            rightElement={
              <div className="flex items-center rounded-lg p-1 border border-white/10" style={{ background: 'var(--bg-raised)' }}>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-[12px] font-medium border",
                    language === 'en'
                      ? "bg-white/10 shadow-sm border-white/10"
                      : "text-gray-400 hover:text-white border-transparent"
                  )}
                  style={language === 'en' ? { color: 'var(--t-1)' } : {}}
                >
                  {t('language.english', 'English')}
                </button>
                <button
                  onClick={() => handleLanguageChange('ua')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-[12px] font-medium border",
                    language === 'ua'
                      ? "bg-white/10 shadow-sm border-white/10"
                      : "text-gray-400 hover:text-white border-transparent"
                  )}
                  style={language === 'ua' ? { color: 'var(--t-1)' } : {}}
                >
                  {t('language.ukrainian', 'Українська')}
                </button>
              </div>
            }
          />
        </SettingsSection>

        {/* Nutrition Goals */}
        <SettingsSection title={t('settings.nutritionGoals', 'Nutrition Goals')} icon={Activity} colorClass="text-amber-400">
          <div className="p-4 sm:px-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {goalFields.map(({ field, labelKey }) => (
                <div key={field}>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--t-2)' }}>{t(labelKey)}</label>
                  <input
                    type="number"
                    value={goals[field]}
                    onChange={(e) => handleGoalChange(field, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500"
                    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </SettingsSection>

        {/* Profile Details */}
        <SettingsSection title={t('settings.profile', 'Profile')} icon={Heart} colorClass="text-pink-400">
          <div className="p-4 sm:px-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--t-2)' }}>{t('settings.height', 'Height (cm)')}</label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => handleProfileChange('height', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--t-2)' }}>{t('settings.weight', 'Weight (kg)')}</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => handleProfileChange('weight', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--t-2)' }}>{t('settings.age', 'Age')}</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => handleProfileChange('age', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--t-2)' }}>{t('settings.gender', 'Gender (optional)')}</label>
                <select
                  value={profile.gender}
                  onChange={(e) => handleProfileChange('gender', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
                >
                  <option value="male">{t('settings.male', 'Male')}</option>
                  <option value="female">{t('settings.female', 'Female')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--t-2)' }}>{t('settings.activityLevel', 'Activity Level (optional)')}</label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) => handleProfileChange('activityLevel', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
                >
                  <option value="low">{t('settings.low', 'Low')}</option>
                  <option value="medium">{t('settings.medium', 'Medium')}</option>
                  <option value="high">{t('settings.high', 'High')}</option>
                </select>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title={t('settings.dataManagement', 'Data Management')} icon={Database} colorClass="text-sky-400">
          <SettingsItem
            icon={Download}
            title={t('settings.exportData', 'Export Data')}
            description={t('settings.exportDataDesc', 'Download all your health and habit data as JSON.')}
            onClick={handleExport}
          />
          <SettingsItem
            icon={Upload}
            title={t('settings.importData', 'Import Data')}
            description={t('settings.importDataDesc', 'Restore your data from a previous backup file.')}
            onClick={handleImportClick}
          />
          {/* Hidden file input for import */}
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title={t('settings.dangerZone', 'Danger Zone')} icon={ShieldAlert} colorClass="text-red-400">
          <SettingsItem
            icon={Trash2}
            title={t('settings.resetAllData', 'Reset All Data')}
            description={t('settings.resetAllDataDesc', 'Permanently delete all your records and start fresh.')}
            isDestructive={true}
            onClick={handleReset}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title={t('settings.about', 'About')} icon={Info} colorClass="text-emerald-400">
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl border border-white/10 mb-2">
              <Heart size={32} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>LifeTracker</p>
              <p className="text-sm mt-1 font-medium" style={{ color: 'var(--t-3)' }}>{t('settings.version', 'Version {{version}} · SQLite', { version: '1.0.0' })}</p>
            </div>
            <p className="text-[13px] max-w-sm mt-2 leading-relaxed" style={{ color: 'var(--t-2)' }}>
              {t('settings.aboutDescription', 'Designed with care to help you track your daily wellness, habits, and productivity. Your data stays entirely on your device via SQLite (WebAssembly).')}
            </p>
          </div>
        </SettingsSection>

      </div>

      <StatusToast message={status.message} type={status.type} />
    </main>
  )
}
