'use client';

import { useState, useCallback } from 'react';
import { ListMusic, Play, Trash2, GripVertical, Music, Plus, X } from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  url: string;
  duration?: number;
  artist?: string;
  cover?: string;
}

interface PlaylistManagerProps {
  tracks?: Track[];
  currentTrack?: Track;
  onTrackSelect: (track: Track) => void;
  onTrackRemove?: (trackId: string) => void;
  onReorder?: (tracks: Track[]) => void;
  className?: string;
}

export default function PlaylistManager({
  tracks = [],
  currentTrack,
  onTrackSelect,
  onTrackRemove,
  onReorder,
  className = ''
}: PlaylistManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Format duration helper
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTracks = [...tracks];
    const draggedTrack = newTracks[draggedIndex];
    newTracks.splice(draggedIndex, 1);
    newTracks.splice(index, 0, draggedTrack);

    onReorder?.(newTracks);
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Handle track remove
  const handleRemove = (trackId: string) => {
    onTrackRemove?.(trackId);
  };

  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm ${className}`}>
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between border-b border-slate-100 p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <ListMusic className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">播放清單</h3>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {tracks.length} 首
          </span>
        </div>
        <button className="text-slate-400 transition-colors hover:text-slate-600">
          {isExpanded ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Track List */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Music className="mb-2 h-8 w-8" />
              <p className="text-sm">播放清單是空的</p>
              <p className="text-xs">上傳音樂檔案以新增曲目</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tracks.map((track, index) => (
                <li
                  key={track.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group flex items-center gap-3 px-4 py-3 transition-colors ${
                    currentTrack?.id === track.id
                      ? 'bg-indigo-50'
                      : 'hover:bg-slate-50'
                  } ${draggedIndex === index ? 'opacity-50' : ''}`}
                >
                  {/* Drag Handle */}
                  <GripVertical className="h-4 w-4 cursor-grab text-slate-300 opacity-0 group-hover:opacity-100" />

                  {/* Track Number / Playing Indicator */}
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                    {currentTrack?.id === track.id ? (
                      <div className="flex items-center gap-0.5">
                        <span className="h-3 w-0.5 animate-pulse bg-indigo-600" />
                        <span className="h-4 w-0.5 animate-pulse bg-indigo-600" style={{ animationDelay: '0.1s' }} />
                        <span className="h-2 w-0.5 animate-pulse bg-indigo-600" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">{index + 1}</span>
                    )}
                  </div>

                  {/* Track Info */}
                  <div
                    className="flex-1 cursor-pointer overflow-hidden"
                    onClick={() => onTrackSelect(track)}
                  >
                    <p className={`truncate text-sm font-medium ${
                      currentTrack?.id === track.id ? 'text-indigo-600' : 'text-slate-700'
                    }`}>
                      {track.title}
                    </p>
                    {track.artist && (
                      <p className="truncate text-xs text-slate-500">{track.artist}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <span className="flex-shrink-0 text-xs text-slate-400">
                    {formatDuration(track.duration)}
                  </span>

                  {/* Play Button */}
                  <button
                    onClick={() => onTrackSelect(track)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 opacity-0 transition-all hover:bg-indigo-200 group-hover:opacity-100"
                  >
                    <Play className="h-4 w-4 ml-0.5" />
                  </button>

                  {/* Remove Button */}
                  {onTrackRemove && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(track.id);
                      }}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-red-500 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Footer Stats */}
      {tracks.length > 0 && isExpanded && (
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          總時長：{formatDuration(tracks.reduce((acc, t) => acc + (t.duration || 0), 0))}
        </div>
      )}
    </div>
  );
}
