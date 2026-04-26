import { BADGE_DEFS } from '../utils/templates';

export default function ProfileCard({ profile, theme }) {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      {/* Avatar */}
      <div className="relative mb-4">
        <img
          src={profile.avatar_url || `https://api.dicebear.com/9.x/glass/svg?seed=${profile.username}&backgroundColor=a855f7`}
          alt={profile.display_name || profile.username}
          className="w-24 h-24 rounded-full object-cover avatar-glow"
          style={{ '--glow-color': `${theme.accent}40` }}
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/9.x/glass/svg?seed=${profile.username}`;
          }}
        />
        {profile.is_verified ? (
          <div
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ background: theme.accent, boxShadow: `0 0 15px ${theme.accent}60` }}
            title="Verified"
          >
            ✓
          </div>
        ) : null}
      </div>

      {/* Name */}
      <h1
        className="text-xl font-bold mb-1"
        style={{ color: theme.text, fontFamily: theme.font }}
      >
        {profile.display_name || profile.username}
      </h1>

      <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
        @{profile.username}
      </p>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {profile.badges.map(badge => {
            const def = BADGE_DEFS[badge];
            if (!def) return null;
            return (
              <span
                key={badge}
                className="badge"
                style={{
                  background: `${def.color}20`,
                  color: def.color,
                  border: `1px solid ${def.color}30`,
                }}
              >
                <span>{def.icon}</span>
                <span>{def.label}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p
          className="text-sm max-w-sm leading-relaxed mb-2"
          style={{ color: theme.textSecondary, fontFamily: theme.font }}
        >
          {profile.bio}
        </p>
      )}

      {/* Location */}
      {profile.location && (
        <p className="text-xs" style={{ color: theme.textSecondary }}>
          📍 {profile.location}
        </p>
      )}

      {/* View count */}
      {profile.show_view_count ? (
        <p className="text-xs mt-2" style={{ color: `${theme.textSecondary}99` }}>
          👀 {profile.views?.toLocaleString() || 0} views
        </p>
      ) : null}
    </div>
  );
}
