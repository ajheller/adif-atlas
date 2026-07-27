import assert from "node:assert/strict";
import test from "node:test";

import {
  clusterProjectedItems,
  spreadOverlappingItems,
} from "../app/clustering.ts";

test("groups nearby projected QSOs and preserves distant markers", () => {
  const clusters = clusterProjectedItems(
    [
      { item: "A", x: 10, y: 10 },
      { item: "B", x: 18, y: 14 },
      { item: "C", x: 200, y: 200 },
    ],
    20,
  );

  assert.equal(clusters.length, 2);
  assert.deepEqual(clusters[0].items.sort(), ["A", "B"]);
  assert.equal(clusters[0].x, 14);
  assert.equal(clusters[0].y, 12);
  assert.deepEqual(clusters[1].items, ["C"]);
});

test("joins chains of neighboring points into one cluster", () => {
  const clusters = clusterProjectedItems(
    [
      { item: 1, x: 0, y: 0 },
      { item: 2, x: 9, y: 0 },
      { item: 3, x: 18, y: 0 },
    ],
    10,
  );

  assert.equal(clusters.length, 1);
  assert.deepEqual(clusters[0].items.sort(), [1, 2, 3]);
});

test("returns individual points when clustering is disabled", () => {
  const clusters = clusterProjectedItems(
    [
      { item: "A", x: 1, y: 2 },
      { item: "B", x: 1, y: 2 },
    ],
    0,
  );

  assert.equal(clusters.length, 2);
});

test("fans out QSOs that share exactly the same mapped location", () => {
  const spread = spreadOverlappingItems(
    Array.from({ length: 12 }, (_, index) => ({
      item: index,
      x: 100,
      y: 200,
    })),
    1,
    16,
  );

  assert.equal(spread.length, 12);
  assert.equal(
    new Set(spread.map(({ x, y }) => `${x.toFixed(3)}:${y.toFixed(3)}`)).size,
    12,
  );
  assert.ok(spread.every(({ x, y }) => Math.hypot(x - 100, y - 200) >= 16));
});
