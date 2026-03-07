import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export const runtime = "edge";

// Supported file types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get file and GitHub configuration from form data
    const file = formData.get('file') as File;
    const githubToken = formData.get('github_token') as string;
    const githubOwner = formData.get('github_owner') as string;
    const githubRepo = formData.get('github_repo') as string;
    const githubBranch = formData.get('github_branch') as string || 'main';
    const folder = formData.get('folder') as string || 'uploads';

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: 'Missing required GitHub configuration: github_token, github_owner, github_repo' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image and video files are allowed. Supported formats: JPG, PNG, GIF, WebP, MP4, WebM, OGG, MOV' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB' },
        { status: 400 }
      );
    }

    // Initialize Octokit with user's token
    const octokit = new Octokit({
      auth: githubToken,
    });

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = file.name.split('.').pop() || 'jpg';
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
    const cleanFolder = folder.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
    const filename = `${cleanFolder}/${timestamp}-${Math.random().toString(36).substr(2, 9)}.${extension}`;

    // Upload to GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: githubOwner,
      repo: githubRepo,
      path: filename,
      message: `Upload ${isVideo ? 'video' : 'image'}: ${file.name}`,
      content: base64Content,
      branch: githubBranch,
    });

    const commitSha = response.data.commit.sha;

    // Generate all URL types
    const urls = {
      // Branch-based URLs
      github: `https://github.com/${githubOwner}/${githubRepo}/blob/${githubBranch}/${filename}`,
      raw: `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${githubBranch}/${filename}`,
      jsdelivr: `https://cdn.jsdelivr.net/gh/${githubOwner}/${githubRepo}@${githubBranch}/${filename}`,

      // Commit-based URLs (permanent)
      github_commit: `https://github.com/${githubOwner}/${githubRepo}/blob/${commitSha}/${filename}`,
      raw_commit: `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${commitSha}/${filename}`,
      jsdelivr_commit: `https://cdn.jsdelivr.net/gh/${githubOwner}/${githubRepo}@${commitSha}/${filename}`,
    };

    return NextResponse.json({
      success: true,
      message: `${isVideo ? 'Video' : 'Image'} uploaded successfully`,
      data: {
        filename: filename,
        size: file.size,
        type: file.type,
        mediaType: isVideo ? 'video' : 'image',
        commit_sha: commitSha,
        github_url: response.data.content?.html_url,
        urls: urls,
        repository: {
          owner: githubOwner,
          repo: githubRepo,
          branch: githubBranch,
          folder: cleanFolder
        }
      }
    });

  } catch (error) {
    console.error('Public upload error:', error);

    if (error instanceof Error) {
      // Handle specific GitHub API errors
      if (error.message.includes('Bad credentials')) {
        return NextResponse.json(
          { error: 'Invalid GitHub token' },
          { status: 401 }
        );
      }
      if (error.message.includes('Not Found')) {
        return NextResponse.json(
          { error: 'Repository not found or insufficient permissions' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Upload failed: Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/public-upload',
    description: 'Public API for uploading images and videos to any GitHub repository',
    method: 'POST',
    contentType: 'multipart/form-data',
    parameters: {
      file: {
        type: 'File',
        required: true,
        description: 'Image or video file to upload (JPG, PNG, GIF, WebP, MP4, WebM, OGG, MOV)',
        maxSize: '100MB'
      },
      github_token: {
        type: 'string',
        required: true,
        description: 'GitHub Personal Access Token with Contents permission'
      },
      github_owner: {
        type: 'string',
        required: true,
        description: 'GitHub username or organization name'
      },
      github_repo: {
        type: 'string',
        required: true,
        description: 'GitHub repository name'
      },
      github_branch: {
        type: 'string',
        required: false,
        default: 'main',
        description: 'Target branch name'
      },
      folder: {
        type: 'string',
        required: false,
        default: 'uploads',
        description: 'Folder path within the repository'
      }
    },
    response: {
      success: 'boolean',
      message: 'string',
      data: {
        filename: 'string',
        size: 'number',
        type: 'string',
        mediaType: 'string - "image" or "video"',
        commit_sha: 'string',
        github_url: 'string',
        urls: {
          github: 'string - GitHub blob URL (branch-based)',
          raw: 'string - Raw GitHub URL (branch-based)',
          jsdelivr: 'string - JSDelivr CDN URL (branch-based)',
          github_commit: 'string - GitHub blob URL (commit-based)',
          raw_commit: 'string - Raw GitHub URL (commit-based)',
          jsdelivr_commit: 'string - JSDelivr CDN URL (commit-based)'
        },
        repository: {
          owner: 'string',
          repo: 'string',
          branch: 'string',
          folder: 'string'
        }
      }
    },
    examples: {
      curl: `curl -X POST \\
-H "Content-Type: multipart/form-data" \\
-F "file=@/path/to/media.png" \\
-F "github_token=ghp_xxxxxxxxxxxx" \\
-F "github_owner=yourusername" \\
-F "github_repo=yourrepo" \\
-F "github_branch=main" \\
-F "folder=images" \\
https://yourapp.com/api/public-upload`
    }
  });
}