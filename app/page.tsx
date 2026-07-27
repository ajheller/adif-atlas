"use client";

import {
  ChangeEvent,
  DragEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  useEffect,
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
  locatorSource: "grid" | "coordinates" | "entity";
};

type ImportResult = {
  qsos: Qso[];
  home: Coordinates | null;
  homeGrid: string;
  totalRecords: number;
};

type DxccLookup = (callsign: string) => {
  country: string;
  lat: number;
  lon: number;
} | null;

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
const MAX_MAP_ZOOM = 131072;
const MAP_ZOOM_FACTOR = 1.5;
const OSM_MAX_ZOOM = 19;

function project({ lat, lon }: Coordinates) {
  return { x: ((lon + 180) / 360) * 1000, y: ((90 - lat) / 180) * 500 };
}

function nearestWrappedX(x: number, centerX: number) {
  return x + Math.round((centerX - x) / 1000) * 1000;
}

function mercatorY(latitude: number) {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const radians = (clamped * Math.PI) / 180;
  return (
    (1 -
      Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) /
    2
  );
}

function mercatorX(longitude: number) {
  return (longitude + 180) / 360;
}

function inverseMercatorY(y: number) {
  return (
    (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) /
    Math.PI
  );
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

function parseAdif(text: string, lookupDxcc: DxccLookup): ImportResult {
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
    const dxcc = lookupDxcc(field.CALL || "");
    const coordinates =
      lat !== null && lon !== null
        ? { lat, lon }
        : fromGrid ?? (dxcc ? { lat: dxcc.lat, lon: dxcc.lon } : null);

    if (!coordinates) continue;
    qsos.push({
      id: qsos.length + 1,
      call: field.CALL || "Unknown",
      band: field.BAND || (field.FREQ ? `${field.FREQ} MHz` : "Unknown"),
      mode: field.SUBMODE || field.MODE || "Unknown",
      date: normalizeDate(field.QSO_DATE || ""),
      time: normalizeTime(field.TIME_ON || ""),
      country:
        field.COUNTRY ||
        dxcc?.country ||
        (field.DXCC ? `DXCC ${field.DXCC}` : "Unknown"),
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
        lat !== null && lon !== null
          ? "coordinates"
          : fromGrid
            ? "grid"
            : "entity",
    });
  }

  return { qsos, home, homeGrid, totalRecords: fields.length };
}

function locationLabel(qso: Qso) {
  if (qso.locatorSource === "coordinates") return "LAT/LON";
  if (qso.locatorSource === "grid") return qso.grid || "Grid center";
  return "Entity centroid · approximate";
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
  const mapSvg = document.getElementById("standalone-map") as unknown as SVGSVGElement;
  const mapStage = document.getElementById("standalone-map-stage") as HTMLElement;
  const tileLayer = document.getElementById("standalone-tiles") as HTMLElement;
  const tileOverlay = document.getElementById("standalone-tile-overlay") as unknown as SVGSVGElement;
  const list = document.getElementById("qso-list") as HTMLElement;
  const resultCount = document.getElementById("result-count") as HTMLElement;
  const band = document.getElementById("band") as HTMLSelectElement;
  const mode = document.getElementById("mode") as HTMLSelectElement;
  const search = document.getElementById("search") as HTMLInputElement;
  const namespace = "http://www.w3.org/2000/svg";
  const maxMapZoom = 131072;
  const osmMaxZoom = 19;
  const zoomFactor = 1.5;
  let pathsVisible = true;
  let mapZoom = 1;
  let mapCenter = payload.home
    ? {
        x: ((payload.home.lon + 180) / 360) * 1000,
        y: 250,
      }
    : { x: 500, y: 250 };
  let drag:
    | {
        pointerId: number;
        clientX: number;
        clientY: number;
        centerMercatorX: number;
        centerMercatorY: number;
        worldSize: number;
      }
    | null = null;

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
  const mercX = (longitude: number) => (longitude + 180) / 360;
  const mercY = (latitude: number) => {
    const clamped = Math.max(-85.05112878, Math.min(85.05112878, latitude));
    const radians = (clamped * Math.PI) / 180;
    return (
      (1 -
        Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) /
      2
    );
  };
  const inverseMercY = (y: number) =>
    (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;
  const wrappedPoint = (lat: number, lon: number) => {
    const projected = point(lat, lon);
    const referenceX = payload.home
      ? point(payload.home.lat, payload.home.lon).x
      : mapCenter.x;
    return {
      ...projected,
      x:
        projected.x +
        Math.round((referenceX - projected.x) / 1000) * 1000,
    };
  };
  const locationText = (qso: Qso) =>
    qso.locatorSource === "coordinates"
      ? "LAT/LON"
      : qso.locatorSource === "grid"
        ? qso.grid || "Grid center"
        : "Entity centroid (approximate)";
  const clampCenter = (candidate: { x: number; y: number }) => {
    const halfWidth = 500 / mapZoom;
    const halfHeight = 250 / mapZoom;
    return {
      x: Math.max(-500 + halfWidth, Math.min(1500 - halfWidth, candidate.x)),
      y: Math.max(halfHeight, Math.min(500 - halfHeight, candidate.y)),
    };
  };
  const updateMarkerSizes = () => {
    mapSvg.querySelectorAll<SVGCircleElement>(".marker").forEach((marker) => {
      marker.setAttribute(
        "r",
        String((marker.classList.contains("active") ? 8 : 5) / mapZoom),
      );
    });
    mapSvg.querySelector<SVGCircleElement>(".origin")?.setAttribute(
      "r",
      String(6 / mapZoom),
    );
  };
  let visibleQsos = payload.qsos;
  const renderTileMap = (filtered: Qso[]) => {
    visibleQsos = filtered;
    const width = mapStage.clientWidth;
    const height = mapStage.clientHeight;
    if (!width || !height) return;
    const worldSize = width * mapZoom;
    const tileZoom = Math.max(
      0,
      Math.min(
        osmMaxZoom,
        Math.floor(Math.log2(Math.max(1, worldSize / 256))),
      ),
    );
    const tileCount = 2 ** tileZoom;
    const tileSize = worldSize / tileCount;
    const centerLongitude = (mapCenter.x / 1000) * 360 - 180;
    const centerLatitude = 90 - (mapCenter.y / 500) * 180;
    const centerWorldX = mercX(centerLongitude) * worldSize;
    const centerWorldY = mercY(centerLatitude) * worldSize;
    const firstTileX = Math.floor((centerWorldX - width / 2) / tileSize);
    const lastTileX = Math.floor((centerWorldX + width / 2) / tileSize);
    const firstTileY = Math.max(
      0,
      Math.floor((centerWorldY - height / 2) / tileSize),
    );
    const lastTileY = Math.min(
      tileCount - 1,
      Math.floor((centerWorldY + height / 2) / tileSize),
    );
    const fragment = document.createDocumentFragment();
    for (let x = firstTileX; x <= lastTileX; x += 1) {
      for (let y = firstTileY; y <= lastTileY; y += 1) {
        const image = document.createElement("img");
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        image.alt = "";
        image.draggable = false;
        image.src = `https://tile.openstreetmap.org/${tileZoom}/${wrappedX}/${y}.png`;
        image.style.left = `${x * tileSize - centerWorldX + width / 2}px`;
        image.style.top = `${y * tileSize - centerWorldY + height / 2}px`;
        image.style.width = `${tileSize + 0.5}px`;
        image.style.height = `${tileSize + 0.5}px`;
        image.addEventListener("load", () =>
          mapSvg.classList.add("tiles-loaded"),
        );
        image.addEventListener("error", () => {
          image.style.display = "none";
        });
        fragment.append(image);
      }
    }
    tileLayer.replaceChildren(fragment);
    tileOverlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
    tileOverlay.replaceChildren();
    const screenPoint = (coordinates: Coordinates) => {
      let deltaX = mercX(coordinates.lon) - mercX(centerLongitude);
      deltaX -= Math.round(deltaX);
      return {
        x: width / 2 + deltaX * worldSize,
        y:
          height / 2 +
          (mercY(coordinates.lat) - mercY(centerLatitude)) * worldSize,
      };
    };
    const origin = payload.home ? screenPoint(payload.home) : null;
    if (pathsVisible && origin && mapZoom < 96) {
      for (const qso of filtered) {
        const destination = screenPoint(qso);
        const line = document.createElementNS(namespace, "path");
        const middleX = (origin.x + destination.x) / 2;
        const lift = Math.min(
          90,
          Math.abs(destination.x - origin.x) * 0.12,
        );
        line.setAttribute(
          "d",
          `M${origin.x},${origin.y} Q${middleX},${Math.min(origin.y, destination.y) - lift} ${destination.x},${destination.y}`,
        );
        line.setAttribute("class", "arc");
        tileOverlay.append(line);
      }
    }
    if (origin) {
      const homeMarker = document.createElementNS(namespace, "circle");
      homeMarker.setAttribute("cx", String(origin.x));
      homeMarker.setAttribute("cy", String(origin.y));
      homeMarker.setAttribute("r", "6");
      homeMarker.setAttribute("class", "origin screen-marker");
      tileOverlay.append(homeMarker);
    }
    for (const qso of filtered) {
      const location = screenPoint(qso);
      if (
        location.x < -30 ||
        location.x > width + 30 ||
        location.y < -30 ||
        location.y > height + 30
      ) {
        continue;
      }
      const marker = document.createElementNS(namespace, "circle");
      marker.setAttribute("cx", String(location.x));
      marker.setAttribute("cy", String(location.y));
      marker.setAttribute("r", "5");
      marker.setAttribute(
        "class",
        `marker screen-marker${qso.locatorSource === "entity" ? " estimated" : ""}`,
      );
      marker.setAttribute("tabindex", "0");
      marker.setAttribute("role", "button");
      marker.setAttribute("aria-label", `${qso.call}, ${qso.country}`);
      const select = () => {
        tileOverlay
          .querySelectorAll(".marker")
          .forEach((item) => item.classList.remove("active"));
        marker.classList.add("active");
        const detail = document.getElementById("detail") as HTMLElement;
        detail.innerHTML = `<strong>${safe(qso.call)}</strong><span>${safe(qso.country)} · ${safe(qso.band)} · ${safe(qso.mode)} · ${safe(qso.date)} · ${safe(locationText(qso))}</span>`;
      };
      marker.addEventListener("mouseenter", select);
      marker.addEventListener("focus", select);
      marker.addEventListener("pointerdown", (event) => event.stopPropagation());
      marker.addEventListener("click", () => {
        select();
        centerQso(qso);
      });
      marker.addEventListener("keydown", (event) => {
        const key = (event as unknown as { key: string }).key;
        if (key === "Enter" || key === " ") {
          select();
          centerQso(qso);
        }
      });
      tileOverlay.append(marker);
    }
    const attribution = document.getElementById("osm-attribution");
    if (attribution) attribution.dataset.zoom = String(tileZoom);
  };
  const updateView = () => {
    mapCenter = clampCenter(mapCenter);
    const width = 1000 / mapZoom;
    const height = 500 / mapZoom;
    mapSvg.setAttribute(
      "viewBox",
      `${mapCenter.x - width / 2} ${mapCenter.y - height / 2} ${width} ${height}`,
    );
    const zoomLabel = document.getElementById("standalone-zoom-label");
    if (zoomLabel) zoomLabel.textContent = `${Math.round(mapZoom * 100)}%`;
    updateMarkerSizes();
    renderTileMap(visibleQsos);
  };
  const centerQso = (qso: Qso) => {
    mapZoom = Math.max(mapZoom, 2);
    mapCenter = wrappedPoint(qso.lat, qso.lon);
    updateView();
  };

  mapSvg.addEventListener("dblclick", (event) => {
    event.preventDefault();
    const bounds = mapSvg.getBoundingClientRect();
    const centerLongitude = (mapCenter.x / 1000) * 360 - 180;
    const centerLatitude = 90 - (mapCenter.y / 500) * 180;
    const worldSize = bounds.width * mapZoom;
    const destination = point(
      inverseMercY(
        mercY(centerLatitude) +
          (event.clientY - bounds.top - bounds.height / 2) / worldSize,
      ),
      (mercX(centerLongitude) +
        (event.clientX - bounds.left - bounds.width / 2) / worldSize) *
        360 -
        180,
    );
    mapZoom = Math.min(maxMapZoom, mapZoom * zoomFactor);
    mapCenter = destination;
    updateView();
  });
  mapSvg.addEventListener("pointerdown", (event) => {
    if (mapZoom <= 1) return;
    const bounds = mapSvg.getBoundingClientRect();
    const centerLongitude = (mapCenter.x / 1000) * 360 - 180;
    const centerLatitude = 90 - (mapCenter.y / 500) * 180;
    drag = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      centerMercatorX: mercX(centerLongitude),
      centerMercatorY: mercY(centerLatitude),
      worldSize: bounds.width * mapZoom,
    };
    mapSvg.setPointerCapture(event.pointerId);
    mapSvg.classList.add("dragging");
  });
  mapSvg.addEventListener("pointermove", (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    mapCenter = point(
      inverseMercY(
        drag.centerMercatorY -
          (event.clientY - drag.clientY) / drag.worldSize,
      ),
      (drag.centerMercatorX -
        (event.clientX - drag.clientX) / drag.worldSize) *
        360 -
        180,
    );
    updateView();
  });
  const finishDrag = (event: globalThis.PointerEvent) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (mapSvg.hasPointerCapture(event.pointerId)) {
      mapSvg.releasePointerCapture(event.pointerId);
    }
    drag = null;
    mapSvg.classList.remove("dragging");
  };
  mapSvg.addEventListener("pointerup", finishDrag);
  mapSvg.addEventListener("pointercancel", finishDrag);
  document.getElementById("standalone-zoom-in")?.addEventListener("click", () => {
    mapZoom = Math.min(maxMapZoom, mapZoom * zoomFactor);
    updateView();
  });
  document.getElementById("standalone-zoom-out")?.addEventListener("click", () => {
    mapZoom = Math.max(1, mapZoom / zoomFactor);
    updateView();
  });
  document.getElementById("standalone-zoom-reset")?.addEventListener("click", () => {
    mapZoom = 1;
    mapCenter = payload.home
      ? { x: point(payload.home.lat, payload.home.lon).x, y: 250 }
      : { x: 500, y: 250 };
    updateView();
  });
  document.getElementById("standalone-path-toggle")?.addEventListener("click", (event) => {
    pathsVisible = !pathsVisible;
    mapStage.classList.toggle("paths-hidden", !pathsVisible);
    const button = event.currentTarget as HTMLButtonElement;
    button.classList.toggle("is-on", pathsVisible);
    button.setAttribute("aria-pressed", String(pathsVisible));
    button.textContent = `Paths ${pathsVisible ? "on" : "off"}`;
    renderTileMap(visibleQsos);
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
      const origin = wrappedPoint(payload.home.lat, payload.home.lon);
      for (const qso of filtered) {
        const destination = wrappedPoint(qso.lat, qso.lon);
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
      const location = wrappedPoint(qso.lat, qso.lon);
      const marker = document.createElementNS(namespace, "circle");
      marker.setAttribute("cx", String(location.x));
      marker.setAttribute("cy", String(location.y));
      marker.setAttribute("r", "5");
      marker.setAttribute(
        "class",
        `marker${qso.locatorSource === "entity" ? " estimated" : ""}`,
      );
      marker.setAttribute("tabindex", "0");
      marker.setAttribute("role", "button");
      marker.setAttribute("aria-label", `${qso.call}, ${qso.country}`);
      const markerTitle = document.createElementNS(namespace, "title");
      markerTitle.textContent = [
        qso.call,
        qso.country,
        `${qso.band} ${qso.mode}`,
        [qso.date, qso.time ? `${qso.time} UTC` : ""]
          .filter(Boolean)
          .join(" "),
        `Location ${locationText(qso)}`,
        qso.rstSent || qso.rstReceived
          ? `RST ${qso.rstSent || "—"} / ${qso.rstReceived || "—"}`
          : "",
      ]
        .filter(Boolean)
        .join(" · ");
      marker.append(markerTitle);
      const select = () => {
        document.querySelectorAll(".marker").forEach((item) => item.classList.remove("active"));
        marker.classList.add("active");
        updateMarkerSizes();
        const detail = document.getElementById("detail") as HTMLElement;
        detail.innerHTML = `<strong>${safe(qso.call)}</strong><span>${safe(qso.country)} · ${safe(qso.band)} · ${safe(qso.mode)} · ${safe(qso.date)} · ${safe(locationText(qso))}</span>`;
      };
      marker.addEventListener("mouseenter", select);
      marker.addEventListener("focus", select);
      marker.addEventListener("pointerdown", (event) => event.stopPropagation());
      marker.addEventListener("click", () => {
        select();
        centerQso(qso);
      });
      marker.addEventListener("keydown", (event) => {
        const key = (event as unknown as { key: string }).key;
        if (key === "Enter" || key === " ") {
          select();
          centerQso(qso);
        }
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
        detail.innerHTML = `<strong>${safe(qso.call)}</strong><span>${safe(qso.country)} · ${safe(qso.band)} · ${safe(qso.mode)} · ${safe(qso.date)} · ${safe(locationText(qso))}</span>`;
        centerQso(qso);
      });
    });
    resultCount.textContent = `${filtered.length} mapped QSO${filtered.length === 1 ? "" : "s"}`;
    updateMarkerSizes();
    renderTileMap(filtered);
  };

  [band, mode].forEach((element) => element.addEventListener("change", render));
  search.addEventListener("input", render);
  render();
  updateView();
  globalThis.addEventListener("resize", () => renderTileMap(visibleQsos));
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
  const mapCenterX = home ? project(home).x : 500;
  const staticArcs = home
    ? qsos
        .map((qso) => {
          const origin = project(home);
          const destination = project(qso);
          destination.x = nearestWrappedX(destination.x, origin.x);
          const middleX = (origin.x + destination.x) / 2;
          const lift = Math.min(
            82,
            Math.abs(destination.x - origin.x) * 0.16,
          );
          return `<path class="arc" d="M${origin.x},${origin.y} Q${middleX},${Math.min(origin.y, destination.y) - lift} ${destination.x},${destination.y}"/>`;
        })
        .join("")
    : "";
  const staticMarkers = qsos
    .map((qso) => {
      const point = project(qso);
      point.x = nearestWrappedX(point.x, mapCenterX);
      const classes = `marker${qso.locatorSource === "entity" ? " estimated" : ""}`;
      const title = [
        qso.call,
        qso.country,
        `${qso.band} ${qso.mode}`,
        locationLabel(qso),
      ].join(" · ");
      return `<circle cx="${point.x}" cy="${point.y}" r="5" class="${classes}"><title>${escapeHtml(title)}</title></circle>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(sourceName)} · QSO Atlas</title>
<style>
:root{--ink:#f2f0e8;--muted:#9ca7aa;--panel:#111a1e;--line:#26343a;--ocean:#0b1418;--land:#1c2b2f;--amber:#f0b45a;--cyan:#73c9c9}*{box-sizing:border-box}body{display:flex;height:100dvh;margin:0;overflow:hidden;flex-direction:column;background:#091115;color:var(--ink);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}header{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:24px;padding:18px 28px;border-bottom:1px solid var(--line)}h1{margin:0;font-size:18px;letter-spacing:.04em}header p{margin:2px 0 0;color:var(--muted)}.mark{display:flex;align-items:center;gap:12px}.pulse{width:12px;height:12px;border:2px solid var(--amber);border-radius:50%;box-shadow:0 0 0 5px rgba(240,180,90,.12)}.controls{display:flex;flex:0 0 auto;flex-wrap:wrap;gap:10px;padding:14px 28px;border-bottom:1px solid var(--line)}input,select{min-height:38px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);padding:0 12px}input{min-width:220px}.count{margin-left:auto;align-self:center;color:var(--muted)}main{display:grid;min-height:0;flex:1 1 auto;grid-template-columns:minmax(0,1fr) 310px}.map{position:relative;min-height:0;background:var(--ocean);overflow:hidden}.map svg{display:block;width:100%;height:100%;min-height:0;cursor:grab;touch-action:none;user-select:none}.map svg.dragging{cursor:grabbing}.graticule{stroke:#233239;stroke-width:.55;vector-effect:non-scaling-stroke}.land{fill:var(--land);stroke:#33474d;stroke-width:.55;vector-effect:non-scaling-stroke}.arc{fill:none;stroke:var(--amber);stroke-width:1;stroke-opacity:.28;vector-effect:non-scaling-stroke}.marker{fill:var(--amber);stroke:#fff2d7;stroke-width:1.4;cursor:pointer;transition:stroke-width .15s;vector-effect:non-scaling-stroke}.marker.estimated{fill:var(--cyan);stroke-dasharray:2 1}.marker:hover,.marker:focus,.marker.active{stroke-width:2.4;outline:none}.origin{fill:var(--cyan);stroke:#dff;stroke-width:2;vector-effect:non-scaling-stroke}.tiles-loaded .graticule,.tiles-loaded .land,.tiles-loaded .arc,.tiles-loaded .marker,.tiles-loaded .origin{visibility:hidden}.tile-layer,#standalone-tile-overlay{position:absolute;inset:0}.tile-layer{z-index:1;overflow:hidden;pointer-events:none}.tile-layer img{position:absolute;display:block;max-width:none;border:0;user-select:none}#standalone-tile-overlay{z-index:2;width:100%;height:100%;min-height:0;overflow:visible;pointer-events:none}.screen-marker{pointer-events:auto}.attribution{position:absolute;z-index:4;right:7px;bottom:5px;padding:2px 5px;border-radius:2px;background:rgba(255,255,255,.82);color:#1e2a2d;font-size:9px;pointer-events:auto}.attribution a{color:#174a69}.mapbuttons{position:absolute;display:grid;z-index:5;top:16px;right:16px;overflow:hidden;border:1px solid var(--line);border-radius:5px;background:rgba(9,17,21,.92)}.mapbuttons button{min-width:44px;height:34px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink)}.mapbuttons button:last-child{border:0}.detail{position:absolute;z-index:4;left:20px;bottom:20px;display:flex;gap:14px;align-items:center;max-width:calc(100% - 40px);padding:12px 15px;border:1px solid #3a4c52;border-radius:8px;background:rgba(9,17,21,.92)}.detail span{color:var(--muted)}aside{min-height:0;border-left:1px solid var(--line);background:var(--panel);overflow:auto}.row{display:grid;width:100%;grid-template-columns:1.2fr 1.6fr .7fr .7fr;gap:8px;padding:13px 16px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink);text-align:left;cursor:pointer}.row:hover{background:#18252a}.row span{overflow:hidden;color:var(--muted);text-overflow:ellipsis;white-space:nowrap}@media(max-width:760px){body{display:block;height:auto;min-height:100vh;overflow:auto}header{align-items:flex-start;padding:16px 18px}.controls{padding:12px 18px}.count{width:100%;margin-left:0}main{display:grid;min-height:0;grid-template-columns:1fr}.map,.map svg{min-height:430px}aside{max-height:360px;border-top:1px solid var(--line);border-left:0}}
.arc{stroke:#a51f3b;stroke-width:2.15;stroke-opacity:.82;filter:drop-shadow(0 0 1px rgba(255,255,255,.95)) drop-shadow(0 0 1px rgba(255,255,255,.8))}.marker{fill:#dc3214;stroke:#fff;stroke-width:2;filter:drop-shadow(0 1px 2px rgba(0,0,0,.9))}.marker.estimated{fill:#007681;stroke:#fff;stroke-dasharray:2 1}.origin{fill:#007681;stroke:#fff;stroke-width:2.2;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8))}.paths-hidden .arc{display:none}.path-toggle{position:absolute;z-index:5;top:16px;left:16px;min-height:34px;padding:0 10px;border:1px solid var(--line);border-radius:5px;background:rgba(9,17,21,.92);color:var(--muted);font-size:11px}.path-toggle.is-on{color:var(--ink);box-shadow:inset 3px 0 #ef6680}.path-toggle:hover{background:#18252a}
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
<section class="map" id="standalone-map-stage" aria-label="World map of radio contacts">
<svg id="standalone-map" viewBox="${mapCenterX - 500} 0 1000 500" preserveAspectRatio="xMidYMin meet" role="img" aria-label="World map with QSO paths">
${[-1000, 0, 1000].map((offset) => `<g transform="translate(${offset} 0)"><g class="graticule">${[-120, -60, 0, 60, 120].map((lon) => `<line x1="${((lon + 180) / 360) * 1000}" y1="0" x2="${((lon + 180) / 360) * 1000}" y2="500"/>`).join("")}${[-60, -30, 0, 30, 60].map((lat) => `<line x1="0" y1="${((90 - lat) / 180) * 500}" x2="1000" y2="${((90 - lat) / 180) * 500}"/>`).join("")}</g><path class="land" d="${worldPath}"/></g>`).join("")}
${home ? `<circle class="origin" cx="${project(home).x}" cy="${project(home).y}" r="6"/>` : ""}
<g id="map-points">${staticArcs}${staticMarkers}</g>
</svg>
<div class="tile-layer" id="standalone-tiles"></div>
<svg id="standalone-tile-overlay" aria-label="QSO markers over OpenStreetMap"></svg>
<button class="path-toggle is-on" id="standalone-path-toggle" type="button" aria-pressed="true">Paths on</button>
<div class="mapbuttons" aria-label="Map zoom">
<button id="standalone-zoom-in" type="button" aria-label="Zoom in">+</button>
<button id="standalone-zoom-reset" type="button" aria-label="Reset map"><span id="standalone-zoom-label">100%</span></button>
<button id="standalone-zoom-out" type="button" aria-label="Zoom out">−</button>
</div>
<div class="detail" id="detail"><strong>Select a QSO</strong><span>Use the map or contact list</span></div>
<div class="attribution" id="osm-attribution">© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors</div>
</section>
<aside id="qso-list" aria-label="QSO list"></aside>
</main>
<script>window.__QSO_PAYLOAD__=${payload};(${standaloneApp.toString()})()</script>
</body>
</html>`;
}

function OsmTileLayer({
  qsos,
  home,
  center,
  zoom,
  showPaths,
  selected,
  onSelect,
  onHover,
  onLeave,
  onReady,
}: {
  qsos: Qso[];
  home: Coordinates | null;
  center: { x: number; y: number };
  zoom: number;
  showPaths: boolean;
  selected: Qso | null;
  onSelect: (qso: Qso) => void;
  onHover: (
    qso: Qso,
    event: MouseEvent<SVGGElement> | FocusEvent<SVGGElement>,
  ) => void;
  onLeave: () => void;
  onReady: () => void;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const update = () =>
      setSize({ width: layer.clientWidth, height: layer.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(layer);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => {
    if (!size.width || !size.height) {
      return { tiles: [], points: [], homePoint: null, tileZoom: 0 };
    }
    const worldSize = size.width * zoom;
    const tileZoom = Math.max(
      0,
      Math.min(
        OSM_MAX_ZOOM,
        Math.floor(Math.log2(Math.max(1, worldSize / 256))),
      ),
    );
    const tileCount = 2 ** tileZoom;
    const tileSize = worldSize / tileCount;
    const centerLongitude = (center.x / 1000) * 360 - 180;
    const centerLatitude = 90 - (center.y / 500) * 180;
    const centerWorldX = mercatorX(centerLongitude) * worldSize;
    const centerWorldY = mercatorY(centerLatitude) * worldSize;
    const firstTileX = Math.floor(
      (centerWorldX - size.width / 2) / tileSize,
    );
    const lastTileX = Math.floor(
      (centerWorldX + size.width / 2) / tileSize,
    );
    const firstTileY = Math.max(
      0,
      Math.floor((centerWorldY - size.height / 2) / tileSize),
    );
    const lastTileY = Math.min(
      tileCount - 1,
      Math.floor((centerWorldY + size.height / 2) / tileSize),
    );
    const tiles: {
      key: string;
      url: string;
      left: number;
      top: number;
      size: number;
    }[] = [];
    for (let x = firstTileX; x <= lastTileX; x += 1) {
      for (let y = firstTileY; y <= lastTileY; y += 1) {
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        tiles.push({
          key: `${tileZoom}/${x}/${y}`,
          url: `https://tile.openstreetmap.org/${tileZoom}/${wrappedX}/${y}.png`,
          left: x * tileSize - centerWorldX + size.width / 2,
          top: y * tileSize - centerWorldY + size.height / 2,
          size: tileSize + 0.5,
        });
      }
    }

    const screenPoint = (coordinates: Coordinates) => {
      let deltaX = mercatorX(coordinates.lon) - mercatorX(centerLongitude);
      deltaX -= Math.round(deltaX);
      return {
        x: size.width / 2 + deltaX * worldSize,
        y:
          size.height / 2 +
          (mercatorY(coordinates.lat) - mercatorY(centerLatitude)) *
            worldSize,
      };
    };
    return {
      tiles,
      tileZoom,
      points: qsos.map((qso) => ({ qso, ...screenPoint(qso) })),
      homePoint: home ? screenPoint(home) : null,
    };
  }, [center, home, qsos, size, zoom]);

  return (
    <div className="osm-map-layer" ref={layerRef}>
      <div className="osm-tiles">
        {geometry.tiles.map((tile) => (
          <img
            alt=""
            draggable="false"
            key={tile.key}
            src={tile.url}
            style={{
              left: tile.left,
              top: tile.top,
              width: tile.size,
              height: tile.size,
            }}
            onLoad={onReady}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ))}
      </div>
      <svg
        className="osm-qso-overlay"
        viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
        preserveAspectRatio="none"
      >
        {showPaths &&
          home &&
          geometry.homePoint &&
          zoom < 96 &&
          geometry.points.map(({ qso, x, y }) => {
            const start = geometry.homePoint!;
            const middleX = (start.x + x) / 2;
            const lift = Math.min(90, Math.abs(x - start.x) * 0.12);
            return (
              <path
                className="contact-arc"
                d={`M${start.x},${start.y} Q${middleX},${Math.min(start.y, y) - lift} ${x},${y}`}
                key={`osm-path-${qso.id}`}
              />
            );
          })}
        {geometry.homePoint && (
          <g
            className="home-marker osm-screen-marker"
            transform={`translate(${geometry.homePoint.x} ${geometry.homePoint.y})`}
          >
            <circle r="6" />
            <circle className="home-halo" r="13" />
          </g>
        )}
        {geometry.points.map(({ qso, x, y }) => {
          if (
            x < -30 ||
            x > size.width + 30 ||
            y < -30 ||
            y > size.height + 30
          ) {
            return null;
          }
          const isSelected = selected?.id === qso.id;
          const isEstimated = qso.locatorSource === "entity";
          return (
            <g
              className={`qso-marker osm-screen-marker${isSelected ? " is-selected" : ""}${isEstimated ? " is-estimated" : ""}`}
              key={`osm-${qso.id}`}
              role="button"
              aria-label={`${qso.call}, ${qso.country}, ${qso.band} ${qso.mode}`}
              tabIndex={0}
              transform={`translate(${x} ${y})`}
              onMouseEnter={(event) => onHover(qso, event)}
              onMouseLeave={onLeave}
              onFocus={(event) => onHover(qso, event)}
              onBlur={onLeave}
              onPointerDown={(event) => event.stopPropagation()}
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
                r={isSelected ? 12 : 8}
              />
              <circle
                className="qso-marker-dot"
                r={isSelected ? 5.5 : 4}
              />
            </g>
          );
        })}
      </svg>
      <div className="osm-attribution">
        ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </a>{" "}
        contributors · z{geometry.tileZoom}
      </div>
    </div>
  );
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
  const [tilesReady, setTilesReady] = useState(false);
  const [showPaths, setShowPaths] = useState(true);
  const [center, setCenter] = useState(() => ({
    x: home ? project(home).x : 500,
    y: 250,
  }));
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    centerMercatorX: number;
    centerMercatorY: number;
    worldSize: number;
  } | null>(null);
  const [hovered, setHovered] = useState<{
    qso: Qso;
    x: number;
    y: number;
    placement: "above" | "below";
  } | null>(null);
  const viewWidth = 1000 / zoom;
  const viewHeight = 500 / zoom;
  const viewBox = `${center.x - viewWidth / 2} ${center.y - viewHeight / 2} ${viewWidth} ${viewHeight}`;

  function clampCenter(candidate: { x: number; y: number }, level: number) {
    const halfHeight = 250 / level;
    return {
      x: ((candidate.x % 1000) + 1000) % 1000,
      y: Math.max(halfHeight, Math.min(500 - halfHeight, candidate.y)),
    };
  }

  function changeZoom(nextZoom: number) {
    const level = Math.max(1, Math.min(MAX_MAP_ZOOM, nextZoom));
    setZoom(level);
    setCenter((current) => clampCenter(current, level));
  }

  function centerOnQso(qso: Qso) {
    const level = Math.max(zoom, 2);
    setHovered(null);
    setZoom(level);
    const point = project(qso);
    setCenter(
      clampCenter(
        { ...point, x: nearestWrappedX(point.x, center.x) },
        level,
      ),
    );
    onSelect(qso);
  }

  useEffect(() => {
    setZoom(1);
    setCenter({ x: home ? project(home).x : 500, y: 250 });
  }, [home]);

  function handleDoubleClick(event: MouseEvent<SVGSVGElement>) {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const centerLongitude = (center.x / 1000) * 360 - 180;
    const centerLatitude = 90 - (center.y / 500) * 180;
    const worldSize = bounds.width * zoom;
    const destinationLongitude =
      (mercatorX(centerLongitude) +
        (event.clientX - bounds.left - bounds.width / 2) / worldSize) *
        360 -
      180;
    const destinationLatitude = inverseMercatorY(
      mercatorY(centerLatitude) +
        (event.clientY - bounds.top - bounds.height / 2) / worldSize,
    );
    const destination = project({
      lat: destinationLatitude,
      lon: destinationLongitude,
    });
    const level = Math.min(MAX_MAP_ZOOM, zoom * MAP_ZOOM_FACTOR);
    setZoom(level);
    setCenter(clampCenter(destination, level));
  }

  function startPan(event: PointerEvent<SVGSVGElement>) {
    if (zoom <= 1) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const centerLongitude = (center.x / 1000) * 360 - 180;
    const centerLatitude = 90 - (center.y / 500) * 180;
    panRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      centerMercatorX: mercatorX(centerLongitude),
      centerMercatorY: mercatorY(centerLatitude),
      worldSize: bounds.width * zoom,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function continuePan(event: PointerEvent<SVGSVGElement>) {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    setCenter(
      clampCenter(
        project({
          lon:
            (pan.centerMercatorX -
              (event.clientX - pan.clientX) / pan.worldSize) *
              360 -
            180,
          lat: inverseMercatorY(
            pan.centerMercatorY -
              (event.clientY - pan.clientY) / pan.worldSize,
          ),
        }),
        zoom,
      ),
    );
  }

  function finishPan(event: PointerEvent<SVGSVGElement>) {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    panRef.current = null;
    setIsPanning(false);
  }

  function showHover(
    qso: Qso,
    event: MouseEvent<SVGGElement> | FocusEvent<SVGGElement>,
  ) {
    const markerBounds = event.currentTarget.getBoundingClientRect();
    const mapBounds =
      event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!mapBounds) return;

    const cardWidth = Math.min(280, Math.max(220, mapBounds.width - 24));
    const minimumX = cardWidth / 2 + 12;
    const maximumX = Math.max(minimumX, mapBounds.width - minimumX);
    const markerX =
      markerBounds.left + markerBounds.width / 2 - mapBounds.left;
    const markerY =
      markerBounds.top + markerBounds.height / 2 - mapBounds.top;

    setHovered({
      qso,
      x: Math.max(minimumX, Math.min(maximumX, markerX)),
      y: markerY,
      placement: markerY < 170 ? "below" : "above",
    });
  }

  return (
    <div className="map-stage">
      <svg
        className={`world-map${isPanning ? " is-panning" : ""}${tilesReady ? " has-osm" : ""}`}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMin meet"
        role="img"
        aria-label={`World map showing ${qsos.length} mapped QSOs`}
        onDoubleClick={handleDoubleClick}
        onPointerDown={startPan}
        onPointerMove={continuePan}
        onPointerUp={finishPan}
        onPointerCancel={finishPan}
      >
        <title>World map of mapped amateur radio contacts</title>
        <desc>
          Contact paths extend from the station location to each mapped QSO.
          Select a marker for details.
        </desc>
        <rect className="map-ocean" x="-1000" y="0" width="3000" height="500" />
        {[-1000, 0, 1000].map((offset) => (
          <g key={offset} transform={`translate(${offset} 0)`} aria-hidden="true">
            <g className="map-graticule">
              {[-120, -60, 0, 60, 120].map((longitude) => {
                const x = ((longitude + 180) / 360) * 1000;
                return <line key={longitude} x1={x} y1="0" x2={x} y2="500" />;
              })}
              {[-60, -30, 0, 30, 60].map((latitude) => {
                const y = ((90 - latitude) / 180) * 500;
                return <line key={latitude} x1="0" y1={y} x2="1000" y2={y} />;
              })}
            </g>
            <path className="map-land" d={WORLD_PATH} />
          </g>
        ))}
        {showPaths &&
          home &&
          qsos.map((qso) =>
            greatCircleSegments(home, qso).flatMap((segment, index) =>
              [-1000, 0, 1000].map((offset) => (
                <path
                  className="contact-arc"
                  d={segment
                    .map(
                      (point, pointIndex) =>
                        `${pointIndex === 0 ? "M" : "L"}${(point.x + offset).toFixed(2)},${point.y.toFixed(2)}`,
                    )
                    .join(" ")}
                  key={`${qso.id}-${index}-${offset}`}
                />
              )),
            ),
          )}
        {home && (() => {
          const homePoint = project(home);
          homePoint.x = nearestWrappedX(homePoint.x, center.x);
          return (
          <g className="home-marker" aria-label="Station location">
            <circle
              cx={homePoint.x}
              cy={homePoint.y}
              r={6 / zoom}
            />
            <circle
              className="home-halo"
              cx={homePoint.x}
              cy={homePoint.y}
              r={13 / zoom}
            />
          </g>
          );
        })()}
        {qsos.map((qso) => {
          const point = project(qso);
          point.x = nearestWrappedX(point.x, center.x);
          const isSelected = selected?.id === qso.id;
          const isEstimated = qso.locatorSource === "entity";
          return (
            <g
              className={`qso-marker${isSelected ? " is-selected" : ""}${isEstimated ? " is-estimated" : ""}`}
              key={qso.id}
              role="button"
              aria-label={`${qso.call}, ${qso.country}, ${qso.band} ${qso.mode}${isEstimated ? ", approximate location" : ""}`}
              tabIndex={0}
              transform={`translate(${point.x} ${point.y})`}
              onMouseEnter={(event) => showHover(qso, event)}
              onMouseLeave={() => setHovered(null)}
              onFocus={(event) => showHover(qso, event)}
              onBlur={() => setHovered(null)}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => centerOnQso(qso)}
              onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  centerOnQso(qso);
                }
              }}
            >
              <circle
                className="qso-marker-halo"
                r={(isSelected ? 12 : 8) / zoom}
              />
              <circle
                className="qso-marker-dot"
                r={(isSelected ? 5.5 : 4) / zoom}
              />
            </g>
          );
        })}
      </svg>

      <OsmTileLayer
        qsos={qsos}
        home={home}
        center={center}
        zoom={zoom}
        showPaths={showPaths}
        selected={selected}
        onSelect={centerOnQso}
        onHover={showHover}
        onLeave={() => setHovered(null)}
        onReady={() => setTilesReady(true)}
      />

      {hovered && (
        <div
          className={`qso-hover-card is-${hovered.placement}`}
          style={{ left: hovered.x, top: hovered.y }}
          role="tooltip"
        >
          <div className="qso-hover-heading">
            <div>
              <strong>{hovered.qso.call}</strong>
              <span>{hovered.qso.country}</span>
            </div>
            <small>{hovered.qso.qsl || "Unconfirmed"}</small>
          </div>
          <dl>
            <div>
              <dt>Band / mode</dt>
              <dd>
                {hovered.qso.band} · {hovered.qso.mode}
              </dd>
            </div>
            <div>
              <dt>Date / time</dt>
              <dd>
                {hovered.qso.date || "—"}
                {hovered.qso.time ? ` · ${hovered.qso.time}Z` : ""}
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{locationLabel(hovered.qso)}</dd>
            </div>
            <div>
              <dt>Signal</dt>
              <dd>
                {hovered.qso.rstSent || "—"} /{" "}
                {hovered.qso.rstReceived || "—"}
              </dd>
            </div>
            {home && (
              <div>
                <dt>Distance</dt>
                <dd>
                  {Math.round(
                    distanceKm(home, hovered.qso),
                  ).toLocaleString()}{" "}
                  km
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="map-gesture-hint" aria-hidden="true">
        Drag to pan · Double-click to zoom
      </div>

      <button
        className={`path-toggle${showPaths ? " is-on" : ""}`}
        type="button"
        aria-pressed={showPaths}
        onClick={() => setShowPaths((current) => !current)}
      >
        <span aria-hidden="true" />
        Paths {showPaths ? "on" : "off"}
      </button>

      <div className="map-tools" aria-label="Map zoom">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => changeZoom(zoom * MAP_ZOOM_FACTOR)}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Reset zoom"
          onClick={() => {
            setZoom(1);
            setCenter({ x: home ? project(home).x : 500, y: 250 });
          }}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => changeZoom(zoom / MAP_ZOOM_FACTOR)}
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
  const estimated = qsos.filter(
    (qso) => qso.locatorSource === "entity",
  ).length;

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
      const [{ lookupDxcc }, text] = await Promise.all([
        import("./dxcc-data"),
        file.text(),
      ]);
      const parsed = parseAdif(text, lookupDxcc);
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
      const approximate = parsed.qsos.filter(
        (qso) => qso.locatorSource === "entity",
      ).length;
      setMessage(
        `${parsed.qsos.length.toLocaleString()} of ${parsed.totalRecords.toLocaleString()} QSOs mapped locally${approximate ? ` · ${approximate.toLocaleString()} approximate` : ""}.`,
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
                <i className="legend-estimated" /> Estimated
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
            <span>
              Locations use LAT/LON first, then Maidenhead grids, then offline
              DXCC entity centroids.
            </span>
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
                  <small>
                    {qso.country}
                    {qso.locatorSource === "entity" ? " · approx." : ""}
                  </small>
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
                  <dt>Location</dt>
                  <dd>{locationLabel(selected)}</dd>
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
        <article className={estimated ? "has-estimates" : ""}>
          <span>Approximate positions</span>
          <strong>{estimated.toLocaleString()}</strong>
          {skipped > 0 && <small>{skipped.toLocaleString()} still unmapped</small>}
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
