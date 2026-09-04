import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageType, ScanResult, MediaType } from '../types';
import { extractVisualForensicMetrics } from '../utils/forensicFilters';
import { optimizeImageForAnalysis, OptimizedImageResult } from '../utils/imageOptimizer';
import { getAuthToken } from '../utils/api';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileCheck, 
  X, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Shield,
  CheckCircle2,
  Zap,
  Lock,
  Layers,
  Camera,
  RefreshCw
} from 'lucide-react';
import { CameraCaptureModal } from '../components/CameraCaptureModal';

interface UploadPageProps {
  onAnalyzeComplete: (result: ScanResult) => void;
  onNavigate: (page: PageType) => void;
}

interface SamplePreset {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  size: number;
  badge: string;
  isAi: boolean;
}

const PRESET_SAMPLES: SamplePreset[] = [
  {
    id: 'preset-ai-portrait',
    title: 'AI Photorealistic Portrait',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    size: 1940000,
    badge: 'AI Sample',
    isAi: true,
  },
  {
    id: 'preset-real-camera',
    title: 'Authentic DSLR Camera Photo',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    size: 2450000,
    badge: 'Real Photo',
    isAi: false,
  },
  {
    id: 'preset-animal-synthetic',
    title: 'Synthetic Wildlife Render',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=900&q=80',
    size: 2800000,
    badge: 'AI Animal',
    isAi: true,
  },
  {
    id: 'preset-landscape-real',
    title: 'Natural Optical Landscape',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    size: 3100000,
    badge: 'Real Landscape',
    isAi: false,
  }
];

export const UploadPage: React.FC<UploadPageProps> = ({ onAnalyzeComplete, onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: MediaType;
    base64?: string;
    url?: string;
    mimeType: string;
    previewUrl?: string;
    optimizedPayload?: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  
  // Loading & Step State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ANALYSIS_STEPS = [
    { title: 'Uploading media payload', desc: 'Secure high-speed memory streaming' },
    { title: 'Extracting visual features', desc: 'Analyzing skin pores, eyes & edges' },
    { title: 'Scanning manipulation artifacts', desc: 'Checking lighting & diffusion noise' },
    { title: 'Evaluating facial consistency', desc: 'Detecting synthetic boundary drift' },
    { title: 'Calculating confidence verdict', desc: 'Finalizing forensic verification report' },
  ];

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);

    // Max 100MB limit check
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('File size exceeds 100MB limit. Please upload a smaller file.');
      return;
    }

    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);

    if (!isVideo && !isImage) {
      setErrorMessage('Unsupported file format. Please upload JPG, PNG, WEBP, MP4, MOV, or WEBM.');
      return;
    }

    setIsPreparingFile(true);

    try {
      if (isImage) {
        // Fast in-browser optimization for lightning-fast network transmission (<50ms)
        const opt = await optimizeImageForAnalysis(file, 1200, 0.88);
        setSelectedFile({
          name: file.name,
          size: file.size,
          type: 'image',
          base64: opt.base64,
          previewUrl: opt.previewUrl,
          mimeType: 'image/jpeg',
          optimizedPayload: opt.base64,
        });
      } else {
        // Video handling
        const previewUrl = URL.createObjectURL(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target?.result as string;
          setSelectedFile({
            name: file.name,
            size: file.size,
            type: 'video',
            base64: base64Data,
            previewUrl,
            mimeType: file.type || 'video/mp4',
            optimizedPayload: base64Data,
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.warn('File preparation notice:', err);
      // Fallback
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: isVideo ? 'video' : 'image',
        previewUrl,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
      });
    } finally {
      setIsPreparingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setErrorMessage(null);
    setSelectedFile({
      name: `${preset.title.toLowerCase().replace(/\s+/g, '_')}.${preset.type === 'video' ? 'mp4' : 'jpg'}`,
      size: preset.size,
      type: preset.type,
      url: preset.url,
      previewUrl: preset.url,
      mimeType: preset.type === 'video' ? 'video/mp4' : 'image/jpeg',
    });
  };

  const handleCameraCapture = (file: File) => {
    setShowCameraModal(false);
    handleFileProcess(file);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setCurrentStepIndex(0);

    // Fast, smooth continuous progress interpolation
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev < 88) {
          const next = prev + Math.floor(Math.random() * 8) + 4;
          return Math.min(next, 88);
        }
        return prev;
      });
    }, 180);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      let visualMetrics = null;
      const imgSrc = selectedFile.optimizedPayload || selectedFile.base64 || selectedFile.url;

      if (selectedFile.type === 'image' && imgSrc) {
        try {
          visualMetrics = await extractVisualForensicMetrics(imgSrc);
        } catch (mErr) {
          console.warn('Client visual metrics extraction notice:', mErr);
        }
      }

      // Fast network request
      const token = getAuthToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mediaBase64: selectedFile.optimizedPayload || selectedFile.base64,
          mediaUrl: selectedFile.url,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          mimeType: selectedFile.mimeType,
          visualMetrics,
        }),
      });

      clearInterval(progressInterval);
      clearInterval(stepInterval);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Analysis failed with status ${response.status}`);
      }

      const scanResult: ScanResult = await response.json();

      // Smooth completion animation
      setAnalysisProgress(100);
      setCurrentStepIndex(ANALYSIS_STEPS.length - 1);

      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalyzeComplete(scanResult);
      }, 350);

    } catch (err: any) {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Analysis could not be completed. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-[calc(100vh-140px)] bg-[#050B1A] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      
      {/* Header with glowing accent */}
      <div className="text-center max-w-2xl mx-auto mb-8 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-xs font-mono font-semibold tracking-wide uppercase mb-3 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>INSTANT FORENSIC SCANNER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Upload & Verify Media
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300">
          Inspect any image or video for AI generation, synthetic diffusion markers, face swaps, and digital alteration in seconds.
        </p>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-sm flex items-center justify-between shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-xs text-red-300 hover:text-white px-2.5 py-1 bg-red-900/50 hover:bg-red-900 rounded-md transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Upload Box / File Selection */}
      <div className="rounded-2xl bg-[#0B1628] border border-slate-800 p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {!selectedFile ? (
          /* Drag & Drop Zone */
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 sm:p-14 text-center transition-all relative overflow-hidden group ${
                isDragging
                  ? 'border-cyan-400 bg-blue-950/40 scale-[1.01]'
                  : 'border-slate-700/80 bg-[#07111F]/80 hover:border-blue-500/70 hover:bg-[#07111F]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {/* Laser Scan Line Effect on Drag */}
              {isDragging && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
              )}

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-0.5 mx-auto mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#07111F] rounded-[14px] flex items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-cyan-400 group-hover:animate-bounce" />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                Drag & Drop your media here
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-5">
                or <span className="text-cyan-400 font-semibold underline decoration-cyan-500/50 hover:decoration-cyan-400">browse files</span> from your device
              </p>

              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400 shadow-inner">
                <span className="text-slate-300">JPG, PNG, WEBP, MP4, MOV, WEBM</span>
                <span>•</span>
                <span className="text-cyan-400">High-Speed Cloud Analysis</span>
                <span>•</span>
                <span>Max 100MB</span>
              </div>
            </div>

            {/* Quick Action Tools: Camera Snap */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#07111F] border border-slate-800 hover:border-blue-500/40 hover:text-white hover:bg-slate-800/80 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Take Photo with Camera</span>
              </button>
            </div>
          </div>
        ) : (
          /* Selected File Preview Box */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#07111F] border border-slate-700/80 shadow-md">
              
              <div className="flex items-center gap-4 min-w-0">
                {/* Media Thumbnail */}
                <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                  {selectedFile.type === 'video' ? (
                    <VideoIcon className="w-8 h-8 text-purple-400" />
                  ) : (
                    <img
                      src={selectedFile.previewUrl || selectedFile.base64 || selectedFile.url}
                      alt={selectedFile.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-600/90 text-white backdrop-blur-xs">
                    {selectedFile.type}
                  </div>
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm sm:text-base truncate">
                      {selectedFile.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-sans font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI Scan
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 transition-all"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Start Analysis Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              id="upload-start-analysis-btn"
              onClick={handleStartAnalysis}
              disabled={isPreparingFile}
              className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              <Shield className="w-5 h-5 text-cyan-200" />
              <span>Start Fast Forensic Scan</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

      </div>

      {/* One-Click Quick Sample Presets */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Try Instant Sample Media
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">One-click test suite</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_SAMPLES.map((preset, idx) => (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07, ease: 'easeOut' }}
              whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
              onClick={() => handleSelectPreset(preset)}
              className="group cursor-pointer rounded-xl bg-[#0B1628] border border-slate-800 hover:border-blue-500/50 p-3.5 transition-all shadow-md hover:shadow-blue-500/15"
            >
              <div className="relative h-28 rounded-lg overflow-hidden bg-slate-900 mb-3">
                <img
                  src={preset.url}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shadow-sm ${
                  preset.isAi 
                    ? 'bg-red-950/90 text-red-300 border border-red-500/40' 
                    : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {preset.badge}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                {preset.title}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Click to load sample
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {/* Analysis Loading Modal Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B1A]/95 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0B1628] border border-blue-500/40 p-8 shadow-2xl text-center relative overflow-hidden"
            >
              
              {/* Glowing Accent Top Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-pulse" />

              {/* Glowing Cyber Radar Shield Animation */}
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-blue-500/40 animate-ping opacity-30" />
                <div className="absolute inset-4 rounded-full bg-blue-600/10 backdrop-blur-xs flex items-center justify-center">
                  <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">
                DeepGuard AI Scanning
              </h3>
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-6">
                Executing Forensic Visual Analysis
              </p>

              {/* Animated Progress Bar & Percentage */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Analysis Progress</span>
                  <span className="font-bold text-cyan-400 text-sm">{analysisProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-500 rounded-full shadow-lg shadow-cyan-500/30"
                    initial={{ width: '0%' }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Active Step Indicator */}
              <div className="p-4 rounded-xl bg-[#07111F] border border-slate-800/80 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {ANALYSIS_STEPS[currentStepIndex]?.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {ANALYSIS_STEPS[currentStepIndex]?.desc}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-5 font-mono">
                Inspecting micro-pores, eye catchlights, textures & noise distribution...
              </p>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
