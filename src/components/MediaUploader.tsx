'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Upload, Copy, ExternalLink, CheckCircle, AlertCircle, Link as LinkIcon, Film, Music } from 'lucide-react';
import { saveToHistory } from '@/utils/storage';
import { saveRecord } from '@/lib/records';
import VideoPreview from './VideoPreview';
import AudioPlayer from './AudioPlayer';

// Supported file types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/m4a'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_AUDIO_TYPES];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface UploadResult {
  success: boolean;
  url: string;
  urls?: {
    github: string;
    raw: string;
    jsdelivr: string;
    github_commit: string;
    raw_commit: string;
    jsdelivr_commit: string;
  };
  filename: string;
  size: number;
  type: string;
  commit_sha?: string;
  github_url?: string;
  error?: string;
}

interface PreviewFile {
  file: File;
  url: string;
}

interface MediaUploaderProps {
  onUpload?: () => void;
}

export default function MediaUploader({ onUpload }: MediaUploaderProps = {}) {
  const t = useTranslations();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const isVideo = (type: string) => ACCEPTED_VIDEO_TYPES.includes(type);
  const isAudio = (type: string) => ACCEPTED_AUDIO_TYPES.includes(type);
  const getMediaType = (type: string): 'image' | 'video' | 'audio' => {
    if (isVideo(type)) return 'video';
    if (isAudio(type)) return 'audio';
    return 'image';
  };

  const handleUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t('errors.invalidType'));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(t('errors.fileTooLarge'));
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewFile({ file, url: previewUrl });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      // Safe JSON parse - handle non-JSON responses (e.g., "Request Entity Too Large")
      let result;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If not JSON, show the raw error message
        setError(responseText || t('errors.uploadFailed'));
        return;
      }

      if (result.success) {
        setUploadResult(result);
        const mediaType = getMediaType(result.type);
        // Save to local history with Raw GitHub URL as primary
        saveToHistory({
          filename: result.filename,
          url: result.urls?.raw_commit || result.url,
          github_url: result.github_url,
          size: result.size,
          type: result.type,
          urls: result.urls,
          mediaType: mediaType,
        });
        // Save to GitHub records (async, don't wait)
        saveRecord({
          filename: result.filename,
          url: result.urls?.raw_commit || result.url,
          github_url: result.github_url,
          size: result.size,
          type: result.type,
          urls: result.urls,
          mediaType: mediaType,
        }).catch(err => console.error('Failed to save record to GitHub:', err));
        // Notify parent component
        onUpload?.();
      } else {
        setError(result.error || t('errors.uploadFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }, [onUpload, t]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (ACCEPTED_TYPES.includes(file.type)) {
        handleUpload(file);
      } else {
        setError(t('errors.invalidType'));
      }
    }
  }, [handleUpload, t]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  }, [handleUpload]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetUpload = () => {
    setUploadResult(null);
    setError(null);
    setPreviewFile(null);
    setCopiedUrl(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (!previewFile) return null;

    // Audio preview
    if (isAudio(previewFile.file.type)) {
      return (
        <div className="mb-8 text-center">
          <div className="inline-block relative w-full max-w-md">
            <AudioPlayer
              src={previewFile.url}
              title={previewFile.file.name}
              className="w-full"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent mx-auto mb-3"></div>
                  <p className="font-medium">{t('upload.uploadingToGithub')}</p>
                  <p className="text-sm opacity-90">{t('upload.generatingCdnUrls')}</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-3 font-medium">{previewFile.file.name}</p>
        </div>
      );
    }

    // Video preview
    if (isVideo(previewFile.file.type)) {
      return (
        <div className="mb-8 text-center">
          <div className="inline-block relative">
            <VideoPreview
              src={previewFile.url}
              file={previewFile.file}
              className="max-w-sm max-h-64 rounded-xl shadow-lg"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent mx-auto mb-3"></div>
                  <p className="font-medium">{t('upload.uploadingToGithub')}</p>
                  <p className="text-sm opacity-90">{t('upload.generatingCdnUrls')}</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-3 font-medium">{previewFile.file.name}</p>
        </div>
      );
    }

    // Image preview (default)
    return (
      <div className="mb-8 text-center">
        <div className="inline-block relative">
          <Image
            src={previewFile.url}
            alt="Preview"
            width={300}
            height={200}
            className="max-w-sm max-h-64 rounded-xl shadow-lg object-contain border border-slate-200"
            unoptimized
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent mx-auto mb-3"></div>
                <p className="font-medium">{t('upload.uploadingToGithub')}</p>
                <p className="text-sm opacity-90">{t('upload.generatingCdnUrls')}</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-3 font-medium">{previewFile.file.name}</p>
      </div>
    );
  };

  const renderResultPreview = () => {
    if (!uploadResult) return null;

    // Audio result
    if (isAudio(uploadResult.type)) {
      return (
        <div className="text-center">
          <div className="inline-block relative w-full max-w-md">
            <AudioPlayer
              src={uploadResult.urls?.raw_commit || uploadResult.url}
              title={uploadResult.filename}
              className="w-full"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Music className="h-3 w-3" />
              <span>{t('urls.permanent')}</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            <p className="font-medium">{uploadResult.filename}</p>
            <p>{formatFileSize(uploadResult.size)} • {uploadResult.type}</p>
          </div>
        </div>
      );
    }

    // Video result
    if (isVideo(uploadResult.type)) {
      return (
        <div className="text-center">
          <div className="inline-block relative">
            <VideoPreview
              src={uploadResult.urls?.raw_commit || uploadResult.url}
              className="max-w-sm max-h-64 rounded-xl shadow-lg"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Film className="h-3 w-3" />
              <span>{t('urls.permanent')}</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            <p className="font-medium">{uploadResult.filename}</p>
            <p>{formatFileSize(uploadResult.size)} • {uploadResult.type}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="inline-block relative">
          <Image
            src={uploadResult.urls?.raw_commit || uploadResult.url}
            alt="Uploaded media"
            width={300}
            height={200}
            className="max-w-sm max-h-64 rounded-xl shadow-lg object-contain border border-slate-200"
            unoptimized
          />
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {t('urls.permanent')}
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-600">
          <p className="font-medium">{uploadResult.filename}</p>
          <p>{formatFileSize(uploadResult.size)} • {uploadResult.type}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {t('common.upload')}
          </h1>
          <p className="text-slate-600 text-lg">
            {t('upload.dragDrop')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {uploadResult ? (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('common.uploadSuccess')}</h3>
              <p className="text-slate-600">{t('upload.imageAvailable')}</p>
            </div>

            {/* Media Preview */}
            {renderResultPreview()}

            {/* Primary Raw URL */}
            {uploadResult.urls?.raw_commit && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-semibold text-emerald-900">{t('urls.rawCommit')}</h4>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={uploadResult.urls.raw_commit}
                    readOnly
                    className="flex-1 px-4 py-3 border border-emerald-300 rounded-lg text-sm bg-white/80 font-mono text-slate-800"
                  />
                  <button
                    onClick={() => copyToClipboard(uploadResult.urls!.raw_commit)}
                    className="flex items-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    {copiedUrl === uploadResult.urls.raw_commit ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>{t('common.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>{t('common.copy')}</span>
                      </>
                    )}
                  </button>
                  <a
                    href={uploadResult.urls.raw_commit}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Alternative URLs */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 flex items-center">
                <LinkIcon className="h-4 w-4 mr-2" />
                {t('urls.alternativeUrls')}
              </h4>

              <div className="grid gap-4">

                {/* GitHub URL */}
                {uploadResult.urls?.github_commit && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{t('urls.githubRepo')}</span>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{t('urls.source')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={uploadResult.urls.github_commit}
                        readOnly
                        className="flex-1 px-3 py-2 border text-amber-950 border-slate-300 rounded text-xs bg-white font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(uploadResult.urls!.github_commit)}
                        className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {copiedUrl === uploadResult.urls.github_commit ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Another Button */}
            <div className="text-center pt-4">
              <button
                onClick={resetUpload}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {t('common.uploadAnother')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {renderPreview()}

            <div
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200
                ${isDragging
                  ? 'border-blue-400 bg-blue-50/50 scale-105'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
                }
                ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              `}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />

              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {isDragging ? t('upload.dropHere') : t('upload.dragDrop')}
                  </h3>
                  <p className="text-slate-600">
                    {t('upload.supportedFormats')}
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="h-4 w-4" />
                    <span>{t('urls.rawCommit')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>{t('upload.permanentUrls')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}