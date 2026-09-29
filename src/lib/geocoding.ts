/**
 * Shërbim Geocoding FALAS duke përdorur Nominatim (OpenStreetMap).
 * Nuk kërkon API Key.
 */

export interface GeocodeResult {
  placeName: string;
  coordinates: [number, number]; // [lng, lat]
  context?: any;
}

export class GeocodingService {
  private static readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
  private static lastRequest = 0;
  private static readonly TIMEOUT_MS = 12000;

  /**
   * Rezervon fole 1-sekondëshe për Nominatim. Serializohet me zinxhir promises
   * që thirrjet paralele të mos dalin njëkohësisht (Nominatim na bllokon me 429).
   */
  private static rrjedhje: Promise<any> = Promise.resolve();
  private static async rezervoSlot() {
    const vazhdo = this.rrjedhje.then(async () => {
      const prisja = Math.max(0, 1000 - (Date.now() - this.lastRequest));
      if (prisja > 0) await new Promise(r => setTimeout(r, prisja));
      this.lastRequest = Date.now();
    });
    // Zinxhiri nuk thyhet edhe nëse një thirrje dështon.
    this.rrjedhje = vazhdo.catch(() => {});
    return vazhdo;
  }

  private static async krijoKontrolluesin(timeoutMs: number) {
    const kontrolluesi = new AbortController();
    const timer = setTimeout(() => kontrolluesi.abort(), timeoutMs);
    return { kontrolluesi, pastro: () => clearTimeout(timer) };
  }

  /** Konverton "lon"/"lat" në numra; kthen null nëse janë të pavlefshëm. */
  private static koordinata(item: any): [number, number] | null {
    const lng = parseFloat(item?.lon);
    const lat = parseFloat(item?.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return [lng, lat];
  }

  /**
   * Geocoding: Kthe adresën në koordinata
   * Përdor Nominatim (OpenStreetMap) - 100% falas, 1 request/sekond
   */
  static async geocode(query: string): Promise<GeocodeResult | null> {
    try {
      await this.rezervoSlot();

      const url = `${this.NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      const { kontrolluesi, pastro } = await this.krijoKontrolluesin(this.TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(url, {
          headers: { 'User-Agent': 'UstaiApp/1.0' },
          signal: kontrolluesi.signal,
        });
      } finally {
        pastro();
      }

      if (!response.ok) {
        console.warn(`Nominatim ktheu HTTP ${response.status}.`);
        return null;
      }
      const data = await response.json();

      if (data && data.length > 0) {
        const item = data[0];
        const coordinates = this.koordinata(item);
        if (!coordinates) return null;
        return {
          placeName: item.display_name,
          coordinates,
          context: item.address,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding Error:', error);
      return null;
    }
  }

  /**
   * Autocomplete Search me Nominatim
   */
  static async searchPlaces(query: string, _proximity?: [number, number]) {
    try {
      await this.rezervoSlot();

      const url = `${this.NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const { kontrolluesi, pastro } = await this.krijoKontrolluesin(this.TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(url, {
          headers: { 'User-Agent': 'UstaiApp/1.0' },
          signal: kontrolluesi.signal,
        });
      } finally {
        pastro();
      }

      if (!response.ok) return [];
      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data
        .map((f: any) => {
          const coordinates = this.koordinata(f);
          return coordinates
            ? { name: f.display_name, coordinates, category: f.type }
            : null;
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Geocoding Search Error:', error);
      return [];
    }
  }

  /**
   * Batch Geocoding — serial, që të respektohet limiti 1/sek.
   */
  static async batchGeocode(addresses: string[]) {
    const results: (GeocodeResult | null)[] = [];
    for (const addr of addresses) {
      results.push(await this.geocode(addr));
    }
    return results.map((res, i) => ({
      input: addresses[i],
      result: res ? res.coordinates : null,
    }));
  }
}
