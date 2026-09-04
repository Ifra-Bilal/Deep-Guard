import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Data: string, fileName: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setCountdown(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMessage(null);
    setHasPermission(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user',
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      setErrorMessage(err.name === 'NotAllowedError' ? 'Camera access was denied by browser. Please enable permissions.' : 'Could not access webcam device.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const triggerCountdownCapture = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage, `live_camera_capture_${Date.now()}.jpg`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#0b1324] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Camera Capture</h3>
              <p className="text-xs text-slate-400">Capture a live photo to test real-world camera authenticity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {hasPermission === false ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-sm text-slate-200">{errorMessage}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
              >
                Retry Camera Access
              </button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

              {/* Optical Framing Grid */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-cyan-400/40">
                <div className="border-r border-b border-cyan-400" />
                <div className="border-r border-b border-cyan-400" />
                <div className="border-b border-cyan-400" />
                <div className="border-r border-b border-cyan-400" />
                <div className="border-r border-b border-cyan-400" />
                <div className="border-b border-cyan-400" />
                <div className="border-r border-cyan-400" />
                <div className="border-r border-cyan-400" />
                <div />
              </div>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                  <span className="text-7xl font-mono font-black text-cyan-400 animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-900/90 border-t border-slate-800">
          {capturedImage ? (
            <>
              <button
                onClick={() => setCapturedImage(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                <span>Analyze Captured Photo</span>
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400 font-mono">
                Face the camera directly for optical iris & skin pore analysis
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={takeSnapshot}
                  disabled={hasPermission !== true || countdown !== null}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
                >
                  Instant Snap
                </button>
                <button
                  onClick={triggerCountdownCapture}
                  disabled={hasPermission !== true || countdown !== null}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture (3s Timer)</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
