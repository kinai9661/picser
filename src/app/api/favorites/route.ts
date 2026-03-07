import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

// 使用 KV 存儲收藏（如果可用），否則使用內存存儲
const getFavoritesKey = (userId: string) => `favorites:${userId}`;

// GET - 取得收藏列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    
    // 從 KV 或 localStorage 獲取收藏
    // 這裡使用簡單的內存存儲作為示例
    const favorites = [];
    
    return NextResponse.json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - 新增收藏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fileId, filename, url, jsdelivrUrl, size, type } = body;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing required field: fileId' },
        { status: 400 }
      );
    }
    
    // 這裡應該將收藏存儲到 KV 或資料庫
    // 目前返回成功響應
    
    return NextResponse.json({
      success: true,
      message: 'Favorite added successfully',
      favorite: {
        id: fileId,
        filename,
        url,
        jsdelivrUrl,
        size,
        type,
        addedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to add favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE - 移除收藏
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing required parameter: fileId' },
        { status: 400 }
      );
    }
    
    // 這裡應該從 KV 或資料庫刪除收藏
    
    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully',
    });
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
