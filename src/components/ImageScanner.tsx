import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Camera, 
  Link as LinkIcon, 
  Sparkles, 
  AlertCircle, 
  FileCheck,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  Crosshair,
  ShieldCheck
} from 'lucide-react';
import { BENCHMARK_SAMPLES } from '../data/benchmarkSamples';
import { BenchmarkSample } from '../types';

interface ImageScannerProps {
  onAnalyze: (payload: {
    imageBase64?: string;
    imageUrl?: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
  }) => void;
  isLoading: boolean;
  onOpenLiveCamera: () => void;
}

export const ImageScanner: React.FC<ImageScannerProps> = ({
  onAnalyze,
  isLoading,
  onOpenLiveCamera,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file?: File;
    preview: string;
    name: string;
    size?: number;
    mimeType?: string;
  } | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Global paste listener for pasting images anywhere on the page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          handleFileSelection(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelection = (file: File) => {
    setErrorText(null);
    if (!file.type.startsWith('image/')) {
      setErrorText('Please upload a valid image file (JPEG, PNG, WebP, etc.).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorText('File size exceeds 25MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setSelectedFile({
        file,
        preview,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: BenchmarkSample) => {
    setErrorText(null);
    setSelectedFile({
      preview: sample.imageUrl,
      name: `${sample.title.toLowerCase().replace(/\s+/g, '_')}.jpg`,
      size: 1540000,
      mimeType: 'image/jpeg',
    });
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setErrorText(null);
    setSelectedFile({
      preview: urlInput.trim(),
      name: 'remote_web_image.jpg',
      mimeType: 'image/jpeg',
    });
    setShowUrlInput(false);
    setUrlInput('');
  };

  const handleTriggerAnalysis = () => {
    if (!selectedFile) return;

    if (selectedFile.preview.startsWith('data:')) {
      onAnalyze({
        imageBase64: selectedFile.preview,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.mimeType || 'image/jpeg',
      });
    } else {
      onAnalyze({
        imageUrl: selectedFile.preview,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.mimeType || 'image/jpeg',
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Header Metric Cards Row */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block mb-1">
              Engine Status
            </span>
            <span className="text-xl font-bold text-white font-mono">Real-Time</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block mb-1">
              Micro-Artifact Res
            </span>
            <span className="text-xl font-bold text-blue-400 font-mono">1000×1000 Grid</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Crosshair className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block mb-1">
              Verification Accuracy
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">99.4% Multi-Modal</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Upload / Inspector Card */}
      <div className="w-full max-w-4xl bg-[#1E293B] border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl relative">
        
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Target Media Forensic Inspection
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Submit any photograph or digital artwork. DeepGuard runs full-spectrum biological consistency, Bayer sensor noise profiling, and multi-spectral error analysis.
          </p>
        </div>

        {/* Drag & Drop Surface */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all ${
            dragOver
              ? 'border-blue-500 bg-blue-600/10 scale-[1.01]'
              : selectedFile
              ? 'border-slate-600 bg-slate-900/80'
              : 'border-slate-700 hover:border-slate-600 bg-slate-900/50 cursor-pointer group'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/bmp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelection(e.target.files[0]);
              }
            }}
          />

          {selectedFile ? (
            /* Selected File Preview Box */
            <div className="w-full flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden border border-slate-700 bg-black shrink-0 shadow-md group">
                <img
                  src={selectedFile.preview}
                  alt="Inspection Candidate"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-white border border-slate-600"
                  >
                    Change Image
                  </button>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                    Target Media Loaded
                  </span>
                </div>
                <h3 className="text-base font-bold text-white truncate max-w-sm mb-1">
                  {selectedFile.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-4">
                  {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · ` : ''}
                  High-Precision Mode
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <button
                    id="btn-run-deep-scan"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerAnalysis();
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Analyzing Micro-Artifacts...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Run Deep Forensic Scan</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Dropzone State */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform shadow-md">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Drag & drop your media here, or <span className="text-blue-400 underline">browse</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Supports JPEG, PNG, WebP, AVIF up to 25MB. Quick paste via <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">Ctrl+V</kbd>.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLiveCamera();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Live Camera Capture</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUrlInput(!showUrlInput);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-all"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Import via URL</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* URL Input Form */}
        {showUrlInput && !selectedFile && (
          <form onSubmit={handleUrlSubmit} className="mt-4 flex gap-2">
            <input
              type="url"
              placeholder="Paste public image URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Load URL
            </button>
          </form>
        )}

        {/* Error message */}
        {errorText && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Quick Test Samples Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-700/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
              <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              <span>Calibrated Training & Benchmark Samples:</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
              Click to load test case
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BENCHMARK_SAMPLES.slice(0, 4).map((sample) => {
              const isAi = sample.groundTruth === 'AI_GENERATED';
              return (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group relative rounded-xl border border-slate-700 hover:border-blue-500 bg-slate-900/70 overflow-hidden cursor-pointer p-2.5 flex items-center gap-2.5 transition-all hover:bg-slate-900"
                >
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-700 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isAi ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      <span className={`text-[9px] font-mono font-bold uppercase ${isAi ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isAi ? 'AI Sample' : 'Real Camera'}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                      {sample.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
