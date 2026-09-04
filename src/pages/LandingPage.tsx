import React, { memo } from 'react';
import { motion } from 'motion/react';
import { PageType, UserProfile } from '../types';
import { 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Lock, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  UploadCloud, 
  Cpu, 
  CheckCheck,
  Search,
  Sparkles,
  Play,
  Sliders
} from 'lucide-react';
import { HeroScannerCard } from '../components/HeroScannerCard';
import { InteractiveComparisonSlider } from '../components/InteractiveComparisonSlider';

interface LandingPageProps {
  onNavigate: (page: PageType) => void;
  currentUser: UserProfile | null;
}

export const LandingPage: React.FC<LandingPageProps> = memo(({ onNavigate, currentUser }) => {
  const handleStartAnalysis = () => {
    onNavigate('upload');
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#050B1A] text-slate-100 min-h-screen overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Fast radial background gradients (zero GPU blur overhead) */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(37,99,235,0.14)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(147,51,234,0.12)_0%,transparent_70%)] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Heading, Tagline & CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            
            {/* Hero Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wide uppercase mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>AI-POWERED MEDIA FORENSICS & VERIFICATION</span>
            </div>

            {/* Large Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase font-['Plus_Jakarta_Sans',sans-serif] leading-none">
              DEEP<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">GUARD</span>
            </h1>

            {/* Main Tagline */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-cyan-400 font-mono mt-3 mb-4">
              Detect. Verify. Trust.
            </h2>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
              Verify images and videos in seconds. Identify AI generators, photorealistic synthetic portraits, face swaps, and manipulated media with enterprise-grade precision.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
              <button
                type="button"
                id="hero-analyze-media-btn"
                onClick={handleStartAnalysis}
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all w-full sm:w-auto cursor-pointer"
              >
                <Shield className="w-5 h-5 text-cyan-200" />
                <span>Upload & Verify Media</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="hero-how-it-works-btn"
                onClick={() => handleScrollTo('how-it-works-section')}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base text-slate-200 bg-[#0B1628] border border-slate-700/80 hover:bg-slate-800 hover:text-white active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
              >
                <Play className="w-4 h-4 text-cyan-400" />
                <span>How It Works</span>
              </button>
            </div>

            {/* Value Proof Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-800/80 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>98.2% Certified Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Lightning-Fast Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Zero Data Retention</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Live Scanner Visual Simulation (Isolated Component) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 w-full"
          >
            <HeroScannerCard onStartAnalysis={handleStartAnalysis} />
          </motion.div>

        </div>

      </section>

      {/* 2. INTERACTIVE BEFORE & AFTER SLIDER SHOWCASE */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80"
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Forensic Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            See What Human Eyes Miss
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Slide horizontally to inspect how DeepGuard isolates synthetic noise, inconsistent lighting, and waxy AI skin smoothing.
          </p>
        </div>

        <InteractiveComparisonSlider />
      </motion.section>

      {/* 3. FEATURES SECTION (EXACTLY 3 CLEAN CARDS) */}
      <motion.section 
        id="features-section" 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed for Instant Media Verification
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Advanced detection algorithms made simple, fast, and easy to understand for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature Card 1 */}
          <div className="group rounded-2xl bg-[#0B1628] border border-slate-800 hover:border-blue-500/50 p-8 shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 mb-6 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#0B1628] rounded-[14px] flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
              Image Analysis
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analyze images for visual inconsistencies, synthetic diffusion patterns, unnatural skin smoothing, and signs of AI generation.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="group rounded-2xl bg-[#0B1628] border border-slate-800 hover:border-purple-500/50 p-8 shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 mb-6 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#0B1628] rounded-[14px] flex items-center justify-center">
                <Video className="w-7 h-7 text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
              Video Detection
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Inspect video files for suspicious facial warping, synthetic lip-sync manipulation, and inter-frame artifacts.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="group rounded-2xl bg-[#0B1628] border border-slate-800 hover:border-cyan-500/50 p-8 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 mb-6 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#0B1628] rounded-[14px] flex items-center justify-center">
                <FileText className="w-7 h-7 text-cyan-300" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
              Detailed Reports
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Receive a clear verdict, confidence percentage, visual anomaly hotspot cards, and downloadable audit logs.
            </p>
          </div>

        </div>
      </motion.section>

      {/* 4. HOW IT WORKS SECTION (3 CLEAN STEPS) */}
      <motion.section 
        id="how-it-works-section" 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 bg-[#07111F]"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold uppercase mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How DeepGuard Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Verify suspicious media in three simple steps with immediate results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 01 */}
          <div className="relative rounded-2xl bg-[#0B1628] border border-slate-800 hover:border-slate-700 p-8 shadow-lg hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                01
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload an image or video that you want to verify from your device or camera.
            </p>
          </div>

          {/* Step 02 */}
          <div className="relative rounded-2xl bg-[#0B1628] border border-slate-800 hover:border-slate-700 p-8 shadow-lg hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                02
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyze</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              DeepGuard conducts high-speed micro-forensic inspection of pixels and textures.
            </p>
          </div>

          {/* Step 03 */}
          <div className="relative rounded-2xl bg-[#0B1628] border border-slate-800 hover:border-slate-700 p-8 shadow-lg hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCheck className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                03
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verify</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Receive a decisive verdict with clear confidence percentages and plain English explanations.
            </p>
          </div>

        </div>
      </motion.section>

      {/* 5. STATISTICS SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="p-6 rounded-2xl bg-[#0B1628] border border-slate-800 shadow-md hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-mono mb-2">
              50K+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Media Scans Completed
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1628] border border-slate-800 shadow-md hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono mb-2">
              98.2%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Detection Accuracy
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1628] border border-slate-800 shadow-md hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-mono mb-2">
              12K+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Protected Users
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1628] border border-slate-800 shadow-md hover:-translate-y-1 transition-all duration-200 gpu-layer">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono mb-2">
              &lt;2 sec
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Average Analysis Time
            </div>
          </div>

        </div>
      </motion.section>

      {/* 6. FINAL CTA SECTION */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
      >
        <div className="relative rounded-3xl bg-gradient-to-b from-[#101D33] to-[#0B1628] border border-blue-500/30 p-8 sm:p-14 text-center shadow-2xl overflow-hidden gpu-layer">
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Don’t Trust Everything You See. Verify It.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Use DeepGuard to quickly check suspicious images and videos before you publish, share, or rely on them.
            </p>
            <button
              type="button"
              id="final-cta-start-btn"
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all cursor-pointer"
            >
              <span>Start Your Analysis Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </motion.section>

    </div>
  );
});
LandingPage.displayName = 'LandingPage';
