import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Sparkles, 
  Fingerprint, 
  Layers, 
  Activity, 
  Download, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { AnalysisResult, ArtifactFinding } from '../types';
import { InteractiveImageViewer } from './InteractiveImageViewer';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  result,
  onReset,
}) => {
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'findings' | 'metrics' | 'technical' | 'metadata'>('findings');

  const isAi = result.verdict === 'AI_GENERATED';
  const isReal = result.verdict === 'REAL_PHOTOGRAPH';
  const isManipulated = result.verdict === 'MANIPULATED';

  // Circular gauge progress calculation
  const gaugePercent = isAi ? result.aiPercentage : result.realPercentage;
  const strokeDashoffset = 283 - (283 * gaugePercent) / 100;

  const exportJsonReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `deepguard_forensic_report_${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1E293B] p-4 rounded-xl border border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Another Image</span>
          </button>
          <div className="text-xs text-slate-400 font-mono hidden sm:flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Latency: {result.processingTimeMs}ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJsonReport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Forensic Audit (JSON)</span>
          </button>
        </div>
      </div>

      {/* Primary Real-Time Verdict Header */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-xl transition-all ${
        isAi
          ? 'bg-[#1E293B] border-red-500/50 border-l-8'
          : isReal
          ? 'bg-[#1E293B] border-emerald-500/50 border-l-8'
          : 'bg-[#1E293B] border-amber-500/50 border-l-8'
      }`}>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Verdict Title & Badge */}
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border shadow-sm ${
                isAi
                  ? 'bg-red-600/20 text-red-300 border-red-500/40'
                  : isReal
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-600/20 text-amber-300 border-amber-500/40'
              }`}>
                {isAi ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>SYNTHETIC MEDIA DETECTED</span>
                  </>
                ) : isReal ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AUTHENTIC CAPTURE VERIFIED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>POSSIBLE MANIPULATION</span>
                  </>
                )}
              </span>

              <span className="text-xs font-mono text-slate-400">
                Confidence: <span className="font-bold text-white">{result.confidenceLevel}</span>
              </span>
            </div>

            {/* Clear Headline with Exact Percentage */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 font-['Plus_Jakarta_Sans']">
              {result.primaryHeadline}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mb-4">
              {result.summary}
            </p>

            {/* Estimated Generator Model Fingerprint */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
              <Fingerprint className={`w-4 h-4 ${isAi ? 'text-red-400' : 'text-emerald-400'}`} />
              <span className="text-slate-400">Model Fingerprint:</span>
              <span className="font-bold text-white">{result.generatorEstimate}</span>
            </div>
          </div>

          {/* Real-time Percentage Circular Gauge Card */}
          <div className="flex items-center gap-5 bg-slate-900 border border-slate-700 p-5 rounded-xl shrink-0 shadow-lg">
            
            {/* SVG Ring Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={`transition-all duration-1000 ease-out ${
                    isAi ? 'stroke-red-500' : isReal ? 'stroke-emerald-500' : 'stroke-amber-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono text-white leading-none">
                  {gaugePercent}%
                </span>
                <span className="text-[9px] font-mono uppercase font-bold text-slate-400 mt-1">
                  {isAi ? 'AI Probability' : 'Real Prob'}
                </span>
              </div>
            </div>

            {/* Sub-probabilities breakdown */}
            <div className="flex flex-col gap-2 text-xs font-mono min-w-[130px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">AI-Generated:</span>
                <span className="font-bold text-red-400">{result.aiPercentage}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Real Authentic:</span>
                <span className="font-bold text-emerald-400">{result.realPercentage}%</span>
              </div>
              <div className="h-px bg-slate-800 my-0.5" />
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Micro-Anomalies:</span>
                <span className="text-blue-400 font-bold">{result.detailedFindings.length}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Grid: Interactive Image Inspector (Left/Top) & Forensic Telemetry Tabs (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Multi-Layer Image Inspector */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <InteractiveImageViewer
            imageUrl={result.imageUrl}
            findings={result.detailedFindings}
            isAiGenerated={isAi}
            selectedFindingId={selectedFindingId}
            onSelectFinding={setSelectedFindingId}
          />

          {/* Key Signals Bullet Ribbon */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Key Forensic Signals Identified</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.keySignals.map((signal, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isAi ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Forensic Breakdown Tabs & Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#1E293B] border border-slate-700 rounded-xl">
            <button
              onClick={() => setActiveTab('findings')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'findings'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Anomalies ({result.detailedFindings.length})
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'metrics'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Forensic Metrics
            </button>

            <button
              onClick={() => setActiveTab('technical')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'technical'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Diagnostics
            </button>
          </div>

          {/* TAB 1: Micro-Artifacts & Anomalies Feed */}
          {activeTab === 'findings' && (
            <div className="flex flex-col gap-3">
              {result.detailedFindings.length === 0 ? (
                <div className="bg-[#1E293B] border border-emerald-500/30 rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-white mb-1">Zero Generative Anomalies</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The forensic scanner detected no synthetic boundary melting, iris asymmetries, or artificial texture smoothing. The image conforms to physical camera sensor specifications.
                  </p>
                </div>
              ) : (
                result.detailedFindings.map((finding) => {
                  const isSelected = selectedFindingId === finding.id;
                  return (
                    <div
                      key={finding.id}
                      onClick={() => setSelectedFindingId(isSelected ? null : finding.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500 shadow-md'
                          : 'bg-[#1E293B] hover:bg-slate-800 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            finding.severity === 'high'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : finding.severity === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {finding.severity} severity
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {finding.category}
                          </span>
                        </div>

                        {finding.boundingBox && (
                          <span className="text-[10px] font-mono text-blue-400 flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" />
                            <span>Locate</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1">
                        {finding.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        {finding.description}
                      </p>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-400">
                        <span className="text-blue-400 font-bold">Evidence: </span>
                        {finding.evidence}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Sub-Metrics Score Bars */}
          {activeTab === 'metrics' && (
            <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Neural Forensic Dimension Scores (0-100)
              </h4>

              {/* Metric Item */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Anatomical & Biological Veracity</span>
                  <span className="font-mono font-bold text-white">{result.metrics.anatomicalConsistency}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${result.metrics.anatomicalConsistency}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">Evaluation of eyes, pupils, ears, teeth, and fingers</span>
              </div>

              {/* Metric Item */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Texture & Epidermal Naturalness</span>
                  <span className="font-mono font-bold text-white">{result.metrics.textureNaturalness}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${result.metrics.textureNaturalness}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">Skin pore variance vs latent diffusion micro-smoothing</span>
              </div>

              {/* Metric Item */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Lighting Physics & Ray Consistency</span>
                  <span className="font-mono font-bold text-white">{result.metrics.lightingPhysicsScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                    style={{ width: `${result.metrics.lightingPhysicsScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">Specular catchlight geometry and shadow convergence</span>
              </div>

              {/* Metric Item */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Frequency & Sensor Noise Profile</span>
                  <span className="font-mono font-bold text-white">{result.metrics.frequencyNoiseScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${result.metrics.frequencyNoiseScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">Bayer sensor CMOS noise matrix vs synthetic denoiser</span>
              </div>

              {/* Metric Item */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Compression & Quantization Matrix</span>
                  <span className="font-mono font-bold text-white">{result.metrics.compressionSignatureScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full bg-slate-400 rounded-full transition-all duration-1000"
                    style={{ width: `${result.metrics.compressionSignatureScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">JPEG/WebP coefficient grid characteristics</span>
              </div>

            </div>
          )}

          {/* TAB 3: Diagnostic Assessments Breakdown */}
          {activeTab === 'technical' && (
            <div className="flex flex-col gap-3">
              {result.technicalBreakdown.faceAnatomyAssessment && (
                <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-700">
                  <h5 className="text-xs font-bold text-blue-400 font-mono uppercase mb-1">
                    Anatomical Geometry
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.technicalBreakdown.faceAnatomyAssessment}
                  </p>
                </div>
              )}

              {result.technicalBreakdown.textureAndEdgeAssessment && (
                <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-700">
                  <h5 className="text-xs font-bold text-blue-400 font-mono uppercase mb-1">
                    Texture & Edge Coherence
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.technicalBreakdown.textureAndEdgeAssessment}
                  </p>
                </div>
              )}

              {result.technicalBreakdown.lightAndShadowAssessment && (
                <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-700">
                  <h5 className="text-xs font-bold text-blue-400 font-mono uppercase mb-1">
                    Light & Shadow Vectors
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.technicalBreakdown.lightAndShadowAssessment}
                  </p>
                </div>
              )}

              {result.technicalBreakdown.frequencyAndNoiseAssessment && (
                <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-700">
                  <h5 className="text-xs font-bold text-blue-400 font-mono uppercase mb-1">
                    Sensor Frequency & Noise
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.technicalBreakdown.frequencyAndNoiseAssessment}
                  </p>
                </div>
              )}

              {result.technicalBreakdown.compressionMetadataAssessment && (
                <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-700">
                  <h5 className="text-xs font-bold text-blue-400 font-mono uppercase mb-1">
                    Quantization & Header Metadata
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.technicalBreakdown.compressionMetadataAssessment}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
