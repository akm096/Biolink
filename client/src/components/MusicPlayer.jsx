import { useState, useRef } from 'react';

export default function MusicPlayer({ musicUrl, musicTitle, musicArtist, accentColor }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  if (!musicUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="music-player" style={{ '--accent': accentColor || '#a855f7' }}>
      <audio ref={audioRef} src={musicUrl} loop onEnded={() => setIsPlaying(false)} />
      <button
        onClick={togglePlay}
        className="play-btn flex-shrink-0"
        style={{ background: accentColor || '#a855f7' }}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M4 2l10 6-10 6V2z" />
          </svg>
        )}
      </button>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{musicTitle || 'Now Playing'}</p>
        {musicArtist && <p className="text-xs text-gray-400 truncate">{musicArtist}</p>}
      </div>
    </div>
  );
}

// Export a function to try autoplay after user interaction
export function tryAutoplay(audioElement) {
  if (audioElement) {
    audioElement.play().catch(() => {
      // Browser blocked autoplay, user needs to click play
    });
  }
}
