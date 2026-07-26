"use client";

import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { WORLD_PATH } from "./world-path";

type Coordinates = { lat: number; lon: number };

type Qso = {
  id: number;
  call: string;
  band: string;
  mode: string;
  date: string;
  time: string;
  country: string;
  grid: string;
  frequency: string;
  rstSent: string;
  rstReceived: string;
  name: string;
  qsl: string;
  lat: number;
  lon: number;
  locatorSource: "grid" | "coordinates";
};

type ImportResult = {
  qsos: Qso[];
  home: Coordinates | null;
  homeGrid: string;
  totalRecords: number;
};

const demoQsos: Qso[] = [
  {
    id: 1,
    call: "JA1NUT",
    band: "20m",
    mode: "CW",
    date: "2026-07-18",
    time: "04:32",
    country: "Japan",
    grid: "PM95",
    frequency: "14.028",
    rstSent: "579",
    rstReceived: "559",
    name: "Shin",
    qsl: "LoTW",
    lat: 35.69,
    lon: 139.69,
    locatorSource: "grid",
  },
  {
    id: 2,
    call: "G3TXQ",
    band: "15m",
    mode: "SSB",
    date: "2026-07-17",
    time: "19:14",
    country: "England",
    grid: "IO91",
    frequency: "21.284",
    rstSent: "57",
    rstReceived: "55",
    name: "Steve",
    qsl: "Confirmed",
    lat: 51.5,
    lon: -0.12,
    locatorSource: "grid",
  },
  {
    id: 3,
    call: "VK3MO",
    band: "20m",
    mode: "FT8",
    date: "2026-07-17",
    time: "12:06",
    country: "Australia",
    grid: "QF22",
    frequency: "14.074",
    rstSent: "-12",
    rstReceived: "-09",
    name: "Ian",
    qsl: "LoTW",
    lat: -37.81,
    lon: 144.96,
    locatorSource: "grid",
  },
  {
    id: 4,
    call: "ZS6BKW",
    band: "10m",
    mode: "FT8",
    date: "2026-07-16",
    time: "17:42",
    country: "South Africa",
    grid: "KG44",
    frequency: "28.074",
    rstSent: "-08",
    rstReceived: "-14",
    name: "Brian",
    qsl: "Pending",
    lat: -25.75,
    lon: 28.19,
    locatorSource: "grid",
  },
  {
    id: 5,
    call: "PY2XB",
    band: "40m",
    mode: "CW",
    date: "2026-07-15",
    time: "02:19",
    country: "Brazil",
    grid: "GG66",
    frequency: "7.028",
    rstSent: "559",
    rstReceived: "549",
    name: "Fred",
    qsl: "LoTW",
    lat: -23.55,
    lon: -46.63,
    locatorSource: "grid",
  },
  {
    id: 6,
    call: "OH2BH",
    band: "17m",
    mode: "SSB",
    date: "2026-07-14",
    time: "21:09",
    country: "Finland",
    grid: "KP20",
    frequency: "18.142",
    rstSent: "59",
    rstReceived: "57",
    name: "Martti",
    qsl: "Confirmed",
    lat: 60.17,
    lon: 24.94,
    locatorSource: "grid",
  },
  {
    id: 7,
    call: "LU7HN",
    band: "20m",
    mode: "SSB",
    date: "2026-07-13",
    time: "23:51",
    country: "Argentina",
    grid: "GF05",
    frequency: "14.242",
    rstSent: "55",
    rstReceived: "54",
    name: "Carlos",
    qsl: "Pending",
    lat: -34.6,
    lon: -58.38,
    locatorSource: "grid",
  },
  {
    id: 8,
    call: "KL7RA",
    band: "40m",
    mode: "CW",
    date: "2026-07-12",
    time: "06:18",
    country: "Alaska",
    grid: "BP40",
    frequency: "7.034",
    rstSent: "599",
    rstReceived: "579",
    name: "Rich",
    qsl: "LoTW",
    lat: 61.22,
    lon: -149.9,
    locatorSource: "grid",
  },
  {
    id: 9,
    call: "XE2CQ",
    band: "15m",
    mode: "FT8",
    date: "2026-07-12",
    time: "01:24",
    country: "Mexico",
    grid: "DL64",
    frequency: "21.074",
    rstSent: "-05",
    rstReceived: "-11",
    name: "Hugo",
    qsl: "LoTW",
    lat: 24.14,
    lon: -110.31,
    locatorSource: "grid",
  },
  {
    id: 10,
    call: "4X4DK",
    band: "20m",
    mode: "CW",
    date: "2026-07-11",
    time: "18:47",
    country: "Israel",
    grid: "KM72",
    frequency: "14.035",
    rstSent: "579",
    rstReceived: "559",
    name: "Ami",
    qsl: "Confirmed",
    lat: 32.08,
    lon: 34.78,
    locatorSource: "grid",
  },
  {
    id: 11,
    call: "KH6LC",
    band: "10m",
    mode: "SSB",
    date: "2026-07-10",
    time: "22:34",
    country: "Hawaii",
    grid: "BL01",
    frequency: "28.468",
    rstSent: "59",
    rstReceived: "57",
    name: "Lloyd",
    qsl: "LoTW",
    lat: 21.31,
    lon: -157.86,
    locatorSource: "grid",
  },
  {
    id: 12,
    call: "V51WH",
    band: "17m",
    mode: "FT8",
    date: "2026-07-09",
    time: "15:58",
    country: "Namibia",
    grid: "JG87",
    frequency: "18.1",
    rstSent: "-16",
    rstReceived: "-10",
    name: "Werner",
    qsl: "Pending",
    lat: -22.56,
    lon: 17.08,
    locatorSource: "grid",
  },
  {
    id: 13,
    call: "HL5QY",
    band: "20m",
    mode: "FT8",
    date: "2026-07-08",
    time: "05:11",
    country: "South Korea",
    grid: "PM45",
    frequency: "14.074",
    rstSent: "-07",
    rstReceived: "-13",
    name: "Kim",
    qsl: "LoTW",
    lat: 37.57,
    lon: 126.98,
    locatorSource: "grid",
  },
  {
    id: 14,
    call: "CT1BOH",
    band: "40m",
    mode: "CW",
    date: "2026-07-07",
    time: "03:39",
    country: "Portugal",
    grid: "IM58",
    frequency: "7.021",
    rstSent: "579",
    rstReceived: "579",
    name: "José",
    qsl: "Confirmed",
    lat: 38.72,
    lon: -9.14,
    locatorSource: "grid",
  },
];

const demoHome = { lat: 47.6062, lon: -122.3321 };

function project({ lat, lon }: Coordinates) {
  return { x: ((lon + 180) / 360) * 1000, y: ((90 - lat) / 180) * 500 };
}

function gridToCoordinates(gridValue: string): Coordinates | null {
  const grid = gridValue.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-R]{2}\d{2}([A-X]{2}(\d{2})?)?$/.test(grid)) return null;

  let lon = -180 + (grid.charCodeAt(0) - 65) * 20 + Number(grid[2]) * 2;
  let lat = -90 + (grid.charCodeAt(1) - 65) * 10 + Number(grid[3]);
  let lonSize = 2;
  let latSize = 1;

  if (grid.length >= 6) {
    lon += (grid.charCodeAt(4) - 65) * (5 / 60);
    lat += (grid.charCodeAt(5) - 65) * (2.5 / 60);
    lonSize = 5 / 60;
    latSize = 2.5 / 60;
  }

  if (grid.length >= 8) {
    lon += Number(grid[6]) * (5 / 600);
    lat += Number(grid[7]) * (2.5 / 600);
    lonSize = 5 / 600;
    latSize = 2.5 / 600;
  }

  return { lon: lon + lonSize / 2, lat: lat + latSize / 2 };
}

function parseAdifCoordinate(value: string, axis: "lat" | "lon") {
  const trimmed = value.trim().toUpperCase();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    const limit = axis === "lat" ? 90 : 180;
    return Math.abs(numeric) <= limit ? numeric : null;
  }

  const hemisphere = trimmed.match(/[NSEW]/)?.[0];
  const numbers = trimmed.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (!hemisphere || numbers.length === 0) return null;
  const coordinate = numbers[0] + (numbers[1] ?? 0) / 60;
  const signed = hemisphere === "S" || hemisphere === "W" ? -coordinate : coordinate;
  const limit = axis === "lat" ? 90 : 180;
  return Math.abs(signed) <= limit ? signed : null;
}

function normalizeDate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return value;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function normalizeTime(value: string) {
  const digits = value.replace(/\D/g, "").padEnd(4, "0");
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function parseAdif(text: string): ImportResult {
  const fields: Record<string, string>[] = [];
  let record: Record<string, string> = {};
  const tagPattern = /<([A-Z0-9_]+)(?::(\d+)(?::[^>]*)?)?>/gi;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(text))) {
    const tag = match[1].toUpperCase();
    if (tag === "EOH") {
      record = {};
      continue;
    }
    if (tag === "EOR") {
      if (Object.keys(record).length) fields.push(record);
      record = {};
      continue;
    }
    if (!match[2]) continue;

    const length = Number(match[2]);
    const valueStart = tagPattern.lastIndex;
    record[tag] = text.slice(valueStart, valueStart + length).trim();
    tagPattern.lastIndex = valueStart + length;
  }

  if (Object.keys(record).length) fields.push(record);

  let home: Coordinates | null = null;
  let homeGrid = "";
  const qsos: Qso[] = [];

  for (const field of fields) {
    if (!home) {
      const myLat = field.MY_LAT
        ? parseAdifCoordinate(field.MY_LAT, "lat")
        : null;
      const myLon = field.MY_LON
        ? parseAdifCoordinate(field.MY_LON, "lon")
        : null;
      const myGrid = field.MY_GRIDSQUARE || field.MY_VUCC_GRIDS || "";
      if (myLat !== null && myLon !== null) {
        home = { lat: myLat, lon: myLon };
        homeGrid = myGrid.split(",")[0];
      } else if (myGrid) {
        homeGrid = myGrid.split(",")[0];
        home = gridToCoordinates(homeGrid);
      }
    }

    const lat = field.LAT ? parseAdifCoordinate(field.LAT, "lat") : null;
    const lon = field.LON ? parseAdifCoordinate(field.LON, "lon") : null;
    const grid = (field.GRIDSQUARE || field.VUCC_GRIDS || "").split(",")[0];
    const fromGrid = grid ? gridToCoordinates(grid) : null;
    const coordinates =
      lat !== null && lon !== null ? { lat, lon } : fromGrid;

    if (!coordinates) continue;
    qsos.push({
      id: qsos.length + 1,
      call: field.CALL || "Unknown",
      band: field.BAND || (field.FREQ ? `${field.FREQ} MHz` : "Unknown"),
      mode: field.SUBMODE || field.MODE || "Unknown",
      date: normalizeDate(field.QSO_DATE || ""),
      time: normalizeTime(field.TIME_ON || ""),
      country: field.COUNTRY || (field.DXCC ? `DXCC ${field.DXCC}` : "Unknown"),
      grid,
      frequency: field.FREQ || "",
      rstSent: field.RST_SENT || "",
      rstReceived: field.RST_RCVD || "",
      name: field.NAME || "",
      qsl:
        field.QSL_RCVD === "Y" || field.LOTW_QSL_RCVD === "Y"
          ? "Confirmed"
          : field.QSL_SENT === "Y" || field.LOTW_QSL_SENT === "Y"
            ? "Sent"
            : "",
      lat: coordinates.lat,
      lon: coordinates.lon,
      locatorSource:
        lat !== null && lon !== null ? "coordinates" : "grid",
    });
  }

  return { qsos, home, homeGrid, totalRecords: fields.length };
}

function distanceKm(a: Coordinates, b: Coordinates) {
  const radius = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLon = toRadians(b.lon - a.lon);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      Math.sin(deltaLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function greatCircleSegments(a: Coordinates, b: Coordinates) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const degrees = (value: number) => (value * 180) / Math.PI;
  const vector = (point: Coordinates) => {
    const lat = radians(point.lat);
    const lon = radians(point.lon);
    return [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
  };
  const start = vector(a);
  const end = vector(b);
  const dot = Math.max(
    -1,
    Math.min(1, start[0] * end[0] + start[1] * end[1] + start[2] * end[2]),
  );
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);
  const points: { x: number; y: number }[] = [];

  for (let index = 0; index <= 32; index += 1) {
    const t = index / 32;
    const first = sinOmega ? Math.sin((1 - t) * omega) / sinOmega : 1 - t;
    const second = sinOmega ? Math.sin(t * omega) / sinOmega : t;
    const x = first * start[0] + second * end[0];
    const y = first * start[1] + second * end[1];
    const z = first * start[2] + second * end[2];
    const longitude = degrees(Math.atan2(y, x));
    const latitude = degrees(Math.atan2(z, Math.sqrt(x * x + y * y)));
    points.push(project({ lat: latitude, lon: longitude }));
  }

  const segments: { x: number; y: number }[][] = [[]];
  for (const point of points) {
    const active = segments[segments.length - 1];
    if (active.length && Math.abs(active[active.length - 1].x - point.x) > 500) {
      segments.push([]);
    }
    segments[segments.length - 1].push(point);
  }
  return segments.filter((segment) => segment.length > 1);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function standaloneApp() {
  const payload = (
    window as unknown as {
      __QSO_PAYLOAD__: {
        qsos: Qso[];
        home: Coordinates | null;
      };
    }
  ).__QSO_PAYLOAD__;
  const svg = document.getElementById("map-points") as unknown as SVGElement;
  const list = document.getElementById("qso-list") as HTMLElement;
  const resultCount = document.getElementById("result-count") as HTMLElement;
  const band = document.getElementById("band") as HTMLSelectElement;
  const mode = document.getElementById("mode") as HTMLSelectElement;
  const search = document.getElementById("search") as HTMLInputElement;
  const namespace = "http://www.w3.org/2000/svg";

  const safe = (value: string) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const point = (lat: number, lon: number) => ({
    x: ((lon + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 500,
  });

  const render = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = payload.qsos.filter(
      (qso) =>
        (band.value === "All" || qso.band === band.value) &&
        (mode.value === "All" || qso.mode === mode.value) &&
        (!query ||
          qso.call.toLowerCase().includes(query) ||
          qso.country.toLowerCase().includes(query)),
    );

    svg.replaceChildren();
    if (payload.home) {
      const origin = point(payload.home.lat, payload.home.lon);
      for (const qso of filtered) {
        const destination = point(qso.lat, qso.lon);
        const line = document.createElementNS(namespace, "path");
        const middleX = (origin.x + destination.x) / 2;
        const lift = Math.min(82, Math.abs(destination.x - origin.x) * 0.16);
        line.setAttribute(
          "d",
          `M${origin.x},${origin.y} Q${middleX},${Math.min(origin.y, destination.y) - lift} ${destination.x},${destination.y}`,
        );
        line.setAttribute("class", "arc");
        svg.append(line);
      }
    }

    for (const qso of filtered) {
      const location = point(qso.lat, qso.lon);
      const marker = document.createElementNS(namespace, "circle");
      marker.setAttribute("cx", String(location.x));
      marker.setAttribute("cy", String(location.y));
      marker.setAttribute("r", "5");
      marker.setAttribute("class", "marker");
      marker.setAttribute("tabindex", "0");
      marker.setAttribute("role", "button");
      marker.setAttribute("aria-label", `${qso.call}, ${qso.country}`);
      const select = () => {
        document.querySelectorAll(".marker").forEach((item) => item.classList.remove("active"));
        marker.classList.add("active");
        const detail = document.getElementById("detail") as HTMLElement;
        detail.innerHTML = `<strong>${safe(qso.call)}</strong><span>${safe(qso.country)} · ${safe(qso.band)} · ${safe(qso.mode)} · ${safe(qso.date)}</span>`;
      };
      marker.addEventListener("click", select);
      marker.addEventListener("keydown", (event) => {
        const key = (event as unknown as { key: string }).key;
        if (key === "Enter" || key === " ") select();
      });
      svg.append(marker);
    }

    list.innerHTML = filtered
      .map(
        (qso) =>
          `<button class="row" data-id="${qso.id}"><strong>${safe(qso.call)}</strong><span>${safe(qso.country)}</span><span>${safe(qso.band)}</span><span>${safe(qso.mode)}</span></button>`,
      )
      .join("");
    list.querySelectorAll<HTMLButtonElement>(".row").forEach((row) => {
      row.addEventListener("click", () => {
        const qso = filtered.find(
          (candidate) => candidate.id === Number(row.dataset.id),
        );
        if (!qso) return;
        const detail = document.getElementById("detail") as HTMLElement;
        detail.innerHTML = `<strong>${safe(qso.call)}</strong><span>${safe(qso.country)} · ${safe(qso.band)} · ${safe(qso.mode)} · ${safe(qso.date)}</span>`;
      });
    });
    resultCount.textContent = `${filtered.length} mapped QSO${filtered.length === 1 ? "" : "s"}`;
  };

  [band, mode].forEach((element) => element.addEventListener("change", render));
  search.addEventListener("input", render);
  render();
}

function buildStandaloneHtml(
  qsos: Qso[],
  home: Coordinates | null,
  sourceName: string,
) {
  const bands = [...new Set(qsos.map((qso) => qso.band))].sort();
  const modes = [...new Set(qsos.map((qso) => qso.mode))].sort();
  const payload = JSON.stringify({ qsos, home }).replaceAll("<", "\\u003c");
  const worldPath = escapeHtml(WORLD_PATH);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(sourceName)} · QSO Atlas</title>
<style>
:root{--ink:#f2f0e8;--muted:#9ca7aa;--panel:#111a1e;--line:#26343a;--ocean:#0b1418;--land:#1c2b2f;--amber:#f0b45a;--cyan:#73c9c9}*{box-sizing:border-box}body{margin:0;background:#091115;color:var(--ink);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 28px;border-bottom:1px solid var(--line)}h1{margin:0;font-size:18px;letter-spacing:.04em}header p{margin:2px 0 0;color:var(--muted)}.mark{display:flex;align-items:center;gap:12px}.pulse{width:12px;height:12px;border:2px solid var(--amber);border-radius:50%;box-shadow:0 0 0 5px rgba(240,180,90,.12)}.controls{display:flex;flex-wrap:wrap;gap:10px;padding:14px 28px;border-bottom:1px solid var(--line)}input,select{min-height:38px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);padding:0 12px}input{min-width:220px}.count{margin-left:auto;align-self:center;color:var(--muted)}main{display:grid;grid-template-columns:minmax(0,1fr) 310px;min-height:calc(100vh - 132px)}.map{position:relative;min-height:580px;background:var(--ocean);overflow:hidden}.map svg{display:block;width:100%;height:100%;min-height:580px}.graticule{stroke:#233239;stroke-width:.55}.land{fill:var(--land);stroke:#33474d;stroke-width:.55}.arc{fill:none;stroke:var(--amber);stroke-width:1;stroke-opacity:.28}.marker{fill:var(--amber);stroke:#fff2d7;stroke-width:1.4;cursor:pointer;transition:r .15s}.marker:hover,.marker:focus,.marker.active{r:8;outline:none}.origin{fill:var(--cyan);stroke:#dff;stroke-width:2}.detail{position:absolute;left:20px;bottom:20px;display:flex;gap:14px;align-items:center;max-width:calc(100% - 40px);padding:12px 15px;border:1px solid #3a4c52;border-radius:8px;background:rgba(9,17,21,.92)}.detail span{color:var(--muted)}aside{border-left:1px solid var(--line);background:var(--panel);overflow:auto}.row{display:grid;width:100%;grid-template-columns:1.2fr 1.6fr .7fr .7fr;gap:8px;padding:13px 16px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink);text-align:left;cursor:pointer}.row:hover{background:#18252a}.row span{overflow:hidden;color:var(--muted);text-overflow:ellipsis;white-space:nowrap}@media(max-width:760px){header{align-items:flex-start;padding:16px 18px}.controls{padding:12px 18px}.count{width:100%;margin-left:0}main{grid-template-columns:1fr}.map,.map svg{min-height:430px}aside{max-height:360px;border-top:1px solid var(--line);border-left:0}}
</style>
</head>
<body>
<header><div class="mark"><span class="pulse"></span><div><h1>QSO ATLAS</h1><p>${escapeHtml(sourceName)} · portable log map</p></div></div><p>Generated locally</p></header>
<section class="controls" aria-label="Map filters">
<input id="search" type="search" placeholder="Search call or country" aria-label="Search call or country">
<select id="band" aria-label="Band"><option>All</option>${bands.map((band) => `<option>${escapeHtml(band)}</option>`).join("")}</select>
<select id="mode" aria-label="Mode"><option>All</option>${modes.map((mode) => `<option>${escapeHtml(mode)}</option>`).join("")}</select>
<span class="count" id="result-count"></span>
</section>
<main>
<section class="map" aria-label="World map of radio contacts">
<svg viewBox="0 0 1000 500" role="img" aria-label="World map with QSO paths">
<g class="graticule">${[-120, -60, 0, 60, 120].map((lon) => `<line x1="${((lon + 180) / 360) * 1000}" y1="0" x2="${((lon + 180) / 360) * 1000}" y2="500"/>`).join("")}${[-60, -30, 0, 30, 60].map((lat) => `<line x1="0" y1="${((90 - lat) / 180) * 500}" x2="1000" y2="${((90 - lat) / 180) * 500}"/>`).join("")}</g>
<path class="land" d="${worldPath}"/>
${home ? `<circle class="origin" cx="${project(home).x}" cy="${project(home).y}" r="6"/>` : ""}
<g id="map-points"></g>
</svg>
<div class="detail" id="detail"><strong>Select a QSO</strong><span>Use the map or contact list</span></div>
</section>
<aside id="qso-list" aria-label="QSO list"></aside>
</main>
<script>window.__QSO_PAYLOAD__=${payload};(${standaloneApp.toString()})()</script>
</body>
</html>`;
}

function QsoMap({
  qsos,
  home,
  selected,
  onSelect,
}: {
  qsos: Qso[];
  home: Coordinates | null;
  selected: Qso | null;
  onSelect: (qso: Qso) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const viewWidth = 1000 / zoom;
  const viewHeight = 500 / zoom;
  const viewBox = `${(1000 - viewWidth) / 2} ${(500 - viewHeight) / 2} ${viewWidth} ${viewHeight}`;

  return (
    <div className="map-stage">
      <svg
        className="world-map"
        viewBox={viewBox}
        role="img"
        aria-label={`World map showing ${qsos.length} mapped QSOs`}
      >
        <title>World map of mapped amateur radio contacts</title>
        <desc>
          Contact paths extend from the station location to each mapped QSO.
          Select a marker for details.
        </desc>
        <rect className="map-ocean" x="0" y="0" width="1000" height="500" />
        <g className="map-graticule" aria-hidden="true">
          {[-120, -60, 0, 60, 120].map((longitude) => {
            const x = ((longitude + 180) / 360) * 1000;
            return <line key={longitude} x1={x} y1="0" x2={x} y2="500" />;
          })}
          {[-60, -30, 0, 30, 60].map((latitude) => {
            const y = ((90 - latitude) / 180) * 500;
            return <line key={latitude} x1="0" y1={y} x2="1000" y2={y} />;
          })}
        </g>
        <path className="map-land" d={WORLD_PATH} aria-hidden="true" />
        {home &&
          qsos.map((qso) =>
            greatCircleSegments(home, qso).map((segment, index) => (
              <path
                className="contact-arc"
                d={segment
                  .map(
                    (point, pointIndex) =>
                      `${pointIndex === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`,
                  )
                  .join(" ")}
                key={`${qso.id}-${index}`}
              />
            )),
          )}
        {home && (
          <g className="home-marker" aria-label="Station location">
            <circle
              cx={project(home).x}
              cy={project(home).y}
              r={6 / Math.sqrt(zoom)}
            />
            <circle
              className="home-halo"
              cx={project(home).x}
              cy={project(home).y}
              r={13 / Math.sqrt(zoom)}
            />
          </g>
        )}
        {qsos.map((qso) => {
          const point = project(qso);
          const isSelected = selected?.id === qso.id;
          return (
            <g
              className={`qso-marker${isSelected ? " is-selected" : ""}`}
              key={qso.id}
              role="button"
              aria-label={`${qso.call}, ${qso.country}, ${qso.band} ${qso.mode}`}
              tabIndex={0}
              transform={`translate(${point.x} ${point.y})`}
              onClick={() => onSelect(qso)}
              onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(qso);
                }
              }}
            >
              <circle
                className="qso-marker-halo"
                r={(isSelected ? 12 : 8) / Math.sqrt(zoom)}
              />
              <circle
                className="qso-marker-dot"
                r={(isSelected ? 5.5 : 4) / Math.sqrt(zoom)}
              />
            </g>
          );
        })}
      </svg>

      <div className="map-tools" aria-label="Map zoom">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((current) => Math.min(2.25, current + 0.25))}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Reset zoom"
          onClick={() => setZoom(1)}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom((current) => Math.max(1, current - 0.25))}
        >
          −
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [qsos, setQsos] = useState(demoQsos);
  const [home, setHome] = useState<Coordinates | null>(demoHome);
  const [homeGrid, setHomeGrid] = useState("CN87");
  const [sourceName, setSourceName] = useState("Demo log");
  const [totalRecords, setTotalRecords] = useState(demoQsos.length);
  const [band, setBand] = useState("All bands");
  const [mode, setMode] = useState("All modes");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Qso | null>(demoQsos[0]);
  const [message, setMessage] = useState(
    "Demo data is loaded. Import an ADIF file to map your log.",
  );
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const bands = useMemo(
    () => [...new Set(qsos.map((qso) => qso.band))].sort(),
    [qsos],
  );
  const modes = useMemo(
    () => [...new Set(qsos.map((qso) => qso.mode))].sort(),
    [qsos],
  );
  const filteredQsos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return qsos.filter(
      (qso) =>
        (band === "All bands" || qso.band === band) &&
        (mode === "All modes" || qso.mode === mode) &&
        (!query ||
          qso.call.toLowerCase().includes(query) ||
          qso.country.toLowerCase().includes(query) ||
          qso.grid.toLowerCase().includes(query)),
    );
  }, [band, mode, qsos, search]);

  const countries = new Set(qsos.map((qso) => qso.country)).size;
  const farthest = home
    ? Math.max(0, ...qsos.map((qso) => distanceKm(home, qso)))
    : 0;
  const skipped = Math.max(0, totalRecords - qsos.length);

  async function importFile(file: File) {
    setError("");
    if (!/\.(adi|adif)$/i.test(file.name)) {
      setError("Choose an .adi or .adif file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("That file is over the 25 MB local import limit.");
      return;
    }

    try {
      const parsed = parseAdif(await file.text());
      if (!parsed.totalRecords) {
        setError("No ADIF QSO records were found in that file.");
        return;
      }
      if (!parsed.qsos.length) {
        setError(
          "The log was read, but none of its QSOs include LAT/LON or a valid GRIDSQUARE.",
        );
        return;
      }

      setQsos(parsed.qsos);
      setHome(parsed.home);
      setHomeGrid(parsed.homeGrid);
      setSourceName(file.name);
      setTotalRecords(parsed.totalRecords);
      setBand("All bands");
      setMode("All modes");
      setSearch("");
      setSelected(parsed.qsos[0]);
      setMessage(
        `${parsed.qsos.length.toLocaleString()} of ${parsed.totalRecords.toLocaleString()} QSOs mapped locally.`,
      );
    } catch {
      setError("The file could not be parsed as ADIF. Your current map was kept.");
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void importFile(file);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void importFile(file);
  }

  function updateHomeGrid(value: string) {
    const normalized = value.toUpperCase();
    setHomeGrid(normalized);
    const coordinates = gridToCoordinates(normalized);
    if (coordinates) {
      setHome(coordinates);
      setMessage(`Station origin set to ${normalized}.`);
    }
  }

  function exportMap() {
    const html = buildStandaloneHtml(qsos, home, sourceName);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sourceName.replace(/\.(adi|adif)$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "qso-log"}-map.html`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Portable HTML map downloaded.");
  }

  return (
    <main
      className={`app-shell${isDragging ? " is-dragging" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-signal" aria-hidden="true">
            <i />
          </span>
          <div>
            <p className="eyebrow">Amateur radio log explorer</p>
            <h1>QSO ATLAS</h1>
          </div>
        </div>

        <div className="file-status" aria-live="polite">
          <span className="status-dot" />
          <div>
            <strong>{sourceName}</strong>
            <span>{message}</span>
          </div>
        </div>

        <div className="top-actions">
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept=".adi,.adif,text/plain"
            onChange={handleFileInput}
          />
          <button
            className="button button-secondary"
            type="button"
            onClick={() => fileInput.current?.click()}
          >
            Import ADIF
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={exportMap}
            disabled={!qsos.length}
          >
            Download HTML
          </button>
        </div>
      </header>

      <section className="control-deck" aria-label="QSO map controls">
        <label className="search-field">
          <span className="visually-hidden">Search QSOs</span>
          <span className="search-symbol" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search call, country, or grid"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          <span>Band</span>
          <select value={band} onChange={(event) => setBand(event.target.value)}>
            <option>All bands</option>
            {bands.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Mode</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option>All modes</option>
            {modes.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>

        <label className="grid-field">
          <span>Home grid</span>
          <input
            value={homeGrid}
            maxLength={8}
            placeholder="e.g. CN87"
            onChange={(event) => updateHomeGrid(event.target.value)}
          />
        </label>

        <div className="privacy-note">
          <span aria-hidden="true">◇</span>
          <p>
            <strong>Private by design</strong>
            Your log never leaves this browser.
          </p>
        </div>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <section className="workspace">
        <div className="map-column">
          <div className="map-header">
            <div>
              <p className="eyebrow">Propagation view</p>
              <h2>
                {filteredQsos.length.toLocaleString()} mapped QSO
                {filteredQsos.length === 1 ? "" : "s"}
              </h2>
            </div>
            <div className="legend" aria-label="Map legend">
              <span>
                <i className="legend-home" /> Home
              </span>
              <span>
                <i className="legend-qso" /> QSO
              </span>
              <span>
                <i className="legend-path" /> Path
              </span>
            </div>
          </div>

          <QsoMap
            qsos={filteredQsos}
            home={home}
            selected={selected}
            onSelect={setSelected}
          />

          <div className="map-footer">
            <span>Coordinates use LAT/LON first, then Maidenhead grid centers.</span>
            {!home && (
              <strong>Enter a home grid to draw contact paths.</strong>
            )}
          </div>
        </div>

        <aside className="log-rail" aria-label="Mapped QSO list">
          <div className="rail-heading">
            <div>
              <p className="eyebrow">Logbook</p>
              <h2>Recent contacts</h2>
            </div>
            <span>{filteredQsos.length}</span>
          </div>

          <div className="qso-list">
            {filteredQsos.map((qso) => (
              <button
                className={`qso-row${selected?.id === qso.id ? " is-selected" : ""}`}
                key={qso.id}
                type="button"
                onClick={() => setSelected(qso)}
              >
                <span className="qso-row-main">
                  <strong>{qso.call}</strong>
                  <small>{qso.country}</small>
                </span>
                <span className="qso-row-meta">
                  <strong>{qso.band}</strong>
                  <small>{qso.mode}</small>
                </span>
                <time>
                  {qso.date}
                  <small>{qso.time} UTC</small>
                </time>
              </button>
            ))}
            {!filteredQsos.length && (
              <div className="empty-state">
                No mapped QSOs match these filters.
              </div>
            )}
          </div>

          {selected && (
            <div className="contact-card" aria-live="polite">
              <div className="contact-card-heading">
                <div>
                  <p className="eyebrow">Selected QSO</p>
                  <h3>{selected.call}</h3>
                </div>
                <span>{selected.qsl || "Unconfirmed"}</span>
              </div>
              <dl>
                <div>
                  <dt>Country</dt>
                  <dd>{selected.country}</dd>
                </div>
                <div>
                  <dt>Band / mode</dt>
                  <dd>
                    {selected.band} · {selected.mode}
                  </dd>
                </div>
                <div>
                  <dt>Grid</dt>
                  <dd>{selected.grid || "LAT/LON"}</dd>
                </div>
                <div>
                  <dt>Signal</dt>
                  <dd>
                    {selected.rstSent || "—"} / {selected.rstReceived || "—"}
                  </dd>
                </div>
                {home && (
                  <div>
                    <dt>Distance</dt>
                    <dd>
                      {Math.round(distanceKm(home, selected)).toLocaleString()} km
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </aside>
      </section>

      <section className="stat-strip" aria-label="Log summary">
        <article>
          <span>Mapped</span>
          <strong>
            {qsos.length.toLocaleString()}
            <small> / {totalRecords.toLocaleString()}</small>
          </strong>
        </article>
        <article>
          <span>Countries / entities</span>
          <strong>{countries.toLocaleString()}</strong>
        </article>
        <article>
          <span>Bands</span>
          <strong>{bands.length}</strong>
        </article>
        <article>
          <span>Farthest path</span>
          <strong>
            {home ? Math.round(farthest).toLocaleString() : "—"}
            <small>{home ? " km" : ""}</small>
          </strong>
        </article>
        <article className={skipped ? "has-warning" : ""}>
          <span>Without coordinates</span>
          <strong>{skipped.toLocaleString()}</strong>
        </article>
      </section>

      {isDragging && (
        <div className="drop-overlay" aria-hidden="true">
          <div>
            <span>ADI</span>
            <strong>Drop your log to map it</strong>
            <p>Processed locally in this browser</p>
          </div>
        </div>
      )}
    </main>
  );
}
