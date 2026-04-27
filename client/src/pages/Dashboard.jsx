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

const TABS = [
  { id: 'profile', label: '👤 Profile', },
  { id: 'links', label: '🔗 Links', },
  { id: 'theme', label: '🎨 Theme', },
  { id: 'stats', label: '📊 Stats', },
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showSocialSelector, setShowSocialSelector] = useState(false);

  // Profile form state
  const [form, setForm] = useState({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    background_image_url: '',
    background_video_url: '',
    music_url: '',
    music_title: '',
    music_artist: '',
    location: '',
    accent_color: '#a855f7',
    show_enter_overlay: false,
    show_view_count: true,
    enable_effects: true,
    badges: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [profileRes, linksRes] = await Promise.all([
        api.getMyProfile(),
        api.getLinks(),
      ]);
      setProfile(profileRes.profile);
      setLinks(linksRes.links);
      setForm({
        display_name: profileRes.profile.display_name || '',
        username: profileRes.profile.username || '',
        bio: profileRes.profile.bio || '',
        avatar_url: profileRes.profile.avatar_url || '',
        background_image_url: profileRes.profile.background_image_url || '',
        background_video_url: profileRes.profile.background_video_url || '',
        music_url: profileRes.profile.music_url || '',
        music_title: profileRes.profile.music_title || '',
        music_artist: profileRes.profile.music_artist || '',
        location: profileRes.profile.location || '',
        accent_color: profileRes.profile.accent_color || '#a855f7',
        show_enter_overlay: !!profileRes.profile.show_enter_overlay,
        show_view_count: !!profileRes.profile.show_view_count,
        enable_effects: !!profileRes.profile.enable_effects,
        badges: profileRes.profile.badges || [],
      });
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await api.getStats();
      setStats(data.stats);
    } catch {
      toast.error('Failed to load stats');
    }
  }

  useEffect(() => {
    if (tab === 'stats' && !stats) loadStats();
  }, [tab]);

  async function saveProfile() {
    setSaving(true);
    try {
      const data = await api.updateProfile(form);
      setProfile(data.profile);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddLink(linkData) {
    try {
      const data = await api.createLink(linkData);
      setLinks([...links, data.link]);
      setShowAddLink(false);
      toast.success('Link added!');
    } catch (err) {
      toast.error(err.message || 'Failed to add link');
    }
  }

  async function handleUpdateLink(linkData) {
    try {
      const data = await api.updateLink(editingLink.id, linkData);
      setLinks(links.map(l => l.id === editingLink.id ? data.link : l));
      setEditingLink(null);
      toast.success('Link updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update link');
    }
  }

  async function handleDeleteLink(linkId) {
    if (!confirm('Delete this link?')) return;
    try {
      await api.deleteLink(linkId);
      setLinks(links.filter(l => l.id !== linkId));
      setEditingLink(null);
      toast.success('Link deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete link');
    }
  }

  async function handleToggleVisibility(link) {
    try {
      const data = await api.updateLink(link.id, { is_visible: !link.is_visible });
      setLinks(links.map(l => l.id === link.id ? data.link : l));
    } catch (err) {
      toast.error('Failed to toggle visibility');
    }
  }

  function handleSocialSelect(preset) {
    setShowSocialSelector(false);
    setEditingLink(null);
    setShowAddLink(false);
    handleAddLink({
      title: preset.title,
      url: preset.url || preset.urlPrefix,
      type: 'social',
      icon: preset.icon || preset.type,
      color: preset.color,
      is_visible: 1,
      is_featured: 0,
    });
  }

  function copyProfileUrl() {
    const url = `${window.location.origin}/${form.username || user?.username}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Profile URL copied!');
    }).catch(() => {
      toast.info(url);
    });
  }

  function toggleBadge(badge) {
    const badges = form.badges.includes(badge)
      ? form.badges.filter(b => b !== badge)
      : [...form.badges, badge];
    setForm({ ...form, badges });
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
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your profile and links</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={copyProfileUrl} className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
              📋 Copy URL
            </button>
            <a
              href={`/${form.username || user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
            >
              👁 Preview
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-fit px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                tab === t.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 space-y-5">
              <h2 className="font-semibold text-white text-lg">Profile Info</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Display Name</label>
                  <input className="input-dark" placeholder="Your Name" value={form.display_name}
                    onChange={e => setForm({ ...form, display_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Username</label>
                  <input className="input-dark" placeholder="username" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })} />
                  <p className="text-xs text-gray-500 mt-1">/{form.username}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Bio</label>
                <textarea className="input-dark min-h-[80px] resize-y" placeholder="Tell the world about yourself..."
                  value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Avatar URL</label>
                  <input className="input-dark" placeholder="https://..." value={form.avatar_url}
                    onChange={e => setForm({ ...form, avatar_url: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Location</label>
                  <input className="input-dark" placeholder="🌍 Somewhere" value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-5">
              <h2 className="font-semibold text-white text-lg">Background & Media</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Background Image URL</label>
                  <input className="input-dark" placeholder="https://..." value={form.background_image_url}
                    onChange={e => setForm({ ...form, background_image_url: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Background Video URL</label>
                  <input className="input-dark" placeholder="https://...video.mp4" value={form.background_video_url}
                    onChange={e => setForm({ ...form, background_video_url: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Music URL</label>
                  <input className="input-dark" placeholder="https://...song.mp3" value={form.music_url}
                    onChange={e => setForm({ ...form, music_url: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Music Title</label>
                  <input className="input-dark" placeholder="Song Name" value={form.music_title}
                    onChange={e => setForm({ ...form, music_title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Music Artist</label>
                  <input className="input-dark" placeholder="Artist" value={form.music_artist}
                    onChange={e => setForm({ ...form, music_artist: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-5">
              <h2 className="font-semibold text-white text-lg">Settings & Badges</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Accent Color</label>
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
                  { key: 'show_enter_overlay', label: 'Click to Enter Screen' },
                  { key: 'show_view_count', label: 'Show View Count' },
                  { key: 'enable_effects', label: 'Enable Effects' },
                ].map(toggle => (
                  <label key={toggle.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[toggle.key]}
                      onChange={e => setForm({ ...form, [toggle.key]: e.target.checked })}
                      className="w-4 h-4 rounded accent-purple-500" />
                    <span className="text-sm text-gray-300">{toggle.label}</span>
                  </label>
                ))}
              </div>

              {/* Badges */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Badges</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(BADGE_DEFS).map(([key, def]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleBadge(key)}
                      className={`badge transition-all ${
                        form.badges.includes(key) ? 'ring-1' : 'opacity-50 hover:opacity-80'
                      }`}
                      style={{
                        background: `${def.color}20`,
                        color: def.color,
                        border: `1px solid ${def.color}${form.badges.includes(key) ? '60' : '20'}`,
                        ringColor: def.color,
                      }}
                    >
                      <span>{def.icon}</span>
                      <span>{def.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={saveProfile} disabled={saving} className="glow-btn w-full sm:w-auto disabled:opacity-50">
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>
        )}

        {/* Links Tab */}
        {tab === 'links' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button onClick={() => { setShowAddLink(true); setEditingLink(null); }}
                className="glow-btn text-sm">
                + Add Link
              </button>
              <button onClick={() => setShowSocialSelector(!showSocialSelector)}
                className="px-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
                ⚡ Quick Add Social
              </button>
            </div>

            {showSocialSelector && (
              <SocialLinkSelector onSelect={handleSocialSelect} />
            )}

            {showAddLink && !editingLink && (
              <LinkEditor
                onSave={handleAddLink}
                onCancel={() => setShowAddLink(false)}
              />
            )}

            {editingLink && (
              <LinkEditor
                link={editingLink}
                onSave={handleUpdateLink}
                onDelete={handleDeleteLink}
                onCancel={() => setEditingLink(null)}
              />
            )}

            {/* Link list */}
            <div className="space-y-2">
              {links.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-gray-400">No links yet. Add your first link!</p>
                </div>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className={`glass-card p-4 flex items-center gap-4 group transition-all ${
                      !link.is_visible ? 'opacity-50' : ''
                    }`}
                  >
                    <SocialIcon source={link} size={24} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm truncate">{link.title}</p>
                        {link.is_featured ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">Featured</span>
                        ) : null}
                        {!link.is_visible ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">Hidden</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>🖱 {link.click_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleVisibility(link)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-sm transition-all"
                        title={link.is_visible ? 'Hide' : 'Show'}
                      >
                        {link.is_visible ? '👁' : '🚫'}
                      </button>
                      <button
                        onClick={() => { setEditingLink(link); setShowAddLink(false); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white text-sm transition-all"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-sm transition-all"
                      >
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
                <h2 className="font-semibold text-white text-lg">Choose Theme</h2>
                <button
                  onClick={() => {
                    setForm({ ...form, accent_color: '#a855f7' });
                    toast.info('Accent color reset');
                  }}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Reset Color
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Object.entries(TEMPLATES).map(([id, tmpl]) => (
                  <ThemePreview
                    key={id}
                    templateId={id}
                    name={tmpl.name}
                    isSelected={form.template === id || (!form.template && id === (profile?.template || 'minimal-dark'))}
                    onSelect={(tid) => {
                      setForm({ ...form, template: tid });
                      // Auto-save theme
                      api.updateProfile({ template: tid }).then(data => {
                        setProfile(data.profile);
                        toast.success(`Theme: ${tmpl.name}`);
                      }).catch(() => toast.error('Failed to save theme'));
                    }}
                  />
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
                  <StatsCard icon="👀" label="Total Views" value={stats.total_views} color="#a855f7" />
                  <StatsCard icon="🖱" label="Total Clicks" value={stats.total_clicks} color="#3b82f6" />
                  <StatsCard icon="🔗" label="Total Links" value={stats.total_links} color="#22c55e" />
                  <StatsCard
                    icon="🌐"
                    label="Profile URL"
                    value={stats.profile_url}
                    color="#f59e0b"
                  />
                </div>

                {stats.top_links && stats.top_links.length > 0 && (
                  <div className="glass-card p-6">
                    <h2 className="font-semibold text-white mb-4">Top Clicked Links</h2>
                    <div className="space-y-3">
                      {stats.top_links.map((link, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <SocialIcon source={link} size={22} className="w-6" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{link.title}</p>
                            <p className="text-xs text-gray-500 truncate">{link.url}</p>
                          </div>
                          <span className="text-sm font-semibold text-purple-400">
                            {link.click_count} clicks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.created_at && (
                  <p className="text-xs text-gray-500">
                    Profile created: {new Date(stats.created_at).toLocaleDateString()}
                    {stats.updated_at && ` · Last updated: ${new Date(stats.updated_at).toLocaleDateString()}`}
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
