import React from 'react';
import { motion } from 'motion/react';
import { PageType, UserProfile, ScanResult, DashboardStats } from '../types';
import { 
  UploadCloud, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  ArrowRight, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Eye,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DashboardPageProps {
  currentUser: UserProfile | null;
  scans: ScanResult[];
  stats: DashboardStats;
  onNavigate: (page: PageType) => void;
  onSelectScanForResults: (scan: ScanResult) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  scans,
  stats,
  onNavigate,
  onSelectScanForResults,
}) => {
  const userName = currentUser?.fullName || 'Investigator';
  const recentScans = scans.slice(0, 6);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-[#050B1A] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      
      {/* Top Greeting */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{userName}</span>!
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Your media verification overview, detection telemetry, and recent scans.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-cyan-300 text-xs font-mono font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Detection Cluster Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main CTA Card: Analyze New Media */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#101D33] via-[#0B1628] to-[#101D33] border border-blue-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30 mb-2">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Instant Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
              Analyze New Media
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload an image or video to check for signs of manipulation, face swaps, or AI generation in seconds.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            id="dashboard-upload-media-btn"
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all shrink-0 cursor-pointer"
          >
            <UploadCloud className="w-5 h-5 text-cyan-200" />
            <span>Upload Media</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        
        {/* Stat 1: Total Scans */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-xl bg-[#0B1628] border border-slate-800 p-5 shadow-md flex items-center justify-between transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Total Scans
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.totalScans}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Stat 2: Authentic */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-xl bg-[#0B1628] border border-slate-800 p-5 shadow-md flex items-center justify-between transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Authentic Media
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {stats.authenticCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Stat 3: Deepfakes Detected */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.19, ease: 'easeOut' }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-xl bg-[#0B1628] border border-slate-800 p-5 shadow-md flex items-center justify-between transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Deepfakes / AI
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
              {stats.deepfakesCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Stat 4: Average Confidence */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.26, ease: 'easeOut' }}
          whileHover={{ y: -3, scale: 1.01 }}
          className="rounded-xl bg-[#0B1628] border border-slate-800 p-5 shadow-md flex items-center justify-between transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Avg Confidence
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
              {stats.averageConfidence}%
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </motion.div>

      </div>

      {/* Recent Activity Table / Grid */}
      <div className="rounded-2xl bg-[#0B1628] border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Scans</h3>
            <p className="text-xs text-slate-400">Your latest verification history</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All Scans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentScans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Scans Recorded Yet</h4>
            <p className="text-xs text-slate-400 mb-4">Start by uploading your first image or video for verification.</p>
            <button
              onClick={() => onNavigate('upload')}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-colors"
            >
              Upload First Media
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentScans.map((scan) => {
              const isAi = scan.verdict === 'AI_GENERATED';
              const isDeepfake = scan.verdict === 'DEEPFAKE_DETECTED';
              const isUncertain = scan.verdict === 'UNCERTAIN';

              return (
                <motion.div
                  key={scan.id}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    onSelectScanForResults(scan);
                    onNavigate('results');
                  }}
                  className="group cursor-pointer rounded-xl bg-[#07111F] border border-slate-800 hover:border-blue-500/50 p-4 transition-all shadow-md hover:shadow-blue-500/10"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {scan.fileType === 'video' ? (
                        <VideoIcon className="w-5 h-5 text-purple-400" />
                      ) : (
                        <img
                          src={scan.mediaUrl}
                          alt={scan.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                        {scan.fileName}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">
                        {formatDate(scan.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isAi || isDeepfake
                        ? 'bg-red-950/80 text-red-300 border border-red-500/30'
                        : isUncertain
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isAi ? 'AI Generated' : isDeepfake ? 'Deepfake' : isUncertain ? 'Uncertain' : 'Authentic'}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {scan.confidenceScore}% Conf
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </motion.div>
  );
};
