import { SOCIAL_PRESETS } from '../utils/templates';

export default function SocialLinkSelector({ onSelect }) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-white mb-3">Quick Add Social Links</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {SOCIAL_PRESETS.map(preset => (
          <button
            key={preset.type}
            onClick={() => onSelect(preset)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02] text-left"
            style={{
              background: `${preset.color}12`,
              border: `1px solid ${preset.color}25`,
              color: '#e2e8f0',
            }}
          >
            <span className="text-base">{preset.icon}</span>
            <span className="truncate text-xs font-medium">{preset.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
