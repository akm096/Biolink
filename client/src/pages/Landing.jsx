import { Link } from 'react-router-dom';

const features = [
  { icon: '🎨', title: 'Beautiful Templates', desc: '10+ stunning themes from neon to luxury to fit your style' },
  { icon: '🔗', title: 'Link Management', desc: 'Add, edit, and organize all your important links in one place' },
  { icon: '🎵', title: 'Music Player', desc: 'Add background music to your profile for an immersive experience' },
  { icon: '📊', title: 'Analytics', desc: 'Track profile views, link clicks, and see your top content' },
  { icon: '🎬', title: 'Video Backgrounds', desc: 'Set a looping video background for a premium profile look' },
  { icon: '✨', title: 'Effects & Badges', desc: 'Glow effects, glass cards, animated gradients, and profile badges' },
];

export default function Landing() {
  return (
    <div className="min-h-screen animated-gradient-bg">
      <div className="particles" />

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Your bio link platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-slide-up leading-tight">
            <span className="text-white">One Link.</span>
            <br />
            <span className="gradient-text">Infinite Possibilities.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Create a stunning, customizable profile page with all your links, social media,
            music, and more. Share everything about you in one beautiful page.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="glow-btn text-base px-8 py-4">
              Create Your Profile →
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 rounded-xl text-base font-medium text-gray-300 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              View Demo
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
            Everything You Need
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
            A complete bio link platform packed with features to make your profile stand out
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
              Ready to Create Your Profile?
            </h2>
            <p className="text-gray-400 mb-8">
              Join now and get your personalized bio link page in seconds
            </p>
            <Link to="/register" className="glow-btn text-base px-10 py-4 inline-block">
              Get Started — It's Free
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
            <Link to="/register" className="hover:text-gray-300 transition-colors">Sign Up</Link>
            <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
