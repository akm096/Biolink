import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { TEMPLATES, BADGE_DEFS } from '../utils/templates';
import ThemePreview from '../components/ThemePreview';
import StatsCard from '../components/StatsCard';
import LinkEditor from '../components/LinkEditor';
import SocialLinkSelector from '../components/SocialLinkSelector';
import SocialIcon from '../components/SocialIcon';
import { useLanguage } from '../hooks/useLanguage';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showSocialSelector, setShowSocialSelector] = useState(false);

  const TABS = [
    { id: 'profile', label: `👤 ${t('profile')}` },
    { id: 'links',   label: `🔗 ${t('links')}` },
    { id: 'theme',   label: `🎨 ${t('theme')}` },
    { id: 'stats',   label: `📊 ${t('stats')}` },
  ];

  const [form, setForm] = useState({
    display_name: '', username: '', bio: '', avatar_url: '',
    background_image_url: '', background_video_url: '',
    music_url: '', music_title: '', music_artist: '', location: '',
    accent_color: '#a855f7', show_enter_overlay: false,
    show_view_count: true, enable_effects: true, badges: [],
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [profileRes, linksRes] = await Promise.all([api.getMyProfile(), api.getLinks()]);
      setProfile(profileRes.profile);
      setLinks(linksRes.links);
      const p = profileRes.profile;
      setForm({
        display_name: p.display_name || '', username: p.username || '',
        bio: p.bio || '', avatar_url: p.avatar_url || '',
        background_image_url: p.background_image_url || '',
        background_video_url: p.background_video_url || '',
        music_url: p.music_url || '', music_title: p.music_title || '',
        music_artist: p.music_artist || '', location: p.location || '',
        accent_color: p.accent_color || '#a855f7',
        show_enter_overlay: !!p.show_enter_overlay,
        show_view_count: !!p.show_view_count,
        enable_effects: !!p.enable_effects,
        badges: p.badges || [],
      });
    } catch {
      toast.error(t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await api.getStats();
      setStats(data.stats);
    } catch {
      toast.error(t('failedToLoadStats'));
    }
  }

  useEffect(() => { if (tab === 'stats' && !stats) loadStats(); }, [tab]);

  async function saveProfile() {
    setSaving(true);
    try {
      const data = await api.updateProfile(form);
      setProfile(data.profile);
      toast.success(t('profileSaved'));
    } catch (err) {
      toast.error(err.message || t('failedToSave'));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddLink(linkData) {
    try {
      const data = await api.createLink(linkData);
      setLinks([...links, data.link]);
      setShowAddLink(false);
      toast.success(t('linkAdded'));
    } catch (err) {
      toast.error(err.message || t('failedToAddLink'));
    }
  }

  async function handleUpdateLink(linkData) {
    try {
      const data = await api.updateLink(editingLink.id, linkData);
      setLinks(links.map(l => l.id === editingLink.id ? data.link : l));
      setEditingLink(null);
      toast.success(t('linkUpdated'));
    } catch (err) {
      toast.error(err.message || t('failedToUpdateLink'));
    }
  }

  async function handleDeleteLink(linkId) {
    if (!confirm(t('deleteThisLink'))) return;
    try {
      await api.deleteLink(linkId);
      setLinks(links.filter(l => l.id !== linkId));
      setEditingLink(null);
      toast.success(t('linkDeleted'));
    } catch (err) {
      toast.error(err.message || t('failedToDeleteLink'));
    }
  }

  async function handleToggleVisibility(link) {
    try {
      const data = await api.updateLink(link.id, { is_visible: !link.is_visible });
      setLinks(links.map(l => l.id === link.id ? data.link : l));
    } catch {
      toast.error(t('failedToggleVisibility'));
    }
  }

  function handleSocialSelect(preset) {
    setShowSocialSelector(false);
    setEditingLink(null);
    setShowAddLink(false);
    handleAddLink({
      title: preset.title, url: preset.url || preset.urlPrefix,
      type: 'social', icon: preset.icon || preset.type,
      color: preset.color, is_visible: 1, is_featured: 0,
    });
  }

  function copyProfileUrl() {
    const url = `${window.location.origin}/${form.username || user?.username}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success(t('profileUrlCopied')))
      .catch(() => toast.info(url));
  }

  function toggleBadge(badge) {
    const badges = form.badges.includes(badge)
      ? form.badges.filter(b => b !== badge)
      : [...form.badges, badge];
    setForm({ ...form, badges });
  }

  function deviceLabel(device) {
    if (device === 'mobile') return t('mobile');
    if (device === 'tablet') return t('tablet');
    return t('desktop');
  }

  function formatDateTime(value) {
    return value ? new Date(value).toLocaleString() : 'N/A';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('dashboard')}</h1>
            <p className="text-gray-400 text-sm mt-1">{t('manageProfile')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={copyProfileUrl} className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
              {t('copyUrl')}
            </button>
            <a href={`/${form.username || user?.username}`} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
              {t('preview')}
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-8 overflow-x-auto">
          {TABS.map(tabItem => (
            <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
              className={`flex-1 min-w-fit px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                tab === tabItem.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}>
              {tabItem.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 space-y-5">
              <h2 className="font-semibold text-white text-lg">{t('profileInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('displayName')}</label>
                  <input className="input-dark" placeholder={t('yourName')} value={form.display_name}
                    onChange={e => setForm({ ...form, display_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('username')}</label>
                  <input className="input-dark" placeholder="username" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })} />
                  <p className="text-xs text-gray-500 mt-1">/{form.username}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('bio')}</label>
                <textarea className="input-dark min-h-[80px] resize-y" placeholder={t('bioPlaceholder')}
                  value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('avatarUrl')}</label>
                  <input className="input-dark" placeholder="https://..." value={form.avatar_url}
                    onChange={e => setForm({ ...form, avatar_url: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('location')}</label>
                  <input className="input-dark" placeholder={t('locationPlaceholder')} value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-5">
              <h2 className="font-semibold text-white text-lg">{t('backgroundMedia')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('backgroundImageUrl')}</label>
                  <input className="input-dark" placeholder="https://..." value={form.background_image_url}
                    onChange={e => setForm({ ...form, background_image_url: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('backgroundVideoUrl')}</label>
                  <input className="input-dark" placeholder="https://...video.mp4" value={form.background_video_url}
                    onChange={e => setForm({ ...form, background_video_url: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('musicUrl')}</label>
                  <input className="input-dark" placeholder="https://...song.mp3" value={form.music_url}
                    onChange={e => setForm({ ...form, music_url: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('musicTitle')}</label>
                  <input className="input-dark" placeholder={t('songName')} value={form.music_title}
                    onChange={e => setForm({ ...form, music_title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('musicArtist')}</label>
                  <input className="input-dark" placeholder={t('artist')} value={form.music_artist}
                    onChange={e => setForm({ ...form, music_artist: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-5">
              <h2 className="font-semibold text-white text-lg">{t('settingsBadges')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('accentColor')}</label>
                  <div className="flex items-center gap-3">
                    <input type="color" className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} />
                    <input className="input-dark flex-1 text-sm" value={form.accent_color}
                      onChange={e => setForm({ ...form, accent_color: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  { key: 'show_enter_overlay', labelKey: 'clickToEnterScreen' },
                  { key: 'show_view_count',    labelKey: 'showViewCount' },
                  { key: 'enable_effects',     labelKey: 'enableEffects' },
                ].map(toggle => (
                  <label key={toggle.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[toggle.key]}
                      onChange={e => setForm({ ...form, [toggle.key]: e.target.checked })}
                      className="w-4 h-4 rounded accent-purple-500" />
                    <span className="text-sm text-gray-300">{t(toggle.labelKey)}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">{t('userBadges')}</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(BADGE_DEFS)
                    .filter(([key]) => !['verified', 'early_user'].includes(key))
                    .map(([key, def]) => (
                    <button key={key} type="button" onClick={() => toggleBadge(key)}
                      className={`badge transition-all ${form.badges.includes(key) ? 'ring-1' : 'opacity-50 hover:opacity-80'}`}
                      style={{ background: `${def.color}20`, color: def.color, border: `1px solid ${def.color}${form.badges.includes(key) ? '60' : '20'}` }}>
                      <span>{def.icon}</span>
                      <span>{def.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">{t('systemBadges')} 🔒</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(BADGE_DEFS)
                    .filter(([key]) => ['verified', 'early_user'].includes(key))
                    .map(([key, def]) => (
                    <span key={key}
                      className={`badge transition-all cursor-default ${form.badges.includes(key) ? '' : 'opacity-30'}`}
                      style={{ background: `${def.color}20`, color: def.color, border: `1px solid ${def.color}${form.badges.includes(key) ? '60' : '20'}` }}
                      title={t('adminOnlyBadge')}>
                      <span>{def.icon}</span>
                      <span>{def.label}</span>
                      <span style={{ fontSize: '10px', opacity: 0.6 }}>🔒</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('adminOnlyBadgeDesc')}</p>
              </div>
            </div>

            <button onClick={saveProfile} disabled={saving} className="glow-btn w-full sm:w-auto disabled:opacity-50">
              {saving ? t('saving') : t('saveProfile')}
            </button>
          </div>
        )}

        {/* Links Tab */}
        {tab === 'links' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button onClick={() => { setShowAddLink(true); setEditingLink(null); }} className="glow-btn text-sm">
                + {t('addLink')}
              </button>
              <button onClick={() => setShowSocialSelector(!showSocialSelector)}
                className="px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
                {t('quickAddSocial')}
              </button>
            </div>

            {showSocialSelector && <SocialLinkSelector onSelect={handleSocialSelect} />}
            {showAddLink && !editingLink && (
              <LinkEditor onSave={handleAddLink} onCancel={() => setShowAddLink(false)} />
            )}
            {editingLink && (
              <LinkEditor link={editingLink} onSave={handleUpdateLink}
                onDelete={handleDeleteLink} onCancel={() => setEditingLink(null)} />
            )}

            <div className="space-y-2">
              {links.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-gray-400">{t('noLinksYet')}</p>
                </div>
              ) : (
                links.map((link) => (
                  <div key={link.id}
                    className={`glass-card p-4 flex items-center gap-4 group transition-all ${!link.is_visible ? 'opacity-50' : ''}`}>
                    <SocialIcon source={link} size={24} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm truncate">{link.title}</p>
                        {link.is_featured ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{t('featured')}</span>
                        ) : null}
                        {!link.is_visible ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">{t('hidden')}</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>🖱 {link.click_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggleVisibility(link)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-sm transition-all"
                        title={link.is_visible ? t('hide') : t('show')}>
                        {link.is_visible ? '👁' : '🚫'}
                      </button>
                      <button onClick={() => { setEditingLink(link); setShowAddLink(false); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-sm transition-all">
                        ✏️
                      </button>
                      <button onClick={() => handleDeleteLink(link.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-sm transition-all">
                        🗑
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {tab === 'theme' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white text-lg">{t('chooseTheme')}</h2>
                <button
                  onClick={() => { setForm({ ...form, accent_color: '#a855f7' }); toast.info(t('accentColorReset')); }}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
                  {t('resetColor')}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Object.entries(TEMPLATES).map(([id, tmpl]) => (
                  <ThemePreview key={id} templateId={id} name={tmpl.name}
                    isSelected={form.template === id || (!form.template && id === (profile?.template || 'minimal-dark'))}
                    onSelect={(tid) => {
                      setForm({ ...form, template: tid });
                      api.updateProfile({ template: tid }).then(data => {
                        setProfile(data.profile);
                        toast.success(`Theme: ${tmpl.name}`);
                      }).catch(() => toast.error(t('failedToSaveTheme')));
                    }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && (
          <div className="space-y-6 animate-fade-in">
            {stats ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard icon="👀" label={t('totalViews')}     value={stats.total_views}           color="#a855f7" />
                  <StatsCard icon="🖱" label={t('totalClicks')}    value={stats.total_clicks}          color="#3b82f6" />
                  <StatsCard icon="IP" label={t('uniqueClickers')} value={stats.unique_clickers || 0}  color="#14b8a6" />
                  <StatsCard icon="🔗" label={t('totalLinks')}     value={stats.total_links}           color="#22c55e" />
                  <StatsCard icon="M"  label={t('mobileClicks')}   value={stats.mobile_clicks || 0}    color="#ec4899" />
                  <StatsCard icon="D"  label={t('desktopClicks')}  value={stats.desktop_clicks || 0}   color="#f97316" />
                  <StatsCard icon="🌐" label={t('profileUrl')}     value={stats.profile_url}           color="#f59e0b" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="glass-card p-6">
                    <h2 className="font-semibold text-white mb-4">{t('clicksByDevice')}</h2>
                    {stats.device_breakdown?.length ? (
                      <div className="space-y-3">
                        {stats.device_breakdown.map((item) => (
                          <div key={item.device_type} className="flex items-center justify-between gap-3">
                            <span className="text-sm text-gray-300">{deviceLabel(item.device_type)}</span>
                            <span className="text-sm font-semibold text-white">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{t('noDetailedClicks')}</p>
                    )}
                  </div>
                  <div className="glass-card p-6">
                    <h2 className="font-semibold text-white mb-4">{t('clicksByCountry')}</h2>
                    {stats.country_breakdown?.length ? (
                      <div className="space-y-3">
                        {stats.country_breakdown.map((item) => (
                          <div key={item.country} className="flex items-center justify-between gap-3">
                            <span className="text-sm text-gray-300">{item.country_label}</span>
                            <span className="text-sm font-semibold text-white">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{t('noCountryData')}</p>
                    )}
                  </div>
                </div>

                {stats.top_links?.length > 0 && (
                  <div className="glass-card p-6">
                    <h2 className="font-semibold text-white mb-4">{t('topClickedLinks')}</h2>
                    <div className="space-y-3">
                      {stats.top_links.map((link, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <SocialIcon source={link} size={22} className="w-6" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{link.title}</p>
                            <p className="text-xs text-gray-500 truncate">{link.url}</p>
                          </div>
                          <span className="text-sm font-semibold text-purple-400">
                            {link.click_count} {t('clicks')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.recent_clicks?.length > 0 && (
                  <div className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-white/[0.08]">
                      <h2 className="font-semibold text-white">{t('recentClicks')}</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.08] text-gray-400 text-xs uppercase tracking-wider bg-white/[0.02]">
                            <th className="px-4 py-3">{t('time')}</th>
                            <th className="px-4 py-3">{t('link')}</th>
                            <th className="px-4 py-3">{t('ip')}</th>
                            <th className="px-4 py-3">{t('device')}</th>
                            <th className="px-4 py-3">{t('country')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {stats.recent_clicks.map((click) => (
                            <tr key={click.id} className="text-sm text-gray-300">
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">{formatDateTime(click.created_at)}</td>
                              <td className="px-4 py-3 max-w-[220px] truncate">{click.link_title || t('deletedLink')}</td>
                              <td className="px-4 py-3 font-mono text-xs">{click.visitor_ip || 'N/A'}</td>
                              <td className="px-4 py-3">{deviceLabel(click.device_type)}</td>
                              <td className="px-4 py-3">{click.country_label || t('unknown')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {stats.created_at && (
                  <p className="text-xs text-gray-500">
                    {t('profileCreated')} {new Date(stats.created_at).toLocaleDateString()}
                    {stats.updated_at && ` · ${t('lastUpdated')} ${new Date(stats.updated_at).toLocaleDateString()}`}
                  </p>
                )}
              </>
            ) : (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
