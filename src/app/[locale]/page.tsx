'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, Github, Star, Zap, Shield, Globe, FolderOpen, User } from 'lucide-react';
import MediaUploader from '@/components/MediaUploader';
import UploadHistory from '@/components/UploadHistory';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LoginButton from '@/components/LoginButton';

export default function Home() {
  const [refreshHistory, setRefreshHistory] = useState(0);
  const t = useTranslations();

  const handleNewUpload = () => {
    setRefreshHistory(prev => prev + 1);
  };

  const navLinkClass = 'flex items-center space-x-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm';
  const navPrimaryLinkClass = 'flex items-center space-x-2 rounded-xl border border-blue-500/70 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg';
  const footerLinkClass = 'rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(15_23_42/0.08)]">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 shadow-sm">
              <div className="relative">
                <Github className="h-7 w-7 text-blue-600" />
                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500"></div>
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                  Picser
                </h1>
                <p className="text-xs font-medium text-slate-500">{t('common.subtitle')}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <LanguageSwitcher />
              <Link
                href="https://github.com/kinai9661/picser"
                target="_blank"
                className={navLinkClass}
              >
                <Star className="h-4 w-4" />
                <span>{t('nav.starOnGithub')}</span>
              </Link>
              <Link
                href="/files"
                className={navLinkClass}
              >
                <FolderOpen className="h-4 w-4" />
                <span>{t('fileManager.title')}</span>
              </Link>
              <Link
                href="/profile"
                className={navLinkClass}
              >
                <User className="h-4 w-4" />
                <span>{t('profile.title')}</span>
              </Link>
              <Link
                href="/api-docs"
                className={navPrimaryLinkClass}
              >
                <BookOpen className="h-4 w-4" />
                <span>{t('nav.apiDocs')}</span>
              </Link>
              <LoginButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-14 pb-10">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-5xl rounded-3xl border border-white/70 bg-white/65 p-8 text-center shadow-[0_12px_40px_rgb(15_23_42/0.10)] backdrop-blur-xl md:p-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Zap className="h-3.5 w-3.5" />
              <span>GitHub + jsDelivr</span>
            </div>

            <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              {t('hero.title')}
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h2>

            <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">
              {t('hero.description')}
            </p>

            <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#upload"
                className="inline-flex items-center justify-center rounded-xl border border-blue-500/70 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
              >
                {t('common.upload')}
              </Link>
              <Link
                href="/api-docs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-blue-200 hover:text-blue-600"
              >
                <BookOpen className="h-4 w-4" />
                <span>{t('nav.apiDocs')}</span>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3 md:gap-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <Zap className="mx-auto mb-3 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 font-semibold text-slate-900">{t('features.fastCdn')}</h3>
                <p className="text-sm text-slate-600">{t('features.fastCdnDesc')}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <Shield className="mx-auto mb-3 h-8 w-8 text-green-600" />
                <h3 className="mb-2 font-semibold text-slate-900">{t('features.permanentUrls')}</h3>
                <p className="text-sm text-slate-600">{t('features.permanentUrlsDesc')}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <Globe className="mx-auto mb-3 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 font-semibold text-slate-900">{t('features.selfHosted')}</h3>
                <p className="text-sm text-slate-600">{t('features.selfHostedDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id='upload' className="pb-16">
        <div className="container mx-auto px-6">
          <MediaUploader onUpload={handleNewUpload} />
          <UploadHistory key={refreshHistory} onNewUpload={() => setRefreshHistory(prev => prev + 1)} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-10">
          <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_auto_1fr]">
            {/* Left Side - Brand */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm">
              <div className="relative">
                <Github className="h-6 w-6 text-blue-600" />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Picser</h3>
                <p className="text-xs text-slate-500">{t('common.subtitle')}</p>
              </div>
            </div>

            {/* Center - Links */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-slate-200/70 bg-white/80 p-1.5 shadow-sm">
              <Link
                href="/api-docs"
                className={footerLinkClass}
              >
                {t('footer.apiDocs')}
              </Link>
              <Link
                href="https://github.com/kinai9661/picser"
                target="_blank"
                className={footerLinkClass}
              >
                {t('footer.github')}
              </Link>
              <Link
                href="https://jsdelivr.com"
                target="_blank"
                className={footerLinkClass}
              >
                jsDelivr CDN
              </Link>
            </div>

            {/* Right Side - Attribution */}
            <div className="text-center lg:text-right">
              <p className="text-sm text-slate-600">
                {t('footer.madeWith')}{' '}
                <Link
                  href="https://github.com/kinai9661"
                  target="_blank"
                  className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  @kinai9661
                </Link>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t('footer.openSource')}
              </p>
            </div>
          </div>

          {/* Bottom Line */}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-xs text-slate-500 md:flex-row">
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
              <p>© 2025 Picser. Made with Next.js 15, TypeScript & Tailwind CSS.</p>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">v2.0.0</span>
                <span>{t('footer.lastUpdate')}: 2025-03-08</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>{t('footer.allSystemsOperational')}</span>
              </span>
              <span>{t('footer.poweredBy')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}