export type Place = {
  /** Short name to show in the app, e.g. "Kingsway Mall". */
  name: string;
  /** Full address, for telling similar places apart. */
  address: string;
  latitude: number;
  longitude: number;
};
