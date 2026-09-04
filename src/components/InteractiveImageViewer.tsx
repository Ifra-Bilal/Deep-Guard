import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Layers, 
  Activity, 
  Zap, 
  Flame, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sliders, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Mountain,
  User,
  PawPrint,
  Building2,
  Box,
  Utensils,
  Palette,
  Sun,
  Cloud,
  Waves
} from 'lucide-react';
import { ArtifactFinding, AnomalyIndicator, InspectionViewMode, MediaType } from '../types';
import { 
  generateErrorLevelAnalysis, 
  generateHighPassNoiseFilter, 
  generateThermalLuminanceMap 
} from '../utils/forensicFilters';

export interface InteractiveImageViewerProps {
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  fileName?: string;
  findings?: ArtifactFinding[];
  indicators?: AnomalyIndicator[];
  isAiGenerated?: boolean;
  selectedFindingId?: string | null;
  selectedIndicator?: AnomalyIndicator | null;
  onSelectFinding?: (id: string | null) => void;
  onSelectIndicator?: (indicator: AnomalyIndicator | null) => void;
}

export const InteractiveImageViewer: React.FC<InteractiveImageViewerProps> = ({
  imageUrl,
  mediaUrl,
  mediaType = 'image',
  findings,
  indicators,
  isAiGenerated = true,
  selectedFindingId,
  selectedIndicator,
  onSelectFinding,
  onSelectIndicator,
}) => {
  const activeUrl = mediaUrl || imageUrl || '';
  const [viewMode, setViewMode] = useState<InspectionViewMode>('heatmap');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [splitPos, setSplitPos] = useState<number>(50); // 0 to 100 for split view
  const [elaImage, setElaImage] = useState<string | null>(null);
  const [noiseImage, setNoiseImage] = useState<string | null>(null);
  const [thermalImage, setThermalImage] = useState<string | null>(null);
  const [isProcessingFilter, setIsProcessingFilter] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Normalize indicators into a unified list
  const unifiedIndicators = React.useMemo(() => {
    if (indicators && indicators.length > 0) {
      return indicators.map((ind) => ({
        id: ind.id,
        title: ind.name,
        description: ind.description,
        severity: ind.severity.toLowerCase(),
        box: ind.locationBox,
        iconType: ind.iconType,
        original: ind,
      }));
    }
    if (findings && findings.length > 0) {
      return findings.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        severity: f.severity,
        box: f.boundingBox,
        iconType: f.category,
        original: f,
      }));
    }
    return [];
  }, [indicators, findings]);

  const activeSelectedId = selectedIndicator?.id || selectedFindingId;

  // Pre-generate forensic layers when image changes
  useEffect(() => {
    let isMounted = true;
    if (mediaType === 'video' || !activeUrl) return;

    const generateLayers = async () => {
      setIsProcessingFilter(true);
      try {
        const [ela, noise, thermal] = await Promise.all([
          generateErrorLevelAnalysis(activeUrl),
          generateHighPassNoiseFilter(activeUrl),
          generateThermalLuminanceMap(activeUrl),
        ]);
        if (isMounted) {
          setElaImage(ela);
          setNoiseImage(noise);
          setThermalImage(thermal);
        }
      } catch (err) {
        console.error('Error generating forensic filters:', err);
      } finally {
        if (isMounted) setIsProcessingFilter(false);
      }
    };
    generateLayers();
    return () => {
      isMounted = false;
    };
  }, [activeUrl, mediaType]);

  const activeOverlayImage = () => {
    switch (viewMode) {
      case 'ela':
        return elaImage || activeUrl;
      case 'noise':
        return noiseImage || activeUrl;
      case 'thermal':
        return thermalImage || activeUrl;
      default:
        return activeUrl;
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(4, Math.max(1, +(prev + delta).toFixed(1))));
  };

  const handleIndicatorClick = (item: any) => {
    if (onSelectIndicator && item.original) {
      onSelectIndicator(activeSelectedId === item.id ? null : item.original);
    } else if (onSelectFinding) {
      onSelectFinding(activeSelectedId === item.id ? null : item.id);
    }
  };

  const getPinIcon = (iconType?: string) => {
    switch (iconType) {
      case 'sky': return <Cloud className="w-3 h-3" />;
      case 'water': return <Waves className="w-3 h-3" />;
      case 'nature': return <Mountain className="w-3 h-3" />;
      case 'building': return <Building2 className="w-3 h-3" />;
      case 'animal': return <PawPrint className="w-3 h-3" />;
      case 'object': return <Box className="w-3 h-3" />;
      case 'food': return <Utensils className="w-3 h-3" />;
      case 'art': return <Palette className="w-3 h-3" />;
      case 'lighting': return <Sun className="w-3 h-3" />;
      case 'eye': return <Eye className="w-3 h-3" />;
      case 'face': return <User className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#0B1628] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#07111F] border-b border-slate-800 text-xs">
        
        {/* Layer Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'original'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'heatmap'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Artifact Map</span>
            {unifiedIndicators.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-black/40 text-white">
                {unifiedIndicators.length}
              </span>
            )}
          </button>

          {mediaType !== 'video' && (
            <>
              <button
                onClick={() => setViewMode('ela')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === 'ela'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>ELA Matrix</span>
              </button>

              <button
                onClick={() => setViewMode('noise')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === 'noise'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sensor Grain</span>
              </button>

              <button
                onClick={() => setViewMode('thermal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === 'thermal'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Luminance</span>
              </button>

              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Split Compare</span>
              </button>
            </>
          )}
        </div>

        {/* Zoom & Inspection Utilities */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 rounded-md border border-slate-800 p-0.5">
            <button
              onClick={() => handleZoom(-0.5)}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold text-slate-300 min-w-[3rem] text-center">
              {zoomLevel}x
            </span>
            <button
              onClick={() => handleZoom(0.5)}
              disabled={zoomLevel >= 4}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Image Stage */}
      <div 
        ref={containerRef}
        className="relative w-full h-[380px] sm:h-[480px] bg-slate-950 flex items-center justify-center overflow-hidden select-none cursor-crosshair"
      >
        {isProcessingFilter && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-blue-500/40 text-blue-400 text-xs font-mono shadow-md">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-spin" />
            <span>Rendering Multi-Spectral Matrix...</span>
          </div>
        )}

        {/* Scaled Image Container */}
        <div 
          className="relative max-w-full max-h-full transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {mediaType === 'video' ? (
            <video 
              src={activeUrl} 
              controls 
              className="max-w-full max-h-[440px] object-contain rounded-lg border border-slate-800"
            />
          ) : viewMode === 'split' ? (
            /* Split View Slider */
            <div className="relative max-w-full max-h-[480px] overflow-hidden flex items-center justify-center">
              <img
                src={elaImage || activeUrl}
                alt="Forensic ELA"
                className="max-w-full max-h-[440px] object-contain rounded-lg"
              />

              {/* Overlaid: Original with clipping */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` }}
              >
                <img
                  src={activeUrl}
                  alt="Original"
                  className="max-w-full max-h-[440px] object-contain rounded-lg"
                />
              </div>

              {/* Split Line Divider */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-blue-400 shadow-[0_0_10px_#3b82f6] z-20 cursor-ew-resize flex items-center justify-center"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-slate-950 border border-blue-400 flex items-center justify-center text-blue-400 shadow-md">
                  <Sliders className="w-3 h-3 rotate-90" />
                </div>
              </div>

              {/* Slider Input overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={(e) => setSplitPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />

              {/* Labels */}
              <span className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-blue-400 border border-blue-500/30">
                Original RGB
              </span>
              <span className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-indigo-400 border border-indigo-500/30">
                ELA Differential Matrix
              </span>
            </div>
          ) : (
            /* Single Layer / Heatmap View */
            <div className="relative inline-block max-w-full max-h-[480px]">
              <img
                src={activeOverlayImage()}
                alt="Forensic Inspection Layer"
                className="max-w-full max-h-[440px] object-contain rounded-lg border border-slate-800 shadow-lg"
              />

              {/* Bounding Box Overlays for Detected Micro-Artifacts */}
              {viewMode === 'heatmap' && unifiedIndicators.map((item) => {
                if (!item.box || item.box.length !== 4) return null;
                const [ymin, xmin, ymax, xmax] = item.box;
                const isSelected = activeSelectedId === item.id;

                const top = `${(ymin / 1000) * 100}%`;
                const left = `${(xmin / 1000) * 100}%`;
                const width = `${((xmax - xmin) / 1000) * 100}%`;
                const height = `${((ymax - ymin) / 1000) * 100}%`;

                const isHigh = item.severity === 'high';
                const isMedium = item.severity === 'medium';

                const severityBorder = isHigh
                  ? 'border-red-500 bg-red-500/15 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : isMedium
                  ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.4)]';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleIndicatorClick(item)}
                    className={`absolute rounded-md border-2 cursor-pointer transition-all duration-300 z-20 group ${severityBorder} ${
                      isSelected ? 'ring-2 ring-white scale-105 z-30' : 'hover:scale-102'
                    }`}
                    style={{ top, left, width, height }}
                  >
                    {/* Pulsing Tag Marker */}
                    <div className="absolute -top-3.5 -left-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono font-bold text-slate-200 shadow-md flex items-center gap-1.5 whitespace-nowrap">
                      {getPinIcon(item.iconType)}
                      <span>{item.title}</span>
                    </div>

                    {/* Hover Info Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-2xl z-40 transition-opacity duration-200">
                      <p className="font-bold text-white mb-1">{item.title}</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}

              {/* Real Photograph Authenticity Stamp Overlay if 100% Real */}
              {!isAiGenerated && viewMode === 'heatmap' && (
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">Authentic Physical Sensor Verified</span>
                    <span className="text-[10px] font-mono text-emerald-400/80">No Generative Diffusion Artifacts</span>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* Layer Description Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            {viewMode === 'original' && 'Standard RGB color view.'}
            {viewMode === 'heatmap' && (isAiGenerated ? 'DeepGuard neural heatmap pinpointing detected synthetic micro-anomalies.' : 'Verified authentic capture: zero generative anomalies detected.')}
            {viewMode === 'ela' && 'Error Level Analysis (ELA) isolates compression error rates; modified regions produce high contrast color differentials.'}
            {viewMode === 'noise' && 'Laplacian high-pass filter isolates high-frequency sensor noise; exposes plastic smoothing typical of diffusion models.'}
            {viewMode === 'thermal' && 'Luminance distribution analysis checks ray-traced lighting and specular reflection vectors.'}
            {viewMode === 'split' && 'Drag slider left/right to compare original photography with forensic ELA differential matrix.'}
          </span>
        </div>
      </div>

    </div>
  );
};
