import {
  siAnilist,
  siDiscord,
  siFacebook,
  siGithub,
  siGmail,
  siInstagram,
  siMyanimelist,
  siSpotify,
  siSteam,
  siTelegram,
  siTiktok,
  siTwitch,
  siX,
  siYoutube,
} from 'simple-icons';

const ICON_ALIASES = {
  discord: 'discord',
  instagram: 'instagram',
  telegram: 'telegram',
  github: 'github',
  git: 'github',
  steam: 'steam',
  website: 'website',
  web: 'website',
  globe: 'website',
  site: 'website',
  link: 'link',
  tiktok: 'tiktok',
  youtube: 'youtube',
  twitter: 'twitter',
  x: 'twitter',
  spotify: 'spotify',
  twitch: 'twitch',
  facebook: 'facebook',
  myanimelist: 'myanimelist',
  mal: 'myanimelist',
  anilist: 'anilist',
  email: 'email',
  mail: 'email',
  gmail: 'email',
};

const DOMAIN_HINTS = [
  ['discord.', 'discord'],
  ['discord.gg', 'discord'],
  ['instagram.', 'instagram'],
  ['t.me', 'telegram'],
  ['telegram.', 'telegram'],
  ['github.', 'github'],
  ['steamcommunity.', 'steam'],
  ['steampowered.', 'steam'],
  ['tiktok.', 'tiktok'],
  ['youtube.', 'youtube'],
  ['youtu.be', 'youtube'],
  ['x.com', 'twitter'],
  ['twitter.', 'twitter'],
  ['spotify.', 'spotify'],
  ['twitch.', 'twitch'],
  ['facebook.', 'facebook'],
  ['myanimelist.', 'myanimelist'],
  ['myanimelist.net', 'myanimelist'],
  ['anilist.', 'anilist'],
  ['anilist.co', 'anilist'],
  ['mailto:', 'email'],
];

const BRAND_ICONS = {
  discord: siDiscord,
  instagram: siInstagram,
  telegram: siTelegram,
  github: siGithub,
  steam: siSteam,
  tiktok: siTiktok,
  youtube: siYoutube,
  twitter: siX,
  spotify: siSpotify,
  twitch: siTwitch,
  facebook: siFacebook,
  myanimelist: siMyanimelist,
  anilist: siAnilist,
  email: siGmail,
};

export const BRAND_COLORS = Object.fromEntries(
  Object.entries(BRAND_ICONS).map(([key, icon]) => [key, `#${icon.hex}`])
);

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9.]+/g, '');
}

export function getSocialIconType(source) {
  if (!source) return 'link';

  if (typeof source === 'string') {
    const token = normalize(source);
    if (ICON_ALIASES[token]) return ICON_ALIASES[token];
    const alias = Object.keys(ICON_ALIASES).find(key => token.includes(key));
    return alias ? ICON_ALIASES[alias] : 'link';
  }

  const direct = [source.icon, source.type, source.title].map(normalize);
  for (const token of direct) {
    if (ICON_ALIASES[token]) return ICON_ALIASES[token];
    const alias = Object.keys(ICON_ALIASES).find(key => token.includes(key));
    if (alias) return ICON_ALIASES[alias];
  }

  const url = normalize(source.url);
  const domainMatch = DOMAIN_HINTS.find(([hint]) => url.includes(hint));
  return domainMatch ? domainMatch[1] : 'link';
}

function WebsiteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
      <path d="M3.8 9h16.4M3.8 15h16.4M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function BrandIcon({ icon, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d={icon.path} />
    </svg>
  );
}

export default function SocialIcon({
  source,
  type,
  className = '',
  size = 24,
  variant = 'glow',
}) {
  const iconType = type || getSocialIconType(source);
  const brandIcon = BRAND_ICONS[iconType];
  const style = variant === 'brand' && BRAND_COLORS[iconType] ? { color: BRAND_COLORS[iconType] } : undefined;

  return (
    <span
      className={`social-logo social-logo-${variant} ${className}`}
      style={{ width: size, height: size, ...style }}
      title={brandIcon?.title || iconType}
    >
      {brandIcon ? (
        <BrandIcon icon={brandIcon} className="w-full h-full" />
      ) : iconType === 'website' ? (
        <WebsiteIcon className="w-full h-full" />
      ) : (
        <LinkIcon className="w-full h-full" />
      )}
    </span>
  );
}
