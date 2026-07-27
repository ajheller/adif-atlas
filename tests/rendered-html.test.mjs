import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: {
        accept: "text/html",
        host: "localhost",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the QSO Atlas application", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>QSO Atlas — ADIF Log Map<\/title>/i);
  assert.match(html, /QSO ATLAS/);
  assert.match(html, /Import ADIF/);
  assert.match(html, /Download HTML/);
  assert.match(html, /Private by design/);
  assert.match(html, /Propagation view/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("includes the bespoke social card and removes the starter preview", async () => {
  await access(new URL("../public/og.png", import.meta.url));
  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", templateRoot)),
  );
});

test("includes hover details in the live and portable maps", async () => {
  const [page, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.ok(page.includes("qso-hover-card is-${hovered.placement}"));
  assert.ok(page.includes('marker.addEventListener("mouseenter", select)'));
  assert.ok(page.includes("onPointerMove={continuePan}"));
  assert.ok(page.includes("onDoubleClick={handleDoubleClick}"));
  assert.ok(page.includes("centerOnQso(qso)"));
  assert.ok(styles.includes(".qso-hover-card {"));
  assert.ok(styles.includes(".world-map.is-panning {"));
});

test("keeps the desktop map visible while QSO lists scroll independently", async () => {
  const [page, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.ok(styles.includes("height: 100dvh;"));
  assert.match(styles, /\.workspace\s*\{[^}]*min-height:\s*0;/s);
  assert.match(styles, /\.qso-list\s*\{[^}]*overflow:\s*auto;/s);
  assert.ok(page.includes("body{display:flex;height:100dvh"));
  assert.ok(page.includes("aside{min-height:0;"));
});

test("filters displayed QSOs by an inclusive date range", async () => {
  const page = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.ok(page.includes('const [dateFrom, setDateFrom] = useState("")'));
  assert.ok(page.includes('const [dateTo, setDateTo] = useState("")'));
  assert.ok(page.includes('type="date"'));
  assert.ok(page.includes("qso.date >= dateFrom"));
  assert.ok(page.includes("qso.date <= dateTo"));
  assert.ok(page.includes('id="date-from"'));
  assert.ok(page.includes('id="date-to"'));
});

test("offers ADIF export for the currently displayed QSOs", async () => {
  const page = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.ok(page.includes("serializeAdif(filteredQsos, homeGrid)"));
  assert.ok(page.includes("Export displayed ADIF"));
  assert.ok(page.includes('id="download-adif"'));
  assert.ok(page.includes("standaloneAdif(visibleQsos)"));
});

test("filters by ADIF station and operator callsigns", async () => {
  const page = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.ok(page.includes("field.STATION_CALLSIGN"));
  assert.ok(page.includes("field.OPERATOR"));
  assert.ok(page.includes('const [stationCall, setStationCall]'));
  assert.ok(page.includes('const [operatorCall, setOperatorCall]'));
  assert.ok(page.includes('id="station-call"'));
  assert.ok(page.includes('id="operator-call"'));
  assert.ok(page.includes('stationCall === "All station calls"'));
  assert.ok(page.includes('operatorCall === "All operators"'));
});

test("offers a QTH-centered azimuthal equidistant map", async () => {
  const [page, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.ok(page.includes("<AzimuthalMap"));
  assert.ok(page.includes('aria-label="Map projection"'));
  assert.ok(page.includes("QTH-centered azimuthal equidistant QSO map"));
  assert.ok(page.includes('id="map-view"'));
  assert.ok(page.includes('id="standalone-azimuthal-base"'));
  assert.ok(styles.includes(".azimuthal-land {"));
  assert.ok(styles.includes(".map-view-toggle {"));
});

test("clusters nearby QSOs in live and portable maps", async () => {
  const [page, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.ok(page.includes("clusterProjectedItems("));
  assert.ok(page.includes('className="qso-cluster osm-screen-marker"'));
  assert.ok(page.includes("const clusterPoints = ("));
  assert.ok(page.includes('"cluster screen-marker"'));
  assert.ok(page.includes("zoom in to expand"));
  assert.ok(styles.includes(".qso-cluster {"));
});
