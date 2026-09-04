import React, { useState, useRef } from 'react';
import { 
  Layers, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  Play, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface BatchItem {
  id: string;
  file?: File;
  name: string;
  preview: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: AnalysisResult;
  error?: string;
}

interface BatchScannerProps {
  onViewResult: (result: AnalysisResult) => void;
}

export const BatchScanner: React.FC<BatchScannerProps> = ({ onViewResult }) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (fileList: FileList) => {
    const newItems: BatchItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newItems.push({
          id: `batch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          file,
          name: file.name,
          preview,
          size: file.size,
          status: 'pending',
        });
      }
    }
    setItems((prev) => [...prev, ...newItems]);
  };

  const removeBatchItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const runBatchProcessing = async () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === 'completed') continue;

      // Update status to processing
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing' } : it))
      );

      try {
        let base64Data = '';
        if (item.file) {
          base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(item.file!);
          });
        }

        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data || item.preview,
            fileName: item.name,
            fileSize: item.size,
          }),
        });

        const data: AnalysisResult = await res.json();
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'completed', result: data } : it))
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'error', error: err.message } : it))
        );
      }
    }

    setIsProcessing(false);
  };

  const completedItems = items.filter((i) => i.status === 'completed');
  const aiCount = completedItems.filter((i) => i.result?.verdict === 'AI_GENERATED').length;
  const realCount = completedItems.filter((i) => i.result?.verdict === 'REAL_PHOTOGRAPH').length;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-mono mb-3 w-fit">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Media Forensic Queue</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Batch Image Forensic Analyzer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Upload multiple images to run simultaneous micro-artifact forensic scans and compare aggregate verdicts.
            </p>
          </div>

          {/* Quick Stats Summary */}
          {completedItems.length > 0 && (
            <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 p-4 rounded-xl shrink-0">
              <div className="text-center px-3 border-r border-slate-700">
                <span className="text-2xl font-bold font-mono text-blue-400 block">{completedItems.length}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Processed</span>
              </div>
              <div className="text-center px-3 border-r border-slate-700">
                <span className="text-2xl font-bold font-mono text-red-400 block">{aiCount}</span>
                <span className="text-[10px] text-red-400 uppercase font-mono font-bold">AI Flagged</span>
              </div>
              <div className="text-center px-3">
                <span className="text-2xl font-bold font-mono text-emerald-400 block">{realCount}</span>
                <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Real Verified</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dropzone & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-blue-400" />
            <span>Add Images to Batch</span>
          </button>

          {items.length > 0 && (
            <button
              onClick={() => setItems([])}
              disabled={isProcessing}
              className="px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
            >
              Clear Queue
            </button>
          )}
        </div>

        {items.length > 0 && (
          <button
            onClick={runBatchProcessing}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Processing Queue...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Batch Deep Scan ({items.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Batch Items Queue Table */}
      {items.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-12 border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-2xl bg-[#1E293B]/50 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
        >
          <UploadCloud className="w-12 h-12 text-slate-500 mb-3" />
          <h4 className="text-base font-bold text-white mb-1">Queue is empty</h4>
          <p className="text-xs text-slate-400 max-w-sm">
            Click here to select multiple images from your device for concurrent forensic inspection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isCompleted = item.status === 'completed';
            const isAi = item.result?.verdict === 'AI_GENERATED';

            return (
              <div
                key={item.id}
                className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex flex-col justify-between shadow-md relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={item.preview}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate mb-0.5">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {(item.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => removeBatchItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Indicator */}
                  {item.status === 'processing' && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-blue-500/30 flex items-center gap-2 text-xs text-blue-400 font-mono">
                      <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                      <span>Scanning Micro-Textures...</span>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                      {item.error || 'Scan failed'}
                    </div>
                  )}

                  {isCompleted && item.result && (
                    <div className={`p-3 rounded-lg border ${
                      isAi
                        ? 'bg-red-950/30 border-red-500/40 text-red-300'
                        : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-mono">
                          {item.result.primaryHeadline}
                        </span>
                        <span className="text-[10px] font-mono uppercase opacity-80">
                          {item.result.confidenceLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {item.result.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Inspect Action */}
                {isCompleted && item.result && (
                  <button
                    onClick={() => onViewResult(item.result!)}
                    className="mt-3 w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Full Forensic Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
