import React from 'react';
import { PageType } from '../types';
import { Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#050B1A] border-t border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-0.5">
            <div className="w-full h-full bg-[#050B1A] rounded-[6px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-white">
              DEEP<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">GUARD</span>
            </span>
            <p className="text-xs text-slate-400 font-medium">Detect. Verify. Trust.</p>
          </div>
        </div>

        {/* Simple Existing Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <button 
            onClick={() => {
              onNavigate('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-cyan-400 transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-cyan-400 transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-cyan-400 transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className="hover:text-cyan-400 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate('signup')}
            className="text-cyan-400 font-semibold hover:underline"
          >
            Get Started
          </button>
        </div>

        {/* Copyright notice */}
        <div className="text-xs text-slate-500 font-mono text-center md:text-right">
          © 2026 DeepGuard. All rights reserved.
        </div>

      </div>
    </footer>
  );
};
