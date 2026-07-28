# ADIF Atlas

ADIF Atlas is the open-source repository for QSO Atlas, a privacy-first web app
for turning an amateur-radio ADIF log into
an interactive world map. ADIF parsing happens entirely in the browser; the log
is never uploaded or stored by the app.

The included ADIF Log Workshop provides a map-free workspace for combining and
cleaning logs.

## What it does

- Imports `.adi` and `.adif` files up to 25 MB
- Maps QSOs using ADIF `LAT`/`LON`, then `GRIDSQUARE` or `VUCC_GRIDS`
- Finds the station origin from `MY_LAT`/`MY_LON` or `MY_GRIDSQUARE`
- Draws contact paths over OpenStreetMap, with an embedded offline fallback
- Lets you hide or show contact paths
- Filters contacts by callsign, country, grid, band, and mode
- Shows QSO details, distance, coverage, and mapping statistics
- Downloads the current log as one self-contained interactive HTML file
- Loads and merges multiple ADIF files in the Log Workshop
- Filters, selects, excludes, restores, and deduplicates QSO records
- Exports retained or currently displayed QSOs
- Removes application-specific fields or creates a minimal portable ADIF
- Supports exact custom field selection before export

When a QSO has no coordinates or valid Maidenhead locator, QSO Atlas uses its
callsign prefix to place it at an approximate DXCC entity centroid. If the log
does not include the station location, enter a home grid in the map controls.

## Hosted app

The GitHub Pages deployment is published automatically from `main`:

https://ajheller.github.io/adif-atlas/

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

To test the static GitHub Pages build:

```bash
pnpm build:pages
```

## Validation

```bash
pnpm test
pnpm exec eslint app/page.tsx app/layout.tsx
```

## Data sources

Detailed maps use © OpenStreetMap contributors. The bundled geographic outline
is derived from the public-domain Natural Earth 1:110m Admin 0 countries
dataset and provides the no-network fallback.
