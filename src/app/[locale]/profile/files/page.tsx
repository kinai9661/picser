'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Search, Grid, List, Trash2, Download, 
  ExternalLink, Copy, Check, File, Filter, SortAsc,
  FolderOpen, Image as ImageIcon, Video
} from 'lucide-react';
import VideoPreview from '@/components/VideoPreview';

interface UploadRecord {
  id: string;
  filename: string;
  url: string;
  jsdelivrUrl: string;
  size: number;
  type: string;
  uploadDate: string;
}

export default function MyFilesPage() {
  const { data: session } = useSession();
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  
  const [files, setFiles] = useState<UploadRecord[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/records');
        if (response.ok) {
          const data = await response.json();
          setFiles(data);
          setFilteredFiles(data);
        }
      } catch (error) {
        console.error('Failed to fetch files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    let result = [...files];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(f => 
        f.filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(f => f.type.startsWith(filterType));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      } else if (sortBy === 'name') {
        comparison = a.filename.localeCompare(b.filename);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredFiles(result);
  }, [files, searchQuery, filterType, sortBy, sortOrder]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const deleteFile = async (file: UploadRecord) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const response = await fetch('/api/records', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: file.id }),
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        setSelectedFiles(prev => {
          const next = new Set(prev);
          next.delete(file.id);
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const deleteSelected = async () => {
    if (!confirm(t('confirmDeleteSelected', { count: selectedFiles.size }))) return;

    for (const id of selectedFiles) {
      try {
        await fetch('/api/records', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }

    setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
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
            <h1 className="text-xl font-bold text-slate-900">{t('myFiles')}</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Toolbar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('searchFiles')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('allTypes')}</option>
                  <option value="image">{t('images')}</option>
                  <option value="video">{t('videos')}</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">{t('sortByDate')}</option>
                  <option value="name">{t('sortByName')}</option>
                  <option value="size">{t('sortBySize')}</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              {/* View Mode */}
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Batch Actions */}
            {selectedFiles.size > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  {t('selectedCount', { count: selectedFiles.size })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('deleteSelected')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Files */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-lg mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">{t('noFiles')}</h3>
              <p className="text-slate-500 mb-4">{t('noFilesDesc')}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                {t('uploadFirst')}
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`group relative bg-white rounded-xl border overflow-hidden transition-all ${
                    selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {/* Selection checkbox */}
                  <button
                    onClick={() => toggleSelect(file.id)}
                    className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center transition-colors ${
                      selectedFiles.has(file.id) 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white/80 border-slate-300 hover:border-blue-500'
                    }`}
                  >
                    {selectedFiles.has(file.id) && <Check className="w-4 h-4" />}
                  </button>

                  {/* Preview */}
                  <div className="aspect-square relative">
                    {isImage(file.type) ? (
                      <Image
                        src={file.jsdelivrUrl || file.url}
                        alt={file.filename}
                        fill
                        className="object-cover"
                      />
                    ) : isVideo(file.type) ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Video className="w-8 h-8 text-slate-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <File className="w-8 h-8 text-slate-400" />
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => copyToClipboard(file.jsdelivrUrl || file.url, file.id)}
                        className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors"
                        title={tCommon('copy')}
                      >
                        {copiedId === file.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-700" />
                        )}
                      </button>
                      <a
                        href={file.jsdelivrUrl || file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors"
                        title={t('openInNewTab')}
                      >
                        <ExternalLink className="w-4 h-4 text-slate-700" />
                      </a>
                      <button
                        onClick={() => deleteFile(file)}
                        className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                        title={tCommon('delete')}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.filename}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                      <span className="text-xs text-slate-400">{formatDate(file.uploadDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Select All */}
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-600">{t('selectAll')}</span>
                </label>
              </div>

              {/* List */}
              <div className="divide-y divide-slate-200">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
                      selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleSelect(file.id)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {isImage(file.type) ? (
                        <Image
                          src={file.jsdelivrUrl || file.url}
                          alt={file.filename}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : isVideo(file.type) ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-5 h-5 text-slate-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <File className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.filename}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)} • {formatDate(file.uploadDate)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(file.jsdelivrUrl || file.url, file.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title={tCommon('copy')}
                      >
                        {copiedId === file.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={file.jsdelivrUrl || file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title={t('openInNewTab')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => deleteFile(file)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title={tCommon('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
