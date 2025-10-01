import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vread.app',
  appName: 'VREAD',
  webDir: 'dist',
  server: { 
    androidScheme: 'https',
    iosScheme: 'capacitor'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;