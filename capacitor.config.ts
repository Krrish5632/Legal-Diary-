import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legalpro.diary',
  appName: 'Legal Diary Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
