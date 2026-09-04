import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanResult, AnomalyIndicator, PageType } from '../types';
import { useAnimatedNumber } from '../utils/useAnimatedNumber';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Share2, 
  RotateCcw, 
  Layers, 
  Eye, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  UploadCloud,
  Sliders,
  Mountain,
  User,
  PawPrint,
  Building2,
  Box,
  Utensils,
  Palette,
  Sun,
  Cloud,
  Waves,
  ScanSearch,
  Camera,
  Activity
} from 'lucide-react';
import { InteractiveImageViewer } from '../components/InteractiveImageViewer';

interface ResultsPageProps {
  result: ScanResult | null;
  onNavigate: (page: PageType) => void;
  onSelectScan?: (scan: ScanResult) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ result, onNavigate }) => {
  const [selectedIndicator, setSelectedIndicator] = useState<AnomalyIndicator | null>(
    result?.indicators?.[0] || null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Smooth animated count-up for numbers
  const animatedAi = useAnimatedNumber(result?.aiPercentage || 0, 700);
  const animatedReal = useAnimatedNumber(result?.realPercentage || 0, 700);
  const animatedConfidence = useAnimatedNumber(result?.confidenceScore || 0, 600);

  if (!result) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-[#050B1A] text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Scan Result Available</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Please upload or capture an image or video to run DeepGuard forensic verification.
        </p>
        <button
          onClick={() => onNavigate('upload')}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Media to Scan</span>
        </button>
      </div>
    );
  }

  const isAi = result.verdict === 'AI_GENERATED';
  const isDeepfake = result.verdict === 'DEEPFAKE_DETECTED';
  const isUncertain = result.verdict === 'UNCERTAIN';
  const isReal = result.verdict === 'REAL_NATURAL';

  const getVerdictDisplay = () => {
    if (isAi) return 'AI Generated Media';
    if (isDeepfake) return 'Altered Deepfake';
    if (isUncertain) return 'Uncertain / Mixed Signals';
    return 'Authentic Real Camera Photo';
  };

  const getCategoryIcon = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('landscape') || cat.includes('nature')) return <Mountain className="w-4 h-4 text-emerald-400" />;
    if (cat.includes('person') || cat.includes('portrait')) return <User className="w-4 h-4 text-sky-400" />;
    if (cat.includes('animal') || cat.includes('wildlife')) return <PawPrint className="w-4 h-4 text-amber-400" />;
    if (cat.includes('architecture') || cat.includes('urban') || cat.includes('building')) return <Building2 className="w-4 h-4 text-indigo-400" />;
    if (cat.includes('product') || cat.includes('object') || cat.includes('vehicle')) return <Box className="w-4 h-4 text-purple-400" />;
    if (cat.includes('food') || cat.includes('culinary')) return <Utensils className="w-4 h-4 text-orange-400" />;
    if (cat.includes('art') || cat.includes('illustration')) return <Palette className="w-4 h-4 text-pink-400" />;
    return <Sparkles className="w-4 h-4 text-cyan-400" />;
  };

  const getIndicatorIcon = (iconType?: string) => {
    switch (iconType) {
      case 'sky': return <Cloud className="w-4 h-4 text-cyan-400" />;
      case 'water': return <Waves className="w-4 h-4 text-blue-400" />;
      case 'nature': return <Mountain className="w-4 h-4 text-emerald-400" />;
      case 'building': return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'animal': return <PawPrint className="w-4 h-4 text-amber-400" />;
      case 'object': return <Box className="w-4 h-4 text-purple-400" />;
      case 'food': return <Utensils className="w-4 h-4 text-orange-400" />;
      case 'art': return <Palette className="w-4 h-4 text-pink-400" />;
      case 'lighting': return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'eye': return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'face': return <User className="w-4 h-4 text-sky-400" />;
      case 'noise': return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'texture': return <Layers className="w-4 h-4 text-violet-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getWhyHeading = () => {
    if (isAi || isDeepfake) return 'Why this is likely AI-generated';
    if (isUncertain) return 'Inconclusive indicators found';
    return 'Why this appears natural & authentic';
  };

  const handleCopyReport = () => {
    const reportText = `DeepGuard Forensic Audit:\nFile: ${result.fileName}\nSubject: ${result.identifiedSubject || result.subjectCategory || 'Detected Media'}\nVerdict: ${getVerdictDisplay()}\nAI Probability: ${result.aiPercentage}%\nReal Probability: ${result.realPercentage}%\nConfidence: ${result.confidenceScore}%\nSummary: ${result.summary}`;
    navigator.clipboard.writeText(reportText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `deepguard_forensic_report_${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-[calc(100vh-140px)] bg-[#050B1A] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-[#0B1628] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Upload</span>
          </motion.button>
          
          <div className="h-4 w-px bg-slate-800" />
          
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white truncate max-w-xs sm:max-w-md">
              {result.fileName}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-slate-400">
                Scanned in {result.processingTimeMs || 420}ms
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-500/30 text-[11px] font-medium text-cyan-300">
                {getCategoryIcon(result.subjectCategory)}
                <span>{result.subjectCategory || 'Dynamic Visual Analysis'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#0B1628] border border-slate-800 hover:border-slate-700 hover:text-white transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedLink ? 'Copied' : 'Copy Summary'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#0B1628] border border-slate-800 hover:border-slate-700 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            id="results-analyze-another-btn"
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </motion.button>
        </div>
      </div>

      {/* Dynamic Content Recognition Banner */}
      {result.identifiedSubject && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mb-6 p-4 rounded-xl bg-[#0B1628] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 border border-blue-500/30 flex items-center justify-center shrink-0">
              <ScanSearch className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Content Subject Identified</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">100% Dynamic</span>
              </div>
              <p className="text-sm font-bold text-white">
                {result.identifiedSubject}
              </p>
            </div>
          </div>

          {result.relevantFeaturesChecked && result.relevantFeaturesChecked.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
              <span className="text-[11px] text-slate-400 mr-1 font-mono">Features Verified:</span>
              {result.relevantFeaturesChecked.map((feat, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-[#07111F] border border-slate-700/60 text-[11px] text-slate-300">
                  {feat}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Main Grid: Left (Verdict & Findings) + Right (Visual Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Verdict Card & Breakdown */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-6"
        >
          
          {/* Main Verdict Card */}
          <div className={`rounded-2xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden ${
            isAi || isDeepfake
              ? 'bg-gradient-to-br from-red-950/60 via-[#0B1628] to-[#0B1628] border-red-500/50 shadow-red-500/10'
              : isUncertain
              ? 'bg-gradient-to-br from-amber-950/60 via-[#0B1628] to-[#0B1628] border-amber-500/50 shadow-amber-500/10'
              : 'bg-gradient-to-br from-emerald-950/60 via-[#0B1628] to-[#0B1628] border-emerald-500/50 shadow-emerald-500/10'
          }`}>
            
            {/* Top Verdict Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl p-0.5 flex items-center justify-center shadow-lg ${
                  isAi || isDeepfake 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                    : isUncertain
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {isAi || isDeepfake ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : isUncertain ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <ShieldCheck className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    Forensic Verdict
                  </span>
                  <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
                    isAi || isDeepfake 
                       ? 'text-red-400' 
                      : isUncertain 
                      ? 'text-amber-400' 
                      : 'text-emerald-400'
                  }`}>
                    {getVerdictDisplay()}
                  </h2>
                </div>
              </div>

              {/* Confidence Counter Badge */}
              <div className="text-right bg-[#07111F]/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Confidence</span>
                <span className="text-lg sm:text-xl font-mono font-bold text-white">
                  {animatedConfidence}%
                </span>
              </div>
            </div>

            {/* Plain English Summary */}
            <p className="text-sm text-slate-200 leading-relaxed mb-6 p-4 rounded-xl bg-[#07111F]/90 border border-slate-800/80 shadow-inner">
              {result.summary}
            </p>

            {/* AI vs Real Dual Probabilities Display */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex flex-col shadow-sm">
                  <span className="text-[11px] font-medium text-red-300">AI Probability</span>
                  <span className="text-2xl font-mono font-black text-red-400">{animatedAi}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col shadow-sm">
                  <span className="text-[11px] font-medium text-emerald-300">Real Photo Probability</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">{animatedReal}%</span>
                </div>
              </div>

              {/* Segmented Dual Bar with Smooth Easing */}
              <div className="w-full h-4 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800 shadow-inner">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${result.aiPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-l-full shadow-sm"
                  title={`AI: ${result.aiPercentage}%`}
                />
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${result.realPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-r-full shadow-sm"
                  title={`Real: ${result.realPercentage}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>AI Likelihood: {animatedAi}%</span>
                <span>Real Camera: {animatedReal}%</span>
              </div>
            </div>

          </div>

          {/* Detected Anomaly Indicators Section */}
          <div className="rounded-2xl bg-[#0B1628] border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {getWhyHeading()}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Targeted visual findings</span>
            </div>

            {/* Quick Bullet Points */}
            {result.analysisDetails?.detectedFeatures && result.analysisDetails.detectedFeatures.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="mb-4 p-3.5 rounded-xl bg-[#07111F] border border-slate-800 space-y-2"
              >
                <span className="text-[11px] uppercase font-mono text-slate-400 tracking-wider block">
                  Content-Specific Observations
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.analysisDetails.detectedFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isAi || isDeepfake ? 'bg-red-400' : isUncertain ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Indicator Cards with Sequential Animation */}
            <div className="space-y-3">
              {result.indicators.map((indicator, idx) => {
                const isHigh = indicator.severity === 'High';
                const isMedium = indicator.severity === 'Medium';

                return (
                  <motion.div
                    key={indicator.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 + idx * 0.08, ease: 'easeOut' }}
                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedIndicator(indicator)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedIndicator?.id === indicator.id
                        ? 'bg-blue-950/40 border-cyan-400 shadow-md'
                        : 'bg-[#07111F] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {getIndicatorIcon(indicator.iconType)}
                        <span>{indicator.name}</span>
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isHigh
                          ? 'bg-red-950/80 text-red-400 border border-red-500/30'
                          : isMedium
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {indicator.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {indicator.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

          </div>

        </motion.div>

        {/* Right Column: Media Preview & Interactive Visual Inspector */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="rounded-2xl bg-[#0B1628] border border-slate-800 p-6 shadow-2xl">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Media Forensic Inspector
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Interactive zoom & crop</span>
            </div>

            {/* Interactive Image / Video Viewer */}
            <InteractiveImageViewer
              mediaUrl={result.mediaUrl}
              mediaType={result.fileType}
              fileName={result.fileName}
              indicators={result.indicators}
              selectedIndicator={selectedIndicator}
              onSelectIndicator={setSelectedIndicator}
            />

            {/* Deep Technical Explanation Card */}
            {result.analysisDetails?.finalExplanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 }}
                className="mt-6 p-4 rounded-xl bg-[#07111F] border border-slate-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Forensic Breakdown Explanation
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.analysisDetails.finalExplanation}
                </p>
              </motion.div>
            )}

          </div>
        </motion.div>

      </div>

    </motion.div>
  );
};

