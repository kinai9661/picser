'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Github, Key, User, GitBranch, Folder, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  GitHubUploadConfig,
  loadGitHubConfig,
  saveGitHubConfig,
  testGitHubConfig,
  validateGitHubConfig,
} from '@/lib/github-upload';

interface GitHubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: GitHubUploadConfig) => void;
}

export default function GitHubConfigModal({ isOpen, onClose, onSave }: GitHubConfigModalProps) {
  const t = useTranslations();
  
  const [config, setConfig] = useState<GitHubUploadConfig>({
    token: '',
    owner: '',
    repo: '',
    branch: 'main',
    folder: 'uploads',
  });
  
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [saved, setSaved] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    if (isOpen) {
      const existingConfig = loadGitHubConfig();
      if (existingConfig) {
        setConfig(existingConfig);
      }
      setTestResult(null);
      setSaved(false);
    }
  }, [isOpen]);

  const handleChange = (field: keyof GitHubUploadConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
    setSaved(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    const validation = validateGitHubConfig(config);
    if (!validation.valid) {
      setTestResult({ valid: false, error: `Missing: ${validation.missing.join(', ')}` });
      setTesting(false);
      return;
    }

    const result = await testGitHubConfig(config);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
  	console.log('[DEBUG] GitHubConfigModal handleSave called');
  	console.log('[DEBUG] config to save:', config);
  	saveGitHubConfig(config);
  	console.log('[DEBUG] config saved to localStorage');
  	setSaved(true);
  	console.log('[DEBUG] calling onSave with config:', config);
  	onSave(config);
  	console.log('[DEBUG] onSave called');
 
  	// Close modal after short delay
  	setTimeout(() => {
  		console.log('[DEBUG] closing modal');
  		onClose();
  	}, 1000);
  };

  if (!isOpen) return null;

  const isValid = validateGitHubConfig(config).valid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('githubConfig.title') || 'GitHub 上傳設定'}
                </h2>
                <p className="text-sm text-slate-500">
                  {t('githubConfig.subtitle') || '設定您的 GitHub Token 以啟用大檔案上傳'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              {t('githubConfig.info') || '使用 GitHub Personal Access Token 可以繞過 Serverless 大小限制，直接上傳檔案到 GitHub。Token 僅儲存在您的瀏覽器本地。'}
            </p>
          </div>

          {/* Token Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Key className="w-4 h-4 inline mr-1.5" />
              {t('githubConfig.token') || 'Personal Access Token'}
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.token}
                onChange={(e) => handleChange('token', e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-500" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('githubConfig.tokenHint') || '需要 "repo" 權限。前往 GitHub → Settings → Developer settings → Personal access tokens'}
            </p>
          </div>

          {/* Owner Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <User className="w-4 h-4 inline mr-1.5" />
              {t('githubConfig.owner') || 'Repository Owner'}
            </label>
            <input
              type="text"
              value={config.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="your-username"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Repo Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Github className="w-4 h-4 inline mr-1.5" />
              {t('githubConfig.repo') || 'Repository Name'}
            </label>
            <input
              type="text"
              value={config.repo}
              onChange={(e) => handleChange('repo', e.target.value)}
              placeholder="your-repo"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Branch Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <GitBranch className="w-4 h-4 inline mr-1.5" />
              {t('githubConfig.branch') || 'Branch'}
            </label>
            <input
              type="text"
              value={config.branch}
              onChange={(e) => handleChange('branch', e.target.value)}
              placeholder="main"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Folder Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Folder className="w-4 h-4 inline mr-1.5" />
              {t('githubConfig.folder') || 'Upload Folder'}
            </label>
            <input
              type="text"
              value={config.folder}
              onChange={(e) => handleChange('folder', e.target.value)}
              placeholder="uploads"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${testResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.valid ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">
                {testResult.valid 
                  ? (t('githubConfig.testSuccess') || '連線成功！設定正確。')
                  : testResult.error
                }
              </span>
            </div>
          )}

          {/* Saved Message */}
          {saved && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">
                {t('githubConfig.saved') || '設定已儲存！'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={!isValid || testing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Github className="w-4 h-4" />
              )}
              <span>{t('githubConfig.test') || '測試連線'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t('githubConfig.save') || '儲存設定'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
