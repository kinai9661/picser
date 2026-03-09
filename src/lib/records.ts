// GitHub Records API client functions

export interface UploadRecord {
  id: string;
  filename: string;
  url: string;
  urls?: {
    github: string;
    raw: string;
    jsdelivr: string;
    github_commit: string;
    raw_commit: string;
    jsdelivr_commit: string;
  };
  github_url?: string;
  uploadDate: string;
  size: number;
  type: string;
  mediaType?: 'image' | 'video';
}

const API_BASE = '/api/records';

export async function fetchRecords(): Promise<UploadRecord[]> {
  try {
    const response = await fetch(API_BASE);
    const data = await response.json();
    if (data.success) {
      return data.records;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch records:', error);
    return [];
  }
}

export async function saveRecord(record: Omit<UploadRecord, 'id' | 'uploadDate'>): Promise<UploadRecord | null> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    const data = await response.json();
    if (data.success) {
      return data.record;
    }
    return null;
  } catch (error) {
    console.error('Failed to save record:', error);
    return null;
  }
}

export async function deleteRecord(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}?id=${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to delete record:', error);
    return false;
  }
}