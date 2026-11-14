/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bookingLink, lyftLink, uberLink } from '../booking/links';
import { EDMONTON_SERVICES } from '../fares/rates';
import { buildSearchUrl, parseSearchResults } from './geocode';
import { buildRouteUrl, parseRoute } from './route';
import { Place } from './types';

const downtown: Place = {
  name: 'Churchill Square',
  address: 'Churchill Square, Downtown, Edmonton',
  latitude: 53.5444,
  longitude: -113.4909,
};
const kingsway: Place = {
  name: 'Kingsway Mall',
  address: 'Kingsway Mall, Kingsway NW, Edmonton',
  latitude: 53.5627,
  longitude: -113.5065,
};

test('address search is limited to the Edmonton area', () => {
  const url = new URL(buildSearchUrl('Kingsway Mall'));
  assert.equal(url.searchParams.get('q'), 'Kingsway Mall');
  assert.equal(url.searchParams.get('bounded'), '1');
  assert.equal(url.searchParams.get('countrycodes'), 'ca');
});

test('search results become places, skipping bad coordinates', () => {
  const places = parseSearchResults([
    {
      lat: '53.5627',
      lon: '-113.5065',
      name: 'Kingsway Mall',
      display_name: 'Kingsway Mall, 109 Street NW, Spruce Avenue, Edmonton, Alberta, Canada',
    },
    { lat: 'x', lon: '-113', display_name: 'Broken' },
  ]);
  assert.equal(places.length, 1);
  assert.equal(places[0].name, 'Kingsway Mall');
  assert.equal(places[0].address, 'Kingsway Mall, 109 Street NW, Spruce Avenue, Edmonton');
  assert.equal(places[0].latitude, 53.5627);
});

test('search result without a name uses the first part of the address', () => {
  const [place] = parseSearchResults([
    { lat: '53.5', lon: '-113.5', display_name: '10220 104 Avenue NW, Downtown, Edmonton' },
  ]);
  assert.equal(place.name, '10220 104 Avenue NW');
});

test('route URL puts longitude before latitude', () => {
  assert.ok(buildRouteUrl(downtown, kingsway).includes('/-113.4909,53.5444;-113.5065,53.5627?'));
});

test('route converts metres and seconds, adding time for city traffic', () => {
  const trip = parseRoute({ code: 'Ok', routes: [{ distance: 4237, duration: 480 }] });
  assert.equal(trip.distanceKm, 4.24);
  assert.equal(trip.durationMin, 10);
});

test('route with no result is an error', () => {
  assert.throws(() => parseRoute({ code: 'NoRoute', routes: [] }));
});

test('Uber link fills in pickup and drop-off', () => {
  const url = new URL(uberLink(downtown, kingsway));
  assert.equal(url.host, 'm.uber.com');
  assert.equal(url.searchParams.get('action'), 'setPickup');
  assert.equal(url.searchParams.get('pickup[latitude]'), '53.5444');
  assert.equal(url.searchParams.get('dropoff[longitude]'), '-113.5065');
  assert.equal(url.searchParams.get('dropoff[nickname]'), 'Kingsway Mall');
});

test('Lyft link fills in pickup and destination', () => {
  const url = new URL(lyftLink(downtown, kingsway));
  assert.equal(url.host, 'lyft.com');
  assert.equal(url.searchParams.get('pickup[longitude]'), '-113.4909');
  assert.equal(url.searchParams.get('destination[latitude]'), '53.5627');
});

test('every Uber and Lyft service has a booking link, taxis do not', () => {
  for (const service of EDMONTON_SERVICES) {
    const link = bookingLink(service, downtown, kingsway);
    assert.equal(link === null, service.provider === 'taxi', service.id);
  }
});
