import { Service } from '../fares/rates';
import { Place } from '../places/types';

// Links that open each app with the trip filled in. Both are web links that
// open the app when it is installed and the mobile website when it is not.
// The rider still picks the ride size (e.g. XL) and confirms in the app.

function query(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}

export function uberLink(from: Place, to: Place): string {
  return `https://m.uber.com/ul/?${query({
    action: 'setPickup',
    'pickup[latitude]': from.latitude,
    'pickup[longitude]': from.longitude,
    'pickup[nickname]': from.name,
    'dropoff[latitude]': to.latitude,
    'dropoff[longitude]': to.longitude,
    'dropoff[nickname]': to.name,
  })}`;
}

export function lyftLink(from: Place, to: Place): string {
  return `https://lyft.com/ride?${query({
    id: 'lyft',
    'pickup[latitude]': from.latitude,
    'pickup[longitude]': from.longitude,
    'destination[latitude]': to.latitude,
    'destination[longitude]': to.longitude,
  })}`;
}

/** Link to book this service, or null when it has no app to open (e.g. taxis). */
export function bookingLink(service: Service, from: Place, to: Place): string | null {
  switch (service.provider) {
    case 'uber':
      return uberLink(from, to);
    case 'lyft':
      return lyftLink(from, to);
    default:
      return null;
  }
}
