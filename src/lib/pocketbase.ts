import PocketBase, { AsyncAuthStore } from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const POCKETBASE_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Krijojmë një AsyncAuthStore që sinkronizohet automatikisht me AsyncStorage
const store = new AsyncAuthStore({
  save: async (batch) => AsyncStorage.setItem('pb_auth', batch),
  clear: async () => AsyncStorage.removeItem('pb_auth'),
});

export const pb = new PocketBase(POCKETBASE_URL, store);

// Ngarkojmë sesionin fillestar (nëse ka) në mënyrë asinkrone
// Shënim: Nëse doni që App të presë për këtë, duhet ta bëni await në App.tsx
AsyncStorage.getItem('pb_auth').then((data) => {
  if (data) {
    pb.authStore.loadFromCookie(data);
  }
});

export default pb;
