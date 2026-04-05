export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;

  return Boolean((window as Window & { Capacitor?: unknown }).Capacitor);
};

export const isIOSNativeApp = (): boolean => {
  if (!isNativeApp()) return false;

  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(userAgent);
};
