import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Ruler, Weight, Cake, Users, Zap, Pencil, Crown } from 'lucide-react'
import { getCurrentUserInfo, getSettings, updateSettings } from '../../utils/storage'

function clsx(...args) { return args.filter(Boolean).join(' ') }

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, unit }) {
    const hasValue = value !== '' && value !== null && value !== undefined
    return (
        <div className="flex items-center justify-between p-4 sm:px-5">
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5"
                    style={{ background: 'var(--bg-raised)', color: 'var(--t-2)' }}
                >
                    <Icon size={16} />
                </div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--t-2)' }}>{label}</p>
            </div>
            <p className="text-[14px] font-semibold" style={{ color: hasValue ? 'var(--t-1)' : 'var(--t-3)' }}>
                {hasValue ? `${value}${unit || ''}` : '—'}
            </p>
        </div>
    )
}

const GENDER_LABELS = { male: 'Чоловіча', female: 'Жіноча' }
const ACTIVITY_LABELS = { low: 'Низька', medium: 'Середня', high: 'Висока' }

export default function ProfilePage() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [username, setUsername] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [isVip, setIsVip] = useState(false)
    const [profile, setProfile] = useState({ height: '', weight: '', age: '', gender: 'male', activityLevel: 'medium' })
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        getCurrentUserInfo().then(info => {
            if (info?.username) setUsername(info.username)
        })
        getSettings().then(s => {
            if (s?.avatar) setAvatarUrl(s.avatar)
            if (s?.profile) setProfile(s.profile)
            setIsVip(!!s?.isVip)
        })
    }, [])

    function handleAvatarClick() {
        fileInputRef.current?.click()
    }

    function handleAvatarChange(e) {
        const file = e.target.files[0]
        e.target.value = ''
        if (!file) return
        if (!file.type.startsWith('image/')) return

        setUploading(true)
        const reader = new FileReader()
        reader.onload = async () => {
            const dataUrl = reader.result
            setAvatarUrl(dataUrl)
            await updateSettings({ avatar: dataUrl })
            setUploading(false)
        }
        reader.onerror = () => setUploading(false)
        reader.readAsDataURL(file)
    }

    const initial = username ? username.charAt(0).toUpperCase() : 'U'

    return (
        <main
            id="main-content"
            aria-label="Profile page"
            className="flex-1 overflow-y-auto"
            style={{ minHeight: 0 }}
        >
            <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-8" style={{ paddingBottom: 'calc(6rem + 24px)' }}>

                {/* Header */}
                <div className="mb-8 anim-down">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--t-1)' }}>Профіль</h1>
                    <p className="text-[14px]" style={{ color: 'var(--t-3)' }}>Твоя особиста інформація та дані акаунта.</p>
                </div>

                {/* Identity card */}
                <div className="glass-card mb-8 anim-up p-5 sm:p-6 flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                        <div
                            className="relative w-20 h-20 rounded-[20px] flex items-center justify-center overflow-hidden"
                            style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 6px 20px rgba(124,58,237,0.4)' }}
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-white select-none">{initial}</span>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleAvatarClick}
                            aria-label="Change avatar"
                            title="Змінити аватар"
                            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            style={{ background: 'var(--bg-raised)', border: '2px solid var(--bg-panel)', color: 'var(--t-1)' }}
                        >
                            <Camera size={13} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xl font-bold tracking-tight truncate" style={{ color: 'var(--t-1)' }}>{username || 'User'}</p>
                        <div
                            className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={
                                isVip
                                    ? { background: 'rgba(245,158,11,0.14)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.28)' }
                                    : { background: 'var(--bg-raised)', color: 'var(--t-3)', border: '1px solid var(--border)' }
                            }
                        >
                            {isVip && <Crown size={12} />}
                            {isVip ? 'VIP' : 'Стандартний акаунт'}
                        </div>
                    </div>
                </div>

                {/* Profile details */}
                <section className="mb-8 anim-up">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Дані профілю</h2>
                        <button
                            onClick={() => navigate('/settings')}
                            className="flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:text-white"
                            style={{ color: 'var(--t-3)' }}
                        >
                            <Pencil size={12} />
                            Редагувати
                        </button>
                    </div>
                    <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
                        <div className="divide-y divide-white/5">
                            <InfoRow icon={Ruler} label="Зріст" value={profile.height} unit=" см" />
                            <InfoRow icon={Weight} label="Вага" value={profile.weight} unit=" кг" />
                            <InfoRow icon={Cake} label="Вік" value={profile.age} unit=" р." />
                            <InfoRow icon={Users} label="Стать" value={GENDER_LABELS[profile.gender] || profile.gender} />
                            <InfoRow icon={Zap} label="Рівень активності" value={ACTIVITY_LABELS[profile.activityLevel] || profile.activityLevel} />
                        </div>
                    </div>
                </section>

            </div>
        </main>
    )
}