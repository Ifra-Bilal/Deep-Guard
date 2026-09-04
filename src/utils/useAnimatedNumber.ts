import { useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';

export function useAnimatedNumber(target: number, durationMs: number = 700): number {
  const [current, setCurrent] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCurrent(target);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    let animationFrameId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + (target - start) * ease);
      setCurrent(val);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      } else {
        setCurrent(target);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, durationMs, shouldReduceMotion]);

  return current;
}
