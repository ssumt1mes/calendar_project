import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dhwoo.liquidcalendar',
  appName: 'Liquid Glass Calendar',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'https'
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
