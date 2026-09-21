import React, { useState } from 'react';
import {
  Leaf,
  Sparkles,
  BarChart3,
  PlusCircle,
  History,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Lock,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { UserPublicProfile } from '../types.ts';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'new-analysis' | 'analysis-result' | 'history' | 'security';
  onNavigate: (view: 'landing' | 'dashboard' | 'new-analysis' | 'analysis-result' | 'history' | 'security') => void;
  hasActiveAnalysis: boolean;
  onOpenResponsibleAI: () => void;
  currentUser: UserPublicProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hasActiveAnalysis,
  onOpenResponsibleAI,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Leaf },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'new-analysis', label: 'New Analysis', icon: PlusCircle, highlight: true },
    { id: 'history', label: 'History & Reports', icon: History },
    { id: 'security', label: 'Privacy & Security', icon: Shield }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/10 bg-white/90 backdrop-blur-md dark:border-emerald-500/10 dark:bg-stone-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          id="nav-brand-logo"
          onClick={() => onNavigate('landing')}
          className="flex cursor-pointer items-center gap-2.5 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-500 transition-all">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-stone-900 dark:text-stone-100 text-lg">
                ECO<span className="text-emerald-600 dark:text-emerald-400">CONTRADICT</span>
              </span>
              <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                AI
              </span>
            </div>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium hidden sm:block">
              Find sustainability problems before they happen
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onNavigate(item.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-900'
                } ${item.highlight ? 'text-emerald-700 dark:text-emerald-400' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {hasActiveAnalysis && (
            <button
              id="nav-item-active-result"
              onClick={() => onNavigate('analysis-result')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'analysis-result'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Current Audit</span>
            </button>
          )}

          <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-1" />

          {/* Responsible AI modal trigger */}
          <button
            id="nav-btn-responsible-ai"
            onClick={onOpenResponsibleAI}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all"
            title="Responsible AI & Governance Guidelines"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Responsible AI</span>
          </button>
        </nav>

        {/* Right CTA & Authentication Status */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 leading-none">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] font-bold px-1 rounded ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('security');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-left"
                  >
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>Privacy & Security Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="nav-btn-signin"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all"
            >
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Sign In / Demo Roles</span>
            </button>
          )}

          <button
            id="nav-cta-analyze"
            onClick={() => onNavigate('new-analysis')}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow hover:shadow-emerald-700/20 active:scale-[0.98]"
          >
            <span>Analyze Plan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            id="nav-mobile-auth"
            onClick={currentUser ? onLogout : onOpenAuth}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 rounded-lg text-xs font-medium"
            title={currentUser ? 'Sign Out' : 'Sign In'}
          >
            {currentUser ? <LogOut className="h-5 w-5 text-rose-600" /> : <Lock className="h-5 w-5 text-emerald-600" />}
          </button>

          <button
            id="nav-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                    : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {hasActiveAnalysis && (
            <button
              id="mobile-nav-active-result"
              onClick={() => {
                onNavigate('analysis-result');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white"
            >
              <Sparkles className="h-5 w-5" />
              <span>Current Audit</span>
            </button>
          )}

          <div className="pt-2">
            <button
              id="mobile-cta-analyze"
              onClick={() => {
                onNavigate('new-analysis');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Start New Analysis</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
