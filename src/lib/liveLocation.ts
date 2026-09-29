import * as Location from 'expo-location';
import { pb } from '@/lib/pocketbase';

// Thirre këtë kur ustai hap app-in / e vë veten "aktiv".
// Përditëson lokacionin çdo herë që lëviz > 100m ose çdo 5 min.

/** Abonimet aktive — që thirrja e dytë të mos krijojë abonim të dyfishtë. */
const abonime = new Set<Location.LocationSubscription>();

/** Ndalon TË GJITHË abonimet e lokacionit. Thirrë kur ekrani mbyllet ose dalet. */
export function ndalNdjekjenELokacionit() {
  abonime.forEach((ab) => {
    try {
      ab.remove();
    } catch (error) {
      console.warn('Abonimi i lokacionit nuk u hoq.', error);
    }
  });
  abonime.clear();
}

export async function fillojNdjekjenELokacionit() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 100, timeInterval: 300000 },
      async (pozicioni) => {
        try {
          if (!pb.authStore.model) return;
          const userId = pb.authStore.model.id;

          const res = await pb.collection('ustai_locations').getList(1, 1, {
            filter: `ustai_id = '${userId}'`
          });
          const existing = res.items[0];

          const payload = {
            ustai_id: userId,
            vendndodhja: JSON.stringify({
              lng: pozicioni.coords.longitude,
              lat: pozicioni.coords.latitude
            }),
            eshte_aktiv: true,
            perditesuar_me: new Date().toISOString(),
          };

          if (existing) {
            await pb.collection('ustai_locations').update(existing.id, payload);
          } else {
            await pb.collection('ustai_locations').create(payload);
          }
        } catch (e) {
          console.error('Gabim në përditësimin e lokacionit:', e);
        }
      }
    );

    abonime.add(subscription);
    return subscription;
  } catch (error) {
    console.warn('Ndjekja e lokacionit nuk u nis.', error);
    return null;
  }
}

export async function ndaloNdjekjenELokacionit(userId: string) {
  try {
    const res = await pb.collection('ustai_locations').getList(1, 1, {
      filter: `ustai_id = '${userId}'`
    });
    const existing = res.items[0];
    if (existing) {
      await pb.collection('ustai_locations').update(existing.id, { eshte_aktiv: false });
    }
  } catch (e) {
    console.error('Gabim në ndalimin e lokacionit:', e);
  }
}
