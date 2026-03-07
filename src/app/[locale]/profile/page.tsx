'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { User, FileImage, Heart, Settings, Upload, Calendar, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentUploads from '@/components/dashboard/RecentUploads';

interface Activity {
  id: string;
  type: 'upload' | 'delete' | 'favorite';
  filename: string;
  date: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const t = useTranslations('profile');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/records');
        if (response.ok) {
          const data = await response.json();
          const recentActivities = data.slice(0, 10).map((r: any) => ({
            id: r.id,
            type: 'upload' as const,
            filename: r.filename,
            date: r.uploadDate,
          }));
          setActivities(recentActivities);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const menuItems = [
    {
      href: '/profile/files',
      icon: FileImage,
      label: t('myFiles'),
      description: t('myFilesDesc'),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      href: '/profile/favorites',
      icon: Heart,
      label: t('favorites'),
      description: t('favoritesDesc'),
      color: 'bg-red-100 text-red-600',
    },
    {
      href: '/profile/settings',
      icon: Settings,
      label: t('settings'),
      description: t('settingsDesc'),
      color: 'bg-slate-100 text-slate-600',
    },
  ];

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Picser
                </h1>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
              >
                <Upload className="h-4 w-4" />
                <span>{t('backToHome')}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('title')}</h1>
            <p className="text-slate-600">{t('description')}</p>
          </div>

          {/* Welcome Card */}
          <div className="mb-6">
            <WelcomeCard />
          </div>

          {/* Stats */}
          <div className="mb-6">
            <StatsCard />
          </div>

          {/* Quick Menu */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
                  {item.label}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-slate-500">{item.description}</p>
              </Link>
            ))}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {t('activityTimeline')}
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 rounded w-1/3 mb-1"></div>
                      <div className="h-2 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">{t('noActivity')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'upload' ? 'bg-green-100 text-green-600' :
                      activity.type === 'delete' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'upload' ? (
                        <Upload className="w-4 h-4" />
                      ) : activity.type === 'delete' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.filename}</p>
                      <p className="text-xs text-slate-500">{formatActivityDate(activity.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Uploads */}
          <RecentUploads limit={6} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-slate-600">
            <p>{t('footer.poweredBy')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
