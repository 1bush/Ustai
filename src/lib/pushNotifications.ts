import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
      lightColor: '#FF7A1A',
    });
  }

  // Ruajtja e token-it në server është HEQUR (PocketBase mock).
  // Kur rikthehet serveri real, rivendos bllokun nga pocketbase.ts.REAL.BAK
  // if (pb.authStore.model && token) { ... }

  return token;
}
