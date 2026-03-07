'use client';

import { useRef, useState, useEffect } from 'react';

interface VideoPreviewProps {
  src: string;
  file?: File;
  className?: string;
}

export default function VideoPreview({ src, file, className = '' }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        controls
        className="max-w-full rounded-xl shadow-lg"
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />
      {duration > 0 && (
        <span className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}