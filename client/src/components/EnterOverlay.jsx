import { useState } from 'react';

export default function EnterOverlay({ displayName, username, avatarUrl, accentColor, onEnter }) {
  const [exiting, setExiting] = useState(false);
  const fallbackAvatar = `https://api.dicebear.com/9.x/glass/svg?seed=${username}&backgroundColor=a855f7`;

  const handleClick = () => {
    setExiting(true);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  return (
    <div
      className={`enter-overlay ${exiting ? 'hidden' : ''}`}
      onClick={handleClick}
    >
      <div className="text-center animate-fade-in">
        <img
          src={avatarUrl || fallbackAvatar}
          alt={displayName || username}
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
          style={{
            border: `2px solid ${accentColor || '#a855f7'}44`,
            boxShadow: `0 0 40px ${accentColor || '#a855f7'}33`
          }}
          onError={(e) => {
            e.currentTarget.src = fallbackAvatar;
          }}
        />
        <h2 className="text-2xl font-bold text-white mb-2">
          {displayName || username}
        </h2>
        <p className="text-gray-400 text-sm mb-8">@{username}</p>
        <div
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
          style={{
            background: `${accentColor || '#a855f7'}20`,
            border: `1px solid ${accentColor || '#a855f7'}40`,
            color: accentColor || '#a855f7',
          }}
        >
          <span>Click to Enter</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <p className="text-gray-600 text-xs mt-6 animate-pulse">Click anywhere to continue</p>
      </div>
    </div>
  );
}
