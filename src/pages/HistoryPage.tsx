import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageType, ScanResult, VerdictType } from '../types';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  UploadCloud, 
  ShieldCheck, 
  ShieldAlert, 
  Download,
  AlertCircle
} from 'lucide-react';

interface HistoryPageProps {
  scans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onDeleteScan: (scanId: string) => void;
  onClearHistory: () => void;
  onNavigate: (page: PageType) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  scans,
  onSelectScan,
  onDeleteScan,
  onClearHistory,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'ALL' | 'AI_GENERATED' | 'REAL_NATURAL' | 'DEEPFAKE_DETECTED' | 'UNCERTAIN'>('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    if (verdictFilter === 'ALL') return matchesSearch;
    if (verdictFilter === 'AI_GENERATED') {
      return matchesSearch && (scan.verdict === 'AI_GENERATED' || scan.aiPercentage >= 60);
    }
    if (verdictFilter === 'REAL_NATURAL') {
      return matchesSearch && (scan.verdict === 'REAL_NATURAL' || scan.verdict === 'AUTHENTIC' || (scan.realPercentage >= 60 && scan.verdict !== 'DEEPFAKE_DETECTED'));
    }
    if (verdictFilter === 'DEEPFAKE_DETECTED') {
      return matchesSearch && scan.verdict === 'DEEPFAKE_DETECTED';
    }
    if (verdictFilter === 'UNCERTAIN') {
      return matchesSearch && scan.verdict === 'UNCERTAIN';
    }
    return matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleExportAllJSON = () => {
    const blob = new Blob([JSON.stringify(scans, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeepGuard_Scan_History_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-[#050B1A] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Scan History
            </h1>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Review your previous media verification results and confidence scores.
          </p>
        </div>

        {scans.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAllJSON}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-[#0B1628] border border-slate-700 hover:bg-slate-800 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export History</span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B1A]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0B1628] border border-red-500/50 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Clear All Scan History?</h3>
            <p className="text-xs text-slate-300 mb-6">
              This will permanently delete all your previous verification logs from this device.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B1628] border border-slate-800 mb-6">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07111F] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        {/* Verdict Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setVerdictFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              verdictFilter === 'ALL'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-[#07111F] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({scans.length})
          </button>

          <button
            onClick={() => setVerdictFilter('AI_GENERATED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              verdictFilter === 'AI_GENERATED'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-[#07111F] text-red-400/80 hover:text-red-300 border border-slate-800'
            }`}
          >
            AI-Generated ({scans.filter(s => s.verdict === 'AI_GENERATED' || s.aiPercentage >= 60).length})
          </button>

          <button
            onClick={() => setVerdictFilter('REAL_NATURAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              verdictFilter === 'REAL_NATURAL'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-[#07111F] text-emerald-400/80 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            Real / Natural ({scans.filter(s => s.verdict === 'REAL_NATURAL' || s.verdict === 'AUTHENTIC' || (s.realPercentage >= 60 && s.verdict !== 'DEEPFAKE_DETECTED')).length})
          </button>

          <button
            onClick={() => setVerdictFilter('DEEPFAKE_DETECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              verdictFilter === 'DEEPFAKE_DETECTED'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-[#07111F] text-rose-400/80 hover:text-rose-300 border border-slate-800'
            }`}
          >
            Deepfakes ({scans.filter(s => s.verdict === 'DEEPFAKE_DETECTED').length})
          </button>
        </div>

      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-[#0B1628] border border-slate-800 overflow-hidden shadow-xl">
        {filteredScans.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <UploadCloud className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-bold text-white mb-1">No Scans Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {searchQuery || verdictFilter !== 'ALL'
                ? 'No media matches your search query or filter.'
                : 'You have not verified any images or videos yet.'}
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all"
            >
              Analyze New Media
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#07111F]/60 text-slate-400 font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Media File</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Verdict</th>
                  <th className="py-3.5 px-4">AI / Real Ratio</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Scan Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredScans.map((scan) => {
                  return (
                    <tr
                      key={scan.id}
                      className="hover:bg-[#101D33]/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectScan(scan)}
                    >
                      {/* Media File Thumbnail & Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {scan.mediaUrl ? (
                              <img
                                src={scan.mediaUrl}
                                alt={scan.fileName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : scan.fileType === 'video' ? (
                              <VideoIcon className="w-5 h-5 text-purple-400" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white max-w-[180px] sm:max-w-xs truncate group-hover:text-cyan-300 transition-colors">
                              {scan.fileName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {scan.fileSize ? `${(scan.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Standard file'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Media Type */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {scan.fileType === 'video' ? (
                            <>
                              <VideoIcon className="w-3 h-3 text-purple-400" />
                              <span>Video</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 text-blue-400" />
                              <span>Image</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Verdict */}
                      <td className="py-4 px-4">
                        {scan.verdict === 'AI_GENERATED' || scan.aiPercentage >= 60 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-950/80 text-red-300 border border-red-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>AI-Generated</span>
                          </span>
                        ) : scan.verdict === 'DEEPFAKE_DETECTED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Deepfake</span>
                          </span>
                        ) : scan.verdict === 'UNCERTAIN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Uncertain</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Real / Natural</span>
                          </span>
                        )}
                      </td>

                      {/* AI vs Real Ratio */}
                      <td className="py-4 px-4 font-mono text-[11px]">
                        <span className="text-red-400 font-bold">{scan.aiPercentage}% AI</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-emerald-400 font-bold">{scan.realPercentage}% Real</span>
                      </td>

                      {/* Confidence Score */}
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        {scan.confidenceScore}%
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDate(scan.timestamp)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectScan(scan)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 bg-blue-950/60 border border-blue-500/30 hover:bg-cyan-500 hover:text-slate-950 transition-all"
                            title="View Full Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => onDeleteScan(scan.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  );
};
