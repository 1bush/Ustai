import { pb } from './pocketbase';

/**
 * Shton kategoritë e reja në PocketBase nëse nuk ekzistojnë.
 */
export async function seedCategories() {
  const kategoriteEReja = [
    { emri: 'Arkitekt', ikona: '🏛️' },
    { emri: 'Interior Design', ikona: '🛋️' },
    { emri: 'Izolime Taracash', ikona: '🏠' }
  ];

  try {
    const ekzistueset = await pb.collection('categories').getFullList({
      sort: 'emri'
    });

    for (const kat of kategoriteEReja) {
      const gjetur = ekzistueset.find(e => e.emri.toLowerCase() === kat.emri.toLowerCase());

      if (!gjetur) {
        console.log(`Duke shtuar kategorinë e re: ${kat.emri}`);
        await pb.collection('categories').create(kat);
      }
    }
  } catch (error) {
    console.error('Gabim gjatë seeding të kategorive:', error);
  }
}
