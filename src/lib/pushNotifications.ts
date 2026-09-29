import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { pb, isPocketBaseConfigured } from './pocketbase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function regjistroPerNjoftime() {
  let token;

  if (!Device.isDevice) return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Dështoi marrja e lejes për njoftime!');
      return false;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'de2baec7-3257-424a-b954-f1d958453fc9', // Nga app.json
      })).data;
    } catch (e) {
      // OFFLINE: marrja e token-it kërkon internet (Expo/FCM). Nuk është fatale —
      // app-i vazhdon normalisht, thjesht pa njoftime push.
      console.warn('Token-i push nuk u mor (pa internet?):', e);
      return false;
    }
  } catch (e) {
    // Asnjë gabim i njoftimeve nuk duhet të prishë nisjen e app-it offline.
    console.warn('regjistroPerNjoftime dështoi:', e);
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E11D2E',
    });
  }

  // Persist the device token in PocketBase when a real backend is configured.
  if (isPocketBaseConfigured && pb.authStore.model) {
    try {
      const record = {
        user_id: pb.authStore.model.id,
        token,
        platform: Platform.OS,
        device_id: null,
        updated_at: new Date().toISOString(),
      };
      const existing = await pb.collection('device_tokens').getFirstListItem(
        `user_id = "${pb.authStore.model.id}" && token = "${token}"`
      );
      if (existing) await pb.collection('device_tokens').update(existing.id, record);
      else await pb.collection('device_tokens').create(record);
    } catch (error) {
      console.warn('Token-i push u mor, por nuk u ruajt në server.', error);
    }
  }

  return token;
}
