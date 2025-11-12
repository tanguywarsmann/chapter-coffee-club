import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vread.app',
  appName: 'VREAD',
  webDir: 'dist',
  server: { 
    // Hot-reload en développement (uniquement en mode dev)
    url: process.env.NODE_ENV === 'development' 
      ? 'https://96648d18-46e6-4470-859c-132d87266a72.lovableproject.com?forceHideBadge=true'
      : undefined,
    cleartext: true,
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