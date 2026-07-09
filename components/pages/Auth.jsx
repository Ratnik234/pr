import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';
import useStore from '../../store/useStore';
import { useTranslation } from 'react-i18next';

export default function Auth() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const login = useStore(state => state.login);
  const register = useStore(state => state.register);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      login(email, password);
    } else {
      register(email, password);
    }
    navigate('/');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-[var(--bg-dark)] text-[var(--paper)]">
      <div className="w-full max-w-md p-8 rounded-3xl" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        
        <div className="flex justify-center mb-8">
          <div
            className="w-12 h-12 rounded-[16px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 4px 16px rgba(124,58,237,0.45)' }}
          >
            <Activity size={24} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 gradient-brand">{isLogin ? t('auth.login') : t('auth.register')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--t-2)' }}>{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--t-2)' }}>{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all mt-6"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}
          >
            {isLogin ? t('auth.login') : t('auth.register')}
            <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm hover:underline"
            style={{ color: 'var(--t-3)' }}
          >
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          </button>
        </div>
      </div>
    </div>
  );
}
