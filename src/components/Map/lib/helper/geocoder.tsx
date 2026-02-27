import { LatLngExpression } from 'leaflet';
import Geohash from 'ngeohash';

function hashStringToNumber(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Bitwise OR ile 32-bit tamsayıya çevir
  }
  return Math.abs(hash);
}

/**
 * Deterministically generates a coordinate offset based on an ID.
 */
function getJitter(id: string | number, multiplier: number = 0.001): number {
  const hash = hashStringToNumber(String(id));
  return ((hash % 1000) / 1000 - 0.5) * multiplier;
}

export const decodeGeoHash = (item: any): LatLngExpression => {
  const hasRawLat = item?.location?.latitude !== undefined || item?.user?.location?.latitude !== undefined;
  const hasRawLng = item?.location?.longitude !== undefined || item?.user?.location?.longitude !== undefined;

  let baseLat =
    item?.location?.latitude ??
    item?.user?.location?.latitude ??
    0;

  let baseLng =
    item?.location?.longitude ??
    item?.user?.location?.longitude ??
    0;

  const id = item?.public_id || item?.id || "default";

  // If both coordinates were missing (or explicitly 0, which we treat as missing for this logic),
  // we "randomize" them globally (within a safe range) so they don't all stack at [0,0].
  if (!hasRawLat && !hasRawLng) {
    const globalHashLat = hashStringToNumber(id + "global_lat");
    const globalHashLng = hashStringToNumber(id + "global_lng");

    // Spread across a reasonable world viewing area (-60 to 70 lat, -160 to 160 lng)
    baseLat = (globalHashLat % 130) - 60;
    baseLng = (globalHashLng % 320) - 160;

    console.log("No location info: placing user randomly", { id, baseLat, baseLng });
    return [baseLat, baseLng];
  }

  // For users WITH location, we still apply a tiny jitter (~50m) to prevent exact stacking
  const jitterLat = getJitter(id + "lat", 0.001);
  const jitterLng = getJitter(id + "lng", 0.001);

  const finalLat = baseLat + jitterLat;
  const finalLng = baseLng + jitterLng;

  return [finalLat, finalLng];
};

export const encodeGeoHash = (position: LatLngExpression): string => {
  if (!Array.isArray(position) || position.length !== 2) {
    throw new Error("Invalid LatLngExpression format. Expected [latitude, longitude].");
  }
  const [latitude, longitude] = position;
  const encodedHash = Geohash.encode(latitude, longitude);

  return encodedHash;
};