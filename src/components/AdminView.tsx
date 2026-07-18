import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Search, 
  Ban, 
  Unlock, 
  ShieldAlert, 
  TrendingUp, 
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { User } from '../types';

interface AdminViewProps {
  currentUser: User | null;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch admin statistics');
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ban: !currentBanStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update ban status');
      
      // Refresh local view
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Could not toggle user status');
    }
  };

  if (currentUser?.email !== 'zabihullah7235@gmail.com') {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The administrative control panel is restricted to the master administrator account (<strong>zabihullah7235@gmail.com</strong>) only. Log in with the master administrator account to view revenue diagnostics, active users, and manage bans.
        </p>
      </div>
    );
  }

  const filteredUsers = stats?.users.filter((user: User) => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span>CVForge Admin Dashboard</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Real-time analytics, user subscriptions metrics, and database registrations.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Refresh Data</span>}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 space-y-2">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Gathering system diagnostics...</p>
        </div>
      ) : error ? (
        <p className="text-xs text-red-500 text-center font-bold">{error}</p>
      ) : (
        <div className="space-y-8">
          
          {/* Diagnostic Metrics boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Users Registered</span>
                <span className="block text-3xl font-black text-slate-900">{stats.totalUsers}</span>
                <div className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% growth this week</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Resumes Created Today</span>
                <span className="block text-3xl font-black text-slate-900">{stats.totalResumes}</span>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Optimal pass rates active</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue</span>
                <span className="block text-3xl font-black text-slate-900">${stats.revenue}</span>
                <div className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Annual billing active</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 text-amber-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">User Directory & Status</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Manage accounts, verify subscription tiers, or suspend abusers.</p>
              </div>

              {/* Search Field */}
              <div className="relative max-w-xs w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6">User Name</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Subscription Tier</th>
                    <th className="py-3.5 px-6">Registered On</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user: User) => (
                      <tr key={user.id} className="hover:bg-slate-50/55 transition">
                        <td className="py-4 px-6 font-bold text-slate-950">{user.fullName}</td>
                        <td className="py-4 px-6 font-mono text-slate-500">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            user.plan === 'premium'
                              ? 'bg-amber-100 text-amber-800'
                              : user.plan === 'standard'
                              ? 'bg-blue-100 text-blue-800'
                              : user.plan === 'basic'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleBanToggle(user.id, user.isBanned)}
                            className={`py-1 px-2.5 rounded text-[10px] font-bold flex items-center gap-1 ml-auto cursor-pointer border ${
                              user.isBanned
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {user.isBanned ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Reinstate</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3 h-3" />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No matches found inside database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
