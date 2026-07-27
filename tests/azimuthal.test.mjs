import assert from "node:assert/strict";
import test from "node:test";

import {
  AZIMUTHAL_CENTER,
  AZIMUTHAL_RADIUS,
  azimuthalProject,
  azimuthalWorldPath,
} from "../app/azimuthal.ts";

const qth = { lat: 47.6062, lon: -122.3321 };

test("azimuthal equidistant projection places the QTH at the center", () => {
  const projected = azimuthalProject(qth, qth);
  assert.ok(Math.abs(projected.x - AZIMUTHAL_CENTER.x) < 1e-8);
  assert.ok(Math.abs(projected.y - AZIMUTHAL_CENTER.y) < 1e-8);
  assert.ok(projected.distanceKm < 1e-6);
});

test("azimuthal projection preserves bearing and radial distance", () => {
  const north = azimuthalProject({ lat: 57.6062, lon: -122.3321 }, qth);
  assert.ok(north.y < AZIMUTHAL_CENTER.y);
  assert.ok(north.bearing < 1 || north.bearing > 359);

  const antipode = azimuthalProject(
    { lat: -qth.lat, lon: qth.lon + 180 },
    qth,
  );
  const radius = Math.hypot(
    antipode.x - AZIMUTHAL_CENTER.x,
    antipode.y - AZIMUTHAL_CENTER.y,
  );
  assert.ok(Math.abs(radius - AZIMUTHAL_RADIUS) < 0.01);
  assert.ok(Math.abs(antipode.distanceKm - 20015) < 1);
});

test("reprojects the bundled offline world geometry", () => {
  const path = azimuthalWorldPath(qth);
  assert.match(path, /^M/);
  assert.ok(path.length > 100_000);
  assert.doesNotMatch(path, /NaN|Infinity/);
});
