'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Heart, Trash2, ExternalLink, Copy, Check, 
  File, FolderOpen, Star, StarOff
} from 'lucide-react';

interface Favorite {
  id: string;
  filename: string;
  url: string;
  jsdelivrUrl: string;
  size: number;
  type: string;
  addedAt: string;
}

export default function FavoritesPage() {
  const { data: session } = useSession();
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // 從 localStorage 獲取收藏
        const stored = localStorage.getItem('favorites');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/profile" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>{t('backToProfile')}</span>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              {t('favorites')}
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 mb-6 border border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{t('favoritesInfo')}</h3>
                <p className="text-sm text-slate-600">{t('favoritesInfoDesc')}</p>
              </div>
            </div>
          </div>

          {/* Favorites Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-lg mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarOff className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">{t('noFavorites')}</h3>
              <p className="text-slate-500 mb-4">{t('noFavoritesDesc')}</p>
              <Link
                href="/profile/files"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                {t('browseFiles')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-red-300 transition-all"
                >
                  {/* Favorite indicator */}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      title={t('removeFavorite')}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Preview */}
                  <div className="aspect-square relative">
                    {isImage(favorite.type) ? (
                      <Image
                        src={favorite.jsdelivrUrl || favorite.url}
                        alt={favorite.filename}
                        fill
                        className="object-cover"
                      />
                    ) : isVideo(favorite.type) ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <File className="w-8 h-8 text-slate-400" />
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => copyToClipboard(favorite.jsdelivrUrl || favorite.url, favorite.id)}
                        className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors"
                        title={tCommon('copy')}
                      >
                        {copiedId === favorite.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-700" />
                        )}
                      </button>
                      <a
                        href={favorite.jsdelivrUrl || favorite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors"
                        title={t('openInNewTab')}
                      >
                        <ExternalLink className="w-4 h-4 text-slate-700" />
                      </a>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-slate-900 truncate">{favorite.filename}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{formatFileSize(favorite.size)}</span>
                      <span className="text-xs text-slate-400">{formatDate(favorite.addedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
