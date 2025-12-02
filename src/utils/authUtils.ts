// utils/authUtils.ts
export const checkTokenExpiry = (expiresAt: number | null): boolean => {
  if (!expiresAt) return true; // jeśli brak expiresAt, traktuj jako wygasły
  return Date.now() > expiresAt;
};

export const getRemainingTokenTime = (
  expiresAt: number | null
): number | null => {
  if (!expiresAt) return null;
  return Math.max(0, expiresAt - Date.now());
};

export const formatTimeRemaining = (ms: number): string => {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const isTokenExpiringSoon = (
  expiresAt: number | null,
  minutes = 15
): boolean => {
  if (!expiresAt) return false;
  const timeLeft = expiresAt - Date.now();
  return timeLeft > 0 && timeLeft < minutes * 60 * 1000;
};
