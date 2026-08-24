import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface ChangePasswordModalProps {
  targetUser?: User;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  targetUser,
  onClose,
}) => {
  const { currentUser, updateUserPassword, showToast } = useApp();

  const user = targetUser || currentUser;
  const isSelf = !targetUser || targetUser.id === currentUser?.id;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setConfirmPassword(pass);
    setShowNew(true);
    setShowConfirm(true);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSelf && !currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    const res = updateUserPassword(
      user.id,
      newPassword,
      isSelf ? currentPassword : undefined
    );

    if (!res.success) {
      setError(res.message);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-[#0F131C] text-[#E0E0E0] rounded-2xl shadow-2xl border border-[#232B3C] w-full max-w-md overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#141924] border-b border-[#232B3C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isSelf ? 'Change My Password' : `Reset Password for ${user.name}`}
              </h2>
              <p className="text-xs text-gray-400">
                User: <span className="text-amber-400 font-mono font-semibold">{user.username}</span> ({user.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#1A2130] rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Password Field (for self only) */}
          {isSelf && (
            <div className="space-y-1">
              <label className="block text-gray-300 font-semibold">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#182030] border border-[#2C384E] rounded-xl pl-9 pr-10 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-gray-300 font-semibold">
                New Password *
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Random</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 4 characters)"
                className="w-full bg-[#182030] border border-[#2C384E] rounded-xl pl-9 pr-10 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="block text-gray-300 font-semibold">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full bg-[#182030] border rounded-xl pl-9 pr-10 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none ${
                  confirmPassword && newPassword === confirmPassword
                    ? 'border-emerald-500'
                    : confirmPassword && newPassword !== confirmPassword
                    ? 'border-rose-500'
                    : 'border-[#2C384E] focus:border-amber-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match perfectly.
              </p>
            )}
          </div>

          {/* Security Note */}
          <div className="bg-[#141924] border border-[#232B3C] rounded-xl p-3 text-[11px] text-gray-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your new password is encrypted and saved locally in your current workstation session and browser storage.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-[#182030] hover:bg-[#202B40] text-gray-300 font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition"
            >
              Save Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
