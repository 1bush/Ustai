const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export interface GeocodeResult {
  placeName: string;
  coordinates: [number, number]; // [lng, lat]
  context?: any;
}

export class GeocodingService {
  /**
   * Geocoding: Kthe adresën në koordinata
   */
  static async geocode(query: string): Promise<GeocodeResult | null> {
    if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN.includes('Placeholder')) {
      console.warn('Mapbox Token mungon. Kërkimi nuk do të funksionojë.');
      return null;
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1&types=address,place`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          placeName: feature.place_name,
          coordinates: feature.center,
          context: feature.context,
        };
      }
      return null;
    } catch (error) {
      console.error('Mapbox Geocoding Error:', error);
      return null;
    }
  }

  /**
   * Autocomplete Search
   */
  static async searchPlaces(query: string, proximity?: [number, number]) {
    if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN.includes('Placeholder')) {
      return [];
    }

    try {
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&autocomplete=true&limit=5&types=poi,address,place`;

      if (proximity) {
        url += `&proximity=${proximity[0]},${proximity[1]}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.features) return [];

      return data.features.map((f: any) => ({
        name: f.place_name,
        coordinates: f.center,
        category: f.properties?.category,
      }));
    } catch (error) {
      console.error('Mapbox Search Error:', error);
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
