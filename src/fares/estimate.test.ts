/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { estimateAll, rideshareFare, taxiFare } from './estimate';
import { MeteredTaxiRates, RideshareRates } from './rates';

const taxiRates: MeteredTaxiRates = {
  kind: 'metered-taxi',
  initialCharge: 4.1,
  incrementMetres: 135,
  incrementCharge: 0.25,
  waitingPerHour: 30,
  fuelSurcharge: 0,
};

const rideshareRates: RideshareRates = {
  kind: 'rideshare',
  baseFare: 2,
  perKm: 1,
  perMinute: 0.2,
  bookingFee: 3,
  minimumFare: 8,
};

test('taxi charges only the initial amount for the first 135 metres', () => {
  assert.equal(taxiFare({ distanceKm: 0.135, durationMin: 0 }, taxiRates, 0), 4.1);
});

test('taxi charges a full increment for any part of the next 135 metres', () => {
  assert.equal(taxiFare({ distanceKm: 0.136, durationMin: 0 }, taxiRates, 0), 4.35);
  assert.equal(taxiFare({ distanceKm: 0.27, durationMin: 0 }, taxiRates, 0), 4.35);
});

test('taxi 10 km trip with no waiting matches the bylaw meter', () => {
  // 10,000 m: first 135 m, then 74 more increments (73.07 rounded up).
  assert.equal(taxiFare({ distanceKm: 10, durationMin: 0 }, taxiRates, 0), 22.6);
});

test('taxi adds waiting time and fuel surcharge', () => {
  // 20 minutes at 30% waiting = 6 minutes = $3.00.
  const withWaiting = taxiFare({ distanceKm: 10, durationMin: 20 }, taxiRates, 0.3);
  assert.equal(withWaiting, 25.6);
  const withSurcharge = taxiFare(
    { distanceKm: 10, durationMin: 20 },
    { ...taxiRates, fuelSurcharge: 0.1329 },
    0.3,
  );
  assert.equal(withSurcharge, 29.0);
});

test('rideshare adds base, distance, time and booking fee', () => {
  // 2 + 10 + 4 = 16, plus 3 booking fee.
  assert.equal(rideshareFare({ distanceKm: 10, durationMin: 20 }, rideshareRates), 19);
});

test('rideshare applies the minimum fare before the booking fee', () => {
  assert.equal(rideshareFare({ distanceKm: 1, durationMin: 2 }, rideshareRates), 11);
});

test('estimateAll sorts cheapest first and keeps ranges around the fare', () => {
  const estimates = estimateAll({ distanceKm: 8, durationMin: 15 });
  assert.ok(estimates.length >= 3);
  for (let i = 1; i < estimates.length; i++) {
    assert.ok(estimates[i - 1].fare <= estimates[i].fare);
  }
  for (const e of estimates) {
    assert.ok(e.low <= e.fare && e.fare <= e.high, e.service.id);
  }
});

test('estimateAll can require larger vehicles', () => {
  const estimates = estimateAll({ distanceKm: 8, durationMin: 15 }, undefined, 5);
  assert.ok(estimates.length > 0);
  assert.ok(estimates.every((e) => e.service.seats >= 5));
});

test('estimateAll rejects impossible trips', () => {
  assert.throws(() => estimateAll({ distanceKm: -1, durationMin: 5 }));
  assert.throws(() => estimateAll({ distanceKm: Number.NaN, durationMin: 5 }));
});
