import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

// GET - 取得使用者統計資料
export async function GET(request: NextRequest) {
  try {
    // 從 /api/records 獲取記錄
    const response = await fetch(new URL('/api/records', request.url));
    const data = await response.json();
    const records = data.records || [];
    
    // 計算統計資料
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalUploads = records.length;
    const totalSize = records.reduce((sum, r) => sum + (r.size || 0), 0);
    
    const thisWeek = records.filter(r => {
      const uploadDate = new Date(r.uploadDate);
      return uploadDate >= oneWeekAgo;
    }).length;
    
    const thisMonth = records.filter(r => {
      const uploadDate = new Date(r.uploadDate);
      return uploadDate >= oneMonthAgo;
    }).length;
    
    return NextResponse.json({
      totalUploads,
      totalSize,
      thisWeek,
      thisMonth,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
