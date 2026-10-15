import type { DaySchedule, DayOfWeek } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const createDefaultSchedule = (): DaySchedule[] => {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    isAvailable: day !== 'Sunday',
    startTime: '18:00',
    endTime: '22:00',
  }));
};

export const validateDaySchedule = (schedule: DaySchedule): { isValid: boolean; error?: string } => {
  if (!schedule.isAvailable) return { isValid: true };

  if (!schedule.startTime || !schedule.endTime) {
    return { isValid: false, error: `${schedule.day}: Start and end operating times are required.` };
  }

  // Simple string time comparison for "HH:MM"
  if (schedule.endTime <= schedule.startTime) {
    return { isValid: false, error: `${schedule.day}: End time must be later than start time.` };
  }

  return { isValid: true };
};

export const validateFullSchedule = (schedules: DaySchedule[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  schedules.forEach((sch) => {
    const res = validateDaySchedule(sch);
    if (!res.isValid && res.error) {
      errors.push(res.error);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
