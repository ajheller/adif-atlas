# QSO Atlas

QSO Atlas is a privacy-first web app for turning an amateur-radio ADIF log into
an interactive world map. ADIF parsing happens entirely in the browser; the log
is never uploaded or stored by the app.

## What it does

- Imports `.adi` and `.adif` files up to 25 MB
- Maps QSOs using ADIF `LAT`/`LON`, then `GRIDSQUARE` or `VUCC_GRIDS`
- Finds the station origin from `MY_LAT`/`MY_LON` or `MY_GRIDSQUARE`
- Draws great-circle contact paths on an offline world map
- Filters contacts by callsign, country, grid, band, and mode
- Shows QSO details, distance, coverage, and mapping statistics
- Downloads the current log as one self-contained interactive HTML file

QSOs without a coordinate pair or valid Maidenhead locator are counted but
cannot be placed on the map. If the log does not include the station location,
enter a home grid in the map controls.

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Validation

```bash
pnpm test
pnpm exec eslint app/page.tsx app/layout.tsx
```

## Data sources

The bundled geographic outline is derived from the public-domain Natural Earth
1:110m Admin 0 countries dataset and projected into a compact equirectangular
SVG path. The deployed app does not request external map tiles or APIs.
