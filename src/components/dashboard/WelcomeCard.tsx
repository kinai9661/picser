'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { User, Clock } from 'lucide-react';

export default function WelcomeCard() {
  const { data: session, status } = useSession();
  const t = useTranslations('dashboard');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  if (status === 'loading') {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center space-x-4">
        {session?.user?.image ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold">
            {getGreeting()}{session?.user?.name ? `，${session.user.name}` : ''}
          </h2>
          <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
      {!session && (
        <p className="mt-4 text-blue-100 text-sm">
          {t('signInPrompt')}
        </p>
      )}
    </div>
  );
}
