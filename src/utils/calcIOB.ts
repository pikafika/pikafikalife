export const calculateRemainingIOB = (
  previousInsulin: number,
  administeredTime: Date,
  currentTime: Date,
  diaHours: number
): number => {
  const diffMs = currentTime.getTime() - administeredTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) return previousInsulin;
  if (diffHours >= diaHours) return 0;

  const remainingPercent = (diaHours - diffHours) / diaHours;
  const remainingInsulin = previousInsulin * remainingPercent;

  return Math.round(remainingInsulin * 100) / 100;
};
