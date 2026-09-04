import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Shield } from 'lucide-react';

interface InitialLoaderProps {
  onComplete: () => void;
}

export const InitialLoader: React.FC<InitialLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setProgress(100);
      const t = setTimeout(onComplete, 50);
      return () => clearTimeout(t);
    }

    const startTime = performance.now();
    const duration = 750; // smooth 750ms load

    let animationFrameId: number;

    const animateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      // Smooth cubic-bezier-like easing out
      const easeOutProgress = 1 - Math.pow(1 - rawProgress, 2.5);
      const currentVal = Math.round(easeOutProgress * 100);

      setProgress(currentVal);

      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(animateProgress);
      } else {
        setProgress(100);
        setTimeout(() => {
          onComplete();
        }, 120);
      }
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete, shouldReduceMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050B1A] select-none"
    >
      {/* Glow Backdrop */}
      <div className="absolute w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* ONLY TWO ELEMENTS: 1. LOGO, 2. LARGE PERCENTAGE NUMBER */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        
        {/* 1. Website Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative"
        >
          {/* Subtle Ambient Pulse Ring */}
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-md animate-pulse" />
          
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-0.5 shadow-2xl shadow-blue-500/30">
            <div className="w-full h-full bg-[#07111F] rounded-[14px] flex items-center justify-center">
              <Shield className="w-9 h-9 sm:w-11 sm:h-11 text-cyan-400" />
            </div>
          </div>
        </motion.div>

        {/* 2. Large Percentage Number */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center"
        >
          <span className="text-4xl sm:text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-tighter">
            {progress}%
          </span>
        </motion.div>

      </div>
    </motion.div>
  );
};
