import {
  EDMONTON_SERVICES,
  MeteredTaxiRates,
  RideshareRates,
  Service,
} from './rates';

export type Trip = {
  /** Driving distance in kilometres, from a maps routing service. */
  distanceKm: number;
  /** Expected driving time in minutes, from a maps routing service. */
  durationMin: number;
};

export type FareEstimate = {
  service: Service;
  /** Most likely fare, in Canadian dollars. */
  fare: number;
  /** Likely range, in Canadian dollars. Does not include surge pricing or tips. */
  low: number;
  high: number;
};

// Share of a trip a taxi spends stopped or crawling, when the meter charges
// for time instead of distance. Low for a clear run, high for rush hour.
const TAXI_WAITING_SHARE = { low: 0.1, typical: 0.2, high: 0.3 };

// Uber and Lyft prices move with demand even without a surge, and our rates
// for them are estimates, so give a wider band than for taxis.
const RIDESHARE_BAND = { low: 0.9, high: 1.2 };

const roundToCents = (amount: number) => Math.round(amount * 100) / 100;

export function rideshareFare(trip: Trip, rates: RideshareRates): number {
  const metered =
    rates.baseFare + rates.perKm * trip.distanceKm + rates.perMinute * trip.durationMin;
  return roundToCents(Math.max(metered, rates.minimumFare) + rates.bookingFee);
}

export function taxiFare(trip: Trip, rates: MeteredTaxiRates, waitingShare: number): number {
  const metres = trip.distanceKm * 1000;
  const increments = Math.max(0, Math.ceil((metres - rates.incrementMetres) / rates.incrementMetres));
  const waitingHours = (trip.durationMin * waitingShare) / 60;
  const metered =
    rates.initialCharge + increments * rates.incrementCharge + waitingHours * rates.waitingPerHour;
  return roundToCents(metered * (1 + rates.fuelSurcharge));
}

export function estimateFare(trip: Trip, service: Service): FareEstimate {
  const { rates } = service;
  if (rates.kind === 'metered-taxi') {
    return {
      service,
      fare: taxiFare(trip, rates, TAXI_WAITING_SHARE.typical),
      low: taxiFare(trip, rates, TAXI_WAITING_SHARE.low),
      high: taxiFare(trip, rates, TAXI_WAITING_SHARE.high),
    };
  }
  const fare = rideshareFare(trip, rates);
  return {
    service,
    fare,
    low: roundToCents(fare * RIDESHARE_BAND.low),
    high: roundToCents(fare * RIDESHARE_BAND.high),
  };
}

/** Estimates for every service, cheapest first. */
export function estimateAll(
  trip: Trip,
  services: Service[] = EDMONTON_SERVICES,
  minSeats = 1,
): FareEstimate[] {
  if (!(trip.distanceKm >= 0) || !(trip.durationMin >= 0)) {
    throw new Error('Trip distance and duration must be zero or more');
  }
  return services
    .filter((service) => service.seats >= minSeats)
    .map((service) => estimateFare(trip, service))
    .sort((a, b) => a.fare - b.fare);
}
