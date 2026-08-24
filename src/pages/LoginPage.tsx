import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Gem,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield,
  UserPlus,
  Trash2,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { users, login, addUser, deleteUser, settings } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newPhone, setNewPhone] = useState('');

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMessage('Please select a user account.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter the password.');
      return;
    }

    const success = login(selectedUser.username, selectedUser.role);
    if (!success) {
      setErrorMessage('Invalid credentials.');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim() || !newEmail.trim()) {
      alert('Please fill out all required user fields.');
      return;
    }

    addUser({
      username: newUsername.toLowerCase().trim(),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      password: 'password123',
      phoneNumber: newPhone.trim() || '+94 77 000 0000',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    });

    setShowAddUserModal(false);
    setNewUsername('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20 mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Gem className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl font-serif font-bold tracking-tight text-white">
            WCS INVENTORY INVOICE
          </h1>
          <p className="text-xs text-amber-400 font-medium">
            Sri Lankan Gemstone & Fine Jewelry Management
          </p>
          <p className="text-[11px] text-slate-400">
            {settings.companyName}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* User Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Select Staff Account</span>
              <span className="text-[10px] text-slate-500">{users.length} accounts</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — [{u.role.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Role Card Preview */}
          {selectedUser && (
            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{selectedUser.name}</p>
                  <p className="text-[11px] text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase rounded">
                  {selectedUser.role} Access
                </span>
              </div>
            </div>
          )}

          {/* Password Field with Hidden Show/Hide Button */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Default demo password is prefilled (`password123`)</p>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 mt-2"
          >
            <Shield className="w-4 h-4" />
            Secure Login to Dashboard
          </button>
        </form>

        {/* Quick Demo Switcher Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Instant One-Click Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {users.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUserId(u.id);
                  login(u.username, u.role);
                }}
                className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-center transition text-[11px]"
              >
                <div className="font-bold text-slate-200 truncate">{u.name.split(' ')[0]}</div>
                <div className="text-[10px] text-amber-400 uppercase font-semibold">{u.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* User Management Actions (Add / Delete) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add User Manually
          </button>

          {users.length > 1 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete user ${selectedUser?.name}?`)) {
                  deleteUser(selectedUserId);
                  setSelectedUserId(users[0]?.id || '');
                }
              }}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 transition"
              title="Delete Selected User"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete User
            </button>
          )}
        </div>
      </div>

      {/* Role Permission Guidance */}
      <div className="mt-8 max-w-md w-full bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-[11px] text-slate-400 space-y-1.5">
        <p className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          Role Permissions Matrix
        </p>
        <p><strong className="text-amber-400">Admin & Owner:</strong> Full system access (Inventory, Workshop Orders, POS, Reports, Purchases, Settings, Backup).</p>
        <p><strong className="text-amber-400">User:</strong> Invoice POS, sales history, certificates & customer directory only.</p>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                Add New Staff Account
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Siriwardena"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kasuns"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kasun@wcsgems.lk"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">System Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="user">User (Invoice & Sales Only)</option>
                  <option value="admin">Admin (Full System Access)</option>
                  <option value="owner">Owner (Full System Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
