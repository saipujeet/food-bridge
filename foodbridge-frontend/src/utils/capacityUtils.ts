export const calculateAvailableCapacity = (maxCapacity: number, currentCapacity: number): number => {
  const max = Math.max(0, Number(maxCapacity) || 0);
  const current = Math.max(0, Number(currentCapacity) || 0);
  return Math.max(0, max - current);
};

export const validateCapacityInput = (
  maxCapacity: number,
  currentCapacity: number
): { isValid: boolean; error?: string } => {
  const max = Number(maxCapacity);
  const current = Number(currentCapacity);

  if (isNaN(max) || max < 0) {
    return { isValid: false, error: 'Maximum capacity cannot be negative.' };
  }

  if (isNaN(current) || current < 0) {
    return { isValid: false, error: 'Current capacity cannot be negative.' };
  }

  if (current > max) {
    return { isValid: false, error: 'Current capacity cannot exceed maximum capacity.' };
  }

  return { isValid: true };
};
