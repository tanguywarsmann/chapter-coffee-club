import { LocalNotifications } from '@capacitor/local-notifications';

export async function askNotifPermission() {
  const { display } = await LocalNotifications.checkPermissions();
  if (display !== 'granted') {
    await LocalNotifications.requestPermissions();
  }
}

export async function scheduleDailyReadingReminder(hour = 20, minute = 0) {
  await LocalNotifications.schedule({
    notifications: [{
      id: 1001,
      title: 'VREAD',
      body: '20 minutes de lecture ce soir 📚',
      schedule: { 
        repeats: true, 
        on: { hour, minute } 
      },
      smallIcon: 'ic_stat_icon_config_sample'
    }]
  });
}

export async function cancelDailyReminder() {
  await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
}

export async function checkNotificationEnabled(): Promise<boolean> {
  const { display } = await LocalNotifications.checkPermissions();
  return display === 'granted';
}