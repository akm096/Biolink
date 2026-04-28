import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { PANEL_ROUTES } from '../utils/routes';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]" style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-shadow">
            B
          </div>
          <span className="font-bold text-lg text-white">Bio<span className="text-purple-400">Platform</span></span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            aria-label={t('language')}
          >
            <option value="en">EN</option>
            <option value="tr">TR</option>
          </select>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  to={PANEL_ROUTES.admin}
                  className="px-3 sm:px-4 py-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {t('admin')}
                </Link>
              )}
              <Link
                to={PANEL_ROUTES.dashboard}
                className="px-3 sm:px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                {t('dashboard')}
              </Link>
              <Link
                to={`/${user.username}`}
                className="hidden sm:inline px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                {t('myProfile')}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to={PANEL_ROUTES.login}
                className="px-3 sm:px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to={PANEL_ROUTES.register}
                className="glow-btn text-sm !px-4 sm:!px-5 !py-2"
              >
                {t('getStarted')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
