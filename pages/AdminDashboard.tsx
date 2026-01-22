import React, { useState, useEffect } from 'react';
import { User, UserRole, AdminUser, AuditLogEntry, AuditAction, SystemBankDetails } from '../types';
import { getUsers, updateUserStatus, deleteUser, getAuditLogs, addAuditLog, getSystemBankDetails, saveSystemBankDetails } from '../services/admin';
import { Shield, Trash2, Ban, CheckCircle, Search, AlertCircle, Users, Activity, UserX, FileText, Clock, CreditCard, Save, Eye, EyeOff } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'monetization'>('users');
  
  // Monetization State
  const [bankDetails, setBankDetails] = useState<SystemBankDetails>({
    bankName: '',
    accountName: '',
    accountNumber: '',
    isVisible: false
  });
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchBankDetails();
  }, []);

  useEffect(() => {
    if (activeTab === 'system') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    const details = await getSystemBankDetails();
    setBankDetails(details);
  };

  const handleStatusToggle = async (userId: string, currentStatus: 'ACTIVE' | 'DISABLED') => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    // Optimistic update
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    
    try {
      await updateUserStatus(userId, newStatus);
      
      // Log Action
      await addAuditLog({
        action: newStatus === 'DISABLED' ? AuditAction.USER_BANNED : AuditAction.USER_UNBANNED,
        adminName: user.name,
        targetUser: targetUser.email,
        details: `Admin changed status from ${currentStatus} to ${newStatus}`
      });

    } catch (error) {
      // Revert on failure
      setUsers(users.map(u => u.id === userId ? { ...u, status: currentStatus } : u));
      alert("Failed to update status");
    }
  };

  const handleDelete = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (!window.confirm(`Are you sure you want to permanently delete ${targetUser.name}? This action cannot be undone.`)) return;

    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));

      // Log Action
      await addAuditLog({
        action: AuditAction.USER_DELETED,
        adminName: user.name,
        targetUser: targetUser.email,
        details: `User account permanently deleted by admin`
      });

    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleSaveBankDetails = async () => {
    setSavingBank(true);
    try {
      await saveSystemBankDetails(bankDetails);
      await addAuditLog({
        action: AuditAction.SYSTEM_UPDATE,
        adminName: user.name,
        targetUser: 'SYSTEM',
        details: `Admin updated monetization settings. Public: ${bankDetails.isVisible}`
      });
      alert("Monetization settings saved.");
    } catch (e) {
      alert("Failed to save settings");
    } finally {
      setSavingBank(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const disabledCount = users.filter(u => u.status === 'DISABLED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-purple-500" size={32} />
            Admin Console
          </h1>
          <p className="text-slate-400 mt-1">System wide controls and user management</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            User Management
          </button>
           <button 
            onClick={() => setActiveTab('monetization')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'monetization' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            Monetization
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'system' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
                <Users className="text-blue-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">Active Accounts</h3>
                <Activity className="text-green-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-white">{activeCount}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">Disabled/Banned</h3>
                <UserX className="text-red-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-white">{disabledCount}</p>
            </div>
          </div>

          {/* User Table Section */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden backdrop-blur-sm">
            {/* Table Header / Search */}
            <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Registered Users</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none w-full sm:w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p>No users found matching your search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 font-semibold">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-700/30 transition duration-150">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            u.role === UserRole.ADMIN 
                              ? 'bg-purple-900/30 text-purple-400 border-purple-500/30' 
                              : 'bg-slate-700/50 text-slate-300 border-slate-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.status === 'ACTIVE' 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {u.status === 'ACTIVE' ? <CheckCircle size={12} className="mr-1" /> : <Ban size={12} className="mr-1" />}
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {new Date(u.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {u.role !== UserRole.ADMIN && (
                              <>
                                <button 
                                  onClick={() => handleStatusToggle(u.id, u.status)}
                                  className={`p-2 rounded-lg transition ${
                                    u.status === 'ACTIVE' 
                                      ? 'text-yellow-400 hover:bg-yellow-400/10' 
                                      : 'text-green-400 hover:bg-green-400/10'
                                  }`}
                                  title={u.status === 'ACTIVE' ? "Disable User" : "Enable User"}
                                >
                                  {u.status === 'ACTIVE' ? <Ban size={18} /> : <CheckCircle size={18} />}
                                </button>
                                <button 
                                  onClick={() => handleDelete(u.id)}
                                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                  title="Delete User"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'monetization' && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden backdrop-blur-sm max-w-2xl mx-auto">
          <div className="p-6 border-b border-slate-700">
             <h2 className="text-xl font-bold text-white flex items-center">
              <CreditCard className="mr-2 text-green-400" size={24} />
              Monetization Settings
            </h2>
            <p className="text-sm text-slate-400 mt-1">Configure the bank details that users will see when they upgrade their account.</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
               <div>
                 <h3 className="text-white font-medium">Public Visibility</h3>
                 <p className="text-xs text-slate-400">Show these bank details on all user dashboards.</p>
               </div>
               <button 
                onClick={() => setBankDetails({...bankDetails, isVisible: !bankDetails.isVisible})}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition ${bankDetails.isVisible ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'}`}
               >
                 {bankDetails.isVisible ? <Eye size={16}/> : <EyeOff size={16}/>}
                 <span>{bankDetails.isVisible ? 'Public' : 'Hidden'}</span>
               </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Bank Name</label>
              <input 
                type="text" 
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                placeholder="e.g. Chase Bank"
              />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-slate-400 mb-1">Account Name</label>
              <input 
                type="text" 
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                placeholder="e.g. DAV PRO LLC"
              />
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-400 mb-1">Account Number</label>
              <input 
                type="text" 
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                placeholder="e.g. 0987654321"
              />
            </div>

            <div className="pt-4 border-t border-slate-700">
              <button 
                onClick={handleSaveBankDetails}
                disabled={savingBank}
                className="w-full flex justify-center items-center py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/30"
              >
                {savingBank ? 'Saving...' : <><Save size={18} className="mr-2"/> Save Configuration</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FileText className="mr-2 text-slate-400" size={20} />
              System Audit Logs
            </h2>
            <p className="text-sm text-slate-400 mt-1">Track administrative actions and security events.</p>
          </div>

          {logsLoading ? (
             <div className="p-12 text-center text-slate-400">Loading audit logs...</div>
          ) : logs.length === 0 ? (
             <div className="p-12 text-center text-slate-400">No logs available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 font-semibold">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Admin</th>
                    <th className="p-4">Target</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/30 transition">
                      <td className="p-4 text-sm text-slate-400 font-mono">
                         <div className="flex items-center">
                           <Clock size={14} className="mr-2 text-slate-500" />
                           {new Date(log.timestamp).toLocaleString()}
                         </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          log.action === AuditAction.USER_DELETED ? 'bg-red-900/40 text-red-400 border border-red-500/20' :
                          log.action === AuditAction.USER_BANNED ? 'bg-orange-900/40 text-orange-400 border border-orange-500/20' :
                          log.action === AuditAction.USER_UNBANNED ? 'bg-green-900/40 text-green-400 border border-green-500/20' :
                          'bg-blue-900/40 text-blue-400 border border-blue-500/20'
                        }`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-white font-medium">
                        {log.adminName}
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {log.targetUser}
                      </td>
                      <td className="p-4 text-sm text-slate-400">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;