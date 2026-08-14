import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { pb } from './pocketbase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function regjistroPerNjoftime() {
  let token;

  if (Device.isDevice) {
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
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'de2baec7-3257-424a-b954-f1d958453fc9', // Nga app.json
    })).data;
    console.log("Push Token:", token);
  } else {
    console.log('Duhet një pajisje reale për njoftimet Push');
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

  // Ruajmë token-in në PocketBase nëse përdoruesi është i loguar
  if (pb.authStore.model && token) {
    try {
      await pb.collection('users').update(pb.authStore.model.id, {
        pushToken: token,
      });
    } catch (e) {
      console.error("Gabim gjatë ruajtjes së Push Token:", e);
    }
  }

  return token;
}
