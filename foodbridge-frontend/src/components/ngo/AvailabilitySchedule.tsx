import React, { useState } from 'react';
import type { DaySchedule } from '../../types';
import { validateFullSchedule } from '../../utils/availabilityUtils';
import { Button } from '../common/Button';
import { Clock, Save, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface AvailabilityScheduleProps {
  initialMasterAvailable: boolean;
  initialSchedule: DaySchedule[];
  onSubmit: (isMasterAvailable: boolean, schedule: DaySchedule[]) => Promise<void>;
  isLoading?: boolean;
}

export const AvailabilitySchedule: React.FC<AvailabilityScheduleProps> = ({
  initialMasterAvailable,
  initialSchedule,
  onSubmit,
  isLoading = false,
}) => {
  const [masterAvailable, setMasterAvailable] = useState<boolean>(initialMasterAvailable ?? true);
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule || []);
  const [errors, setErrors] = useState<string[]>([]);

  const handleDayToggle = (index: number) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isAvailable: !next[index].isAvailable };
      return next;
    });
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validation = validateFullSchedule(schedule);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit(masterAvailable, schedule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* MASTER AVAILABILITY SWITCH */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">Master Availability Switch</h3>
          <p className="text-xs text-slate-500">
            Turn ON to receive real-time donation matching notifications from nearby donors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMasterAvailable(!masterAvailable)}
          className={`px-5 py-2.5 rounded-xl border text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
            masterAvailable
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          {masterAvailable ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Currently Available (ON)</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              <span>Unavailable (OFF)</span>
            </>
          )}
        </button>
      </div>

      {/* ERRORS */}
      {errors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl font-bold space-y-1">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please correct operating hours errors:</span>
          </div>
          <ul className="list-disc pl-6 space-y-0.5 font-normal">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 7-DAY OPERATING SCHEDULE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-200">
          <Clock className="w-4 h-4 text-emerald-700" />
          <span>7-Day Operating Hours Schedule (Monday — Sunday)</span>
        </div>

        <div className="divide-y divide-slate-100">
          {schedule.map((item, idx) => (
            <div key={item.day} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Day & Toggle */}
              <div className="flex items-center space-x-3 w-44">
                <button
                  type="button"
                  onClick={() => handleDayToggle(idx)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    item.isAvailable ? 'bg-emerald-700' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      item.isAvailable ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
                <span className={`text-xs font-bold ${item.isAvailable ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.day}
                </span>
              </div>

              {/* Time Pickers */}
              {item.isAvailable ? (
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500 font-medium">From:</span>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                  />
                  <span className="text-slate-500 font-medium">To:</span>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                  />
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-400 italic">Closed / Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
          className="px-8 py-2.5 font-extrabold shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          Save Availability Schedule
        </Button>
      </div>
    </form>
  );
};
