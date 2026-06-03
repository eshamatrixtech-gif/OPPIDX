"use client";

import { useState, useRef, useCallback } from "react";

interface PhotoCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export default function PhotoCapture({ onCapture, onClose }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera access!");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50">
        <button onClick={() => { stopCamera(); onClose(); }} className="text-white text-lg">✕ Cancel</button>
        <h2 className="text-white font-bold">📸 Capture Real Moment</h2>
        <div className="w-16" />
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-gray-900">
        {error && (
          <div className="text-center p-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={startCamera} className="px-6 py-3 bg-white text-black rounded-xl font-bold">Try Again</button>
          </div>
        )}

        {!cameraActive && !capturedImage && !error && (
          <button onClick={startCamera} className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl text-xl shadow-lg shadow-green-500/30">
            🎥 Open Camera
          </button>
        )}

        <video ref={videoRef} autoPlay playsInline className={`max-h-full max-w-full ${cameraActive && !capturedImage ? "block" : "hidden"}`} />
        {capturedImage && <img src={capturedImage} alt="Captured" className="max-h-full max-w-full object-contain" />}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6 bg-black/50">
        {cameraActive && !capturedImage && (
          <button onClick={takePhoto} className="w-full py-4 bg-white text-black font-bold rounded-2xl text-xl">📷 Take Photo</button>
        )}
        {capturedImage && (
          <div className="flex gap-4">
            <button onClick={retake} className="flex-1 py-4 bg-gray-700 text-white font-bold rounded-2xl">🔄 Retake</button>
            <button onClick={confirmPhoto} className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30">✓ Share & Heal</button>
          </div>
        )}
      </div>
    </div>
  );
}