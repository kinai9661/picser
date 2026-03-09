# 🚀 Picser - Free GitHub Media Hosting with jsDelivr CDN

> **Lightning-fast, self-hostable media hosting using GitHub repositories and jsDelivr CDN. Upload images and videos with permanent URLs that work forever, even if your repo gets deleted.**

![Picser Banner](https://cdn.jsdelivr.net/gh/sh20raj/picser@main/public/og/og-image.png)

[![GitHub Stars](https://img.shields.io/github/stars/sh20raj/picser?style=social)](https://github.com/sh20raj/picser)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sh20raj/picser)
[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sh20raj/picser)

[![Visitors](https://api.visitorbadge.io/api/combined?path=https%3A%2F%2Fgithub.com%2FSH20RAJ%2Fpicser&countColor=%232ccce4&labelStyle=upper)](https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2FSH20RAJ%2Fpicser)

---

## 🇹🇼 中文介紹

### 什麼是 Picser？

Picser 是一個免費、開源的媒體託管服務，使用 GitHub 儲存庫作為後端儲存，並透過 jsDelivr CDN 提供全球加速訪問。支援圖片和影片檔案的上傳與預覽。

### ✨ 主要特色

- **⚡ 極速 CDN**：全球 jsDelivr CDN，99.9% 正常運行時間
- **🔒 永久連結**：基於 commit 的 URL，即使儲存庫刪除仍可訪問
- **💰 完全免費**：無限制、無訂閱，只需上傳並分享
- **🖼️ 多媒體支援**：圖片、影片一站式託管
- **🌐 多語言支援**：完整中英文介面
- **👤 個人化儀表板**：歡迎訊息、上傳統計、最近上傳
- **📁 檔案管理**：瀏覽、搜尋、篩選、批量操作
- **❤️ 收藏功能**：快速存取常用檔案
- **⚙️ 個人設定**：主題、語言、上傳偏好設定

### 🚀 快速開始

```bash
# 複製專案
git clone https://github.com/kinai9661/picser.git

# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env.local
# 編輯 .env.local 填入您的 GitHub 設定

# 啟動開發伺服器
npm run dev
```

### 📁 專案結構

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx          # 首頁
│   │   ├── api-docs/         # API 文件頁面
│   │   ├── files/            # 檔案管理頁面
│   │   └── profile/          # 個人中心
│   │       ├── page.tsx      # 個人中心首頁
│   │       ├── files/        # 我的檔案
│   │       ├── favorites/    # 收藏夾
│   │       └── settings/     # 設定頁面
│   └── api/
│       ├── upload/           # 上傳 API
│       ├── files/            # 檔案管理 API
│       ├── favorites/        # 收藏 API
│       └── user/             # 使用者 API
├── components/
│   ├── Dashboard.tsx         # 儀表板組件
│   ├── FileManager.tsx       # 檔案管理器
│   └── dashboard/            # 儀表板子組件
└── i18n/
    └── messages/             # 翻譯檔案
        ├── en.json
        └── zh-TW.json
```

---

## 🇺🇸 English

## ✨ Why Choose Picser?

- **⚡ Lightning Fast**: Global jsDelivr CDN with 99.9% uptime and edge caching
- **🔒 Permanent URLs**: Commit-based URLs work even if repository/files are deleted
- **💰 Completely Free**: No limits, no subscriptions - just upload and share
- **🛡️ Self-Hostable**: Deploy on your own infrastructure for full control
- **🌍 Global CDN**: Images load instantly from 100+ edge locations worldwide
- **📦 Git-Backed**: All images stored in Git with full version control
- **🎨 Modern UI**: Beautiful glassmorphism interface built with Next.js 15 & Tailwind CSS
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **🔄 Upload History**: Track all your uploads with smart URL management
- **🏷️ Smart Badges**: Visual indicators for CDN status and URL permanence
- **🌐 i18n Support**: Full Chinese and English interface support
- **👤 Personal Dashboard**: Welcome message, upload statistics, recent uploads
- **📁 File Management**: Browse, search, filter, batch operations
- **❤️ Favorites**: Quick access to frequently used files
- **⚙️ Settings**: Theme, language, upload preferences

## 🎯 Key Features

### 🖼️ **Smart Media Upload**

- Drag & drop interface with instant preview
- Support for images (JPG, PNG, GIF, WebP) and videos (MP4, WebM)
- Up to 100MB file size limit
- Automatic optimization and multiple URL formats

### ⚡ **jsDelivr CDN Integration**

- **Primary Feature**: Commit-based CDN URLs for maximum performance
- Global edge network with heavy caching
- Permanent links that survive repository changes
- 99.9% uptime guarantee

### 🔗 **Multiple URL Types**

1. **jsDelivr CDN (Permanent)** ⭐ *Recommended*
   - `https://cdn.jsdelivr.net/gh/user/repo@commit/image.png`
   - ✅ Lightning fast global CDN
   - ✅ Heavy caching and edge optimization
   - ✅ Permanent URLs (work even if repo deleted)

2. **Raw GitHub (Permanent)**
   - `https://raw.githubusercontent.com/user/repo/commit/image.png`
   - ✅ Direct GitHub access
   - ✅ Permanent commit-based URLs

3. **jsDelivr CDN (Dynamic)**
   - `https://cdn.jsdelivr.net/gh/user/repo@branch/image.png`
   - ✅ CDN performance
   - 📝 Updates with repository changes

### 🌐 **Public API**

- RESTful API for external integrations
- Support for user-provided GitHub credentials
- Comprehensive documentation with examples
- Edge runtime for global performance

### 📊 **Upload Management**

- Visual upload history with thumbnails
- One-click URL copying
- Repository source links
- File metadata tracking

### 👤 **Personal Dashboard**

- Welcome message with time-based greeting
- Upload statistics (total, this week, this month)
- Recent uploads with quick actions
- Quick upload and copy last URL

### 📁 **File Management**

- Browse all uploaded files
- Search and filter by type
- Grid/List view toggle
- Sort by date, name, or size
- Batch delete operations
- Quick copy and preview

### ❤️ **Favorites**

- Mark files as favorites for quick access
- Remove from favorites easily
- Visual indicators for favorite status

### ⚙️ **Settings**

- Theme selection (Light/Dark/System)
- Language preference (English/繁體中文)
- Default URL format
- Default upload folder
- Notification preferences

## 🚀 Quick Start

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sh20raj/picser)

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sh20raj/picser)

### Option 2: Manual Setup

1. **Clone and Install**

```bash
git clone https://github.com/kinai9661/picser.git
cd picser
npm install
```

2. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Setup

Create a `.env.local` file with your GitHub configuration:

```env
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main

# Optional: NextAuth.js for authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Create a new **Fine-grained personal access token** or **Classic token**
3. For fine-grained tokens, select your repository and grant these permissions:
   - **Contents**: Write (to upload files)
   - **Metadata**: Read (to access repository info)
4. For classic tokens, select these scopes:
   - `repo` (Full control of private repositories)
5. Copy the token to your `.env.local` file

---

## 📝 更新記錄 / Changelog

### v2.0.0 (2025-03-08)

#### 🎉 新功能 / New Features

- **🌐 國際化支援 / i18n Support**
  - 新增完整繁體中文翻譯
  - Added full Traditional Chinese translation
  - 支援語言切換功能
  - Added language switcher

- **👤 個人化儀表板 / Personal Dashboard**
  - 歡迎訊息（根據時間顯示早安/午安/晚安）
  - Welcome message with time-based greeting
  - 上傳統計（總上傳數、總容量、本週、本月）
  - Upload statistics (total, size, this week, this month)
  - 最近上傳區塊
  - Recent uploads section
  - 快速操作區
  - Quick actions panel

- **📁 檔案管理 / File Management**
  - 瀏覽 GitHub 儲存庫中的檔案
  - Browse files in GitHub repository
  - 搜尋、篩選、排序功能
  - Search, filter, and sort
  - 網格/列表檢視切換
  - Grid/List view toggle
  - 批量選擇和刪除
  - Batch select and delete

- **❤️ 收藏功能 / Favorites**
  - 標記檔案為收藏
  - Mark files as favorites
  - 快速存取收藏的檔案
  - Quick access to favorite files

- **⚙️ 設定頁面 / Settings Page**
  - 主題設定（淺色/深色/系統）
  - Theme settings (Light/Dark/System)
  - 語言設定
  - Language settings
  - 上傳設定（預設 URL 格式、上傳資料夾）
  - Upload settings (default URL format, upload folder)
  - 通知設定
  - Notification settings

- **📄 API 文件頁面中文化**
  - API documentation page localization

#### 🐛 修復 / Bug Fixes

- 修復 TypeScript 類型錯誤
- Fixed TypeScript type errors
- 修復 API 路由匯入問題
- Fixed API route import issues

---

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Authentication**: NextAuth.js
- **GitHub API**: Octokit
- **CDN**: jsDelivr
- **Icons**: Lucide React

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [jsDelivr Documentation](https://www.jsdelivr.com/documentation)
- [GitHub API Documentation](https://docs.github.com/en/rest)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

## License

MIT License - feel free to use this project for any purpose.

---

Made with ❤️ by the Picser Team
