import assert from "node:assert/strict";
import test from "node:test";

import {
  duplicateKey,
  parseWorkshopAdif,
  parseWorkshopAdifAsync,
  serializeWorkshopAdif,
} from "../app/adif-workshop.ts";

test("parses headered and headerless ADIF without discarding extension fields", () => {
  const headered = parseWorkshopAdif(
    "<ADIF_VER:5>3.1.7 <EOH>\n<CALL:5>K1ABC <QSO_DATE:8>20260728 <APP_HRD_NOTE:4>test <EOR>",
    "hrd.adi",
  );
  const headerless = parseWorkshopAdif(
    "<CALL:5>W7XYZ <BAND:3>20m <EOR>",
    "plain.adi",
  );

  assert.equal(headered.length, 1);
  assert.equal(headered[0].fields.CALL, "K1ABC");
  assert.equal(headered[0].fields.APP_HRD_NOTE, "test");
  assert.equal(headerless[0].fields.CALL, "W7XYZ");
});

test("asynchronous parsing reports progress while preserving records", async () => {
  const progress = [];
  const records = await parseWorkshopAdifAsync(
    Array.from(
      { length: 80 },
      (_, index) =>
        `<CALL:5>K${String(index).padStart(4, "0")} <QSO_DATE:8>20260728 <EOR>`,
    ).join("\n"),
    "large.adi",
    "large",
    (value) => progress.push(value),
  );

  assert.equal(records.length, 80);
  assert.equal(progress.at(-1), 1);
  assert.ok(progress.length > 1);
});

test("clean export can remove application fields without changing QSO count", () => {
  const records = parseWorkshopAdif(
    "<CALL:5>K1ABC <QSO_DATE:8>20260728 <BAND:3>20m <MODE:3>FT8 <APP_QRZ_TOKEN:6>secret <EOR>",
    "qrz.adi",
  );
  const clean = serializeWorkshopAdif(records, { cleanup: "no-app" });

  assert.match(clean, /<ADIF_VER:5>3\.1\.7/);
  assert.match(clean, /<CALL:5>K1ABC/);
  assert.doesNotMatch(clean, /APP_QRZ_TOKEN/);
  assert.equal((clean.match(/<EOR>/g) ?? []).length, 1);
});

test("minimal export retains portable activity fields and duplicate identity is stable", () => {
  const records = parseWorkshopAdif(
    "<CALL:5>K1ABC <QSO_DATE:8>20260728 <TIME_ON:6>123456 <BAND:3>20m <MY_SIG:4>POTA <MY_SIG_INFO:7>US-1234 <APP_TEST:3>abc <EOR>",
    "portable.adi",
  );
  const minimal = serializeWorkshopAdif(records, { cleanup: "minimal" });

  assert.match(minimal, /<MY_SIG:4>POTA/);
  assert.match(minimal, /<MY_SIG_INFO:7>US-1234/);
  assert.doesNotMatch(minimal, /APP_TEST/);
  assert.equal(duplicateKey(records[0]), "K1ABC|20260728|123456|20M");
});
