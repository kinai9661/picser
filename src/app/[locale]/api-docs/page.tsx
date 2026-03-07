'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Copy, CheckCircle, Upload, Code, Github, Home, Zap, Shield, Globe, AlertCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Add interfaces for the playground
interface PlaygroundUploadResult {
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

interface PlaygroundPreviewFile {
    file: File;
    url: string;
}

export default function APIDocumentation() {
  const t = useTranslations('apiDocs');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        githubToken: '',
        githubOwner: 'sh20raj',
        githubRepo: 'picser',
        githubBranch: 'main',
        folder: 'uploads'
    });

    // Playground state
    const [playgroundDragging, setPlaygroundDragging] = useState(false);
    const [playgroundUploading, setPlaygroundUploading] = useState(false);
    const [playgroundResult, setPlaygroundResult] = useState<PlaygroundUploadResult | null>(null);
    const [playgroundError, setPlaygroundError] = useState<string | null>(null);
    const [playgroundPreview, setPlaygroundPreview] = useState<PlaygroundPreviewFile | null>(null);
    const [playgroundCopiedUrl, setPlaygroundCopiedUrl] = useState<string | null>(null);

    // Check if all required fields are filled for playground
    const isPlaygroundReady = formData.githubToken && formData.githubOwner && formData.githubRepo;

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const generateCurlExample = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://picser.pages.dev';
        return `curl -X POST \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@/path/to/your/image.png" \\
  -F "github_token=${formData.githubToken || 'ghp_xxxxxxxxxxxx'}" \\
  -F "github_owner=${formData.githubOwner}" \\
  -F "github_repo=${formData.githubRepo}" \\
  -F "github_branch=${formData.githubBranch}" \\
  -F "folder=${formData.folder}" \\
  ${baseUrl}/api/public-upload

# Or use the hosted version directly:
# https://picser.pages.dev/api/public-upload`;
    };

    const generateJavaScriptExample = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://picser.pages.dev';
        return `const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('github_token', '${formData.githubToken || 'ghp_xxxxxxxxxxxx'}');
formData.append('github_owner', '${formData.githubOwner}');
formData.append('github_repo', '${formData.githubRepo}');
formData.append('github_branch', '${formData.githubBranch}');
formData.append('folder', '${formData.folder}');

// Use your own instance or the hosted version
const response = await fetch('${baseUrl}/api/public-upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);

// Or use hosted version directly:
// const response = await fetch('https://picser.pages.dev/api/public-upload', {...});`;
    };

    const generatePythonExample = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://picser.pages.dev';
        return `import requests

files = {'file': open('/path/to/your/image.png', 'rb')}
data = {
    'github_token': '${formData.githubToken || 'ghp_xxxxxxxxxxxx'}',
    'github_owner': '${formData.githubOwner}',
    'github_repo': '${formData.githubRepo}',
    'github_branch': '${formData.githubBranch}',
    'folder': '${formData.folder}'
}

# Use your own instance or the hosted version
response = requests.post('${baseUrl}/api/public-upload', files=files, data=data)
result = response.json()
print(result)

# Or use hosted version directly:
# response = requests.post('https://picser.pages.dev/api/public-upload', files=files, data=data)`;
    };

    const exampleResponse = {
        success: true,
        filename: "image-1703123456789.png",
        url: `https://cdn.jsdelivr.net/gh/${formData.githubOwner}/${formData.githubRepo}@commit_sha/${formData.folder}/image-1703123456789.png`,
        urls: {
            github: `https://github.com/${formData.githubOwner}/${formData.githubRepo}/blob/${formData.githubBranch}/${formData.folder}/image-1703123456789.png`,
            raw: `https://raw.githubusercontent.com/${formData.githubOwner}/${formData.githubRepo}/${formData.githubBranch}/${formData.folder}/image-1703123456789.png`,
            jsdelivr: `https://cdn.jsdelivr.net/gh/${formData.githubOwner}/${formData.githubRepo}@${formData.githubBranch}/${formData.folder}/image-1703123456789.png`,
            github_commit: `https://github.com/${formData.githubOwner}/${formData.githubRepo}/blob/commit_sha/${formData.folder}/image-1703123456789.png`,
            raw_commit: `https://raw.githubusercontent.com/${formData.githubOwner}/${formData.githubRepo}/commit_sha/${formData.folder}/image-1703123456789.png`,
            jsdelivr_commit: `https://cdn.jsdelivr.net/gh/${formData.githubOwner}/${formData.githubRepo}@commit_sha/${formData.folder}/image-1703123456789.png`
        },
        size: 142857,
        type: "image/png",
        commit_sha: "a1b2c3d4e5f6",
        github_url: `https://github.com/${formData.githubOwner}/${formData.githubRepo}/blob/commit_sha/${formData.folder}/image-1703123456789.png`
    };

    const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
        <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <span className="text-sm font-medium text-slate-300 capitalize">{language}</span>
                <button
                    onClick={() => copyToClipboard(code, id)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                >
                    {copiedCode === id ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                    <span>{copiedCode === id ? t('copied') : t('copyCode')}</span>
                </button>
            </div>
            <div className="relative">
                <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        lineHeight: '1.5'
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );

    const TabbedCodeExample = () => {
        const [activeTab, setActiveTab] = useState('curl');

        const tabs = [
            { id: 'curl', label: 'cURL', language: 'bash', code: generateCurlExample() },
            { id: 'javascript', label: 'JavaScript', language: 'javascript', code: generateJavaScriptExample() },
            { id: 'python', label: 'Python', language: 'python', code: generatePythonExample() },
            { id: 'response', label: 'Response', language: 'json', code: JSON.stringify(exampleResponse, null, 2) }
        ];

        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={activeTab === tab.id ? 'block' : 'hidden'}
                        >
                            <CodeBlock code={tab.code} language={tab.language} id={tab.id} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Playground utility functions
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const copyPlaygroundUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setPlaygroundCopiedUrl(url);
            setTimeout(() => setPlaygroundCopiedUrl(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const resetPlayground = () => {
        setPlaygroundResult(null);
        setPlaygroundError(null);
        setPlaygroundPreview(null);
        setPlaygroundCopiedUrl(null);
        setPlaygroundUploading(false);
    };

    const handlePlaygroundDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPlaygroundDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setPlaygroundPreview({
                    file,
                    url: URL.createObjectURL(file)
                });
            } else {
                setPlaygroundError('Please select an image file');
            }
        }
    };

    const handlePlaygroundFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                setPlaygroundPreview({
                    file,
                    url: URL.createObjectURL(file)
                });
                setPlaygroundError(null);
            } else {
                setPlaygroundError('Please select an image file');
            }
        }
    };

    // Playground upload handler
    const handlePlaygroundUpload = async () => {
        setPlaygroundUploading(true);
        setPlaygroundError(null);

        if (!playgroundPreview?.file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', playgroundPreview.file);
        uploadFormData.append('github_token', formData.githubToken);
        uploadFormData.append('github_owner', formData.githubOwner);
        uploadFormData.append('github_repo', formData.githubRepo);
        uploadFormData.append('github_branch', formData.githubBranch);
        uploadFormData.append('folder', formData.folder);

        try {
            const response = await fetch('/api/public-upload', {
                method: 'POST',
                body: uploadFormData
            });

            const result: PlaygroundUploadResult = await response.json();
            setPlaygroundResult(result);

            if (result.success) {
                setPlaygroundCopiedUrl(result.url);
                setPlaygroundPreview({
                    file: playgroundPreview.file,
                    url: result.url
                });
            } else {
                setPlaygroundError(result.error || 'Unknown error occurred');
            }
        } catch (error) {
            setPlaygroundError('Failed to upload image');
            console.error('Upload error:', error);
        } finally {
            setPlaygroundUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center space-x-2 text-slate-900 hover:text-blue-600 transition-colors">
                              <Home className="h-5 w-5" />
                              <span className="font-medium">{t('backToPicser')}</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href="https://github.com/sh20raj/picser"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <Github className="h-5 w-5" />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6">
                        <Code className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                      {t('title')}
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                      {t('description')}
                    </p>
        
                    {/* Deployment Options */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-8">
                      <h2 className="text-lg font-bold text-slate-900 mb-4">{t('twoWays')}</h2>
                      <div className="grid md:grid-cols-2 gap-6 text-left">
                        <div className="bg-white/60 rounded-xl p-4">
                          <h3 className="font-semibold text-blue-700 mb-2">{t('useHosted')}</h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {t('useHostedDesc')}
                          </p>
                          <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                            https://picser.pages.dev/api/public-upload
                          </code>
                          <p className="text-xs text-slate-500 mt-2" dangerouslySetInnerHTML={{ __html: t('useHostedNote') }} />
                        </div>
                        <div className="bg-white/60 rounded-xl p-4">
                          <h3 className="font-semibold text-green-700 mb-2">{t('selfHost')}</h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {t('selfHostDesc')}
                          </p>
                          <div className="space-y-2">
                            <a
                              href="https://github.com/sh20raj/picser"
                              target="_blank"
                              className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                            >
                              {t('forkRepo')}
                            </a>
                          </div>
                          <p className="text-xs text-slate-500 mt-2" dangerouslySetInnerHTML={{ __html: t('selfHostNote') }} />
                        </div>
                      </div>
                    </div>
                  </div>
        
                  {/* Features */}
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-900">{t('featureFastCdn')}</h3>
                      </div>
                      <p className="text-slate-600 text-sm">
                        {t('featureFastCdnDesc')}
                      </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-slate-900">{t('featurePermanentUrls')}</h3>
                      </div>
                      <p className="text-slate-600 text-sm">
                        {t('featurePermanentUrlsDesc')}
                        </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <Globe className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-slate-900">{t('featureGlobalAccess')}</h3>
                      </div>
                      <p className="text-slate-600 text-sm">
                        {t('featureGlobalAccessDesc')}
                      </p>
                    </div>
                  </div>
        
                  {/* Configuration Form */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('apiConfig')}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('githubToken')} <Link
                            className='text-blue-600 hover:underline'
                            href={"https://docs.catalyst.zoho.com/en/tutorials/githubbot/java/generate-personal-access-token/"}>{t('howToGenerate')}</Link>
                        </label>
                        <input
                          type="password"
                          value={formData.githubToken}
                          onChange={(e) => setFormData({ ...formData, githubToken: e.target.value })}
                          placeholder="ghp_xxxxxxxxxxxx"
                          className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('githubOwner')}
                        </label>
                        <input
                          type="text"
                          value={formData.githubOwner}
                          onChange={(e) => setFormData({ ...formData, githubOwner: e.target.value })}
                          placeholder="sh20raj"
                          className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('repoName')}
                        </label>
                        <input
                          type="text"
                          value={formData.githubRepo}
                          onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                          placeholder="picser"
                          className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('branch')}
                        </label>
                        <input
                          type="text"
                          value={formData.githubBranch}
                          onChange={(e) => setFormData({ ...formData, githubBranch: e.target.value })}
                          placeholder="main"
                          className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('uploadFolder')}
                        </label>
                        <input
                          type="text"
                          value={formData.folder}
                          onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                          placeholder="uploads"
                          className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
        
                  {/* API Playground */}
                  {isPlaygroundReady && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 mb-12">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                          <Upload className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">{t('playground')}</h2>
                          <p className="text-slate-600">{t('playgroundDesc')}</p>
                        </div>
                      </div>

                        {playgroundError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                    <p className="text-red-700 font-medium">{playgroundError}</p>
                                </div>
                            </div>
                        )}

                        {playgroundResult ? (
                            <div className="space-y-6">
                                {/* Success Message */}
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('uploadSuccess')}</h3>
                                    <p className="text-slate-600">{t('uploadSuccessDesc')}</p>
                                  </div>
                      
                                  {/* Image Preview */}
                                  <div className="text-center">
                                    <div className="inline-block relative">
                                      <Image
                                        src={playgroundResult.urls?.jsdelivr_commit || playgroundResult.url}
                                        alt="Uploaded image"
                                        width={300}
                                        height={200}
                                        className="max-w-sm max-h-64 rounded-xl shadow-lg object-contain border border-slate-200"
                                        unoptimized
                                      />
                                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        {t('cdnReady')}
                                      </div>
                                    </div>
                                  </div>
                      
                                  {/* File Info */}
                                  <div className="bg-slate-50 rounded-xl p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <span className="text-slate-500">{t('filename')}</span>
                                        <p className="font-medium text-slate-900">{playgroundResult.filename}</p>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">{t('size')}</span>
                                        <p className="font-medium text-slate-900">{formatFileSize(playgroundResult.size)}</p>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">{t('type')}</span>
                                        <p className="font-medium text-slate-900">{playgroundResult.type}</p>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">{t('commit')}</span>
                                        <p className="font-medium text-slate-900 font-mono text-xs">{playgroundResult.commit_sha?.substring(0, 8)}...</p>
                                      </div>
                                    </div>
                                  </div>
                      
                                  {/* URL Options */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-900">{t('availableUrls')}</h4>
                      
                                    {/* Primary CDN URL */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <Zap className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium text-blue-900">{t('jsdelivrRecommended')}</span>
                                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">{t('fast')}</span>
                                          </div>
                                          <code className="text-sm text-blue-800 break-all">
                                            {playgroundResult.urls?.jsdelivr_commit || playgroundResult.url}
                                          </code>
                                        </div>
                                        <button
                                          onClick={() => copyPlaygroundUrl(playgroundResult.urls?.jsdelivr_commit || playgroundResult.url)}
                                          className="ml-4 flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                          {playgroundCopiedUrl === (playgroundResult.urls?.jsdelivr_commit || playgroundResult.url) ? (
                                            <CheckCircle className="h-4 w-4" />
                                          ) : (
                                            <Copy className="h-4 w-4" />
                                          )}
                                          <span>{playgroundCopiedUrl === (playgroundResult.urls?.jsdelivr_commit || playgroundResult.url) ? t('copied') : t('copyCode')}</span>
                                        </button>
                                      </div>
                                    </div>
                      
                                    {/* Other URLs */}
                                    {playgroundResult.urls && (
                                      <div className="grid gap-3">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <span className="text-sm font-medium text-slate-700">{t('githubRaw')}</span>
                                                        <code className="block text-xs text-slate-600 mt-1 break-all">
                                                            {playgroundResult.urls.raw_commit}
                                                        </code>
                                                    </div>
                                                    <button
                                                        onClick={() => copyPlaygroundUrl(playgroundResult.urls!.raw_commit)}
                                                        className="ml-2 p-2 text-slate-600 hover:text-slate-900 transition-colors"
                                                    >
                                                        {playgroundCopiedUrl === playgroundResult.urls.raw_commit ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <span className="text-sm font-medium text-slate-700">{t('githubPage')}</span>
                                                        <code className="block text-xs text-slate-600 mt-1 break-all">
                                                            {playgroundResult.urls.github_commit}
                                                        </code>
                                                    </div>
                                                    <button
                                                        onClick={() => copyPlaygroundUrl(playgroundResult.urls!.github_commit)}
                                                        className="ml-2 p-2 text-slate-600 hover:text-slate-900 transition-colors"
                                                    >
                                                        {playgroundCopiedUrl === playgroundResult.urls.github_commit ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={resetPlayground}
                                    className="w-full px-4 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                                >
                                    {t('uploadAnother')}
                                  </button>
                            </div>
                        ) : (
                            <div
                                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${playgroundDragging
                                    ? 'border-blue-400 bg-blue-50'
                                    : 'border-slate-300 hover:border-slate-400'
                                    } ${playgroundUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                onDrop={handlePlaygroundDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setPlaygroundDragging(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setPlaygroundDragging(false);
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePlaygroundFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={playgroundUploading}
                                />

                                {playgroundUploading ? (
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl">
                                            <Upload className="h-8 w-8 text-blue-600 animate-pulse" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-900">Uploading...</h3>
                                        <p className="text-slate-600">Please wait while we upload your image</p>
                                        {playgroundPreview && (
                                            <div className="mt-4">
                                                <Image
                                                    src={playgroundPreview.url}
                                                    alt="Preview"
                                                    width={150}
                                                    height={100}
                                                    className="rounded-lg shadow-md object-contain mx-auto"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl">
                                            <Upload className="h-8 w-8 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                                {playgroundDragging ? t('dropImage') : t('testApi')}
                                              </h3>
                                              <p className="text-slate-600 mb-4">
                                                {t('dragDropDesc')}
                                              </p>
                                              <div className="text-sm text-slate-500">
                                                <p>{t('supportedFormats')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* API Endpoint */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('uploadEndpoint')}</h2>
        
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">POST</span>
                          <code className="text-blue-900 font-mono text-sm">/api/public-upload</code>
                        </div>
                        <p className="text-xs text-blue-700">{t('yourInstance')}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">POST</span>
                          <code className="text-green-900 font-mono text-sm">picser.pages.dev/api/public-upload</code>
                        </div>
                        <p className="text-xs text-green-700">{t('hostedVersion')}</p>
                      </div>
                    </div>
        
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('parameters')}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 pr-4 font-medium text-slate-900">Parameter</th>
                            <th className="text-left py-3 pr-4 font-medium text-slate-900">Type</th>
                            <th className="text-left py-3 pr-4 font-medium text-slate-900">Required</th>
                            <th className="text-left py-3 font-medium text-slate-900">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="py-3 pr-4 text-slate-900 font-mono">file</td>
                            <td className="py-3 pr-4 text-slate-600">File</td>
                            <td className="py-3 pr-4 text-red-600">Yes</td>
                            <td className="py-3 text-slate-600">{t('paramFile')}</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 text-slate-900 font-mono">github_token</td>
                            <td className="py-3 pr-4 text-slate-600">String</td>
                            <td className="py-3 pr-4 text-red-600">Yes</td>
                            <td className="py-3 text-slate-600">{t('paramToken')}</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 text-slate-900 font-mono">github_owner</td>
                            <td className="py-3 pr-4 text-slate-600">String</td>
                            <td className="py-3 pr-4 text-red-600">Yes</td>
                            <td className="py-3 text-slate-600">{t('paramOwner')}</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 text-slate-900 font-mono">github_repo</td>
                            <td className="py-3 pr-4 text-slate-600">String</td>
                            <td className="py-3 pr-4 text-red-600">Yes</td>
                            <td className="py-3 text-slate-600">{t('paramRepo')}</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 text-slate-900 font-mono">github_branch</td>
                            <td className="py-3 pr-4 text-slate-600">String</td>
                            <td className="py-3 pr-4 text-slate-600">No</td>
                            <td className="py-3 text-slate-600">{t('paramBranch')}</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 text-slate-900 font-mono">folder</td>
                            <td className="py-3 pr-4 text-slate-600">String</td>
                            <td className="py-3 pr-4 text-slate-600">No</td>
                            <td className="py-3 text-slate-600">{t('paramFolder')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
        
                  {/* Code Examples */}
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('codeExamples')}</h2>
                      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {t('codeExamplesDesc')}
                      </p>
                    </div>
        
                    <TabbedCodeExample />
                  </div>
        
                  {/* Interactive Playground */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('interactivePlayground')}</h2>
                    <p className="text-sm text-slate-600 mb-4">
                      {t('interactivePlaygroundDesc')}
                    </p>

                    {/* Playground Form */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('githubToken')}
                            </label>
                            <input
                              type="password"
                              value={formData.githubToken}
                              onChange={(e) => setFormData({ ...formData, githubToken: e.target.value })}
                              placeholder="ghp_xxxxxxxxxxxx"
                              className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('githubOwner')}
                            </label>
                            <input
                              type="text"
                              value={formData.githubOwner}
                              onChange={(e) => setFormData({ ...formData, githubOwner: e.target.value })}
                              placeholder="sh20raj"
                              className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('repoName')}
                            </label>
                            <input
                              type="text"
                              value={formData.githubRepo}
                              onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                              placeholder="picser"
                              className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('branch')}
                            </label>
                            <input
                              type="text"
                              value={formData.githubBranch}
                              onChange={(e) => setFormData({ ...formData, githubBranch: e.target.value })}
                              placeholder="main"
                              className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {t('uploadFolder')}
                            </label>
                            <input
                                type="text"
                                value={formData.folder}
                                onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                                placeholder="uploads"
                                className="w-full px-4 py-3 border text-amber-950 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-4 transition-all flex flex-col items-center justify-center text-center
                        ${playgroundDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}
                        `}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setPlaygroundDragging(true);
                        }}
                        onDragLeave={() => setPlaygroundDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setPlaygroundDragging(false);

                            const files = Array.from(e.dataTransfer.files);
                            if (files.length > 0) {
                                const file = files[0];
                                setPlaygroundPreview({
                                    file,
                                    url: URL.createObjectURL(file)
                                });
                            }
                        }}
                    >
                        {playgroundPreview ? (
                            <div className="relative w-full h-48 mb-4">
                                <Image
                                    src={playgroundPreview.url}
                                    alt="Preview"
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="text-slate-500">
                                <Upload className="h-10 w-10 mx-auto mb-2" />
                                <p className="text-sm">{t('dragDropHere')}</p>
                                <p className="text-xs text-slate-400">{t('or')}</p>
                                <button
                                  onClick={() => document.getElementById('file-input')?.click()}
                                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                  {t('browseFiles')}
                                </button>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length > 0) {
                                            const file = files[0];
                                            setPlaygroundPreview({
                                                file,
                                                url: URL.createObjectURL(file)
                                            });
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    {/* Upload Result */}
                    {playgroundResult && (
                        <div className="mb-4 p-4 rounded-lg border transition-all
                        ${playgroundResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                        ">
                            <div className="flex items-center">
                                {playgroundResult.success ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                                )}
                                <p className="text-sm font-medium text-slate-900">
                                    {playgroundResult.success ? t('uploadSuccess') : t('uploadFailed')}
                                </p>
                            </div>
                            <div className="mt-2 text-sm text-slate-700">
                                {playgroundResult.success ? (
                                    <div>
                                        <p className="mb-1">File: {playgroundResult.filename}</p>
                                        <p className="mb-1">Size: {(playgroundResult.size / 1024).toFixed(2)} KB</p>
                                        <p className="mb-1">Type: {playgroundResult.type}</p>
                                        <p className="mb-1">Commit SHA: {playgroundResult.commit_sha}</p>
                                        <p className="mb-1">
                                            URL: <a href={playgroundResult.url} target="_blank" className="text-blue-600 hover:underline">{playgroundResult.url}</a>
                                        </p>
                                    </div>
                                ) : (
                                    <p>{playgroundResult.error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handlePlaygroundUpload}
                            disabled={!isPlaygroundReady || playgroundUploading}
                            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center justify-center space-x-2
                            ${!isPlaygroundReady ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                            `}
                        >
                            {playgroundUploading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 mr-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"
                                        />
                                    </svg>
                                    <span>{t('uploading')}</span>
                                    </>
                                  ) : (
                                    <span>{t('uploadBtn')}</span>
                            )}
                        </button>
                        <button
                            onClick={() => setPlaygroundPreview(null)}
                            className="flex-1 px-4 py-2 bg-slate-200 rounded-lg text-slate-900 font-medium hover:bg-slate-300 transition-colors"
                        >
                            {t('resetBtn')}
                          </button>
                        </div>
                      </div>
              
                      {/* CTA */}
                      <div className="mt-16 text-center">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                          <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('readyToStart')}</h3>
                          <p className="text-slate-600 mb-6">
                            {t('readyToStartDesc')}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                              href="/#upload"
                              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {t('tryWebUpload')}
                            </Link>
                            <a
                              href="https://github.com/sh20raj/picser"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              {t('viewOnGithub')}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
              
                    <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 mt-16">
                      <div className="container mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                          {/* Left Side - Brand */}
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Github className="h-6 w-6 text-blue-600" />
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">Picser</h3>
                              <p className="text-xs text-slate-500">{t('freeGithubHosting')}</p>
                            </div>
                          </div>
              
                          {/* Center - Links */}
                          <div className="flex items-center space-x-6 text-sm">
                            <Link
                              href="/api-docs"
                              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                            >
                              {t('apiDocs')}
                            </Link>
                            <Link
                              href="https://github.com/sh20raj/picser"
                              target="_blank"
                              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                            >
                              {t('github')}
                            </Link>
                            <Link
                              href="https://jsdelivr.com"
                              target="_blank"
                              className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                            >
                              jsDelivr CDN
                            </Link>
                          </div>
              
                          {/* Right Side - Attribution */}
                          <div className="text-center md:text-right">
                            <p className="text-sm text-slate-600">
                              {t('builtWith')}{' '}
                              <a
                                href="https://x.com/sh20raj"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                              >
                                @sh20raj
                              </a>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {t('openSource')}
                            </p>
                          </div>
                        </div>

                    {/* Bottom Line */}
                    <div className="border-t border-slate-200/50 mt-6 pt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 text-xs text-slate-500">
                            <p>© 2025 Picser. Made with Next.js 15, TypeScript & Tailwind CSS.</p>
                            <div className="flex items-center space-x-4">
                                <span className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>All systems operational</span>
                                </span>
                                <span>Powered by jsDelivr CDN</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}
