import { Moon, Sun, Monitor, Download, Upload, Trash2, Info, ChevronRight, Palette, Database, ShieldAlert, Heart, Languages } from 'lucide-react'
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
          isDestructive ? "bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]" : "bg-white/5 text-gray-300"
        )}>
          <Icon size={18} />
        </div>
        <div>
          <p className={clsx("text-[15px] font-semibold", isDestructive ? "text-red-400" : "text-gray-200")}>{title}</p>
          {description && (
            <p className="text-[12px] text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {rightElement && (
        <div className="flex-shrink-0 ml-4">
          {rightElement}
        </div>
      )}
      {!rightElement && onClick && (
        <ChevronRight size={18} className="text-gray-500 flex-shrink-0" />
      )}
    </Component>
  )
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  
  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };
  
  return (
    <main
      id="main-content"
      aria-label="Settings page"
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8" style={{ paddingBottom: 'calc(6rem + 24px)' }}>
        
        {/* Header */}
        <div className="mb-8 anim-down">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">{t('settings.title')}</h1>
          <p className="text-[14px]" style={{ color: 'var(--t-3)' }}>Manage your preferences and app data.</p>
        </div>

        {/* Language */}
        <SettingsSection title={t('settings.language')} icon={Languages} colorClass="text-blue-400">
          <SettingsItem
            icon={Languages}
            title={t('settings.language')}
            description="Choose your preferred language."
            rightElement={
              <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/10">
                <button onClick={() => toggleLanguage('en')} className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border", i18n.language === 'en' ? "bg-white/10 text-white shadow-sm border-white/10" : "text-gray-400 hover:text-white border-transparent")}>
                  EN
                </button>
                <button onClick={() => toggleLanguage('ua')} className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border", i18n.language === 'ua' ? "bg-white/10 text-white shadow-sm border-white/10" : "text-gray-400 hover:text-white border-transparent")}>
                  UA
                </button>
              </div>
            }
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance" icon={Palette} colorClass="text-violet-400">
          <SettingsItem
            icon={Monitor}
            title="Theme"
            description="Select your preferred color theme."
            rightElement={
              <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/10">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 text-white shadow-sm transition-all text-[12px] font-medium border border-white/10">
                  <Moon size={14} /> Dark
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-400 hover:text-white transition-all text-[12px] font-medium border border-transparent">
                  <Sun size={14} /> Light
                </button>
              </div>
            }
          />
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data Management" icon={Database} colorClass="text-sky-400">
          <SettingsItem
            icon={Download}
            title="Export Data"
            description="Download all your health and habit data as a CSV."
            onClick={() => {}}
          />
          <SettingsItem
            icon={Upload}
            title="Import Data"
            description="Restore your data from a previous backup file."
            onClick={() => {}}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title="Danger Zone" icon={ShieldAlert} colorClass="text-red-400">
          <SettingsItem
            icon={Trash2}
            title="Reset All Data"
            description="Permanently delete all your records and start fresh."
            isDestructive={true}
            onClick={() => {}}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" icon={Info} colorClass="text-emerald-400">
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl border border-white/10 mb-2">
              <Heart size={32} className="text-white" fill="white" />
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">LifeTracker</p>
              <p className="text-sm text-gray-400 mt-1 font-medium">Version 1.0.0</p>
            </div>
            <p className="text-[13px] text-gray-400 max-w-sm mt-2 leading-relaxed">
              Designed with care to help you track your daily wellness, habits, and productivity. Your data stays entirely on your device.
            </p>
          </div>
        </SettingsSection>

      </div>
    </main>
  )
}
