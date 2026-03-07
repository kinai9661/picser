import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

// 預設設定
const defaultSettings = {
  theme: 'light',
  language: 'en',
  defaultUrlFormat: 'jsdelivr',
  defaultUploadFolder: 'uploads',
  notifications: {
    uploadSuccess: true,
    copyToClipboard: true,
  },
};

// GET - 取得使用者設定
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    
    // 這裡應該從 KV 或資料庫獲取使用者設定
    // 目前返回預設設定
    
    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH - 更新使用者設定
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, settings } = body;
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Missing required field: settings' },
        { status: 400 }
      );
    }
    
    // 這裡應該將設定存儲到 KV 或資料庫
    // 目前返回成功響應
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        ...defaultSettings,
        ...settings,
      },
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
