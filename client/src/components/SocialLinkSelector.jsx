import { SOCIAL_PRESETS } from '../utils/templates';
import SocialIcon from './SocialIcon';
import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

function cleanHandle(value) {
  return value.trim().replace(/^@+/, '').replace(/^\/+/, '');
}

function withProtocol(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function buildPresetLink(preset, mode, value) {
  if (mode === 'link') return withProtocol(value);

  const handle = cleanHandle(value);
  if (!handle) return '';

  if (preset.type === 'discord') return 'https://discord.com';
  if (preset.type === 'email') return `mailto:${handle}`;
  return `${preset.urlPrefix}${handle}`;
}

export default function SocialLinkSelector({ onSelect }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('username');
  const [value, setValue] = useState('');

  const selectPreset = (preset) => {
    setSelected(preset);
    setMode('username');
    setValue('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;

    const url = buildPresetLink(selected, mode, value);
    if (!url) return;

    const handle = cleanHandle(value);
    onSelect({
      ...selected,
      title: selected.type === 'discord' && mode === 'username' && handle
        ? `Discord: ${handle}`
        : selected.title,
      url,
      handle: mode === 'username' ? handle : '',
    });
  };

  const inputLabel = selected?.type === 'discord'
    ? t('discordNick')
    : selected?.type === 'email'
      ? t('email')
      : t('username');

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-white mb-3">{t('quickAddSocialLinks')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {SOCIAL_PRESETS.map(preset => (
          <button
            key={preset.type}
            onClick={() => selectPreset(preset)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02] text-left"
            style={{
              background: selected?.type === preset.type ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
              border: selected?.type === preset.type ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)',
              color: '#f8fafc',
            }}
          >
            <SocialIcon type={preset.type} size={20} variant="brand" />
            <span className="truncate text-xs font-medium">{preset.title}</span>
          </button>
        ))}
      </div>

      {selected ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.08] p-1">
            {[
              { id: 'username', label: inputLabel },
              { id: 'link', label: t('fullLink') },
            ].map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setMode(option.id);
                  setValue('');
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  mode === option.id
                    ? 'bg-white/15 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="input-dark py-2.5 text-sm"
              placeholder={mode === 'link' ? 'https://...' : inputLabel}
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
            />
            <button type="submit" className="glow-btn text-sm !px-5 !py-2.5 whitespace-nowrap">
              {t('add')}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
