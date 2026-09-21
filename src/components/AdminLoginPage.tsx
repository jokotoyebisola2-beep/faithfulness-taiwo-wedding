import type React from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Key, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  loginWithPasscode,
  getSupabaseStatus,
} from '../services/supabaseService';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToPublic: () => void;
}

export function AdminLoginPage({ onSuccess, onBackToPublic }: AdminLoginPageProps) {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabaseStatus = getSupabaseStatus();

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!passcode.trim()) {
      setError('Please enter your wedding admin passcode.');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await loginWithPasscode(passcode);
      if (ok) {
        setPasscode('');
        onSuccess();
      } else {
        setError('Incorrect passcode. Please verify and try again.');
      }
    } catch {
      setError('Login error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1B3022] flex flex-col justify-between p-4 sm:p-6 md:p-8 selection:bg-[#1B3022] selection:text-[#FDFCF8]">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <button
          type="button"
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B3022]/70 hover:text-[#1B3022] transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-[#1B3022]/5"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Return to Wedding Invitation</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
          <span className="text-[11px] uppercase tracking-widest text-[#1B3022]/60 font-medium">
            Admin Portal
          </span>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full border border-[#1B3022]/10 shadow-lg relative"
        >
          {/* Couple Monogram Badge */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#1B3022] text-[#C5A059] flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-white ring-1 ring-[#1B3022]/10">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C5A059] mb-1">
              Faithfulness &amp; Taiwo
            </p>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#1B3022]">
              Wedding Admin Login
            </h1>
            <p className="text-xs text-[#1B3022]/60 mt-2 max-w-xs mx-auto leading-relaxed">
              This area is protected. Please enter the admin passcode to access the invitation dashboard and RSVPs.
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 text-center font-medium"
            >
              {error}
            </motion.div>
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
                  type={showPasscode ? 'text' : 'password'}
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. faithful2026)"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#FDFCF8] border border-[#1B3022]/15 text-xs text-[#1B3022] placeholder:text-[#1B3022]/40 focus:outline-none focus:ring-2 focus:ring-[#1B3022]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-3 text-[#1B3022]/50 hover:text-[#1B3022] transition-colors p-0.5 cursor-pointer"
                  title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-2.5 p-2.5 rounded-lg bg-[#FDFCF8] border border-[#1B3022]/10 text-[11px] text-[#1B3022]/70 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span>
                  Default passcode: <code className="bg-[#1B3022]/5 px-1 py-0.5 rounded font-mono font-semibold text-[#1B3022]">faithful2026</code>
                </span>
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#1B3022] text-[#FDFCF8] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#C5A059] hover:text-[#122218] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>Unlock Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToPublic}
              className="text-xs text-[#1B3022]/60 hover:text-[#1B3022] hover:underline transition-colors cursor-pointer"
            >
              Cancel and view public invitation
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#1B3022]/50 py-2">
        Faithfulness &amp; Taiwo &bull; 24 October 2026 &bull; Protected Area
      </footer>
    </div>
  );
}
