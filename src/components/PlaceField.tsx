import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { searchPlaces } from '../places/geocode';
import { Place } from '../places/types';

type Props = {
  label: string;
  placeholder: string;
  place: Place | null;
  onChange: (place: Place | null) => void;
};

export function PlaceField({ label, placeholder, place, onChange }: Props) {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function search() {
    if (!text.trim()) return;
    setSearching(true);
    setMessage(null);
    try {
      const found = await searchPlaces(text);
      setResults(found);
      if (found.length === 0) setMessage('No matches in Edmonton. Try a street address.');
    } catch {
      setMessage("Couldn't search right now. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  if (place) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.chosen}>
          <View style={styles.chosenText}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeAddress} numberOfLines={1}>
              {place.address}
            </Text>
          </View>
          <Pressable onPress={() => onChange(null)} hitSlop={8}>
            <Text style={styles.link}>Change</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          returnKeyType="search"
          onSubmitEditing={search}
          autoCorrect={false}
        />
        <Pressable style={styles.searchButton} onPress={search} disabled={searching}>
          {searching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </Pressable>
      </View>
      {message && <Text style={styles.message}>{message}</Text>}
      {results.map((result) => (
        <Pressable
          key={`${result.latitude},${result.longitude}`}
          style={styles.result}
          onPress={() => {
            onChange(result);
            setResults([]);
            setText('');
          }}
        >
          <Text style={styles.placeName}>{result.name}</Text>
          <Text style={styles.placeAddress} numberOfLines={1}>
            {result.address}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonText: { color: '#fff', fontWeight: '600' },
  message: { color: '#a33', marginTop: 6 },
  result: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  chosen: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  chosenText: { flex: 1, marginRight: 12 },
  placeName: { fontSize: 16, fontWeight: '600' },
  placeAddress: { fontSize: 13, color: '#666', marginTop: 2 },
  link: { color: '#0a66c2', fontWeight: '600' },
});
