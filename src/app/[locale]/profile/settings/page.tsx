'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { 
  ArrowLeft, Settings, Sun, Moon, Globe, Upload, Bell,
  Check, Save, RotateCcw
} from 'lucide-react';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultUrlFormat: 'jsdelivr' | 'raw' | 'github';
  defaultUploadFolder: string;
  notifications: {
    uploadSuccess: boolean;
    copyToClipboard: boolean;
  };
}

const defaultSettings: UserSettings = {
  theme: 'light',
  language: 'en',
  defaultUrlFormat: 'jsdelivr',
  defaultUploadFolder: 'uploads',
  notifications: {
    uploadSuccess: true,
    copyToClipboard: true,
  },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations('profile');
  const locale = useLocale();
  
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('userSettings');
        if (stored) {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        } else {
          // 使用當前語言作為預設
          setSettings(prev => ({ ...prev, language: locale }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [locale]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      // 儲存到 localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // 如果有登入，也嘗試儲存到伺服器
      if (session) {
        await fetch('/api/user/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm(t('confirmResetSettings'))) {
      setSettings(defaultSettings);
      localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/profile" className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>{t('backToProfile')}</span>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('settings')}
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-6 border border-slate-200">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-slate-200 rounded"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Appearance Settings */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  {t('appearance')}
                </h2>
                
                {/* Theme */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('theme')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updateSetting('theme', theme)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                          settings.theme === theme
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {theme === 'light' && <Sun className="w-4 h-4" />}
                        {theme === 'dark' && <Moon className="w-4 h-4" />}
                        {theme === 'system' && <div className="w-4 h-4 border border-current rounded" />}
                        <span className="text-sm">{t(`theme_${theme}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    {t('language')}
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="zh-TW">繁體中文</option>
                  </select>
                </div>
              </div>

              {/* Upload Settings */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-500" />
                  {t('uploadSettings')}
                </h2>
                
                {/* Default URL Format */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('defaultUrlFormat')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'jsdelivr', label: 'jsDelivr CDN', desc: t('jsdelivrDesc') },
                      { value: 'raw', label: 'GitHub Raw', desc: t('rawDesc') },
                      { value: 'github', label: 'GitHub Page', desc: t('githubDesc') },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateSetting('defaultUrlFormat', option.value as any)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          settings.defaultUrlFormat === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-medium text-slate-900">{option.label}</p>
                          <p className="text-xs text-slate-500">{option.desc}</p>
                        </div>
                        {settings.defaultUrlFormat === option.value && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Upload Folder */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('defaultUploadFolder')}</label>
                  <input
                    type="text"
                    value={settings.defaultUploadFolder}
                    onChange={(e) => updateSetting('defaultUploadFolder', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="uploads"
                  />
                  <p className="text-xs text-slate-500 mt-1">{t('defaultUploadFolderDesc')}</p>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-500" />
                  {t('notifications')}
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900">{t('notifyUploadSuccess')}</p>
                      <p className="text-xs text-slate-500">{t('notifyUploadSuccessDesc')}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.uploadSuccess}
                      onChange={(e) => updateNotification('uploadSuccess', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900">{t('notifyCopy')}</p>
                      <p className="text-xs text-slate-500">{t('notifyCopyDesc')}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.copyToClipboard}
                      onChange={(e) => updateNotification('copyToClipboard', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={resetSettings}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('resetToDefault')}
                </button>
                
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : saved ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saved ? t('saved') : t('save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
