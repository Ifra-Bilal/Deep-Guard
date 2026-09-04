import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  FileText,
  AlertCircle,
  Eye
} from 'lucide-react';
import { AuditLogItem, AnalysisResult } from '../types';

interface HistoryLogsProps {
  logs: AuditLogItem[];
  onSelectLog: (result: AnalysisResult) => void;
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryLogs: React.FC<HistoryLogsProps> = ({
  logs,
  onSelectLog,
  onDeleteLog,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'ALL' | 'AI_GENERATED' | 'REAL_PHOTOGRAPH'>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.generatorEstimate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerdict = verdictFilter === 'ALL' || log.verdict === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `deepguard_historical_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportLogsAsCsv = () => {
    const headers = ['ID', 'Timestamp', 'Filename', 'Verdict', 'AI_Percentage', 'Real_Percentage', 'Confidence', 'Model_Estimate', 'Artifacts_Count', 'Latency_ms'];
    const rows = logs.map(l => [
      l.id,
      new Date(l.timestamp).toISOString(),
      `"${l.fileName.replace(/"/g, '""')}"`,
      l.verdict,
      l.aiPercentage,
      l.realPercentage,
      l.confidenceLevel,
      `"${l.generatorEstimate.replace(/"/g, '""')}"`,
      l.topArtifactsCount,
      l.processingTimeMs
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `deepguard_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-mono mb-3 w-fit">
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Immutable Forensic Audit Ledger</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Historical Analysis Logs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Complete chronological ledger of all media scans with diagnostic telemetry, percentage confidence verdicts, and artifact counts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportLogsAsCsv}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={exportLogsAsJson}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>

            {logs.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-950/60 text-xs font-semibold text-red-300 border border-red-500/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by filename or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1E293B] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#1E293B] border border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setVerdictFilter('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              verdictFilter === 'ALL'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setVerdictFilter('AI_GENERATED')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              verdictFilter === 'AI_GENERATED'
                ? 'bg-red-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI-Generated
          </button>
          <button
            onClick={() => setVerdictFilter('REAL_PHOTOGRAPH')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              verdictFilter === 'REAL_PHOTOGRAPH'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Real Camera
          </button>
        </div>

      </div>

      {/* Logs Table / Cards Feed */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 border border-slate-700 rounded-2xl bg-[#1E293B] text-center">
          <History className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No analysis logs found</h4>
          <p className="text-xs text-slate-400">
            {searchTerm ? 'No logs match your search term.' : 'Run forensic scans on pictures to build your audit log history.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Media Target</th>
                  <th className="py-3.5 px-4">Verdict & Confidence</th>
                  <th className="py-3.5 px-4">Estimated Generator</th>
                  <th className="py-3.5 px-4">Artifacts</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredLogs.map((log) => {
                  const isAi = log.verdict === 'AI_GENERATED';
                  const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/60 transition-colors group">
                      
                      {/* Media Target Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={log.imageUrl}
                            alt={log.fileName}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                              {log.fileName}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              {log.processingTimeMs}ms latency
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Verdict Badge with Exact Percentage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {isAi ? (
                              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span className={`font-mono font-bold ${isAi ? 'text-red-400' : 'text-emerald-400'}`}>
                              {isAi ? `${log.aiPercentage}% AI-Generated` : `${log.realPercentage}% Real`}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            Confidence: {log.confidenceLevel}
                          </span>
                        </div>
                      </td>

                      {/* Generator Fingerprint */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        <span className="truncate block max-w-xs">{log.generatorEstimate}</span>
                      </td>

                      {/* Artifacts Count */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded-md ${
                          log.topArtifactsCount > 0
                            ? 'bg-red-950/40 text-red-300 border border-red-500/30'
                            : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {log.topArtifactsCount} flagged
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {log.resultData && (
                            <button
                              onClick={() => onSelectLog(log.resultData!)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
                              title="Inspect in Dashboard"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteLog(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Delete log"
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
        </div>
      )}

    </div>
  );
};
