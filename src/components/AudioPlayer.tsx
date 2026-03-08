'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Music } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export default function AudioPlayer({ 
  src, 
  title = 'Audio Track', 
  className = '',
  onEnded,
  autoPlay = false
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);

  // Format time helper
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Initialize audio visualization
  const initVisualization = useCallback(() => {
    if (!audioRef.current || !canvasRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      setIsVisualizing(true);
    } catch (error) {
      console.log('Visualization not available:', error);
    }
  }, []);

  // Draw visualization
  const drawVisualization = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        // Create gradient for bars
        const barGradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        barGradient.addColorStop(0, '#6366f1');
        barGradient.addColorStop(0.5, '#8b5cf6');
        barGradient.addColorStop(1, '#a855f7');
        
        ctx.fillStyle = barGradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        
        x += barWidth;
      }
    };
    
    draw();
  }, []);

  // Play/Pause toggle
  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (!audioContextRef.current) {
      initVisualization();
    }
    
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play();
      drawVisualization();
    }
    setIsPlaying(!isPlaying);
  };

  // Time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Loaded metadata handler
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Volume change handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Toggle repeat
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
    if (audioRef.current) {
      audioRef.current.loop = !isRepeat;
    }
  };

  // Handle ended
  const handleEnded = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    onEnded?.();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 shadow-sm ${className}`}>
      {/* Visualization Canvas */}
      <div className="relative mb-4 h-24 overflow-hidden rounded-xl bg-slate-900">
        <canvas
          ref={canvasRef}
          width={400}
          height={96}
          className="h-full w-full"
        />
        {!isVisualizing && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <Music className="h-8 w-8 text-slate-400" />
          </div>
        )}
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          autoPlay={autoPlay}
          crossOrigin="anonymous"
        />
      </div>

      {/* Track Info */}
      <div className="mb-3 text-center">
        <h3 className="truncate font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Shuffle Button */}
        <button
          onClick={() => setIsShuffle(!isShuffle)}
          className={`rounded-lg p-2 transition-colors ${
            isShuffle ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Shuffle"
        >
          <Shuffle className="h-4 w-4" />
        </button>

        {/* Previous Button */}
        <button
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          title="Previous"
        >
          <SkipBack className="h-5 w-5" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all hover:shadow-xl"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </button>

        {/* Next Button */}
        <button
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
          title="Next"
        >
          <SkipForward className="h-5 w-5" />
        </button>

        {/* Repeat Button */}
        <button
          onClick={toggleRepeat}
          className={`rounded-lg p-2 transition-colors ${
            isRepeat ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
          }`}
          title="Repeat"
        >
          <Repeat className="h-4 w-4" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={toggleMute}
          className="text-slate-500 transition-colors hover:text-slate-700"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
        />
      </div>
    </div>
  );
}
