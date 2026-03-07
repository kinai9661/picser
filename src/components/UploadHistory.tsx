'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Clock, Copy, ExternalLink, Trash2, CheckCircle, Zap, Star, Film, Loader2, Cloud, CloudOff } from 'lucide-react';
import { getHistory, clearHistory, type UploadHistory } from '@/utils/storage';
import { fetchRecords, deleteRecord, type UploadRecord } from '@/lib/records';
import VideoPreview from './VideoPreview';

interface UploadHistoryProps {
  onNewUpload?: () => void;
}

export default function UploadHistoryComponent({ onNewUpload }: UploadHistoryProps) {
  const t = useTranslations();
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'loading' | 'synced' | 'error' | 'offline'>('loading');

  // Load records from both localStorage and GitHub
  const loadAllRecords = useCallback(async () => {
    setIsLoading(true);
    setCloudStatus('loading');
    
    // Start with local storage records
    const localRecords = getHistory();
    
    try {
      // Try to fetch GitHub records
      const githubRecords = await fetchRecords();
      
      if (githubRecords && githubRecords.length > 0) {
        // Merge records, preferring GitHub records (more complete)
        const localIds = new Set(localRecords.map(r => r.id));
        const githubIds = new Set(githubRecords.map(r => r.id));
        
        // Combine: GitHub records + local records not in GitHub
        const mergedRecords = [
          ...githubRecords.map(r => ({
            ...r,
            // Ensure compatibility with UploadHistory type
            mediaType: r.mediaType || ('image' as const)
          })),
          ...localRecords.filter(r => !githubIds.has(r.id))
        ];
        
        // Sort by upload date (newest first)
        mergedRecords.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        
        setHistory(mergedRecords);
        setCloudStatus('synced');
      } else {
        // No GitHub records, use local only
        setHistory(localRecords);
        setCloudStatus(localRecords.length > 0 ? 'offline' : 'synced');
      }
    } catch (error) {
      console.error('Failed to load GitHub records:', error);
      // Fallback to local storage
      setHistory(localRecords);
      setCloudStatus('error');
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAllRecords();
  }, [onNewUpload, loadAllRecords]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClearHistory = async () => {
    if (confirm(t('confirm.clearHistory'))) {
      clearHistory();
      setHistory([]);
      // Note: This only clears local storage. GitHub records remain.
    }
  };

  // Delete a single record
  const handleDeleteRecord = async (upload: UploadHistory) => {
    if (!confirm(t('confirm.deleteRecord') || 'Are you sure you want to delete this record?')) {
      return;
    }

    // Remove from local state immediately for better UX
    setHistory(prev => prev.filter(h => h.id !== upload.id));

    // Try to delete from GitHub
    const deleted = await deleteRecord(upload.id);
    
    if (!deleted) {
      // If GitHub delete failed, show error but keep local record
      console.error('Failed to delete from GitHub');
      // Optionally show a toast notification here
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get the best URL for display (prioritize jsDelivr CDN)
  const getBestUrl = (upload: UploadHistory) => {
    if (upload.urls?.jsdelivr_commit) return upload.urls.jsdelivr_commit;
    if (upload.urls?.jsdelivr) return upload.urls.jsdelivr;
    return upload.url;
  };

  const isVideo = (upload: UploadHistory) => upload.mediaType === 'video';

  if (history.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('common.history')}</h2>
              <div className="flex items-center space-x-2">
                <p className="text-slate-600">{history.length} {t('common.images')}</p>
                {/* Cloud sync status indicator */}
                <div className="flex items-center">
                  {cloudStatus === 'loading' && (
                    <span className="flex items-center text-xs text-slate-400">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      {t('records.syncing') || 'Syncing...'}
                    </span>
                  )}
                  {cloudStatus === 'synced' && (
                    <span className="flex items-center text-xs text-green-600" title={t('records.cloudSynced') || 'Records synced to cloud'}>
                      <Cloud className="h-3 w-3 mr-1" />
                      {t('records.synced') || 'Synced'}
                    </span>
                  )}
                  {cloudStatus === 'offline' && (
                    <span className="flex items-center text-xs text-amber-600" title={t('records.localOnly') || 'Records stored locally only'}>
                      <CloudOff className="h-3 w-3 mr-1" />
                      {t('records.offline') || 'Local'}
                    </span>
                  )}
                  {cloudStatus === 'error' && (
                    <span className="flex items-center text-xs text-red-500" title={t('records.syncError') || 'Failed to sync with cloud'}>
                      <CloudOff className="h-3 w-3 mr-1" />
                      {t('records.error') || 'Error'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('common.clearAll')}</span>
          </button>
        </div>

        {/* Loading state */}
        {isLoading && history.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Upload Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((upload) => {
            const bestUrl = getBestUrl(upload);
            const isCDN = bestUrl.includes('jsdelivr.net');
            const isPermanent = upload.urls?.jsdelivr_commit || upload.urls?.raw_commit;
            const fallbackJsdelivrCommit = upload.urls?.jsdelivr_commit || (upload.url?.includes('jsdelivr.net') ? upload.url : undefined);
            const video = isVideo(upload);

            return (
              <div
                key={upload.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
              >
                {/* Media Preview */}
                <div className="aspect-video relative bg-slate-50">
                  {video ? (
                    <VideoPreview
                      src={bestUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <Image
                      src={bestUrl}
                      alt={upload.filename}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      unoptimized
                    />
                  )}
                  
                  {/* URL Type Badge */}
                  <div className="absolute top-2 right-2">
                    {isCDN && (
                      <div className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Zap className="h-3 w-3" />
                        <span>CDN</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Badge */}
                  {video && (
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center space-x-1 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Film className="h-3 w-3" />
                        <span>Video</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Permanent Badge */}
                  {isPermanent && !video && (
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Star className="h-3 w-3" />
                        <span>{t('urls.permanent')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* File Info */}
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate text-sm">
                      {upload.filename}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>{formatFileSize(upload.size)}</span>
                      <span>{formatDate(upload.uploadDate)}</span>
                    </div>
                  </div>

                  {/* Primary URL (jsDelivr CDN preferred) */}
                  {fallbackJsdelivrCommit && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-700 flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>{t('urls.jsdelivrCommit')}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={fallbackJsdelivrCommit}
                          readOnly
                          className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-mono text-slate-700"
                        />
                        <button
                          onClick={() => copyToClipboard(fallbackJsdelivrCommit, `${upload.id}-jsdelivr`)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={t('common.copy')}
                        >
                          {copiedId === `${upload.id}-jsdelivr` ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <a
                          href={fallbackJsdelivrCommit}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={t('urls.openInNewTab')}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* GitHub URL */}
                  {upload.github_url && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                        <span>{t('urls.githubRepo')}</span>
                        <a
                          href={upload.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <span>{t('urls.source')}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDeleteRecord(upload)}
                      className="flex items-center space-x-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{t('common.delete') || 'Delete'}</span>
                    </button>
                  </div>
                  </div>
                  </div>
                  );
                  })}
        </div>
      </div>
    </div>
  );
}