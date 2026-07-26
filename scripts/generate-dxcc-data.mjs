import fs from "node:fs";
import path from "node:path";

const source =
  process.argv[2] ??
  "/Applications/wsjtx.app/Contents/Resources/wsjtx/cty.dat";
const destination =
  process.argv[3] ?? path.resolve("app/dxcc-data.ts");

const text = fs.readFileSync(source, "utf8");
const lines = text.split(/\r?\n/);
const entities = [];
const prefixes = new Map();
const exact = new Map();

let current = null;
let aliases = "";

function addAlias(rawAlias, entityIndex) {
  let alias = rawAlias.trim();
  if (!alias) return;

  const isExact = alias.startsWith("=");
  if (isExact) alias = alias.slice(1);

  const coordinateOverride = alias.match(/<(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)>/);
  alias = alias
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/~[^~]*~/g, "")
    .replace(/^\*/, "")
    .trim()
    .toUpperCase();

  if (!alias) return;

  const entity = entities[entityIndex];
  const target = coordinateOverride
    ? [
        entity[0],
        Number(coordinateOverride[1]),
        -Number(coordinateOverride[2]),
      ]
    : entity;
  const targetIndex = coordinateOverride
    ? entities.push(target) - 1
    : entityIndex;

  const collection = isExact ? exact : prefixes;
  if (!collection.has(alias)) collection.set(alias, targetIndex);
}

function flush() {
  if (!current) return;
  for (const alias of aliases.split(/[,;]/)) {
    addAlias(alias, current.index);
  }
  addAlias(current.primary, current.index);
  current = null;
  aliases = "";
}

for (const line of lines) {
  if (!line.trim()) continue;
  if (!/^\s/.test(line)) {
    flush();
    const parts = line.split(":").map((part) => part.trim());
    if (parts.length < 8) continue;
    const latitude = Number(parts[4]);
    const longitude = -Number(parts[5]);
    const primary = parts[7].replace(/^\*/, "");
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !primary) {
      continue;
    }
    current = {
      index: entities.push([parts[0], latitude, longitude]) - 1,
      primary,
    };
    continue;
  }

  if (current) aliases += line.trim();
  if (line.includes(";")) flush();
}
flush();

const prefixRows = [...prefixes]
  .sort(([left], [right]) => right.length - left.length || left.localeCompare(right));
const exactRows = [...exact].sort(([left], [right]) => left.localeCompare(right));

const output = `// Generated from the CTY.DAT country file distributed with WSJT-X.
// Country-file format and data are maintained by Jim Reisert, AD1C:
// https://www.country-files.com/cty-dat-format/
// Regenerate with: node scripts/generate-dxcc-data.mjs /path/to/cty.dat

export type DxccMatch = {
  country: string;
  lat: number;
  lon: number;
};

const entities: readonly (readonly [string, number, number])[] = ${JSON.stringify(entities)};
const exactEntries: readonly (readonly [string, number])[] = ${JSON.stringify(exactRows)};
const prefixEntries: readonly (readonly [string, number])[] = ${JSON.stringify(prefixRows)};

const exact = new Map(exactEntries);

export function lookupDxcc(callsignValue: string): DxccMatch | null {
  const callsign = callsignValue.trim().toUpperCase().replace(/\\s+/g, "");
  if (!callsign) return null;

  const exactIndex = exact.get(callsign);
  if (exactIndex !== undefined) {
    const [country, lat, lon] = entities[exactIndex];
    return { country, lat, lon };
  }

  for (const [prefix, entityIndex] of prefixEntries) {
    if (!callsign.startsWith(prefix)) continue;
    const [country, lat, lon] = entities[entityIndex];
    return { country, lat, lon };
  }

  return null;
}
`;

fs.writeFileSync(destination, output);
console.log(
  `Generated ${destination}: ${entities.length} locations, ${prefixRows.length} prefixes, ${exactRows.length} exact callsigns.`,
);
