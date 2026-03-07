'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Github, Star, BookOpen, FolderOpen } from 'lucide-react';
import FileManager from '@/components/FileManager';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LoginButton from '@/components/LoginButton';

export default function FilesPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Github className="h-8 w-8 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Picser
                </h1>
                <p className="text-xs text-slate-500 font-medium">{t('common.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link
                href="https://github.com/sh20raj/picser"
                target="_blank"
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
              >
                <Star className="h-4 w-4" />
                <span>{t('nav.starOnGithub')}</span>
              </Link>
              <Link
                href="/api-docs"
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
              >
                <BookOpen className="h-4 w-4" />
                <span>{t('nav.apiDocs')}</span>
              </Link>
              <Link
                href="/"
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
              >
                <FolderOpen className="h-4 w-4" />
                <span>{t('fileManager.title')}</span>
              </Link>
              <LoginButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                  {t('fileManager.title')}
                </h2>
                <p className="text-slate-600">{t('fileManager.description')}</p>
              </div>
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 border border-slate-200"
              >
                <span>{t('fileManager.backToHome')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* File Manager Component */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <FileManager />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">
                {t('footer.apiDocs')}
              </Link>
              <Link
                href="https://github.com/sh20raj/picser"
                target="_blank"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                {t('footer.github')}
              </Link>
            </div>
            <p className="text-sm text-slate-600">
              {t('footer.poweredBy')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
