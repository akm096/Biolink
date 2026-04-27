import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    { icon: '🎨', title: t('feat1Title'), desc: t('feat1Desc') },
    { icon: '🔗', title: t('feat2Title'), desc: t('feat2Desc') },
    { icon: '🎵', title: t('feat3Title'), desc: t('feat3Desc') },
    { icon: '📊', title: t('feat4Title'), desc: t('feat4Desc') },
    { icon: '🎬', title: t('feat5Title'), desc: t('feat5Desc') },
    { icon: '✨', title: t('feat6Title'), desc: t('feat6Desc') },
  ];

  return (
    <div className="min-h-screen animated-gradient-bg">
      <div className="particles" />

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            {t('bioLinkPlatform')}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-slide-up leading-tight">
            <span className="text-white">{t('heroTitle1')}</span>
            <br />
            <span className="gradient-text">{t('heroTitle2')}</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {t('heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="glow-btn text-base px-8 py-4">
              {t('createYourProfile')}
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 rounded-xl text-base font-medium text-gray-300 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              {t('viewDemo')}
            </Link>
          </div>

          {/* Preview mockup */}
          <div className="mt-16 max-w-sm mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-3 avatar-glow" style={{ '--glow-color': 'rgba(168,85,247,0.4)' }} />
              <h3 className="font-bold text-white">Demo User</h3>
              <p className="text-sm text-gray-400 mb-4">@demo</p>
              <div className="space-y-2">
                {['📸 Instagram', '🎬 YouTube', '💻 GitHub'].map(l => (
                  <div key={l} className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            {t('everythingYouNeed')}
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
            {t('featuresDesc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card-hover p-6"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card p-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('readyToCreate')}
            </h2>
            <p className="text-gray-400 mb-8">
              {t('joinNow')}
            </p>
            <Link to="/register" className="glow-btn text-base px-10 py-4 inline-block">
              {t('getStartedFree')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
              B
            </div>
            <span className="text-sm text-gray-500">BioPlatform © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/demo" className="hover:text-gray-300 transition-colors">Demo</Link>
            <Link to="/register" className="hover:text-gray-300 transition-colors">{t('signUp')}</Link>
            <Link to="/login" className="hover:text-gray-300 transition-colors">{t('login')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
