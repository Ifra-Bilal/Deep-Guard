import React, { useState } from 'react';
import { PageType, UserProfile } from '../types';
import { Shield, Menu, X, LayoutDashboard, UploadCloud, History, LogOut, ArrowRight, User } from 'lucide-react';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authenticated view pages: dashboard, upload, results, history
  const isAuthenticated = Boolean(currentUser);

  const handleNavClick = (page: PageType) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    if (currentPage !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#07111F] border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="deepguard-nav-logo"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white">
                  DEEP<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">GUARD</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-medium tracking-widest text-slate-400 uppercase hidden sm:block">
                Detect. Verify. Trust.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              // Public Navigation for Guests
              <>
                <button
                  id="nav-home-btn"
                  onClick={() => handleNavClick('landing')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'landing'
                      ? 'text-cyan-400 bg-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Home
                </button>
                <button
                  id="nav-features-btn"
                  onClick={() => handleScrollToSection('features-section')}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  Features
                </button>
                <button
                  id="nav-how-it-works-btn"
                  onClick={() => handleScrollToSection('how-it-works-section')}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  How It Works
                </button>
                
                <div className="h-5 w-px bg-slate-800 mx-2" />

                <button
                  id="nav-signin-btn"
                  onClick={() => handleNavClick('login')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'login'
                      ? 'text-white bg-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Sign In
                </button>
                <button
                  id="nav-get-started-btn"
                  onClick={() => handleNavClick('signup')}
                  className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              // Authenticated Dashboard Navigation
              <>
                <button
                  id="nav-dashboard-btn"
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'dashboard'
                      ? 'text-cyan-400 bg-blue-500/15 border border-blue-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  id="nav-upload-btn"
                  onClick={() => handleNavClick('upload')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'upload'
                      ? 'text-cyan-400 bg-blue-500/15 border border-blue-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload / Analysis</span>
                </button>

                <button
                  id="nav-history-btn"
                  onClick={() => handleNavClick('history')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'history'
                      ? 'text-cyan-400 bg-blue-500/15 border border-blue-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>

                <div className="h-5 w-px bg-slate-800 mx-3" />

                {/* User Info Badge */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0B1628] border border-slate-800 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{currentUser.fullName}</span>
                </div>

                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Log out of DeepGuard"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B1628] border-b border-slate-800 px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => handleNavClick('landing')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Home
              </button>
              <button
                onClick={() => handleScrollToSection('features-section')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Features
              </button>
              <button
                onClick={() => handleScrollToSection('how-it-works-section')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                How It Works
              </button>
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Get Started
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="px-3.5 py-2 text-xs text-slate-400 font-mono border-b border-slate-800 mb-2">
                Signed in as <span className="text-cyan-400 font-bold">{currentUser.fullName}</span>
              </div>
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNavClick('upload')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <UploadCloud className="w-4 h-4 text-blue-400" />
                <span>Upload / Analysis</span>
              </button>
              <button
                onClick={() => handleNavClick('history')}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <History className="w-4 h-4 text-purple-400" />
                <span>History</span>
              </button>
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
