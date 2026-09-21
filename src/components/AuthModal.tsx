import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginUser, signupUser, requestPasswordReset, confirmPasswordReset } from '../lib/api.ts';
import { UserPublicProfile } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserPublicProfile) => void;
  initialMode?: 'login' | 'signup' | 'demo' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'demo' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password reset specific
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const session = await loginUser(email, password);
        onLoginSuccess(session.user);
        onClose();
      } else if (mode === 'signup') {
        if (strength < 3) {
          throw new Error('Please choose a stronger password with at least 8 characters, uppercase, and numbers.');
        }
        const session = await signupUser(name, email, password);
        onLoginSuccess(session.user);
        onClose();
      } else if (mode === 'reset') {
        if (resetStep === 'request') {
          const res = await requestPasswordReset(email);
          setSuccessMsg(res.message);
          if (res.demoToken) {
            setResetToken(res.demoToken);
          }
          setResetStep('confirm');
        } else {
          const res = await confirmPasswordReset(resetToken, newPassword);
          setSuccessMsg(res.message);
          setTimeout(() => {
            setMode('login');
            setResetStep('request');
            setSuccessMsg('Password reset complete. You may now sign in with your new credentials.');
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (userEmail: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const session = await loginUser(userEmail, pass);
      onLoginSuccess(session.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <ShieldCheck className="h-5 w-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">EcoContradict Security</h3>
                <p className="text-xs text-emerald-100">Zero-Trust Identity & Session Security</p>
              </div>
            </div>
            <button
              id="auth-modal-close-btn"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex rounded-lg bg-black/20 p-1 text-xs font-medium">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 rounded-md py-1.5 transition-all ${
                mode === 'login' ? 'bg-white text-stone-900 font-semibold shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-auth-signup"
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 rounded-md py-1.5 transition-all ${
                mode === 'signup' ? 'bg-white text-stone-900 font-semibold shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              id="tab-auth-demo"
              type="button"
              onClick={() => { setMode('demo'); setError(null); }}
              className={`flex-1 rounded-md py-1.5 transition-all ${
                mode === 'demo' ? 'bg-white text-stone-900 font-semibold shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Demo Roles
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Success</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}

          {/* Quick Demo Logins View */}
          {mode === 'demo' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Select a pre-configured role to immediately test RBAC (Role-Based Access Control) and isolated tenant workflows:
              </p>

              <div className="space-y-3">
                <button
                  id="btn-demo-user"
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin('user@ecocontradict.org', 'EcoUser2026!')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-stone-50 dark:bg-stone-800/60 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      SJ
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Dr. Sarah Jenkins</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                          USER Role
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Sustainability Lead · Scoped data access</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  id="btn-demo-admin"
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin('admin@ecocontradict.org', 'EcoAdmin2026!')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-purple-500 dark:hover:border-purple-500 bg-stone-50 dark:bg-stone-800/60 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-sm">
                      AD
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Chief Security Officer</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                          ADMIN Role
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Full audit trail & security management</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-stone-100 dark:bg-stone-800/50 p-3 text-[11px] text-stone-600 dark:text-stone-400">
                <span className="font-semibold text-stone-800 dark:text-stone-200">Security Architecture: </span>
                All credentials use bcrypt 12-round salted hashing. Authenticated sessions receive signed JWT bearer tokens stored securely with no token leakage.
              </div>
            </div>
          )}

          {/* Sign In & Sign Up Form */}
          {(mode === 'login' || mode === 'signup') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                      id="input-auth-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 pl-9 pr-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    id="input-auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.org"
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 pl-9 pr-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('reset'); setError(null); }}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    id="input-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min 8 chars with symbols' : '••••••••••••'}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 pl-9 pr-10 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength meter for Signup */}
                {mode === 'signup' && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1 h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${strength >= 1 ? 'w-1/4 bg-red-500' : 'w-0'}`} />
                      <div className={`h-full transition-all ${strength >= 2 ? 'w-1/4 bg-orange-500' : 'w-0'}`} />
                      <div className={`h-full transition-all ${strength >= 3 ? 'w-1/4 bg-amber-500' : 'w-0'}`} />
                      <div className={`h-full transition-all ${strength >= 4 ? 'w-1/4 bg-emerald-500' : 'w-0'}`} />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Requirement: 8+ characters, uppercase, lowercase, numbers, and symbols.
                    </p>
                  </div>
                )}
              </div>

              <button
                id="btn-auth-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Secure Account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Password Reset View */}
          {mode === 'reset' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 mb-2">
                <KeyRound className="h-5 w-5 text-emerald-600" />
                <h4 className="text-sm font-semibold">Secure Password Recovery</h4>
              </div>

              {resetStep === 'request' ? (
                <>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Enter your registered email address. A secure single-use recovery token will be generated.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@ecocontradict.org"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Reset Token
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste 64-character token"
                      className="w-full font-mono text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-3.5 py-2 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setResetStep('request'); }}
                  className="w-1/3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Processing...' : resetStep === 'request' ? 'Request Recovery Token' : 'Confirm New Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
