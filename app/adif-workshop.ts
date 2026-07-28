export type WorkshopRecord = {
  id: string;
  source: string;
  fields: Record<string, string>;
};

export type CleanupMode = "lossless" | "no-app" | "minimal" | "custom";

export type WorkshopExportOptions = {
  cleanup: CleanupMode;
  customFields?: ReadonlySet<string>;
};

const MINIMAL_PORTABLE_FIELDS = new Set([
  "CALL",
  "QSO_DATE",
  "TIME_ON",
  "TIME_OFF",
  "BAND",
  "BAND_RX",
  "FREQ",
  "FREQ_RX",
  "MODE",
  "SUBMODE",
  "RST_SENT",
  "RST_RCVD",
  "GRIDSQUARE",
  "MY_GRIDSQUARE",
  "LAT",
  "LON",
  "MY_LAT",
  "MY_LON",
  "COUNTRY",
  "DXCC",
  "STATE",
  "CNTY",
  "CQZ",
  "ITUZ",
  "CONT",
  "IOTA",
  "MY_COUNTRY",
  "MY_DXCC",
  "MY_STATE",
  "MY_CNTY",
  "MY_CQ_ZONE",
  "MY_ITU_ZONE",
  "MY_IOTA",
  "NAME",
  "QTH",
  "COMMENT",
  "NOTES",
  "STATION_CALLSIGN",
  "OPERATOR",
  "OWNER_CALLSIGN",
  "PROP_MODE",
  "SAT_NAME",
  "SAT_MODE",
  "CONTEST_ID",
  "SRX",
  "STX",
  "SRX_STRING",
  "STX_STRING",
  "SIG",
  "SIG_INFO",
  "MY_SIG",
  "MY_SIG_INFO",
  "QSL_SENT",
  "QSL_RCVD",
  "QSL_SENT_VIA",
  "QSL_RCVD_VIA",
  "QSLMSG",
  "LOTW_QSL_SENT",
  "LOTW_QSL_RCVD",
  "EQSL_QSL_SENT",
  "EQSL_QSL_RCVD",
]);

function readTag(
  text: string,
  start: number,
): { name: string; value: string; next: number } | null {
  const close = text.indexOf(">", start + 1);
  if (close < 0) return null;
  const descriptor = text.slice(start + 1, close).trim();
  const endMarker = /^(EOH|EOR)$/i.exec(descriptor);
  if (endMarker) {
    return { name: endMarker[1].toUpperCase(), value: "", next: close + 1 };
  }

  const field = /^([^:>\s]+):(\d+)(?::[^>]*)?$/i.exec(descriptor);
  if (!field) return null;
  const length = Number(field[2]);
  const available = text.slice(close + 1);
  const value = Array.from(available).slice(0, length).join("");
  return {
    name: field[1].toUpperCase(),
    value,
    next: close + 1 + value.length,
  };
}

export function parseWorkshopAdif(
  text: string,
  source: string,
  idPrefix = source,
) {
  const records: WorkshopRecord[] = [];
  let current: Record<string, string> = {};
  let inHeader = /<EOH(?:\s|>)/i.test(text);
  let cursor = 0;
  let sequence = 0;

  while (cursor < text.length) {
    const open = text.indexOf("<", cursor);
    if (open < 0) break;
    const tag = readTag(text, open);
    if (!tag) {
      cursor = open + 1;
      continue;
    }
    cursor = tag.next;

    if (tag.name === "EOH") {
      inHeader = false;
      current = {};
      continue;
    }
    if (tag.name === "EOR") {
      if (Object.keys(current).length) {
        records.push({
          id: `${idPrefix}-${sequence}`,
          source,
          fields: current,
        });
        sequence += 1;
      }
      current = {};
      inHeader = false;
      continue;
    }
    if (!inHeader) current[tag.name] = tag.value;
  }

  return records;
}

function field(tag: string, value: string) {
  return `<${tag}:${Array.from(value).length}>${value}`;
}

export function fieldsForCleanup(
  fields: Record<string, string>,
  options: WorkshopExportOptions,
) {
  return Object.fromEntries(
    Object.entries(fields).filter(([tag, value]) => {
      if (value === "") return false;
      if (options.cleanup === "no-app") return !tag.startsWith("APP_");
      if (options.cleanup === "minimal") {
        return MINIMAL_PORTABLE_FIELDS.has(tag);
      }
      if (options.cleanup === "custom") {
        return options.customFields?.has(tag) ?? false;
      }
      return true;
    }),
  );
}

export function serializeWorkshopAdif(
  records: WorkshopRecord[],
  options: WorkshopExportOptions,
) {
  const header = [
    field("ADIF_VER", "3.1.7"),
    field("PROGRAMID", "ADIF Atlas"),
    field("PROGRAMVERSION", "1.0"),
    "<EOH>",
  ].join("\n");
  const body = records
    .map((record) => {
      const fields = fieldsForCleanup(record.fields, options);
      return `${Object.entries(fields)
        .map(([tag, value]) => field(tag, value))
        .join(" ")} <EOR>`;
    })
    .join("\n");
  return `${header}\n\n${body}${body ? "\n" : ""}`;
}

export function duplicateKey(record: WorkshopRecord) {
  const { fields } = record;
  return [
    fields.CALL,
    fields.QSO_DATE,
    fields.TIME_ON,
    fields.BAND || fields.FREQ,
  ]
    .map((value) => (value || "").trim().toUpperCase())
    .join("|");
}

export function formatAdifDate(value = "") {
  if (!/^\d{8}$/.test(value)) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

export function formatAdifTime(value = "") {
  if (!/^\d{4,6}$/.test(value)) return value;
  return `${value.slice(0, 2)}:${value.slice(2, 4)}${value.length >= 6 ? `:${value.slice(4, 6)}` : ""}`;
}

export function allFieldNames(records: WorkshopRecord[]) {
  return [
    ...new Set(records.flatMap((record) => Object.keys(record.fields))),
  ].sort();
}
