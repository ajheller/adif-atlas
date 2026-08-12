"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  allFieldNames,
  type CleanupMode,
  duplicateKey,
  fieldsForCleanup,
  formatAdifDate,
  formatAdifTime,
  parseWorkshopAdifAsync,
  serializeWorkshopAdif,
  type WorkshopRecord,
} from "../adif-workshop";
import {
  clearSharedAdif,
  loadSharedAdif,
  saveSharedAdif,
} from "../adif-session";

const PAGE_SIZE = 100;

function downloadText(contents: string, filename: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function mapHref() {
  return window.location.hostname.endsWith("github.io")
    ? "./index.html"
    : "/";
}

function readFileWithProgress(
  file: File,
  onProgress: (progress: number) => void,
) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });
    reader.addEventListener("load", () => {
      onProgress(1);
      resolve(String(reader.result ?? ""));
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.addEventListener("abort", () => reject(new Error("File read aborted")));
    reader.readAsText(file);
  });
}

export default function WorkshopPage() {
  const [records, setRecords] = useState<WorkshopRecord[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [band, setBand] = useState("All");
  const [mode, setMode] = useState("All");
  const [stationCall, setStationCall] = useState("All");
  const [operatorCall, setOperatorCall] = useState("All");
  const [source, setSource] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showExcluded, setShowExcluded] = useState(false);
  const [cleanup, setCleanup] = useState<CleanupMode>("lossless");
  const [exportScope, setExportScope] = useState<"retained" | "displayed">(
    "retained",
  );
  const [customExcludedFields, setCustomExcludedFields] = useState<Set<string>>(
    new Set(),
  );
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState(
    "Load one or more ADIF files. Everything stays in this browser.",
  );
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    percent: number;
    label: string;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const restoreStarted = useRef(false);

  const fields = useMemo(() => allFieldNames(records), [records]);
  const appFields = useMemo(
    () => fields.filter((field) => field.startsWith("APP_")),
    [fields],
  );
  const bands = useMemo(
    () =>
      [...new Set(records.map((record) => record.fields.BAND).filter(Boolean))]
        .sort(),
    [records],
  );
  const modes = useMemo(
    () =>
      [...new Set(records.map((record) => record.fields.MODE).filter(Boolean))]
        .sort(),
    [records],
  );
  const sources = useMemo(
    () => [...new Set(records.map((record) => record.source))].sort(),
    [records],
  );
  const stationCalls = useMemo(
    () =>
      [
        ...new Set(
          records
            .map((record) => record.fields.STATION_CALLSIGN)
            .filter(Boolean),
        ),
      ].sort(),
    [records],
  );
  const operatorCalls = useMemo(
    () =>
      [
        ...new Set(
          records.map((record) => record.fields.OPERATOR).filter(Boolean),
        ),
      ].sort(),
    [records],
  );

  const duplicateIds = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const record of records) {
      const key = duplicateKey(record);
      if (!record.fields.CALL || !record.fields.QSO_DATE) continue;
      if (seen.has(key)) duplicates.add(record.id);
      else seen.add(key);
    }
    return duplicates;
  }, [records]);

  const filtered = useMemo(
    () =>
      records.filter((record) => {
        const { fields } = record;
        const recordDate = formatAdifDate(fields.QSO_DATE);
        return (
          (showExcluded || !excluded.has(record.id)) &&
          (band === "All" || fields.BAND === band) &&
          (mode === "All" || fields.MODE === mode) &&
          (stationCall === "All" ||
            fields.STATION_CALLSIGN === stationCall) &&
          (operatorCall === "All" || fields.OPERATOR === operatorCall) &&
          (source === "All" || record.source === source) &&
          (!dateFrom || (!!recordDate && recordDate >= dateFrom)) &&
          (!dateTo || (!!recordDate && recordDate <= dateTo)) &&
          (!deferredSearch ||
            Object.values(fields).some((value) =>
              value.toLowerCase().includes(deferredSearch),
            ))
        );
      }),
    [
      band,
      dateFrom,
      dateTo,
      deferredSearch,
      excluded,
      mode,
      operatorCall,
      records,
      showExcluded,
      source,
      stationCall,
    ],
  );
  const retained = useMemo(
    () => records.filter((record) => !excluded.has(record.id)),
    [excluded, records],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRecords = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const customFields = useMemo(
    () =>
      new Set(fields.filter((field) => !customExcludedFields.has(field))),
    [customExcludedFields, fields],
  );
  const exportRecords = exportScope === "displayed"
    ? filtered.filter((record) => !excluded.has(record.id))
    : retained;
  const exportOptions = { cleanup, customFields };
  const removedFieldOccurrences = useMemo(
    () =>
      exportRecords.reduce(
        (total, record) =>
          total +
          (Object.keys(record.fields).length -
            Object.keys(fieldsForCleanup(record.fields, exportOptions)).length),
        0,
      ),
    [cleanup, customFields, exportRecords],
  );

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;
    void (async () => {
      const stored = await loadSharedAdif();
      if (!stored) return;
      if (stored.workshop) {
        setRecords(stored.workshop.records);
        setExcluded(new Set(stored.workshop.excluded));
        setMessage(
          `${stored.workshop.records.length.toLocaleString()} QSOs restored from the local workspace.`,
        );
        return;
      }
      setImportProgress({ percent: 0, label: `Restoring ${stored.name}…` });
      const restored = await parseWorkshopAdifAsync(
        stored.text,
        stored.name,
        `restored-${stored.updatedAt}`,
        (progress) => {
          setImportProgress({
            percent: Math.round(progress * 100),
            label: `Restoring ${stored.name} · ${Math.round(progress * 100)}%`,
          });
        },
      );
      setRecords(restored);
      setMessage(
        `${restored.length.toLocaleString()} QSOs restored from the map.`,
      );
      setImportProgress(null);
    })();
  }, []);

  async function importFiles(files: File[]) {
    if (importProgress) return;
    setError("");
    const supported = files.filter((file) => /\.(adi|adif)$/i.test(file.name));
    if (!supported.length) {
      setError("Choose one or more .adi or .adif files.");
      return;
    }
    if (supported.some((file) => file.size > 50 * 1024 * 1024)) {
      setError("Each file must be 50 MB or smaller.");
      return;
    }

    try {
      const batch = Date.now().toString(36);
      const imported: WorkshopRecord[] = [];
      setImportProgress({ percent: 0, label: "Preparing import…" });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      for (let index = 0; index < supported.length; index += 1) {
        const file = supported[index];
        const fileStart = index / supported.length;
        const fileShare = 1 / supported.length;
        const update = (phase: number, label: string) => {
          setImportProgress({
            percent: Math.round((fileStart + fileShare * phase) * 100),
            label,
          });
        };
        const text = await readFileWithProgress(file, (progress) => {
          update(
            progress * 0.3,
            `Reading ${file.name} (${index + 1} of ${supported.length})`,
          );
        });
        const parsed = await parseWorkshopAdifAsync(
          text,
          file.name,
          `${batch}-${index}`,
          (progress) => {
            update(
              0.3 + progress * 0.7,
              `Parsing ${file.name} · ${Math.round(progress * 100)}%`,
            );
          },
        );
        imported.push(...parsed);
      }
      if (!imported.length) {
        setError("No ADIF QSO records were found in those files.");
        setImportProgress(null);
        return;
      }
      setImportProgress({ percent: 100, label: "Preparing QSO table…" });
      const mergedRecords = [...records, ...imported];
      setRecords(mergedRecords);
      void saveSharedAdif({
        text: serializeWorkshopAdif(mergedRecords, { cleanup: "lossless" }),
        name: supported.length === 1 ? supported[0].name : "Merged ADIF log",
        workshop: {
          records: mergedRecords,
          excluded: [...excluded],
        },
      });
      setPage(1);
      setMessage(
        `${imported.length.toLocaleString()} QSOs added from ${supported.length} file${supported.length === 1 ? "" : "s"}.`,
      );
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      setImportProgress(null);
    } catch {
      setError("One of the files could not be read as ADIF.");
      setImportProgress(null);
    }
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length) void importFiles(files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length) void importFiles(files);
  }

  function setRecordsExcluded(ids: Iterable<string>, value: boolean) {
    setExcluded((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (value) next.add(id);
        else next.delete(id);
      }
      return next;
    });
    setSelected(new Set());
  }

  function exportAdif() {
    const contents = serializeWorkshopAdif(exportRecords, exportOptions);
    const suffix = cleanup === "lossless" ? "merged" : "clean";
    downloadText(contents, `adif-workshop-${suffix}.adi`);
    setMessage(
      `${exportRecords.length.toLocaleString()} retained QSO${exportRecords.length === 1 ? "" : "s"} exported.`,
    );
  }

  function clearWorkspace() {
    if (records.length && !window.confirm("Clear all loaded logs and edits?")) {
      return;
    }
    setRecords([]);
    setExcluded(new Set());
    setSelected(new Set());
    setSearch("");
    setBand("All");
    setMode("All");
    setStationCall("All");
    setOperatorCall("All");
    setSource("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setMessage("Workspace cleared.");
    void clearSharedAdif();
  }

  async function openMap() {
    if (records.length) {
      await saveSharedAdif({
        text: serializeWorkshopAdif(retained, { cleanup: "lossless" }),
        name: sources.length === 1 ? sources[0] : "ADIF Workshop log",
        workshop: {
          records,
          excluded: [...excluded],
        },
      });
    }
    window.location.href = mapHref();
  }

  return (
    <main
      className={`workshop-shell${isDragging ? " is-dragging" : ""}`}
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
      <header className="workshop-topbar">
        <div className="brand-lockup">
          <span className="brand-signal" aria-hidden="true"><i /></span>
          <div>
            <p className="eyebrow">ADIF log workshop</p>
            <h1>MERGE · FILTER · CLEAN</h1>
          </div>
        </div>
        <div className="workshop-message" aria-live="polite">
          <strong>{records.length.toLocaleString()} loaded QSOs</strong>
          <span>{message}</span>
          {error && <span className="workshop-error">{error}</span>}
        </div>
        <div className="top-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void openMap()}
          >
            Map
          </button>
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept=".adi,.adif,text/plain"
            multiple
            onChange={handleInput}
          />
          <button
            className="button button-primary"
            type="button"
            disabled={!!importProgress}
            onClick={() => fileInput.current?.click()}
          >
            {importProgress ? "Importing…" : "Add ADIF files"}
          </button>
        </div>
      </header>

      {importProgress && (
        <section className="workshop-import-progress" aria-live="polite">
          <div>
            <span>{importProgress.label}</span>
            <strong>{importProgress.percent}%</strong>
          </div>
          <progress max="100" value={importProgress.percent}>
            {importProgress.percent}%
          </progress>
        </section>
      )}

      <section className="workshop-summary" aria-label="Workspace summary">
        <article>
          <span>Retained</span>
          <strong>{retained.length.toLocaleString()}</strong>
        </article>
        <article>
          <span>Excluded</span>
          <strong>{excluded.size.toLocaleString()}</strong>
        </article>
        <article>
          <span>Later duplicates</span>
          <strong>{duplicateIds.size.toLocaleString()}</strong>
        </article>
        <article>
          <span>Source files</span>
          <strong>{sources.length.toLocaleString()}</strong>
        </article>
        <article>
          <span>Distinct fields</span>
          <strong>{fields.length.toLocaleString()}</strong>
        </article>
        <article>
          <span>Application fields</span>
          <strong>{appFields.length.toLocaleString()}</strong>
        </article>
      </section>

      <section className="workshop-controls" aria-label="QSO filters">
        <label className="workshop-search">
          <span>Search any field</span>
          <input
            type="search"
            value={search}
            placeholder="Callsign, grid, comment…"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          <span>Band</span>
          <select value={band} onChange={(event) => { setBand(event.target.value); setPage(1); }}>
            <option value="All">All bands</option>
            {bands.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Mode</span>
          <select value={mode} onChange={(event) => { setMode(event.target.value); setPage(1); }}>
            <option value="All">All modes</option>
            {modes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Station call</span>
          <select value={stationCall} onChange={(event) => { setStationCall(event.target.value); setPage(1); }}>
            <option value="All">All station calls</option>
            {stationCalls.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Operator</span>
          <select value={operatorCall} onChange={(event) => { setOperatorCall(event.target.value); setPage(1); }}>
            <option value="All">All operators</option>
            {operatorCalls.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Source</span>
          <select value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }}>
            <option value="All">All files</option>
            {sources.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>From</span>
          <input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} />
        </label>
        <label>
          <span>Through</span>
          <input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} />
        </label>
        <label className="workshop-check">
          <input
            type="checkbox"
            checked={showExcluded}
            onChange={(event) => {
              setShowExcluded(event.target.checked);
              setPage(1);
            }}
          />
          <span>Show excluded</span>
        </label>
      </section>

      <section className="workshop-body">
        <div className="workshop-log">
          <div className="workshop-toolbar">
            <div>
              <strong>{filtered.length.toLocaleString()} displayed</strong>
              <span>{selected.size.toLocaleString()} selected</span>
            </div>
            <div>
              <button type="button" onClick={() => setSelected(new Set(pageRecords.map((record) => record.id)))} disabled={!pageRecords.length}>
                Select page
              </button>
              <button type="button" onClick={() => setSelected(new Set(filtered.map((record) => record.id)))} disabled={!filtered.length}>
                Select all results
              </button>
              <button type="button" onClick={() => setSelected(new Set())} disabled={!selected.size}>
                Clear selection
              </button>
              <button type="button" onClick={() => setRecordsExcluded(selected, true)} disabled={!selected.size}>
                Exclude selected
              </button>
              <button type="button" onClick={() => setRecordsExcluded(selected, false)} disabled={!selected.size}>
                Restore selected
              </button>
              <button type="button" onClick={() => setRecordsExcluded(duplicateIds, true)} disabled={!duplicateIds.size}>
                Exclude later duplicates
              </button>
            </div>
          </div>

          <div className="workshop-table-wrap">
            <table className="workshop-table">
              <thead>
                <tr>
                  <th aria-label="Select" />
                  <th>Call</th>
                  <th>Date / UTC</th>
                  <th>Band</th>
                  <th>Mode</th>
                  <th>Station / operator</th>
                  <th>Grid</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((record) => {
                  const isExcluded = excluded.has(record.id);
                  const isDuplicate = duplicateIds.has(record.id);
                  return (
                    <tr
                      key={record.id}
                      className={isExcluded ? "is-excluded" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${record.fields.CALL || "record"}`}
                          checked={selected.has(record.id)}
                          onChange={(event) => {
                            setSelected((current) => {
                              const next = new Set(current);
                              if (event.target.checked) next.add(record.id);
                              else next.delete(record.id);
                              return next;
                            });
                          }}
                        />
                      </td>
                      <td><strong>{record.fields.CALL || "—"}</strong></td>
                      <td>
                        <span>{formatAdifDate(record.fields.QSO_DATE) || "—"}</span>
                        <small>{formatAdifTime(record.fields.TIME_ON) || "—"}</small>
                      </td>
                      <td>{record.fields.BAND || "—"}</td>
                      <td>{record.fields.SUBMODE || record.fields.MODE || "—"}</td>
                      <td>
                        <span>{record.fields.STATION_CALLSIGN || "—"}</span>
                        <small>{record.fields.OPERATOR || "—"}</small>
                      </td>
                      <td>{record.fields.GRIDSQUARE || "—"}</td>
                      <td title={record.source}>{record.source}</td>
                      <td>
                        {isExcluded && <span className="status-tag excluded">Excluded</span>}
                        {!isExcluded && isDuplicate && <span className="status-tag duplicate">Duplicate</span>}
                        {!isExcluded && !isDuplicate && <span className="status-tag retained">Retained</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!pageRecords.length && (
              <div className="workshop-empty">
                <strong>{records.length ? "No QSOs match these filters" : "Drop ADIF files anywhere"}</strong>
                <span>{records.length ? "Adjust the filters or show excluded records." : "Multiple files will be merged into one local workspace."}</span>
              </div>
            )}
          </div>

          <nav className="workshop-pagination" aria-label="QSO pages">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <span>Page {safePage.toLocaleString()} of {totalPages.toLocaleString()}</span>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
          </nav>
        </div>

        <aside className="workshop-export">
          <div>
            <p className="eyebrow">Clean export</p>
            <h2>Build the new ADIF</h2>
          </div>
          <label>
            <span>QSO scope</span>
            <select value={exportScope} onChange={(event) => setExportScope(event.target.value as "retained" | "displayed")}>
              <option value="retained">All retained QSOs</option>
              <option value="displayed">Displayed retained QSOs</option>
            </select>
          </label>
          <fieldset>
            <legend>Field cleanup</legend>
            {([
              ["lossless", "Lossless", "Keep every imported field."],
              ["no-app", "Remove APP_ fields", "Remove QRZ, HRD, and other application extensions."],
              ["minimal", "Minimal portable", "Keep common logging, location, activity, and QSL fields."],
              ["custom", "Custom selection", "Choose exactly which field names to retain."],
            ] as const).map(([value, label, description]) => (
              <label className="cleanup-option" key={value}>
                <input
                  type="radio"
                  name="cleanup"
                  value={value}
                  checked={cleanup === value}
                  onChange={() => setCleanup(value)}
                />
                <span><strong>{label}</strong><small>{description}</small></span>
              </label>
            ))}
          </fieldset>

          {cleanup === "custom" && (
            <div className="field-picker">
              <div>
                <strong>Fields to retain</strong>
                <button type="button" onClick={() => setCustomExcludedFields(new Set())}>All</button>
                <button type="button" onClick={() => setCustomExcludedFields(new Set(fields))}>None</button>
              </div>
              <div>
                {fields.map((field) => (
                  <label key={field}>
                    <input
                      type="checkbox"
                      checked={!customExcludedFields.has(field)}
                      onChange={(event) => {
                        setCustomExcludedFields((current) => {
                          const next = new Set(current);
                          if (event.target.checked) next.delete(field);
                          else next.add(field);
                          return next;
                        });
                      }}
                    />
                    <span>{field}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="export-preview">
            <span>QSOs in export <strong>{exportRecords.length.toLocaleString()}</strong></span>
            <span>Field values removed <strong>{removedFieldOccurrences.toLocaleString()}</strong></span>
          </div>
          <button
            className="button button-primary workshop-download"
            type="button"
            disabled={!exportRecords.length}
            onClick={exportAdif}
          >
            Download new ADIF
          </button>
          <button className="workshop-clear" type="button" onClick={clearWorkspace} disabled={!records.length}>
            Clear workspace
          </button>
          <p className="privacy-note">Files are processed locally. No log data is uploaded.</p>
        </aside>
      </section>
    </main>
  );
}
