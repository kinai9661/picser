import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export const runtime = "edge";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const RECORDS_FILE = 'upload-records.json';

async function getRecords(): Promise<any[]> {
  try {
    const response = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: RECORDS_FILE,
      ref: process.env.GITHUB_BRANCH || 'main',
    });

    if ('content' in response.data) {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    }
    return [];
  } catch (error: any) {
    // File doesn't exist yet
    if (error.status === 404) {
      return [];
    }
    throw error;
  }
}

async function saveRecords(records: any[]): Promise<void> {
  const content = JSON.stringify(records, null, 2);
  const base64Content = Buffer.from(content).toString('base64');

  // Get the current file SHA if it exists
  let sha: string | undefined;
  try {
    const response = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: RECORDS_FILE,
      ref: process.env.GITHUB_BRANCH || 'main',
    });
    if ('sha' in response.data) {
      sha = response.data.sha;
    }
  } catch (error: any) {
    // File doesn't exist, sha will be undefined
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: process.env.GITHUB_OWNER!,
    repo: process.env.GITHUB_REPO!,
    path: RECORDS_FILE,
    message: `Update upload records`,
    content: base64Content,
    branch: process.env.GITHUB_BRANCH || 'main',
    sha: sha,
  });
}

// GET - Retrieve all records
export async function GET() {
  try {
    const records = await getRecords();
    return NextResponse.json({
      success: true,
      records: records,
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

// POST - Add a new record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, url, urls, size, type, mediaType, github_url } = body;

    const records = await getRecords();
    
    const newRecord = {
      id: Date.now().toString(),
      filename,
      url,
      urls,
      size,
      type,
      mediaType: mediaType || (type?.startsWith('video/') ? 'video' : 'image'),
      github_url,
      uploadDate: new Date().toISOString(),
    };

    // Add to beginning of array (newest first)
    records.unshift(newRecord);

    // Keep only last 100 records
    const trimmedRecords = records.slice(0, 100);

    await saveRecords(trimmedRecords);

    return NextResponse.json({
      success: true,
      record: newRecord,
    });
  } catch (error) {
    console.error('Error saving record:', error);
    return NextResponse.json(
      { error: 'Failed to save record' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }

    const records = await getRecords();
    const filteredRecords = records.filter((r: any) => r.id !== id);

    if (filteredRecords.length === records.length) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    await saveRecords(filteredRecords);

    return NextResponse.json({
      success: true,
      message: 'Record deleted',
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}