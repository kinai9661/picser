'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import WelcomeCard from './dashboard/WelcomeCard';
import StatsCard from './dashboard/StatsCard';
import RecentUploads from './dashboard/RecentUploads';
import QuickActions from './dashboard/QuickActions';

interface DashboardProps {
  onUpload?: () => void;
}

export default function Dashboard({ onUpload }: DashboardProps) {
  const { data: session, status } = useSession();
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />
      
      {/* Stats Section */}
      <StatsCard />
      
      {/* Quick Actions */}
      <QuickActions onUpload={onUpload} />
      
      {/* Recent Uploads */}
      <RecentUploads limit={6} />
    </div>
  );
}
