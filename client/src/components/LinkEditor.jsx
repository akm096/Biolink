import { useState } from 'react';
import SocialIcon, { getSocialIconType } from './SocialIcon';
import { SOCIAL_PRESETS } from '../utils/templates';
import { useLanguage } from '../hooks/useLanguage';

export default function LinkEditor({ link, onSave, onDelete, onCancel }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    title: link?.title || '',
    url: link?.url || '',
    type: link?.type || 'link',
    icon: getSocialIconType(link) || 'link',
    color: link?.color || '#a855f7',
    is_visible: link?.is_visible ?? true,
    is_featured: link?.is_featured ?? false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    onSave({
      ...form,
      is_visible: form.is_visible ? 1 : 0,
      is_featured: form.is_featured ? 1 : 0,
    });
  };

  const iconOptions = [
    { type: 'link', title: t('normalLink') },
    ...SOCIAL_PRESETS.map(({ type, title }) => ({ type, title })),
  ];

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">
          {link?.id ? t('editLink') : t('addNewLink')}
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white text-sm">
            ✕ {t('cancel')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('title')}</label>
          <input
            className="input-dark"
            placeholder="My Link"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('url')}</label>
          <input
            className="input-dark"
            placeholder="https://example.com"
            value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('type')}</label>
          <select
            className="input-dark"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option value="link">{t('normalLink')}</option>
            <option value="social">{t('socialLink')}</option>
            <option value="music">{t('musicLink')}</option>
            <option value="video">{t('videoLink')}</option>
            <option value="contact">{t('contactLink')}</option>
            <option value="custom">{t('customLink')}</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('icon')}</label>
          <div className="flex gap-1 flex-wrap">
            {iconOptions.slice(0, 12).map(option => (
              <button
                key={option.type}
                type="button"
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                  getSocialIconType(form.icon) === option.type ? 'bg-purple-500/30 ring-1 ring-purple-400' : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setForm({ ...form, icon: option.type, type: option.type === 'link' ? form.type : 'social' })}
                title={option.title}
              >
                <SocialIcon type={option.type} size={18} variant="brand" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('color')}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
            />
            <input
              className="input-dark text-xs flex-1"
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_visible}
            onChange={e => setForm({ ...form, is_visible: e.target.checked })}
            className="w-4 h-4 rounded accent-purple-500"
          />
          <span className="text-sm text-gray-300">{t('visible')}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={e => setForm({ ...form, is_featured: e.target.checked })}
            className="w-4 h-4 rounded accent-purple-500"
          />
          <span className="text-sm text-gray-300">{t('featured')}</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="glow-btn text-sm">
          {link?.id ? t('saveChanges') : t('addLink')}
        </button>
        {link?.id && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(link.id)}
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          >
            {t('delete')}
          </button>
        )}
      </div>
    </form>
  );
}
