// Bilinear IOB model: faster decay pre-peak, slower post-peak.
// Peak is at ~35% of DIA (based on OpenAPS/Loop standard).
// This is more accurate than a linear model for rapid/fast-acting insulins.
export const calculateRemainingIOB = (
  previousInsulin: number,
  administeredTime: Date,
  currentTime: Date,
  diaHours: number
): number => {
  const diffHours = (currentTime.getTime() - administeredTime.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) return previousInsulin;
  if (diffHours >= diaHours) return 0;

  const peakHours = diaHours * 0.35;
  let iobFraction: number;
  if (diffHours <= peakHours) {
    iobFraction = 1 - (diffHours / peakHours) * 0.5;
  } else {
    iobFraction = 0.5 * (diaHours - diffHours) / (diaHours - peakHours);
  }

  return Math.round(previousInsulin * iobFraction * 100) / 100;
};
