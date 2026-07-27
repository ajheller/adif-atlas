import assert from "node:assert/strict";
import test from "node:test";

import { serializeAdif } from "../app/adif.ts";

test("serializes only the supplied displayed QSOs as valid ADIF records", () => {
  const displayed = [
    {
      call: "K1ABC",
      band: "20m",
      mode: "FT8",
      date: "2026-07-20",
      time: "14:32",
      country: "United States",
      grid: "FN42",
      frequency: "14.074",
      rstSent: "-10",
      rstReceived: "-12",
      name: "Alex",
      stationCall: "W7XYZ",
      operator: "N7OP",
      lat: 42.5,
      lon: -71,
      locatorSource: "grid",
      adifFields: {
        CALL: "K1ABC",
        QSO_DATE: "20260720",
        COMMENT: "Displayed contact",
      },
    },
  ];

  const adif = serializeAdif(displayed, "CN87");

  assert.match(adif, /<ADIF_VER:5>3\.1\.4/);
  assert.match(adif, /<PROGRAMID:10>ADIF Atlas/);
  assert.match(adif, /<CALL:5>K1ABC/);
  assert.match(adif, /<QSO_DATE:8>20260720/);
  assert.match(adif, /<COMMENT:17>Displayed contact/);
  assert.match(adif, /<MY_GRIDSQUARE:4>CN87/);
  assert.match(adif, /<STATION_CALLSIGN:5>W7XYZ/);
  assert.match(adif, /<OPERATOR:4>N7OP/);
  assert.equal((adif.match(/<EOR>/g) ?? []).length, 1);
});

test("does not invent exact coordinates for entity-centroid locations", () => {
  const adif = serializeAdif([
    {
      call: "G3ABC",
      band: "40m",
      mode: "CW",
      date: "2026-07-19",
      time: "09:15",
      country: "England",
      grid: "",
      frequency: "7.025",
      rstSent: "579",
      rstReceived: "559",
      name: "",
      lat: 52,
      lon: -1,
      locatorSource: "entity",
    },
  ]);

  assert.doesNotMatch(adif, /<(?:LAT|LON):/);
});
