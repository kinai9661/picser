'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Copy, ExternalLink, File, Video, Image as ImageIcon } from 'lucide-react';
import VideoPreview from '@/components/VideoPreview';

interface RecentUpload {
  id: string;
  filename: string;
  url: string;
  jsdelivrUrl: string;
  size: number;
  type: string;
  uploadDate: string;
}

export default function RecentUploads({ limit = 6 }: { limit?: number }) {
  const t = useTranslations('dashboard');
  const [uploads, setUploads] = useState<RecentUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentUploads = async () => {
      try {
        const response = await fetch('/api/records');
        if (response.ok) {
          const data = await response.json();
          setUploads(data.slice(0, limit));
        }
      } catch (error) {
        console.error('Failed to fetch recent uploads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUploads();
  }, [limit]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return t('today');
    if (days === 1) return t('yesterday');
    if (days < 7) return t('daysAgo', { count: days });
    return date.toLocaleDateString();
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('recentUploads')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-lg mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('recentUploads')}</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <File className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">{t('noUploads')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{t('recentUploads')}</h3>
        <a href="/profile/files" className="text-sm text-blue-600 hover:text-blue-700">
          {t('viewAll')} →
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="group relative bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="aspect-square relative">
              {isImage(upload.type) ? (
                <Image
                  src={upload.jsdelivrUrl || upload.url}
                  alt={upload.filename}
                  fill
                  className="object-cover"
                />
              ) : isVideo(upload.type) ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <VideoPreview
                    src={upload.jsdelivrUrl || upload.url}
                    file={null}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <File className="w-12 h-12 text-slate-400" />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyToClipboard(upload.jsdelivrUrl || upload.url, upload.id)}
                  className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors"
                  title={t('copyUrl')}
                >
                  {copiedId === upload.id ? (
                    <span className="text-green-600 text-xs">✓</span>
                  ) : (
                    <Copy className="w-4 h-4 text-slate-700" />
                  )}
                </button>
                <a
                  href={upload.jsdelivrUrl || upload.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors"
                  title={t('openInNewTab')}
                >
                  <ExternalLink className="w-4 h-4 text-slate-700" />
                </a>
              </div>
            </div>
            
            <div className="p-3">
              <p className="text-sm font-medium text-slate-900 truncate">{upload.filename}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">{formatFileSize(upload.size)}</span>
                <span className="text-xs text-slate-400">{formatDate(upload.uploadDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
