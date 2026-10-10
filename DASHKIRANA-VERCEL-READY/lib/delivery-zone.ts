export interface DeliveryLocation {
  latitude: number;
  longitude: number;
}

// Temporary corridor settings.
// These points define a rough straight-line corridor, not verified road boundaries.
const CORRIDOR = {
  start: { latitude: 17.7345, longitude: 83.3012 },
  end: { latitude: 17.7475, longitude: 83.2735 },
  halfWidthKm: 1.5,
};

function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function pointToSegmentDistanceKm(
  point: DeliveryLocation,
  start: DeliveryLocation,
  end: DeliveryLocation
): number {
  const referenceLat = (start.latitude + end.latitude) / 2;
  const kmPerDegreeLat = 111.32;
  const kmPerDegreeLon =
    111.32 * Math.cos((referenceLat * Math.PI) / 180);

  const px = point.longitude * kmPerDegreeLon;
  const py = point.latitude * kmPerDegreeLat;
  const ax = start.longitude * kmPerDegreeLon;
  const ay = start.latitude * kmPerDegreeLat;
  const bx = end.longitude * kmPerDegreeLon;
  const by = end.latitude * kmPerDegreeLat;

  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;

  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared)
        );

  const closest = {
    latitude: (ay + t * dy) / kmPerDegreeLat,
    longitude: (ax + t * dx) / kmPerDegreeLon,
  };

  return distanceKm(point, closest);
}

export function isInsideDeliveryZone(
  location: DeliveryLocation
): boolean {
  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude) ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    location.longitude < -180 ||
    location.longitude > 180
  ) {
    return false;
  }

  const distance = pointToSegmentDistanceKm(
    location,
    CORRIDOR.start,
    CORRIDOR.end
  );

  return distance <= CORRIDOR.halfWidthKm;
}
