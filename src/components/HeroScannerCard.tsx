import React, { useState, useEffect, memo } from 'react';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';

interface HeroScannerCardProps {
  onStartAnalysis: () => void;
}

const scanSteps = [
  { label: 'Reading media pixels & color channels', status: 'completed' },
  { label: 'Examining microscopic skin pores & catchlights', status: 'completed' },
  { label: 'Checking AI diffusion noise & edge blur', status: 'active' },
  { label: 'Generating clear forensic report', status: 'waiting' }
];

export const HeroScannerCard: React.FC<HeroScannerCardProps> = memo(({ onStartAnalysis }) => {
  const [activeScanStep, setActiveScanStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScanStep((prev) => (prev + 1) % scanSteps.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-2xl bg-[#0B1628] border border-slate-700/80 shadow-2xl p-6 overflow-hidden gpu-layer">
      {/* Header inside Frame */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">DeepGuard Engine</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Online
        </span>
      </div>

      {/* Radar Target & Scanning Screen */}
      <div className="relative h-52 sm:h-56 rounded-xl bg-[#07111F] border border-slate-800/80 flex items-center justify-center overflow-hidden mb-5">
        {/* Corner reticle brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

        {/* Animated Laser Scanning Sweep */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse pointer-events-none" />

        {/* Radar Scanning Rings */}
        <div className="absolute w-36 h-36 rounded-full border border-cyan-500/30 opacity-30 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full border border-blue-500/40 pointer-events-none" />
        <div className="absolute w-14 h-14 rounded-full border border-purple-500/40 pointer-events-none" />

        {/* Center Shield Indicator */}
        <div className="relative z-10 w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-0.5 shadow-lg shadow-blue-500/40 flex items-center justify-center">
          <div className="w-full h-full bg-[#0B1628] rounded-[13px] flex items-center justify-center">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Floating Status Tag */}
        <div className="absolute top-3 inset-x-0 mx-auto w-fit px-3 py-1 rounded-full bg-blue-950/90 border border-blue-500/40 text-[11px] font-mono text-cyan-300 shadow-md">
          ● Real-Time Neural Scanner
        </div>
      </div>

      {/* Live Step Progress Checklist */}
      <div className="space-y-2 mb-5">
        {scanSteps.map((step, idx) => {
          const isCurrent = idx === activeScanStep;
          const isDone = idx < activeScanStep;

          return (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors duration-200 ${
                isCurrent 
                  ? 'bg-blue-600/15 border border-blue-500/40 text-white font-semibold' 
                  : isDone 
                  ? 'bg-slate-900/60 text-slate-300' 
                  : 'text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="truncate">{step.label}</span>
              </div>
              <span className="font-mono text-[10px] uppercase shrink-0">
                {isDone ? 'Verified' : isCurrent ? 'Scanning...' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Trigger Button */}
      <button
        type="button"
        onClick={onStartAnalysis}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer"
      >
        <span>Upload Your Media Now</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});
HeroScannerCard.displayName = 'HeroScannerCard';
