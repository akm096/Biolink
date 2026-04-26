import { getTemplateStyles } from '../utils/templates';

export default function ThemePreview({ templateId, name, isSelected, onSelect }) {
  const theme = getTemplateStyles(templateId);

  return (
    <button
      onClick={() => onSelect(templateId)}
      className={`relative rounded-xl overflow-hidden transition-all duration-300 text-left group ${
        isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900 scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
      style={{ background: theme.bg.startsWith('linear') ? theme.bg : theme.bg }}
    >
      <div className="p-4 min-h-[120px] flex flex-col justify-between">
        {/* Mini preview */}
        <div className="space-y-2">
          <div
            className="w-8 h-8 rounded-full"
            style={{ background: `${theme.accent}40`, border: `2px solid ${theme.accent}60` }}
          />
          <div
            className="h-2 w-16 rounded"
            style={{ background: `${theme.accent}50` }}
          />
          <div
            className="h-1.5 w-24 rounded"
            style={{ background: theme.textSecondary + '40' }}
          />
        </div>

        {/* Mini buttons */}
        <div className="space-y-1.5 mt-3">
          {[1, 2].map(i => (
            <div
              key={i}
              className="h-5 rounded-md"
              style={{
                background: theme.buttonBg,
                border: `1px solid ${theme.buttonBorder}`,
              }}
            />
          ))}
        </div>

        <p
          className="text-xs font-medium mt-3"
          style={{ color: theme.text }}
        >
          {name}
        </p>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="white">
            <path d="M13.7 4.3l-7.4 7.4L3 8.4l1.4-1.4 2.9 2.9 6-6 1.4 1.4z" />
          </svg>
        </div>
      )}
    </button>
  );
}
