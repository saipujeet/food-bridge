import React, { useState, useEffect } from 'react';
import { adminService, type AdminSettingRecord } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Save,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AdminSettingRecord[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSettings();
      setSettings(data);
      const map: Record<string, string> = {};
      data.forEach((s) => {
        map[s.settingKey] = s.settingValue;
      });
      setFormValues(map);
    } catch {
      showToast('Error', 'Unable to fetch system settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (key: string) => {
    const val = formValues[key];
    if (val === undefined || val.trim() === '') {
      showToast('Validation Error', 'Setting value cannot be blank', 'error');
      return;
    }

    setSavingKey(key);
    try {
      await adminService.updateSetting(key, val.trim());
      showToast('Setting Saved', `Parameter '${key}' updated successfully.`, 'success');
      loadSettings();
    } catch (err: unknown) {
      showToast('Validation Error', (err as Error).message || 'Invalid setting format', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Sliders className="w-5 h-5 text-emerald-600 mr-2" />
            Platform & Algorithm Operational Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tune Module 4 & 5 matching expansion radii, dispatch delay escalation intervals, and food safety policies.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Schema Validation</span>
        </div>
      </div>

      {/* Settings Grid */}
      {isLoading && settings.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading operational parameters...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map((setting) => (
          <Card key={setting.settingKey} className="border-slate-200 flex flex-col justify-between">
            <CardHeader className="py-4 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-mono">
                    {setting.settingKey}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{setting.description}</p>
                </div>
                <Badge variant="neutral">{setting.category}</Badge>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Configured Value
                </label>
                <Input
                  value={formValues[setting.settingKey] ?? setting.settingValue}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      [setting.settingKey]: e.target.value,
                    })
                  }
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Updated by: {setting.updatedBy || 'admin@foodbridge.org'}</span>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={savingKey === setting.settingKey}
                  onClick={() => handleSave(setting.settingKey)}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Parameter
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
};
