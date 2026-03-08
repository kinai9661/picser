'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Folder, File, Trash2, Edit2, Download, ExternalLink, ChevronRight, Home, RefreshCw, Loader2, Music } from 'lucide-react';
import Image from 'next/image';
import AudioPlayer from './AudioPlayer';

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha: string;
  download_url?: string | null;
  html_url?: string;
}

interface RenameModalState {
  show: boolean;
  file: GitHubFile | null;
  newName: string;
}

export default function FileManager() {
  const t = useTranslations('fileManager');
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [renameModal, setRenameModal] = useState<RenameModalState>({
    show: false,
    file: null,
    newName: '',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFiles = useCallback(async (path: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      if (data.success) {
        // 排序：資料夾在前，檔案在後，同類型按名稱排序
        const sortedFiles = (data.files as GitHubFile[]).sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'dir' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        setFiles(sortedFiles);
        setCurrentPath(path);
      } else {
        setError(data.error || t('fetchError'));
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const navigateToFolder = (folder: GitHubFile) => {
    if (folder.type === 'dir') {
      fetchFiles(folder.path);
      setSelectedFile(null);
    }
  };

  const navigateToPath = (path: string) => {
    fetchFiles(path);
    setSelectedFile(null);
  };

  const goUp = () => {
    const parts = currentPath.split('/');
    parts.pop();
    navigateToPath(parts.join('/'));
  };

  const deleteFile = async (file: GitHubFile) => {
    if (!confirm(t('confirmDelete', { name: file.name }))) return;

    setActionLoading(file.path);
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file.path,
          sha: file.sha,
          message: `Delete: ${file.name}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchFiles(currentPath);
      } else {
        setError(data.error || t('deleteError'));
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError(t('deleteError'));
    } finally {
      setActionLoading(null);
    }
  };

  const openRenameModal = (file: GitHubFile) => {
    setRenameModal({
      show: true,
      file,
      newName: file.name,
    });
  };

  const closeRenameModal = () => {
    setRenameModal({
      show: false,
      file: null,
      newName: '',
    });
  };

  const handleRename = async () => {
    if (!renameModal.file || !renameModal.newName) return;

    const oldPath = renameModal.file.path;
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = renameModal.newName;
    const newPath = pathParts.join('/');

    setActionLoading(renameModal.file.path);
    try {
      const response = await fetch('/api/files', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath,
          newPath,
          sha: renameModal.file.sha,
          message: `Rename: ${renameModal.file.name} -> ${renameModal.newName}`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchFiles(currentPath);
        closeRenameModal();
      } else {
        setError(data.error || t('renameError'));
      }
    } catch (err) {
      console.error('Failed to rename file:', err);
      setError(t('renameError'));
    } finally {
      setActionLoading(null);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (filename: string) => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  };

  const isVideoFile = (filename: string) => {
    const ext = getFileExtension(filename);
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  };
  
  const isAudioFile = (filename: string) => {
    const ext = getFileExtension(filename);
    return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext);
  };

  const getJsdelivrUrl = (file: GitHubFile) => {
    const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'sh20raj';
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'picser';
    const branch = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${file.path}`;
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // 路徑麵包屑
  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 overflow-hidden">
      {/* 標題列 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <Folder className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">{t('title')}</h2>
        </div>
        <button
          onClick={() => fetchFiles(currentPath)}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {/* 路徑導航 */}
      <div className="px-6 py-3 border-b border-slate-200/50 bg-slate-50/30">
        <div className="flex items-center space-x-1 text-sm overflow-x-auto">
          <button
            onClick={() => navigateToPath('')}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:underline"
          >
            <Home className="h-4 w-4" />
            <span>{t('root')}</span>
          </button>
          {pathParts.map((part, index) => {
            const path = pathParts.slice(0, index + 1).join('/');
            return (
              <div key={path} className="flex items-center space-x-1">
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <button
                  onClick={() => navigateToPath(path)}
                  className="text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
                >
                  {part}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 檔案列表 */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Folder className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>{t('emptyFolder')}</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.path}
              className={`flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors ${
                selectedFile?.path === file.path ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {file.type === 'dir' ? (
                  <Folder className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : isImageFile(file.name) ? (
                  <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                    <Image
                      src={getJsdelivrUrl(file)}
                      alt={file.name}
                      width={32}
                      height={32}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : isVideoFile(file.name) ? (
                  <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-purple-600 font-medium">MP4</span>
                  </div>
                ) : isAudioFile(file.name) ? (
                  <div className="h-8 w-8 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Music className="h-4 w-4 text-indigo-600" />
                  </div>
                ) : (
                  <File className="h-5 w-5 text-slate-600 flex-shrink-0" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToFolder(file);
                  }}
                  className={`text-left truncate ${
                    file.type === 'dir'
                      ? 'text-blue-600 hover:text-blue-700 hover:underline font-medium'
                      : 'text-slate-900'
                  }`}
                >
                  {file.name}
                </button>
                {file.size !== undefined && (
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                {file.type === 'file' && (
                  <>
                    <a
                      href={getJsdelivrUrl(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('openInNew')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={file.download_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title={t('download')}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRenameModal(file);
                  }}
                  disabled={actionLoading === file.path}
                  className="p-2 text-slate-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                  title={t('rename')}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file);
                  }}
                  disabled={actionLoading === file.path}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('delete')}
                >
                  {actionLoading === file.path ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 重新命名對話框 */}
      {renameModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('renameTitle')}</h3>
            <input
              type="text"
              value={renameModal.newName}
              onChange={(e) => setRenameModal({ ...renameModal, newName: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              placeholder={t('newNamePlaceholder')}
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeRenameModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleRename}
                disabled={!renameModal.newName || actionLoading === renameModal.file?.path}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === renameModal.file?.path ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('confirm')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
