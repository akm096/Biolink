import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { useLanguage } from '../hooks/useLanguage';
import { PANEL_ROUTES } from '../utils/routes';

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      toast.error(t('pleaseFill'));
      return;
    }
    setLoading(true);
    try {
      await login(form);
      toast.success(t('welcomeToast'));
      navigate(PANEL_ROUTES.dashboard);
    } catch (err) {
      toast.error(err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 animated-gradient-bg">
      <div className="particles" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">{t('welcomeBack')}</h1>
          <p className="text-gray-400">{t('signInAccount')}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5 animate-slide-up">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">{t('usernameOrEmail')}</label>
            <input
              className="input-dark"
              placeholder={t('enterUsernameOrEmail')}
              value={form.login}
              onChange={e => setForm({ ...form, login: e.target.value })}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">{t('password')}</label>
            <input
              type="password"
              className="input-dark"
              placeholder={t('enterPassword')}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn w-full text-center disabled:opacity-50"
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>

          <p className="text-center text-sm text-gray-400">
            {t('noAccount')}{' '}
            <Link to={PANEL_ROUTES.register} className="text-purple-400 hover:text-purple-300 transition-colors">
              {t('createOne')}
            </Link>
          </p>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-gray-500 text-center">
              {t('demoAccount')}: <span className="text-gray-400">demo</span> / <span className="text-gray-400">demo123</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
