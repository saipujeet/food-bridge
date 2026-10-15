import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import type { NotificationPreferences } from '../../types';
import { Settings, Bell, Mail, Smartphone, Save, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotificationSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    id: 'pref_initial',
    userId: user?.id || '',
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    categories: {
      DONATION: true,
      MATCH: true,
      DELIVERY: true,
      SYSTEM: true,
      VERIFICATION: true,
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    notificationService
      .getUserPreferences(user.id)
      .then((prefs) => {
        setPreferences(prefs);
      })
      .catch((err) => {
        console.error('Failed to load preferences:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  const handleToggleChannel = (channel: 'emailEnabled' | 'pushEnabled' | 'inAppEnabled') => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleToggleCategory = (catKey: keyof NotificationPreferences['categories']) => {
    setPreferences((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [catKey]: !prev.categories[catKey],
      },
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await notificationService.saveUserPreferences(user.id, preferences);
      showToast('Settings Saved', 'Your notification preferences have been updated successfully.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save preferences';
      showToast('Error', msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Settings</h1>
            <p className="text-xs text-slate-500 font-medium">
              Configure alert channels, delivery frequencies, and topic preference filters
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center space-x-2 shrink-0"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Preferences</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 mt-2">Loading preferences...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* DELIVERY CHANNELS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center">
              <Bell className="w-4 h-4 text-emerald-600 mr-2" />
              Delivery Channels
            </h2>
            <p className="text-xs text-slate-500">Choose how you want to receive real-time updates and emergency alerts.</p>

            <div className="divide-y divide-slate-100">
              {/* In-App Alerts */}
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">In-App Live Toast & Bell Badges</h3>
                    <p className="text-[11px] text-slate-500">Receive instant popups and header badge count updates in real time</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inAppEnabled}
                    onChange={() => handleToggleChannel('inAppEnabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* Email Notifications */}
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Email Notifications</h3>
                    <p className="text-[11px] text-slate-500">Receive email digests for donation acceptances and volunteer assignments</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailEnabled}
                    onChange={() => handleToggleChannel('emailEnabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* Push Notifications */}
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Mobile Push Notifications</h3>
                    <p className="text-[11px] text-slate-500">Receive mobile device push alerts when urgent surplus matches are triggered</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.pushEnabled}
                    onChange={() => handleToggleChannel('pushEnabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>
            </div>
          </div>

          {/* TOPIC & EVENT CATEGORIES */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
              Event Categories
            </h2>
            <p className="text-xs text-slate-500">Toggle specific event categories you wish to subscribe to.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                {
                  key: 'DONATION',
                  title: 'Donation Activity',
                  desc: 'New posts, cancellations, and expiration alerts',
                },
                {
                  key: 'MATCH',
                  title: 'Match Recommendations',
                  desc: 'Matching notifications and radius expansion alerts',
                },
                {
                  key: 'DELIVERY',
                  title: 'Delivery & Logistics',
                  desc: 'Volunteer assignment, pickup, and delivery updates',
                },
                {
                  key: 'SYSTEM',
                  title: 'System Announcements',
                  desc: 'Platform updates, terms, and maintenance windows',
                },
                {
                  key: 'VERIFICATION',
                  title: 'Account & Security Verification',
                  desc: 'NGO and Volunteer credential verification status',
                },
              ].map((item) => {
                const isChecked = preferences.categories[item.key as keyof NotificationPreferences['categories']];
                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between space-x-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          handleToggleCategory(item.key as keyof NotificationPreferences['categories'])
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
