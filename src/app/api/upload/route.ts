import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export const runtime = "edge";

// Supported file types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/m4a'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_AUDIO_TYPES];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image, video, and audio files are allowed. Supported formats: JPG, PNG, GIF, WebP, MP4, WebM, OGG, MOV, MP3, WAV, FLAC, AAC, M4A' },
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
  
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');
  
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = file.name.split('.').pop() || 'jpg';
    const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
    const isAudio = ACCEPTED_AUDIO_TYPES.includes(file.type);
    const folder = isVideo ? 'videos' : isAudio ? 'audio' : 'uploads';
    const mediaType = isVideo ? 'video' : isAudio ? 'audio' : 'image';
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substr(2, 9)}.${extension}`;
  
    // Upload to GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: filename,
      message: `Upload ${mediaType}: ${file.name}`,
      content: base64Content,
      branch: process.env.GITHUB_BRANCH || 'main',
    });

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const commitSha = response.data.commit.sha;

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

    return NextResponse.json({
      success: true,
      url: urls.raw, // Default URL for backward compatibility
      urls: urls,
      filename: filename,
      size: file.size,
      type: file.type,
      mediaType: mediaType,
      commit_sha: commitSha,
      github_url: response.data.content?.html_url,
    });

  } catch (error) {
    console.error('Upload error:', error);

    if (error instanceof Error) {
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
    message: 'Media upload API endpoint',
    methods: ['POST'],
    maxFileSize: '100MB',
    allowedTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    },
  });
}