import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 animated-gradient-bg">
      <div className="particles" />
      <div className="relative z-10 text-center animate-fade-in">
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or this profile hasn't been created yet.
        </p>
        <Link to="/" className="glow-btn inline-block">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
