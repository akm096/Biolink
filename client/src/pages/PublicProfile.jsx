import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { getTemplateStyles } from '../utils/templates';
import ProfileCard from '../components/ProfileCard';
import LinkButton from '../components/LinkButton';
import MusicPlayer from '../components/MusicPlayer';
import EnterOverlay from '../components/EnterOverlay';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [entered, setEntered] = useState(false);

  // Video controls state
  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoVolume, setVideoVolume] = useState(0.5);
  const [videoMuted, setVideoMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [needsUnmute, setNeedsUnmute] = useState(false); // Shows "click for sound" hint

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPublicProfile(username);
        setProfile(data.profile);
        // If profile has a background video, ALWAYS show enter overlay first.
        // This gives us a user gesture so the browser allows unmuted autoplay.
        // Without a click, ALL browsers block audio in autoplay — no workaround exists.
        if (data.profile.show_enter_overlay || data.profile.background_video_url) {
          setShowOverlay(true);
        } else {
          setEntered(true);
        }
      } catch (err) {
        setError(err.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  // Only try autoplay when user has entered (no overlay visible).
  // If overlay is showing, video stays paused and hidden until Enter click.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !profile?.background_video_url) return;
    // Don't autoplay while overlay is showing — wait for user click
    if (showOverlay) {
      vid.pause();
      return;
    }
    if (!entered) return;

    vid.volume = videoVolume;
    vid.muted = false; // Try unmuted first

    const tryPlay = vid.play();
    if (tryPlay !== undefined) {
      tryPlay.then(() => {
        setVideoPlaying(true);
        setVideoMuted(false);
        setNeedsUnmute(false);
      }).catch(() => {
        // Browser blocked sound autoplay — fallback to muted
        vid.muted = true;
        setVideoMuted(true);
        setNeedsUnmute(true);
        vid.play().then(() => {
          setVideoPlaying(true);
        }).catch(() => {
          setVideoPlaying(false);
        });
      });
    }
  }, [profile?.background_video_url, entered, showOverlay]);

  // On any click: if video is muted because browser blocked, unmute it
  const handlePageClick = useCallback(() => {
    if (!needsUnmute) return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = false;
    vid.volume = videoVolume;
    setVideoMuted(false);
    setNeedsUnmute(false);
    if (vid.paused) {
      vid.play().catch(() => {});
    }
  }, [needsUnmute, videoVolume]);

  useEffect(() => {
    if (!needsUnmute) return;
    document.addEventListener('click', handlePageClick, { once: true });
    document.addEventListener('touchstart', handlePageClick, { once: true });
    return () => {
      document.removeEventListener('click', handlePageClick);
      document.removeEventListener('touchstart', handlePageClick);
    };
  }, [needsUnmute, handlePageClick]);

  // Sync volume to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = videoVolume;
      videoRef.current.muted = videoMuted;
    }
  }, [videoVolume, videoMuted]);

  const toggleVideoPlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    // Any click unmutes if needed
    if (needsUnmute) {
      vid.muted = false;
      setVideoMuted(false);
      setNeedsUnmute(false);
    }
    if (vid.paused) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  };

  const handleVolumeChange = (e) => {
    if (needsUnmute) {
      setNeedsUnmute(false);
    }
    const val = parseFloat(e.target.value);
    setVideoVolume(val);
    setVideoMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (needsUnmute) {
      // User clicking mute button = interaction, unmute
      setNeedsUnmute(false);
      setVideoMuted(false);
      if (videoRef.current) videoRef.current.muted = false;
      return;
    }
    const newMuted = !videoMuted;
    setVideoMuted(newMuted);
    if (videoRef.current) videoRef.current.muted = newMuted;
  };

  // Enter overlay — user clicked, so we can play with sound
  const handleEnter = () => {
    // FIRST: reset video to start before overlay disappears
    const vid = videoRef.current;
    if (vid) {
      vid.pause();
      vid.currentTime = 0;
    }
    // THEN: hide overlay and show content
    setNeedsUnmute(false);
    setVideoMuted(false);
    setShowOverlay(false);
    setEntered(true);
    // Play with sound after a tick (overlay is now gone)
    requestAnimationFrame(() => {
      if (vid) {
        vid.muted = false;
        vid.volume = videoVolume;
        vid.play().then(() => setVideoPlaying(true)).catch(() => {});
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center px-4">
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
        <p className="text-gray-400">The user @{username} doesn't exist or hasn't set up their profile yet.</p>
      </div>
    );
  }

  const theme = getTemplateStyles(profile.template);
  const bgStyle = theme.bg.startsWith('linear')
    ? { background: theme.bg }
    : { backgroundColor: theme.bg };

  const hasVideo = !!profile.background_video_url;

  // Volume icon
  const VolumeIcon = () => {
    if (videoMuted || videoVolume === 0 || needsUnmute) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      );
    }
    if (videoVolume < 0.5) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen relative" style={{ ...bgStyle, fontFamily: theme.font }}>
      {/* Background image */}
      {profile.background_image_url && !profile.background_video_url && (
        <>
          <div
            className="fixed inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.background_image_url})` }}
          />
          <div className="profile-bg-overlay" />
        </>
      )}

      {/* Background video — tries unmuted autoplay, falls back to muted if browser blocks */}
      {profile.background_video_url && (
        <>
          <video
            ref={videoRef}
            className="profile-bg-video"
            src={profile.background_video_url}
            loop
            playsInline
            preload="auto"
            onPlay={() => setVideoPlaying(true)}
            onPause={() => setVideoPlaying(false)}
          />
          <div className="profile-bg-overlay" />
        </>
      )}

      {/* Particles effect */}
      {profile.enable_effects ? <div className="particles" style={{ '--accent': theme.accent }} /> : null}

      {/* Enter Overlay */}
      {showOverlay && (
        <EnterOverlay
          displayName={profile.display_name}
          username={profile.username}
          accentColor={profile.accent_color || theme.accent}
          onEnter={handleEnter}
        />
      )}

      {/* ===== Video Volume Control — Top Left ===== */}
      {entered && hasVideo && (
        <div
          className="video-volume-control"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={toggleMute}
            className={`volume-btn ${needsUnmute ? 'animate-pulse' : ''}`}
            title={needsUnmute ? 'Click for sound' : videoMuted ? 'Unmute' : 'Mute'}
          >
            <VolumeIcon />
          </button>

          {/* "Click for sound" hint */}
          {needsUnmute && (
            <span className="text-xs text-white/70 whitespace-nowrap">Səs üçün klik</span>
          )}

          <div className={`volume-slider-wrap ${showVolumeSlider && !needsUnmute ? 'open' : ''}`}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={videoMuted ? 0 : videoVolume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>
      )}

      {/* Profile content */}
      {entered && (
        <div className="relative z-10 min-h-screen flex flex-col items-center pt-12 pb-24 px-4 animate-fade-in">
          <div className="w-full max-w-md">
            <ProfileCard profile={profile} theme={theme} />

            {/* Links */}
            <div className="space-y-3 mt-4">
              {profile.links?.map((link, i) => (
                <div
                  key={link.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <LinkButton link={link} templateId={profile.template} />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-xs" style={{ color: `${theme.textSecondary}60` }}>
                Made with{' '}
                <span className="font-medium" style={{ color: theme.accent }}>
                  BioPlatform
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Video Play/Pause Button — Bottom Center ===== */}
      {entered && hasVideo && (
        <button
          onClick={toggleVideoPlay}
          className="video-playpause-btn"
          title={videoPlaying ? 'Pause video' : 'Play video'}
        >
          {videoPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <rect x="5" y="4" width="5" height="16" rx="1" />
              <rect x="14" y="4" width="5" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          )}
        </button>
      )}

      {/* Music Player */}
      {entered && profile.music_url && (
        <MusicPlayer
          musicUrl={profile.music_url}
          musicTitle={profile.music_title}
          musicArtist={profile.music_artist}
          accentColor={profile.accent_color || theme.accent}
        />
      )}
    </div>
  );
}
