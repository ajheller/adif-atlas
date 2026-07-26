import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import { lookupDxcc } from "../app/dxcc-data.ts";

test("offline DXCC lookup identifies representative callsigns", () => {
  assert.equal(lookupDxcc("N7PWZ")?.country, "United States");
  assert.equal(lookupDxcc("JA8KSF")?.country, "Japan");
  assert.equal(lookupDxcc("HB9EFK")?.country, "Switzerland");
  assert.equal(lookupDxcc("KL7RW")?.country, "Alaska");
  assert.equal(lookupDxcc("ZS6NL")?.country, "South Africa");
  assert.equal(lookupDxcc("7X5CY")?.country, "Algeria");
});

test("standalone export includes a script-free initial QSO layer", async () => {
  const source = await fs.readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    source,
    /<g id="map-points">\$\{staticArcs\}\$\{staticMarkers\}<\/g>/,
  );
  assert.match(source, /Entity centroid · approximate/);
});

test("maps support deep zoom and center the wrapped world on the home longitude", async () => {
  const source = await fs.readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /const MAX_MAP_ZOOM = 131072/);
  assert.match(source, /tile\.openstreetmap\.org/);
  assert.match(source, /OpenStreetMap<\/a> contributors/);
  assert.match(source, /viewBox="\$\{mapCenterX - 500\} 0 1000 500"/);
  assert.match(source, /\[-1000, 0, 1000\]\.map/);
});
