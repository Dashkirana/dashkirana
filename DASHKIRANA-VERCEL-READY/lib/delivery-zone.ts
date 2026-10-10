export interface DeliveryLocation {
  latitude: number;
  longitude: number;
}

export interface DeliveryZone {
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

// Initial reference points only — these are NOT the final delivery boundary.
export const DELIVERY_REFERENCES: DeliveryZone[] = [
  {
    name: 'RTC Complex',
    latitude: 17.7345,
    longitude: 83.3012,
    radiusKm: 1,
  },
  {
    name: 'Madhavadhara',
    latitude: 17.7475,
    longitude: 83.2735,
    radiusKm: 1,
  },
];

function distanceKm(
  pointA: DeliveryLocation,
  pointB: DeliveryLocation
): number {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(pointB.latitude - pointA.latitude);
  const dLon = toRadians(pointB.longitude - pointA.longitude);

  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isInsideDeliveryZone(
  location: DeliveryLocation
): boolean {
  return DELIVERY_REFERENCES.some(
    (reference) =>
      distanceKm(location, reference) <= reference.radiusKm
  );
}
