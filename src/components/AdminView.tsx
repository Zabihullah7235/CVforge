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
  Loader2,
  Inbox,
  CreditCard,
  BarChart3,
  Mail,
  Send,
  Trash2,
  Check,
  ShieldCheck,
  History,
  Lock as LockIcon
} from 'lucide-react';
import { User } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';

interface AdminViewProps {
  currentUser: User | null;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'users' | 'payments' | 'contacts' | 'emails'>('analytics');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Interactive admin fields
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [tempPassword, setTempPassword] = useState<{ [key: string]: string }>({});
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('cvforge_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Access denied or server error');
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to authorize administrator token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const triggerNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // User Administration Handlers
  const handleUserStatusChange = async (targetUserId: string, action: 'ban' | 'unban' | 'suspend' | 'activate') => {
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ targetUserId, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user status');
      triggerNotification(`User status changed successfully: ${action.toUpperCase()}`);
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUserPlanChange = async (targetUserId: string, newPlan: string) => {
    try {
      const res = await fetch('/api/admin/users/subscription', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ targetUserId, newPlan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update subscription');
      triggerNotification(`Subscription plan updated: ${newPlan.toUpperCase()}`);
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdminResetPassword = async (targetUserId: string) => {
    const pwd = tempPassword[targetUserId];
    if (!pwd || pwd.length < 6) {
      alert('Please specify a secure temporary password (at least 6 chars).');
      return;
    }

    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ targetUserId, tempPassword: pwd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      
      triggerNotification('Password reset successfully! Temporary credential is active.');
      setTempPassword(prev => ({ ...prev, [targetUserId]: '' }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUserDelete = async (userId: string) => {
    const confirm = window.confirm('Are you sure you want to PERMANENTLY delete this user? All their resumes and transaction history will be purged.');
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Purge failed');
      }
      triggerNotification('User deleted permanently.');
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Payment LEDGER Actions
  const handlePaymentAction = async (paymentId: string, action: 'approve' | 'refund' | 'cancel' | 'delete') => {
    try {
      const res = await fetch('/api/admin/payments/action', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentId, action })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      triggerNotification(`Payment state updated: ${action.toUpperCase()}`);
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Contact Support Inbox actions
  const handleContactAction = async (messageId: string, action: 'read' | 'reply' | 'delete' | 'archive') => {
    const reply = replyText[messageId] || '';
    if (action === 'reply' && !reply) {
      alert('Please write an email response first.');
      return;
    }

    try {
      const res = await fetch('/api/admin/contacts/action', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ messageId, action, replyMessage: reply })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      triggerNotification(`Support ticket status updated: ${action.toUpperCase()}`);
      if (action === 'reply') {
        setReplyText(prev => ({ ...prev, [messageId]: '' }));
      }
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Restrict access
  if (!currentUser || currentUser.email !== 'zabihullah7235@gmail.com') {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The administrative control panel is restricted to the master administrator account (<strong>zabihullah7235@gmail.com</strong>) only. Please sign up or log in as the default administrator to view revenue diagnostic data.
        </p>
      </div>
    );
  }

  // Filter lists
  const filteredUsers = stats?.users?.filter((user: any) => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Alert toast notification */}
      {actionSuccess && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-900 border border-emerald-500/30 text-emerald-100 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span>CVForge SaaS Administrative Command Panel</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Securely auditting registrations, subscription recurring revenue, PayPal/Stripe logs, and support inquiries.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer border shadow-sm"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Sync Metrics</span>}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 space-y-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-slate-600">Retrieving system database values...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-6 text-center space-y-2 max-w-lg mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto" />
          <h4 className="font-extrabold text-sm">System Authorization Error</h4>
          <p className="text-xs text-red-700">{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Main Stats Bento boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Users</span>
                <span className="block text-2xl font-black text-slate-900">{stats.totalUsers}</span>
                <span className="block text-[9px] text-indigo-600 font-bold">
                  {stats.newUsersToday} new registrations today
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Estimated Revenue</span>
                <span className="block text-2xl font-black text-slate-900">${stats.totalRevenue.toFixed(2)}</span>
                <span className="block text-[9px] text-emerald-600 font-bold">
                  ${stats.monthlyRevenue.toFixed(2)} this month (est)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Resumes</span>
                <span className="block text-2xl font-black text-slate-900">{stats.totalResumesGenerated}</span>
                <span className="block text-[9px] text-indigo-600 font-bold">
                  {stats.totalAiCreditsUsed} AI credits used
                </span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Support Inbox</span>
                <span className="block text-2xl font-black text-slate-900">
                  {stats.contactMessages?.filter((m: any) => m.status === 'unread').length || 0}
                </span>
                <span className="block text-[9px] text-amber-600 font-bold">
                  {stats.contactMessages?.length || 0} total enquiries
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Inbox className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`py-2 px-4 text-xs font-extrabold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'analytics'
                  ? 'border-indigo-600 text-indigo-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Real-Time Analytics</span>
            </button>
            <button
              onClick={() => setActiveSubTab('users')}
              className={`py-2 px-4 text-xs font-extrabold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'users'
                  ? 'border-indigo-600 text-indigo-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directories ({stats.users?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`py-2 px-4 text-xs font-extrabold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'payments'
                  ? 'border-indigo-600 text-indigo-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payments Ledger ({stats.payments?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('contacts')}
              className={`py-2 px-4 text-xs font-extrabold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'contacts'
                  ? 'border-indigo-600 text-indigo-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Support Helpdesk ({stats.contactMessages?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('emails')}
              className={`py-2 px-4 text-xs font-extrabold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'emails'
                  ? 'border-indigo-600 text-indigo-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Mail Dispatcher ({stats.emails?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: REAL-TIME ANALYTICS (Recharts) */}
          {activeSubTab === 'analytics' && stats.analytics?.dailyLogs && (
            <div className="space-y-6">
              
              {/* Daily Visitor & Registration Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Traffic & Registrations</h3>
                    <p className="text-slate-500 text-[10px]">Comparing website traffic visitors with registration volume (Daily)</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.analytics.dailyLogs}>
                        <defs>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 9}} />
                        <YAxis tick={{fontSize: 9}} />
                        <Tooltip contentStyle={{fontSize: '11px', borderRadius: '10px'}} />
                        <Legend wrapperStyle={{fontSize: '11px'}} />
                        <Area type="monotone" name="Traffic Visitors" dataKey="visitors" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={2} />
                        <Area type="monotone" name="New Accounts" dataKey="signups" stroke="#10b981" fillOpacity={1} fill="url(#colorSignups)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Daily Generated Revenue ($)</h3>
                    <p className="text-slate-500 text-[10px]">Income collection breakdown from Stripe and PayPal checkouts</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.analytics.dailyLogs}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 9}} />
                        <YAxis tick={{fontSize: 9}} />
                        <Tooltip contentStyle={{fontSize: '11px', borderRadius: '10px'}} />
                        <Legend wrapperStyle={{fontSize: '11px'}} />
                        <Bar name="Checkout Income ($)" dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar name="AI Assist Invocations" dataKey="aiUsage" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Historical month logs */}
              {stats.analytics?.monthlyLogs && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Monthly Performance & Income Growth</h3>
                    <p className="text-slate-500 text-[10px]">Auditing long-term visitor stats, creations, and monthly MRR curves</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.analytics.monthlyLogs}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{fontSize: 10}} />
                        <YAxis tick={{fontSize: 10}} />
                        <Tooltip contentStyle={{fontSize: '11px', borderRadius: '10px'}} />
                        <Legend wrapperStyle={{fontSize: '11px'}} />
                        <Area type="monotone" name="Monthly Revenue ($)" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2.5} />
                        <Area type="monotone" name="Resumes Processed" dataKey="resumes" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="4 4" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: USER DIRECTORIES */}
          {activeSubTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Account Database Management</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Control billing states, trigger administrative temporary password overrides, or ban abusive users.</p>
                </div>

                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, country..."
                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-5">User Account Details</th>
                      <th className="py-3 px-5">Contact Info</th>
                      <th className="py-3 px-5">Subscription Plan</th>
                      <th className="py-3 px-5">Credits & Resumes</th>
                      <th className="py-3 px-5">Change Settings</th>
                      <th className="py-3 px-5 text-right">Delete Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <tr key={user.id} className={`hover:bg-slate-50/50 transition ${user.isBanned ? 'bg-red-50/30' : ''}`}>
                          <td className="py-4 px-5">
                            <div className="font-extrabold text-slate-950 flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {user.isBanned && (
                                <span className="bg-red-100 text-red-800 text-[8px] font-black uppercase px-1 py-0.2 rounded">
                                  Banned
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">@{user.username || 'n/a'}</div>
                            <div className="text-[9px] font-mono text-slate-400">Registered: {new Date(user.createdAt).toLocaleDateString()}</div>
                          </td>

                          <td className="py-4 px-5 space-y-0.5">
                            <div className="font-mono text-slate-500 font-medium">{user.email}</div>
                            <div className="text-[10px] text-slate-400">{user.phone || 'No phone'} | {user.country || 'No country'}</div>
                          </td>

                          <td className="py-4 px-5">
                            <select
                              value={user.plan}
                              onChange={(e) => handleUserPlanChange(user.id, e.target.value)}
                              className="py-1 px-2 border border-slate-200 rounded text-[10px] font-bold uppercase text-slate-700 bg-slate-50 focus:outline-none"
                            >
                              <option value="free">Free</option>
                              <option value="basic">Basic</option>
                              <option value="pro">Pro</option>
                              <option value="business">Business</option>
                              <option value="enterprise">Enterprise</option>
                              <option value="premium">Premium</option>
                            </select>
                          </td>

                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-800">{user.resumeCount || 0} resumes saved</div>
                            <div className="text-[10px] text-slate-400">{user.aiCredits || 10} AI assist credits</div>
                          </td>

                          <td className="py-4 px-5 space-y-1.5">
                            {/* Force password reset input and button */}
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Temp password"
                                value={tempPassword[user.id] || ''}
                                onChange={(e) => setTempPassword({ ...tempPassword, [user.id]: e.target.value })}
                                className="border border-slate-200 rounded px-2 py-0.5 text-[10px] max-w-[110px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => handleAdminResetPassword(user.id)}
                                className="bg-slate-100 border border-slate-200 p-1 hover:bg-indigo-50 hover:text-indigo-600 rounded cursor-pointer transition text-slate-500"
                                title="Reset user password"
                              >
                                <LockIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Suspend / Ban Toggle */}
                            <button
                              onClick={() => handleUserStatusChange(user.id, user.isBanned ? 'activate' : 'ban')}
                              className={`text-[10px] font-bold py-0.5 px-2 rounded border flex items-center gap-1 cursor-pointer transition ${
                                user.isBanned 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {user.isBanned ? <Unlock className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                              <span>{user.isBanned ? 'Unban Account' : 'Suspend Account'}</span>
                            </button>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => handleUserDelete(user.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 p-1.5 rounded-lg cursor-pointer transition ml-auto flex"
                              title="Delete user permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-400">No matching user accounts inside database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS LEDGER */}
          {activeSubTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-150">
                <h3 className="font-extrabold text-slate-900 text-sm">Stripe & PayPal Transaction History</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Real-time gateway webhook receipts, completed subscription billing parameters, and invoice records.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-5">Invoice Reference</th>
                      <th className="py-3 px-5">Account Reference</th>
                      <th className="py-3 px-5">Payment Method</th>
                      <th className="py-3 px-5">Date & Time</th>
                      <th className="py-3 px-5">Amount (USD)</th>
                      <th className="py-3 px-5">Payment Status</th>
                      <th className="py-3 px-5 text-right">Refund Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                    {stats.payments && stats.payments.length > 0 ? (
                      stats.payments.map((p: any) => {
                        const payingUser = stats.users?.find((u: any) => u.id === p.userId);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/40 transition">
                            <td className="py-4 px-5">
                              <div className="font-bold text-slate-950">{p.invoiceNumber}</div>
                              <div className="text-[10px] text-slate-400 font-mono select-all">TXN ID: {p.transactionId}</div>
                            </td>

                            <td className="py-4 px-5">
                              <div className="font-bold text-slate-800">{payingUser?.fullName || 'Deleted Account'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{payingUser?.email || p.userId}</div>
                            </td>

                            <td className="py-4 px-5">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                                {p.paymentMethod || 'Stripe API'}
                              </span>
                            </td>

                            <td className="py-4 px-5 font-mono text-slate-400 text-[10px]">
                              {new Date(p.date).toLocaleString()}
                            </td>

                            <td className="py-4 px-5">
                              <div className="text-sm font-black text-slate-900">${p.amount?.toFixed(2)}</div>
                              <div className="text-[9px] font-extrabold text-blue-600 uppercase">Plan: {p.plan}</div>
                            </td>

                            <td className="py-4 px-5">
                              <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                p.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : p.status === 'refunded'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-right space-y-1">
                              {p.status === 'completed' && (
                                <button
                                  onClick={() => handlePaymentAction(p.id, 'refund')}
                                  className="text-[10px] font-bold py-0.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded cursor-pointer transition block ml-auto"
                                >
                                  Refund Amount
                                </button>
                              )}
                              <button
                                onClick={() => handlePaymentAction(p.id, 'delete')}
                                className="text-[9px] font-bold text-red-500 hover:underline block ml-auto transition"
                              >
                                Void Record
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">No payment transaction records found in ledger database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT HELPDESK */}
          {activeSubTab === 'contacts' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-150">
                <h3 className="font-extrabold text-slate-900 text-sm">Customer Support Helpdesk</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Read landing-page contact form submissions, and transmit secure replies directly back to standard SMTP email relays.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {stats.contactMessages && stats.contactMessages.length > 0 ? (
                  stats.contactMessages.map((msg: any) => (
                    <div key={msg.id} className={`p-6 space-y-4 hover:bg-slate-50/20 transition ${msg.status === 'unread' ? 'bg-indigo-50/15' : ''}`}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-full bg-slate-100 text-slate-600 mt-0.5 border">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-950 text-xs flex items-center gap-2">
                              <span>{msg.name}</span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                                msg.status === 'unread'
                                  ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                                  : msg.status === 'replied'
                                  ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                  : 'bg-slate-100 border-slate-200 text-slate-600'
                              }`}>
                                {msg.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono select-all">{msg.email}</div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.date).toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-slate-50 border rounded-xl p-3 text-xs text-slate-700 leading-relaxed font-medium">
                        "{msg.message}"
                      </div>

                      {/* Display replies if exists */}
                      {msg.replyMessage && (
                        <div className="ml-6 pl-4 border-l-2 border-emerald-500 bg-emerald-50/30 p-2.5 rounded-r-xl text-xs space-y-1">
                          <span className="block font-black text-emerald-950 text-[10px] uppercase">Response Sent:</span>
                          <p className="text-emerald-900 leading-normal font-medium">"{msg.replyMessage}"</p>
                        </div>
                      )}

                      {/* Answer box if unreplied */}
                      {msg.status !== 'replied' && (
                        <div className="space-y-2 max-w-xl pl-10">
                          <textarea
                            rows={2}
                            placeholder="Type your official administrative email response..."
                            value={replyText[msg.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                            className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleContactAction(msg.id, 'reply')}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition shadow shadow-indigo-200"
                            >
                              <Send className="w-3 h-3" />
                              <span>Transmit Response</span>
                            </button>
                            {msg.status === 'unread' && (
                              <button
                                onClick={() => handleContactAction(msg.id, 'read')}
                                className="text-[10px] font-bold py-1.5 px-3 hover:bg-slate-100 border rounded-lg cursor-pointer text-slate-500 transition"
                              >
                                Mark Read
                              </button>
                            )}
                            <button
                              onClick={() => handleContactAction(msg.id, 'archive')}
                              className="text-[10px] font-bold py-1.5 px-3 hover:bg-slate-100 border rounded-lg cursor-pointer text-slate-500 transition"
                            >
                              Archive Ticket
                            </button>
                            <button
                              onClick={() => handleContactAction(msg.id, 'delete')}
                              className="text-red-500 hover:bg-red-50 text-[10px] font-bold py-1.5 px-2.5 rounded-lg cursor-pointer transition ml-auto"
                            >
                              Delete Inquiry
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 space-y-2">
                    <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400">Support tickets database is currently empty.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TRANSACTIONAL EMAILS */}
          {activeSubTab === 'emails' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-150">
                <h3 className="font-extrabold text-slate-900 text-sm">Transactional SMTP Logs (Simulated Server)</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Auditing transactional automated dispatches including Welcome greetings, Password tokens, and itemized Stripe payments invoice receipts.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {stats.emails && stats.emails.length > 0 ? (
                  [...stats.emails].reverse().map((email: any) => (
                    <div key={email.id} className="p-6 space-y-3 hover:bg-slate-50/20 transition">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg">
                            <Send className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs">
                              Subject: {email.subject}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              To: <span className="font-mono text-slate-700 select-all font-bold">{email.to}</span> | 
                              <span className="capitalize ml-1 bg-slate-100 text-slate-600 border px-1.5 py-0.2 rounded text-[9px] font-bold inline-block">Type: {email.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(email.date).toLocaleString()}
                        </div>
                      </div>

                      {/* Render simulated Email body safely */}
                      <div 
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-medium overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: email.body }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 space-y-2">
                    <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400">No transactional emails have been triggered by the system yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
