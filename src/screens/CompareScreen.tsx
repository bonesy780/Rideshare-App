import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { bookingLink } from '../booking/links';
import { PlaceField } from '../components/PlaceField';
import { estimateAll, FareEstimate, Trip } from '../fares/estimate';
import { getTrip } from '../places/route';
import { Place } from '../places/types';

const money = (amount: number) => `$${amount.toFixed(2)}`;

export function CompareScreen() {
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [bigCar, setBigCar] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Look up the route whenever both ends are chosen.
  useEffect(() => {
    setTrip(null);
    setError(null);
    if (!from || !to) return;
    let cancelled = false;
    setLoading(true);
    getTrip(from, to)
      .then((result) => !cancelled && setTrip(result))
      .catch(() => !cancelled && setError("Couldn't find a driving route. Try again in a moment."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const estimates = trip ? estimateAll(trip, undefined, bigCar ? 5 : 1) : [];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Rideshare</Text>
      <Text style={styles.subtitle}>Compare Uber, Lyft and taxi fares in Edmonton.</Text>

      <PlaceField label="From" placeholder="Pickup address or place" place={from} onChange={setFrom} />
      <PlaceField label="To" placeholder="Drop-off address or place" place={to} onChange={setTo} />

      <View style={styles.toggleRow}>
        {[
          { label: 'Any car', value: false },
          { label: '5+ seats', value: true },
        ].map((option) => (
          <Pressable
            key={option.label}
            style={[styles.toggle, bigCar === option.value && styles.toggleOn]}
            onPress={() => setBigCar(option.value)}
          >
            <Text style={[styles.toggleText, bigCar === option.value && styles.toggleTextOn]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator style={styles.spinner} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {trip && from && to && (
        <>
          <Text style={styles.tripSummary}>
            About {trip.distanceKm.toFixed(1)} km, {trip.durationMin} min
          </Text>
          {estimates.map((estimate, index) => (
            <EstimateRow
              key={estimate.service.id}
              estimate={estimate}
              cheapest={index === 0}
              link={bookingLink(estimate.service, from, to)}
            />
          ))}
          <Text style={styles.footnote}>
            Prices are estimates before tips. Uber and Lyft charge more when busy (surge
            pricing), so check the app before you book. Taxi prices use the City of Edmonton
            meter rates.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

function EstimateRow({
  estimate,
  cheapest,
  link,
}: {
  estimate: FareEstimate;
  cheapest: boolean;
  link: string | null;
}) {
  const { service } = estimate;
  return (
    <View style={[styles.card, cheapest && styles.cardCheapest]}>
      <View style={styles.cardText}>
        <Text style={styles.serviceName}>
          {service.name}
          {cheapest ? '  · Cheapest' : ''}
        </Text>
        <Text style={styles.fare}>{money(estimate.fare)}</Text>
        <Text style={styles.range}>
          Likely {money(estimate.low)} – {money(estimate.high)} · {service.seats} seats
        </Text>
      </View>
      {link ? (
        <Pressable style={styles.openButton} onPress={() => Linking.openURL(link)}>
          <Text style={styles.openButtonText}>Open</Text>
        </Pressable>
      ) : (
        <Text style={styles.noLink}>Hail or call</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 64, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: '700' },
  subtitle: { fontSize: 15, color: '#555', marginTop: 4, marginBottom: 24 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggle: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toggleOn: { backgroundColor: '#222', borderColor: '#222' },
  toggleText: { fontWeight: '600', color: '#333' },
  toggleTextOn: { color: '#fff' },
  spinner: { marginTop: 24 },
  error: { color: '#a33', marginTop: 12 },
  tripSummary: { fontSize: 14, color: '#555', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardCheapest: { borderColor: '#1a7f37', borderWidth: 2 },
  cardText: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600' },
  fare: { fontSize: 24, fontWeight: '700', marginTop: 2 },
  range: { fontSize: 13, color: '#666', marginTop: 2 },
  openButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  openButtonText: { color: '#fff', fontWeight: '600' },
  noLink: { fontSize: 13, color: '#666' },
  footnote: { fontSize: 12, color: '#777', marginTop: 12, lineHeight: 17 },
});
