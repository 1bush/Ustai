import { pb } from './pocketbase';

/**
 * Bën seed të kategorive bazë në PocketBase (vetëm nëse serveri funksionon).
 * Mund të thërret eta nga ekranet e hyrjes ose nga AdminTestScreen.
 */
export async function seedCategories() {
  if (!pb) return;

  try {
    const existing = await pb.collection('categories').getList(1, 1);
    if (existing.totalItems > 0) return; // Të gjitha kategoritë ekzistojnë

    const kategorite = [
      { emri: 'Rregullimi dhe Lajmimi', ikona: '🔧' },
      { emri: 'Dhomat (Kuzhina, Tualeti, Dhome Gjumi)', ikona: '🏠' },
      { emri: 'Tokësirat dhe Pestat', ikona: '🌍' },
      { emri: 'Diturie Elektronike', ikona: '⚡' },
      { emri: 'Lartësia dhe Ftohtësia', ikona: '❄️' },
      { emri: 'Aksesueshmëria', ikona: '♿' },
    ];

    for (const kat of kategorite) {
      try {
        await pb.collection('categories').create(kat);
      } catch {
        // Ndonjëherë ka konflikt — thyhet xorë e vazhdo
      }
    }
  } catch (e) {
    console.warn('seedCategories dështoi (mund të jetë offline):', e);
  }
}
