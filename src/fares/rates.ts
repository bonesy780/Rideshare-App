// Fare rules for each service in Edmonton.
//
// Taxi rates come from the City of Edmonton Vehicle for Hire Bylaw 17400,
// Schedule A (consolidated April 1, 2025):
// https://webdocs.edmonton.ca/bylaws/17400-Vehicle-for-Hire-Bylaw-C-20250401.pdf
//
// Uber and Lyft do not publish Edmonton rate cards, so their numbers are
// starting values to be calibrated against real quotes from the apps.
// Update `checked` whenever a value is confirmed.

export type MeteredTaxiRates = {
  kind: 'metered-taxi';
  /** Charge when the meter starts, covering the first `incrementMetres`. */
  initialCharge: number;
  incrementMetres: number;
  /** Charge for each further `incrementMetres` driven. */
  incrementCharge: number;
  /** Charge per hour while stopped or in slow traffic. */
  waitingPerHour: number;
  /** Extra percentage on the metered fare, e.g. 0.1329 for 13.29%. */
  fuelSurcharge: number;
};

export type RideshareRates = {
  kind: 'rideshare';
  baseFare: number;
  perKm: number;
  perMinute: number;
  /** Flat fee added to every trip, after the minimum fare is applied. */
  bookingFee: number;
  minimumFare: number;
};

export type Service = {
  id: string;
  name: string;
  /** Which app or company provides the ride. */
  provider: 'uber' | 'lyft' | 'taxi';
  seats: number;
  rates: MeteredTaxiRates | RideshareRates;
  /** 'official' means taken from a published source; 'estimated' means a guess to calibrate. */
  confidence: 'official' | 'estimated';
  /** Date (YYYY-MM-DD) the rates were last checked. */
  checked: string;
};

export const EDMONTON_SERVICES: Service[] = [
  {
    id: 'uberx',
    name: 'UberX',
    provider: 'uber',
    seats: 4,
    rates: {
      kind: 'rideshare',
      baseFare: 2.75,
      perKm: 0.95,
      perMinute: 0.22,
      bookingFee: 2.75,
      minimumFare: 8.0,
    },
    confidence: 'estimated',
    checked: '2026-11-14',
  },
  {
    id: 'uberxl',
    name: 'UberXL',
    provider: 'uber',
    seats: 6,
    rates: {
      kind: 'rideshare',
      baseFare: 4.5,
      perKm: 1.55,
      perMinute: 0.35,
      bookingFee: 2.75,
      minimumFare: 12.0,
    },
    confidence: 'estimated',
    checked: '2026-11-14',
  },
  {
    id: 'lyft',
    name: 'Lyft',
    provider: 'lyft',
    seats: 4,
    rates: {
      kind: 'rideshare',
      baseFare: 2.5,
      perKm: 0.92,
      perMinute: 0.21,
      bookingFee: 2.75,
      minimumFare: 7.5,
    },
    confidence: 'estimated',
    checked: '2026-11-14',
  },
  {
    id: 'lyft-xl',
    name: 'Lyft XL',
    provider: 'lyft',
    seats: 6,
    rates: {
      kind: 'rideshare',
      baseFare: 4.25,
      perKm: 1.5,
      perMinute: 0.34,
      bookingFee: 2.75,
      minimumFare: 11.5,
    },
    confidence: 'estimated',
    checked: '2026-11-14',
  },
  {
    id: 'taxi',
    name: 'Taxi (metered)',
    provider: 'taxi',
    seats: 4,
    rates: {
      kind: 'metered-taxi',
      initialCharge: 4.1,
      incrementMetres: 135,
      incrementCharge: 0.25,
      waitingPerHour: 30.0,
      // Temporary surcharge approved by City Council in July 2022. Set to 0
      // if the City confirms it has ended.
      fuelSurcharge: 0.1329,
    },
    confidence: 'official',
    checked: '2026-11-14',
  },
];
