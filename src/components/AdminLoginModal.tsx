import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, Key, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import {
  loginWithPasscode,
  signInAdminWithGoogle,
  getFirebaseStatus,
} from '../services/firebaseService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminLoginModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fbStatus = getFirebaseStatus();

  if (!isOpen) return null;

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!passcode.trim()) {
      setError('Please enter the wedding admin passcode.');
      return;
    }

    const ok = loginWithPasscode(passcode);
    if (ok) {
      setPasscode('');
      onSuccess();
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAdminWithGoogle();
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in error. Try the passcode below.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#FDFCF8] rounded-2xl p-6 sm:p-8 max-w-md w-full border border-[#1B3022]/10 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-[#1B3022]/60 hover:text-[#1B3022] hover:bg-[#1B3022]/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#1B3022] text-[#C5A059] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-2xl text-[#1B3022]">
              Couple Admin Login
            </h3>
            <p className="text-xs text-[#1B3022]/60 mt-1">
              Enter your access passcode to edit the invitation website.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 text-center">
              {error}
            </div>
          )}

          {/* Passcode Form */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-passcode-input"
                className="block text-[10px] font-bold uppercase tracking-wider text-[#1B3022] mb-1.5"
              >
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  id="admin-passcode-input"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. faithful2026)"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#1B3022]/15 text-xs text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#1B3022]/30"
                />
                <Key className="w-4 h-4 text-[#C5A059] absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#1B3022]/60 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                Default wedding passcode: <code className="bg-[#1B3022]/5 px-1 rounded text-[#1B3022] font-mono">faithful2026</code>
              </p>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              className="w-full py-3 px-5 rounded-xl bg-[#1B3022] text-[#FDFCF8] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#C5A059]" />
            </button>
          </form>

          {/* Optional Google Login if Firebase Auth available */}
          {fbStatus.hasAuth && (
            <div className="mt-5 pt-5 border-t border-[#1B3022]/10 text-center">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-[#1B3022]/15 bg-white text-xs font-medium text-[#1B3022] hover:bg-[#1B3022]/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Sign in with Google</span>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
