import { useState } from 'react'
import { Activity, Lock, User, ArrowRight } from 'lucide-react'
import { loginUser, registerUser } from '../../utils/storage'

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      let res
      if (isLogin) {
        res = await loginUser(username, password)
      } else {
        res = await registerUser(username, password)
      }

      if (res.ok) {
        onLoginSuccess()
      } else {
        setError(res.message)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: 'var(--bg-root)' }}>
      {/* Ambient background mesh */}
      <div className="mesh-bg" aria-hidden="true" />
      
      <div className="w-full max-w-md glass-card p-8 anim-up shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 8px 24px rgba(124,58,237,0.45)' }}
          >
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight gradient-brand">LifeTracker</h1>
          <p className="text-[13px] font-medium mt-1" style={{ color: 'var(--t-3)' }}>
            {isLogin ? 'Welcome back! Please login.' : 'Create your account.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl text-[13px] font-medium text-center border" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--t-2)' }}>Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-3)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--t-2)' }}>Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-3)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[13px]" style={{ color: 'var(--t-3)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="font-bold hover:underline transition-colors"
              style={{ color: '#a78bfa' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
