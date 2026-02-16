/**
 * Geolocation utilities
 * Haversine distance, speed conversion helpers
 */

/** Convert m/s to km/h */
export function msToKmh(ms: number): number {
  return ms * 3.6;
}

/** Convert km/h to mph */
export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

/** Haversine distance between two lat/lng in meters */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/** Format seconds as "Xh Ym" or "Xm Ys" */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

/** Format meters to readable distance */
export function formatDistance(meters: number, unit: 'kmh' | 'mph' = 'kmh'): string {
  if (unit === 'mph') {
    const miles = meters / 1609.34;
    return miles < 1 ? `${Math.round(miles * 5280)} ft` : `${miles.toFixed(1)} mi`;
  }
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

/** Format speed for display */
export function formatSpeed(kmh: number, unit: 'kmh' | 'mph' = 'kmh'): string {
  if (unit === 'mph') {
    return `${Math.round(kmhToMph(kmh))}`;
  }
  return `${Math.round(kmh)}`;
}

/** Speed unit label */
export function speedUnitLabel(unit: 'kmh' | 'mph'): string {
  return unit === 'kmh' ? 'km/h' : 'mph';
}
