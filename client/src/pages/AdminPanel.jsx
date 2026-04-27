import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import StatsCard from '../components/StatsCard';
import { useLanguage } from '../hooks/useLanguage';

export default function AdminPanel() {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const TABS = [
    { id: 'overview', label: `📊 ${t('overview')}` },
    { id: 'users',    label: `👥 ${t('users')}` },
    { id: 'visits',   label: `🌍 ${t('visitors')}` },
  ];

  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') loadData(tab);
  }, [tab, user]);

  useEffect(() => {
    if (tab === 'users') {
      const delay = setTimeout(() => loadData('users'), 500);
      return () => clearTimeout(delay);
    }
  }, [search]);

  async function loadData(currentTab) {
    setLoading(true);
    try {
      if (currentTab === 'overview') {
        const res = await api.getAdminStats();
        setStats(res.stats);
      } else if (currentTab === 'users') {
        const res = await api.getAdminUsers({ search });
        setUsers(res.users);
      } else if (currentTab === 'visits') {
        const res = await api.getAdminVisits();
        setVisits(res.visits);
      }
    } catch (err) {
      toast.error(err.message || t('failedLoadAdmin'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUser() {
    setSavingUser(true);
    try {
      await api.updateAdminUser(editingUser.id, editingUser);
      toast.success(t('userUpdated'));
      setEditingUser(null);
      loadData('users');
    } catch (err) {
      toast.error(err.message || t('failedUpdateUser'));
    } finally {
      setSavingUser(false);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm(t('confirmDeleteUser'))) return;
    try {
      await api.deleteAdminUser(id);
      toast.success(t('userDeleted'));
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      toast.error(err.message || t('failedDeleteUser'));
    }
  }

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white gradient-text">{t('adminPanel')}</h1>
          <p className="text-gray-400 text-sm mt-2">{t('managePlatform')}</p>
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

        {loading && !stats && !users.length && !visits.length && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Overview Tab */}
        {tab === 'overview' && stats && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard icon="👥" label={t('totalUsers')}        value={stats.total_users}         color="#3b82f6" />
              <StatsCard icon="👀" label={t('totalViews')}        value={stats.total_views}         color="#a855f7" />
              <StatsCard icon="🖱" label={t('totalClicks')}       value={stats.total_clicks}        color="#22c55e" />
              <StatsCard icon="🔗" label={t('totalLinks')}        value={stats.total_links}         color="#f59e0b" />
              <StatsCard icon="🌟" label={t('newUsersToday')}     value={stats.new_users_today}     color="#ec4899" />
              <StatsCard icon="🌍" label={t('totalLoggedVisits')} value={stats.active_visits}       color="#14b8a6" />
              <StatsCard icon="IP" label={t('loggedClicks')}      value={stats.logged_clicks || 0}  color="#f97316" />
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-4">
              <input type="text" placeholder={t('searchUsers')} className="input-dark w-full"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-gray-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">{t('user')}</th>
                      <th className="px-6 py-4">{t('role')}</th>
                      <th className="px-6 py-4">{t('stats')}</th>
                      <th className="px-6 py-4">{t('lastLogin')}</th>
                      <th className="px-6 py-4">{t('joined')}</th>
                      <th className="px-6 py-4">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.username} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/50 to-indigo-500/50 flex items-center justify-center font-bold text-white text-sm">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{u.display_name || u.username}</span>
                                {u.is_verified === 1 && <span className="text-blue-400 text-xs" title="Verified">✓</span>}
                              </div>
                              <div className="text-xs text-gray-400">@{u.username}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-500/20 text-gray-300'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-300">
                            <div>👀 {u.views || 0} {t('totalViews').toLowerCase()}</div>
                            <div>🖱 {u.total_clicks || 0} {t('clicks')}</div>
                            <div>🔗 {u.link_count || 0} {t('links').toLowerCase()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-300">
                            <div>{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : t('never')}</div>
                            <div className="text-gray-500 font-mono text-[10px] mt-1">{u.last_login_ip || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => setEditingUser({ ...u })}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all text-xs border border-blue-500/20">
                              {t('edit')}
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-xs border border-red-500/20">
                              {t('delete')}
                            </button>
                            <a href={`/${u.username}`} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-all text-xs border border-white/10">
                              {t('view')}
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && !loading && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">{t('noUsersFound')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Visits Tab */}
        {tab === 'visits' && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/[0.08]">
                <h3 className="font-semibold text-white">{t('recentVisitors')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-gray-400 text-xs uppercase tracking-wider bg-white/[0.02]">
                      <th className="px-6 py-3">{t('time')}</th>
                      <th className="px-6 py-3">{t('ipAddress')}</th>
                      <th className="px-6 py-3">{t('device')}</th>
                      <th className="px-6 py-3">{t('country')}</th>
                      <th className="px-6 py-3">{t('profileVisited')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {visits.map((v, i) => (
                      <tr key={v.id || i} className="hover:bg-white/[0.02] transition-colors text-sm text-gray-300">
                        <td className="px-6 py-3 whitespace-nowrap text-gray-400 text-xs">
                          {new Date(v.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs">{v.visitor_ip}</td>
                        <td className="px-6 py-3">{v.device_type || 'desktop'}</td>
                        <td className="px-6 py-3">
                          {v.country ? (
                            <span className="flex items-center gap-1.5">
                              {v.city ? `${v.city}, ` : ''}{v.country_label || v.country}
                            </span>
                          ) : (
                            <span className="text-gray-500">{t('unknown')}</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {v.visited_profile ? (
                            <a href={`/${v.visited_profile}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                              @{v.visited_profile}
                            </a>
                          ) : (
                            <span className="text-gray-500">{t('generalUnknown')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {visits.length === 0 && !loading && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">{t('noVisitLogs')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">{t('editUser')} {editingUser.username}</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('username')}</label>
                  <input className="input-dark py-2" value={editingUser.username || ''}
                    onChange={e => setEditingUser({...editingUser, username: e.target.value.toLowerCase()})} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('role')}</label>
                  <select className="input-dark py-2 appearance-none cursor-pointer"
                    value={editingUser.role || 'user'}
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                    <option value="user">{t('user')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('email')}</label>
                <input className="input-dark py-2" type="email" value={editingUser.email || ''}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('displayNameLabel')}</label>
                <input className="input-dark py-2" value={editingUser.display_name || ''}
                  onChange={e => setEditingUser({...editingUser, display_name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('bio')}</label>
                <textarea className="input-dark py-2 min-h-[80px]" value={editingUser.bio || ''}
                  onChange={e => setEditingUser({...editingUser, bio: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('totalViewsEdit')}</label>
                  <input className="input-dark py-2" type="number" min="0" value={editingUser.views || 0}
                    onChange={e => setEditingUser({...editingUser, views: parseInt(e.target.value) || 0})} />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-purple-500"
                      checked={editingUser.is_verified === 1}
                      onChange={e => setEditingUser({...editingUser, is_verified: e.target.checked ? 1 : 0})} />
                    <span className="text-sm text-blue-400 font-medium">{t('verifiedAccount')}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02]">
              <button onClick={() => setEditingUser(null)}
                className="px-5 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
                {t('cancel')}
              </button>
              <button onClick={handleSaveUser} disabled={savingUser} className="glow-btn !px-6 !py-2 text-sm disabled:opacity-50">
                {savingUser ? t('saving') : `💾 ${t('saveChanges')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
