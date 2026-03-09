/**
 * GitHub Direct Upload Utility
 * 
 * This module provides functions to upload files directly to GitHub API,
 * avoiding backend payload-size bottlenecks.
 * 
 * Security: Token is stored in localStorage (client-side only).
 * Suitable for personal deployments where users provide their own GitHub Token.
 */

// Supported file types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

// GitHub API file size limit (100MB)
const GITHUB_MAX_FILE_SIZE = 100 * 1024 * 1024;

export interface GitHubUploadConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  folder?: string;
}

export interface GitHubUploadResult {
  success: boolean;
  url: string;
  urls: {
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
  mediaType: 'image' | 'video';
  commit_sha: string;
  github_url: string;
  error?: string;
}

export interface GitHubConfigValidation {
  valid: boolean;
  missing: string[];
}

/**
 * Get media type from MIME type
 */
export function getMediaType(type: string): 'image' | 'video' {
  if (ACCEPTED_VIDEO_TYPES.includes(type)) return 'video';
  return 'image';
}

/**
 * Validate file type
 */
export function isValidFileType(type: string): boolean {
  return ACCEPTED_TYPES.includes(type);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number): boolean {
  return size <= GITHUB_MAX_FILE_SIZE;
}

/**
 * Get supported file types description
 */
export function getSupportedTypesDescription(): string {
  return 'Images: JPG, PNG, GIF, WebP | Videos: MP4, WebM, OGG, MOV';
}

/**
 * Load GitHub configuration from localStorage
 */
export function loadGitHubConfig(): GitHubUploadConfig | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const config = localStorage.getItem('github_upload_config');
    if (!config) return null;
    
    const parsed = JSON.parse(config);
    return {
      token: parsed.token || '',
      owner: parsed.owner || '',
      repo: parsed.repo || '',
      branch: parsed.branch || 'main',
      folder: parsed.folder || 'uploads',
    };
  } catch {
    return null;
  }
}

/**
 * Save GitHub configuration to localStorage
 */
export function saveGitHubConfig(config: GitHubUploadConfig): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('github_upload_config', JSON.stringify({
    token: config.token,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    folder: config.folder,
  }));
}

/**
 * Clear GitHub configuration from localStorage
 */
export function clearGitHubConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('github_upload_config');
}

/**
 * Validate GitHub configuration
 */
export function validateGitHubConfig(config: GitHubUploadConfig | null): GitHubConfigValidation {
  if (!config) {
    return { valid: false, missing: ['token', 'owner', 'repo'] };
  }
  
  const missing: string[] = [];
  
  if (!config.token) missing.push('token');
  if (!config.owner) missing.push('owner');
  if (!config.repo) missing.push('repo');
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Upload file directly to GitHub API
 * 
 * @param file - File to upload
 * @param config - GitHub configuration
 * @param onProgress - Optional progress callback
 * @returns Upload result with URLs
 */
export async function uploadToGitHubDirect(
  file: File,
  config: GitHubUploadConfig,
  onProgress?: (progress: number) => void
): Promise<GitHubUploadResult> {
  try {
    // Validate file type
    if (!isValidFileType(file.type)) {
      return {
        success: false,
        url: '',
        urls: {} as GitHubUploadResult['urls'],
        filename: file.name,
        size: file.size,
        type: file.type,
        mediaType: getMediaType(file.type),
        commit_sha: '',
        github_url: '',
        error: `Invalid file type. Supported: ${getSupportedTypesDescription()}`,
      };
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      return {
        success: false,
        url: '',
        urls: {} as GitHubUploadResult['urls'],
        filename: file.name,
        size: file.size,
        type: file.type,
        mediaType: getMediaType(file.type),
        commit_sha: '',
        github_url: '',
        error: `File size exceeds GitHub limit of 100MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // Report progress: Starting
    onProgress?.(10);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to handle large files
    let base64 = '';
    const chunkSize = 1024 * 1024; // 1MB chunks
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
      base64 += btoa(String.fromCharCode(...chunk));
      
      // Report progress: 10-50% for encoding
      const progress = 10 + Math.floor((i / uint8Array.length) * 40);
      onProgress?.(progress);
    }

    // Report progress: Preparing upload
    onProgress?.(50);

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = file.name.split('.').pop() || 'bin';
    const mediaType = getMediaType(file.type);
    const folder = config.folder || (mediaType === 'video' ? 'videos' : 'uploads');
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substr(2, 9)}.${extension}`;

    // Report progress: Uploading
    onProgress?.(60);

    // Call GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          message: `Upload ${mediaType}: ${file.name}`,
          content: base64,
          branch: config.branch,
        }),
      }
    );

    // Report progress: Processing response
    onProgress?.(90);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `GitHub API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
        
        // Handle specific errors
        if (response.status === 401) {
          errorMessage = 'Invalid GitHub token. Please check your Personal Access Token.';
        } else if (response.status === 404) {
          errorMessage = 'Repository not found. Please check owner and repo name.';
        } else if (response.status === 403) {
          errorMessage = 'Permission denied. Make sure your token has "repo" scope.';
        }
      } catch {
        // Use default error message
      }

      return {
        success: false,
        url: '',
        urls: {} as GitHubUploadResult['urls'],
        filename: file.name,
        size: file.size,
        type: file.type,
        mediaType,
        commit_sha: '',
        github_url: '',
        error: errorMessage,
      };
    }

    const data = await response.json();
    const commitSha = data.commit.sha;
    const owner = config.owner;
    const repo = config.repo;
    const branch = config.branch;

    // Generate all URL types
    const urls = {
      // Branch-based URLs
      github: `https://github.com/${owner}/${repo}/blob/${branch}/${filename}`,
      raw: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`,
      jsdelivr: `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filename}`,
      // Commit-based URLs (permanent)
      github_commit: `https://github.com/${owner}/${repo}/blob/${commitSha}/${filename}`,
      raw_commit: `https://raw.githubusercontent.com/${owner}/${repo}/${commitSha}/${filename}`,
      jsdelivr_commit: `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${commitSha}/${filename}`,
    };

    // Report progress: Complete
    onProgress?.(100);

    return {
      success: true,
      url: urls.jsdelivr_commit, // Default URL: permanent CDN link
      urls,
      filename,
      size: file.size,
      type: file.type,
      mediaType,
      commit_sha: commitSha,
      github_url: data.content?.html_url || urls.github,
    };
  } catch (error) {
    return {
      success: false,
      url: '',
      urls: {} as GitHubUploadResult['urls'],
      filename: file.name,
      size: file.size,
      type: file.type,
      mediaType: getMediaType(file.type),
      commit_sha: '',
      github_url: '',
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Test GitHub configuration by fetching repository info
 */
export async function testGitHubConfig(config: GitHubUploadConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}`,
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return { valid: false, error: 'Invalid GitHub token' };
      } else if (response.status === 404) {
        return { valid: false, error: 'Repository not found' };
      } else if (response.status === 403) {
        return { valid: false, error: 'Token lacks required permissions (needs "repo" scope)' };
      }
      return { valid: false, error: `GitHub API error: ${response.status}` };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}
