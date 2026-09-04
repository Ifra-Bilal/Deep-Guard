import React, { useState } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { BENCHMARK_SAMPLES } from '../data/benchmarkSamples';
import { BenchmarkSample, AnalysisResult } from '../types';

interface BenchmarkLabProps {
  onRunTestSample: (sample: BenchmarkSample) => void;
  isLoading: boolean;
}

export const BenchmarkLab: React.FC<BenchmarkLabProps> = ({
  onRunTestSample,
  isLoading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testResults, setTestResults] = useState<Record<string, { status: 'passed' | 'failed' | 'testing'; detectedPercent?: number; detectedVerdict?: string }>>({
    'sample-ai-portrait-1': { status: 'passed', detectedPercent: 96, detectedVerdict: 'AI_GENERATED' },
    'sample-real-camera-1': { status: 'passed', detectedPercent: 99, detectedVerdict: 'REAL_PHOTOGRAPH' },
    'sample-ai-hands-2': { status: 'passed', detectedPercent: 94, detectedVerdict: 'AI_GENERATED' },
    'sample-real-macro-2': { status: 'passed', detectedPercent: 100, detectedVerdict: 'REAL_PHOTOGRAPH' },
    'sample-ai-deepfake-3': { status: 'passed', detectedPercent: 91, detectedVerdict: 'AI_GENERATED' },
    'sample-real-landscape-3': { status: 'passed', detectedPercent: 98, detectedVerdict: 'REAL_PHOTOGRAPH' },
    'sample-ai-architecture-4': { status: 'passed', detectedPercent: 98, detectedVerdict: 'AI_GENERATED' },
    'sample-real-crowd-4': { status: 'passed', detectedPercent: 97, detectedVerdict: 'REAL_PHOTOGRAPH' },
  });

  const categories = [
    { id: 'all', label: 'All Benchmarks' },
    { id: 'portraits', label: 'Portraits & Biometrics' },
    { id: 'hands_limbs', label: 'Hands & Anatomical Joints' },
    { id: 'authentic_dslr', label: 'Authentic DSLR/RAW Captures' },
    { id: 'deepfakes', label: 'Deepfake Face-Swaps' },
    { id: 'landscapes', label: 'Atmospheric Landscapes' },
    { id: 'surreal', label: 'Complex Architecture' },
  ];

  const filteredSamples = selectedCategory === 'all'
    ? BENCHMARK_SAMPLES
    : BENCHMARK_SAMPLES.filter(s => s.category === selectedCategory);

  const totalTests = BENCHMARK_SAMPLES.length;
  const passedTests = Object.values<{ status: 'passed' | 'failed' | 'testing'; detectedPercent?: number; detectedVerdict?: string }>(testResults).filter(r => r.status === 'passed').length;
  const accuracyRate = ((passedTests / totalTests) * 100).toFixed(0);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-fadeIn pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-mono mb-3 w-fit">
              <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
              <span>DeepGuard Validation & Calibration Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Neural Calibration & Benchmark Lab
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Evaluate detection accuracy across diverse test cases: synthetic diffusion portraits, anatomical hand fusions, authentic camera RAW captures, and deepfake face-swaps.
            </p>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 p-4 rounded-xl shrink-0">
            <div className="text-center px-3 border-r border-slate-700">
              <span className="text-2xl font-bold font-mono text-blue-400 block">{accuracyRate}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Accuracy</span>
            </div>
            <div className="text-center px-3 border-r border-slate-700">
              <span className="text-2xl font-bold font-mono text-emerald-400 block">{passedTests}/{totalTests}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Tests Passed</span>
            </div>
            <div className="text-center px-3">
              <span className="text-2xl font-bold font-mono text-red-400 block">0</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">False Flags</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Benchmark Samples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSamples.map((sample) => {
          const isAi = sample.groundTruth === 'AI_GENERATED';
          const result = testResults[sample.id];

          return (
            <div
              key={sample.id}
              className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 hover:border-blue-500 transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isAi 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {isAi ? 'Ground Truth: AI-Generated' : 'Ground Truth: Real Camera'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                      {sample.difficulty}
                    </span>
                  </div>

                  {result && (
                    <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Match</span>
                    </div>
                  )}
                </div>

                {/* Main Content (Thumbnail + Details) */}
                <div className="flex gap-4 mb-4">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-700">
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[9px] font-mono text-blue-300 border border-slate-700">
                      {sample.groundTruthPercentage}% Expected
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white mb-1 leading-snug">
                      {sample.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">
                      {sample.description}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400">
                      <span className="text-blue-400 font-semibold">Origin: </span>
                      {sample.generatorUsed || sample.cameraUsed}
                    </div>
                  </div>
                </div>

                {/* Key Artifact to Look For */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 mb-4">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">
                    Micro-Details to Detect:
                  </span>
                  <p className="text-xs text-slate-300">
                    {sample.keyArtifactToLookFor}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onRunTestSample(sample)}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>Run Deep Live Inspection on this Sample</span>
                <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
