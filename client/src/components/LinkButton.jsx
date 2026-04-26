import api from '../utils/api';
import { getTemplateStyles } from '../utils/templates';

export default function LinkButton({ link, templateId, onClick }) {
  const theme = getTemplateStyles(templateId);

  const handleClick = async (e) => {
    e.preventDefault();
    // Track click
    try {
      await api.trackClick(link.id);
    } catch {
      // Ignore tracking errors
    }
    // Open link
    window.open(link.url, '_blank', 'noopener,noreferrer');
    if (onClick) onClick(link);
  };

  const buttonStyle = {
    background: link.color ? `${link.color}18` : theme.buttonBg,
    borderColor: link.color ? `${link.color}35` : theme.buttonBorder,
    color: theme.text,
    fontFamily: theme.font,
    boxShadow: link.is_featured
      ? `0 0 25px ${link.color || theme.accent}30`
      : 'none',
  };

  return (
    <a
      href={link.url}
      onClick={handleClick}
      className={`link-card w-full group ${link.is_featured ? 'featured' : ''}`}
      style={buttonStyle}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="text-xl flex-shrink-0">{link.icon || '🔗'}</span>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm block truncate">{link.title}</span>
      </div>
      <svg
        className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity flex-shrink-0"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    </a>
  );
}
