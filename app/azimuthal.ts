import { WORLD_PATH } from "./world-path.ts";

export { WORLD_PATH };

export type GeoPoint = { lat: number; lon: number };

export const AZIMUTHAL_CENTER = { x: 500, y: 250 };
export const AZIMUTHAL_RADIUS = 232;
export const EARTH_CIRCUMFERENCE_KM = 40030;

const radians = (degrees: number) => (degrees * Math.PI) / 180;
const degrees = (value: number) => (value * 180) / Math.PI;

export function azimuthalProject(
  point: GeoPoint,
  center: GeoPoint,
) {
  const latitude = radians(point.lat);
  const longitudeDelta = radians(point.lon - center.lon);
  const centerLatitude = radians(center.lat);
  const cosineDistance = Math.max(
    -1,
    Math.min(
      1,
      Math.sin(centerLatitude) * Math.sin(latitude) +
        Math.cos(centerLatitude) *
          Math.cos(latitude) *
          Math.cos(longitudeDelta),
    ),
  );
  const angularDistance = Math.acos(cosineDistance);
  const bearing = Math.atan2(
    Math.sin(longitudeDelta) * Math.cos(latitude),
    Math.cos(centerLatitude) * Math.sin(latitude) -
      Math.sin(centerLatitude) *
        Math.cos(latitude) *
        Math.cos(longitudeDelta),
  );
  const radius = (angularDistance / Math.PI) * AZIMUTHAL_RADIUS;

  return {
    x: AZIMUTHAL_CENTER.x + radius * Math.sin(bearing),
    y: AZIMUTHAL_CENTER.y - radius * Math.cos(bearing),
    distanceKm: (angularDistance / (2 * Math.PI)) * EARTH_CIRCUMFERENCE_KM,
    bearing: (degrees(bearing) + 360) % 360,
  };
}

function worldPathPolygons() {
  const tokens =
    WORLD_PATH.match(/[MLZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const polygons: GeoPoint[][] = [];
  let polygon: GeoPoint[] = [];

  for (let index = 0; index < tokens.length; ) {
    const token = tokens[index++];
    if (token === "Z") {
      if (polygon.length > 2) polygons.push(polygon);
      polygon = [];
      continue;
    }
    if (token !== "M" && token !== "L") continue;
    const x = Number(tokens[index++]);
    const y = Number(tokens[index++]);
    polygon.push({
      lon: (x / 1000) * 360 - 180,
      lat: 90 - (y / 500) * 180,
    });
  }

  if (polygon.length > 2) polygons.push(polygon);
  return polygons;
}

const WORLD_POLYGONS = worldPathPolygons();

export function azimuthalWorldPath(center: GeoPoint) {
  return WORLD_POLYGONS.map((polygon) => {
    const points = polygon.map((point) => azimuthalProject(point, center));
    return `${points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
      )
      .join("")}Z`;
  }).join("");
}
