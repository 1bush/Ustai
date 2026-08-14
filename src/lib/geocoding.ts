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

  /**
   * Geocoding: Kthe adresën në koordinata
   * Përdor Nominatim (OpenStreetMap) - 100% falas, 1 request/sekond
   */
  static async geocode(query: string): Promise<GeocodeResult | null> {
    try {
      // Rate limiting: max 1 request per second
      const now = Date.now();
      const wait = Math.max(0, 1000 - (now - this.lastRequest));
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      this.lastRequest = Date.now();

      const url = `${this.NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'UstaiApp/1.0' }
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const item = data[0];
        return {
          placeName: item.display_name,
          coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
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
      const now = Date.now();
      const wait = Math.max(0, 1000 - (now - this.lastRequest));
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      this.lastRequest = Date.now();

      let url = `${this.NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'UstaiApp/1.0' }
      });
      const data = await response.json();

      if (!data) return [];

      return data.map((f: any) => ({
        name: f.display_name,
        coordinates: [parseFloat(f.lon), parseFloat(f.lat)],
        category: f.type,
      }));
    } catch (error) {
      console.error('Geocoding Search Error:', error);
      return [];
    }
  }

  /**
   * Batch Geocoding
   */
  static async batchGeocode(addresses: string[]) {
    const requests = addresses.map((addr) => this.geocode(addr));
    const results = await Promise.all(requests);
    return results.map((res, i) => ({
      input: addresses[i],
      result: res ? res.coordinates : null,
    }));
  }
}
