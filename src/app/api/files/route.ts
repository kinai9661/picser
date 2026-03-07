import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export const runtime = "edge";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// GET - 列出檔案
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  const branch = searchParams.get('branch') || 'main';

  try {
    const response = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: path,
      ref: branch,
    });

    // 處理目錄或單一檔案
    const files = Array.isArray(response.data)
      ? response.data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
          download_url: item.download_url,
          html_url: item.html_url,
        }))
      : [{
          name: response.data.name,
          path: response.data.path,
          type: response.data.type,
          size: response.data.size,
          sha: response.data.sha,
          download_url: response.data.download_url,
          html_url: response.data.html_url,
        }];

    return NextResponse.json({
      success: true,
      files,
      path,
    });
  } catch (error: any) {
    if (error.status === 404) {
      return NextResponse.json({
        success: true,
        files: [],
        path,
        message: 'Directory is empty or does not exist'
      });
    }
    console.error('Failed to fetch files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// DELETE - 刪除檔案
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, sha, message } = body;

    if (!path || !sha) {
      return NextResponse.json(
        { error: 'Missing required fields: path, sha' },
        { status: 400 }
      );
    }

    await octokit.repos.deleteFile({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: path,
      message: message || `Delete: ${path}`,
      sha: sha,
      branch: process.env.GITHUB_BRANCH || 'main',
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

// PATCH - 重新命名檔案
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldPath, newPath, sha, message } = body;

    if (!oldPath || !newPath || !sha) {
      return NextResponse.json(
        { error: 'Missing required fields: oldPath, newPath, sha' },
        { status: 400 }
      );
    }

    // 1. 取得檔案內容
    const contentResponse = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: oldPath,
    });

    if (!('content' in contentResponse.data)) {
      return NextResponse.json(
        { error: 'Not a file' },
        { status: 400 }
      );
    }

    // 2. 在新路徑建立檔案
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: newPath,
      message: message || `Rename: ${oldPath} -> ${newPath}`,
      content: contentResponse.data.content,
      branch: process.env.GITHUB_BRANCH || 'main',
    });

    // 3. 刪除舊檔案
    await octokit.repos.deleteFile({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: oldPath,
      message: `Delete old file: ${oldPath}`,
      sha: sha,
      branch: process.env.GITHUB_BRANCH || 'main',
    });

    return NextResponse.json({
      success: true,
      message: 'File renamed successfully',
      newPath,
    });
  } catch (error) {
    console.error('Failed to rename file:', error);
    return NextResponse.json(
      { error: 'Failed to rename file' },
      { status: 500 }
    );
  }
}
