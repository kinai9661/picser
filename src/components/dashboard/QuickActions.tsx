'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Upload, Link2, FolderOpen, Settings, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
  onUpload?: () => void;
}

export default function QuickActions({ onUpload }: QuickActionsProps) {
  const { data: session } = useSession();
  const t = useTranslations('dashboard');
  const [copied, setCopied] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get last uploaded URL from localStorage
  useState(() => {
    const history = localStorage.getItem('uploadHistory');
    if (history) {
      try {
        const uploads = JSON.parse(history);
        if (uploads.length > 0) {
          setLastUrl(uploads[0].jsdelivrUrl || uploads[0].url);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  });

  const copyLastUrl = async () => {
    if (lastUrl) {
      try {
        await navigator.clipboard.writeText(lastUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const actions = [
    {
      label: t('quickUpload'),
      icon: Upload,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      onClick: () => fileInputRef.current?.click(),
      primary: true,
    },
    {
      label: t('copyLastUrl'),
      icon: copied ? Check : Link2,
      color: 'bg-green-100 hover:bg-green-200',
      textColor: 'text-green-700',
      onClick: copyLastUrl,
      disabled: !lastUrl,
    },
    {
      label: t('browseFiles'),
      icon: FolderOpen,
      color: 'bg-purple-100 hover:bg-purple-200',
      textColor: 'text-purple-700',
      href: '/files',
    },
    {
      label: t('settings'),
      icon: Settings,
      color: 'bg-slate-100 hover:bg-slate-200',
      textColor: 'text-slate-700',
      href: '/profile/settings',
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('quickActions')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => {
          const content = (
            <button
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl transition-all
                ${action.color} ${action.textColor}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${action.primary ? 'shadow-lg hover:shadow-xl' : ''}
              `}
            >
              <action.icon className={`w-6 h-6 mb-2 ${action.primary ? '' : 'opacity-70'}`} />
              <span className={`text-sm font-medium ${action.primary ? '' : 'text-xs'}`}>
                {action.label}
              </span>
            </button>
          );

          if (action.href) {
            return (
              <Link key={action.label} href={action.href}>
                {content}
              </Link>
            );
          }

          return <div key={action.label}>{content}</div>;
        })}
      </div>
      
      {/* Hidden file input for quick upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onUpload) {
            onUpload();
          }
        }}
      />
    </div>
  );
}
