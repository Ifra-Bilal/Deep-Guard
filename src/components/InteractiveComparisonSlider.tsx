import React, { useState, useRef, useCallback, memo } from 'react';
import { Sliders } from 'lucide-react';

export const InteractiveComparisonSlider: React.FC = memo(() => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      setSliderPosition(pos);
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto rounded-2xl bg-[#0B1628] border border-slate-700/80 p-4 sm:p-6 shadow-2xl gpu-layer">
      <div 
        ref={containerRef}
        className="relative h-72 sm:h-96 rounded-xl overflow-hidden select-none cursor-ew-resize bg-slate-950 touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Left Side: Synthetic Image */}
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=75" 
            alt="Synthetic AI Portrait" 
            width={800}
            height={500}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-lg bg-red-950/90 border border-red-500/40 text-xs font-mono font-bold text-red-300">
            AI Diffusion Output (Synthetic)
          </div>
        </div>

        {/* Right Side: DeepGuard Micro-Forensic Overlay */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none will-change-transform"
          style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
        >
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=75" 
            alt="Forensic Heatmap Inspection" 
            width={800}
            height={500}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover filter contrast-150 hue-rotate-180 brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-lg bg-cyan-950/90 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300">
            DeepGuard Micro-Forensic Overlay
          </div>
        </div>

        {/* Dividing Vertical Line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] pointer-events-none will-change-transform"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-400 text-slate-900 flex items-center justify-center shadow-lg font-black text-xs">
            ⇄
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Drag or slide horizontally</span>
        </span>
        <span className="text-cyan-400 font-semibold">Interactive Visual Comparison</span>
      </div>
    </div>
  );
});
InteractiveComparisonSlider.displayName = 'InteractiveComparisonSlider';
