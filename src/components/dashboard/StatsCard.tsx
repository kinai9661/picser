'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Upload, HardDrive, TrendingUp, Clock } from 'lucide-react';

interface UploadStats {
  totalUploads: number;
  totalSize: number;
  thisWeek: number;
  thisMonth: number;
}

export default function StatsCard() {
  const { data: session } = useSession();
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<UploadStats>({
    totalUploads: 0,
    totalSize: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const statItems = [
    {
      label: t('totalUploads'),
      value: stats.totalUploads,
      icon: Upload,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: t('totalSize'),
      value: formatSize(stats.totalSize),
      icon: HardDrive,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: t('thisWeek'),
      value: stats.thisWeek,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: t('thisMonth'),
      value: stats.thisMonth,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
            <div className="animate-pulse">
              <div className="w-10 h-10 bg-slate-200 rounded-lg mb-3"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 hover:shadow-md transition-shadow"
        >
          <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center mb-3`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{item.value}</p>
          <p className="text-sm text-slate-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
