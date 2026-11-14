import { Place } from './types';

// Address search uses OpenStreetMap's free Nominatim service, which needs no
// API key. Its usage policy allows about one search per second and asks apps
// to identify themselves, which is fine for testing with friends. Before a
// public launch, switch to a paid provider such as Google Places or Mapbox.
// https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'rideshare-app (github.com/bonesy780/rideshare-app)';

// Greater Edmonton, including St. Albert, Sherwood Park and the airport.
// Order is west, north, east, south.
const EDMONTON_VIEWBOX = '-113.85,53.75,-113.20,53.25';

type NominatimResult = {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
};

export function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'ca',
    viewbox: EDMONTON_VIEWBOX,
    bounded: '1',
  });
  return `${NOMINATIM_URL}?${params.toString()}`;
}

export function parseSearchResults(results: NominatimResult[]): Place[] {
  return results
    .map((result) => {
      const parts = result.display_name.split(',').map((part) => part.trim());
      return {
        name: result.name || parts[0],
        address: parts.slice(0, 4).join(', '),
        latitude: Number(result.lat),
        longitude: Number(result.lon),
      };
    })
    .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const response = await fetch(buildSearchUrl(trimmed), {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Address search failed (${response.status})`);
  }
  return parseSearchResults(await response.json());
}
