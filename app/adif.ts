export type AdifExportQso = {
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
  lat: number;
  lon: number;
  locatorSource: "grid" | "coordinates" | "entity";
  adifFields?: Record<string, string>;
};

function field(tag: string, value: string) {
  return `<${tag}:${Array.from(value).length}>${value}`;
}

function formatCoordinate(
  value: number,
  axis: "lat" | "lon",
) {
  const positive = axis === "lat" ? "N" : "E";
  const negative = axis === "lat" ? "S" : "W";
  const degreesWidth = axis === "lat" ? 2 : 3;
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutes = ((absolute - degrees) * 60).toFixed(3).padStart(6, "0");
  return `${value < 0 ? negative : positive}${String(degrees).padStart(degreesWidth, "0")} ${minutes}`;
}

function fieldsForQso(qso: AdifExportQso, homeGrid: string) {
  const fields = { ...(qso.adifFields ?? {}) };
  const add = (tag: string, value: string) => {
    if (!fields[tag] && value) fields[tag] = value;
  };

  add("CALL", qso.call);
  add("BAND", qso.band);
  add("MODE", qso.mode);
  add("QSO_DATE", qso.date.replaceAll("-", ""));
  add("TIME_ON", qso.time.replaceAll(":", ""));
  add("COUNTRY", qso.country);
  add("GRIDSQUARE", qso.grid);
  add("FREQ", qso.frequency);
  add("RST_SENT", qso.rstSent);
  add("RST_RCVD", qso.rstReceived);
  add("NAME", qso.name);
  add("MY_GRIDSQUARE", homeGrid);

  if (qso.locatorSource === "coordinates") {
    add("LAT", formatCoordinate(qso.lat, "lat"));
    add("LON", formatCoordinate(qso.lon, "lon"));
  }

  return fields;
}

export function serializeAdif(
  qsos: AdifExportQso[],
  homeGrid = "",
) {
  const header = [
    field("ADIF_VER", "3.1.4"),
    field("PROGRAMID", "ADIF Atlas"),
    field("PROGRAMVERSION", "1.0"),
    "<EOH>",
  ].join("\n");

  const records = qsos.map((qso) => {
    const fields = fieldsForQso(qso, homeGrid);
    const body = Object.entries(fields)
      .filter(([, value]) => value !== "")
      .map(([tag, value]) => field(tag, value))
      .join(" ");
    return `${body} <EOR>`;
  });

  return `${header}\n\n${records.join("\n")}\n`;
}
