import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { useLanguage } from '../hooks/useLanguage';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error(t('pleaseFill'));
      return;
    }
    if (form.password.length < 6) {
      toast.error(t('passwordMin'));
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success(t('accountCreated'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 animated-gradient-bg">
      <div className="particles" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">{t('createAccount')}</h1>
          <p className="text-gray-400">{t('setupProfile')}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5 animate-slide-up">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">{t('username')}</label>
            <input
              className="input-dark"
              placeholder="yourname"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })}
              autoComplete="username"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('profileUrlHelp')} /{form.username || 'yourname'}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">{t('email')}</label>
            <input
              type="email"
              className="input-dark"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">{t('password')}</label>
            <input
              type="password"
              className="input-dark"
              placeholder={t('minimumPassword')}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn w-full text-center disabled:opacity-50"
          >
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>

          <p className="text-center text-sm text-gray-400">
            {t('alreadyAccount')}{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              {t('signIn')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
