import { Trip } from '../fares/estimate';
import { Place } from './types';

// Driving distance and time come from the free OSRM demo server, which needs
// no API key but is meant for light use. Swap in Google or Mapbox directions
// before a public launch.
// https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

// OSRM assumes empty roads. City trips take longer with lights and traffic,
// so stretch its time to match what the ride apps quote.
const CITY_TRAFFIC_FACTOR = 1.25;

type OsrmResponse = {
  code: string;
  routes?: { distance: number; duration: number }[];
};

export function buildRouteUrl(from: Place, to: Place): string {
  // OSRM takes longitude first.
  const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  return `${OSRM_URL}/${coords}?overview=false`;
}

export function parseRoute(response: OsrmResponse): Trip {
  const route = response.routes?.[0];
  if (response.code !== 'Ok' || !route) {
    throw new Error('No driving route found between those places');
  }
  return {
    distanceKm: Math.round(route.distance / 10) / 100,
    durationMin: Math.round((route.duration / 60) * CITY_TRAFFIC_FACTOR),
  };
}

export async function getTrip(from: Place, to: Place): Promise<Trip> {
  const response = await fetch(buildRouteUrl(from, to));
  if (!response.ok) {
    throw new Error(`Route lookup failed (${response.status})`);
  }
  return parseRoute(await response.json());
}
