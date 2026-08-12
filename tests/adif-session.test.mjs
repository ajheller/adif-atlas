import assert from "node:assert/strict";
import test from "node:test";

import {
  clearSharedAdif,
  loadSharedAdif,
  saveSharedAdif,
} from "../app/adif-session.ts";

test("shared ADIF storage degrades safely when IndexedDB is unavailable", async () => {
  assert.equal(await loadSharedAdif(), null);
  await saveSharedAdif({ name: "test.adi", text: "<EOH>" });
  await clearSharedAdif();
});
