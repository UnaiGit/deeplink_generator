# Deep Link Template Builder (HotelTwin)

A lightweight, browser-based tool to define and test deep-link templates for hotel booking engines. Paste an example URL, map its dynamic parts to standard variables, set simple formatting, and generate the final link from booking data — no backend needed.

## What it does
- Parses an example URL into ordered slots (path segments, query params, fragment params), keeping duplicates and positions.
- Maps slots to internal variables (checkIn, checkOut, adults, children, totalGuests, nights, promoCode, currency, hotelId).
- Applies per-slot formatting (date tokens) and transforms (uppercase for text, totals, auto-calculated nights).
- Auto-suggests mappings for common patterns (checkin/checkout, month/day/year, adults/children, promo, currency, hotelCode, nights).
- Previews the generated deep link live using test values; saves templates locally (localStorage); includes quick templates for common engines.

## Core concepts
**Internal model**: Standard variables use fixed formats (dates `YYYY-MM-DD`, numbers as integers). The template adapts them to each engine.

**Slots**: Each URL value is a slot with identity and order:
- Path segment: by index.
- Query param: name + position (supports repeated params).
- Fragment param: name + position.

**Mapping rule**:
- Target slot (path index, query name+pos, fragment name+pos).
- Source variable (one of the internal set).
- Format (dates): tokens `YYYY`, `MM`, `DD` (or individual parts like `MM` on a `month` param).
- Transforms: uppercase (for text variables), derived values (`totalGuests`, `nights` when missing).

## Flow (wizard)
1) **Basic info**: Name the template, optionally pick a quick template, paste the example URL (protocol auto-added if missing), go to Mapping (auto-parse).
2) **Mapping**: Single compact slot list with filter; assign variables. Date slots show format input; `nights` shows auto-calc hint. Live per-slot preview.
3) **Preview**: Enter test values (defaults prefilled), generate link, see final URL and any warnings. Save/reload templates (localStorage).

## Runtime logic
1. Parse the example URL into slots (path/query/fragment with order and duplicates).
2. For each mapping rule: fetch internal value (derive `totalGuests`, `nights` if needed), apply format/uppercase, write into the slot.
3. Rebuild the URL preserving order; return final link and issues if any missing data.

## Auto-suggestions
- Names: `checkin/ci/arrive/from` → checkIn; `checkout/co/depart/to` → checkOut; `month/day/year` → checkIn tokens `MM/DD/YYYY`; `adult/adults` → adults; `child/children` → children; `currency/curr` → currency; `promo/promocode/code` → promoCode (uppercase); `hotelcode/hotelid` → hotelId; `nights` → nights.
- Formats: values with `-` → `YYYY-MM-DD`; 8 digits → `DDMMYYYY`.

## Quick templates
Included samples for: Meliá, SynXis, Amadeus/TravelClick iHotelier, Bookassist, SHR Windsurfer, Mews, Planet/D-EDGE (HotSoft), Clock PMS+, Cloudbeds, ReservHotel/Tambourine.

## Keyboard & accessibility
- Shortcuts: Cmd/Ctrl+S save; Cmd/Ctrl+Enter next step; `/` focuses slot filter (outside inputs).
- Roles/labels: aria-labels on controls; slot list uses table roles; toast is aria-live.
- Responsive: compact cards on narrow screens with inline labels.

## Run locally
No build required. Open `deeplink/index.html` in a browser or:
```bash
cd deeplink
python3 -m http.server 3000
# open http://localhost:3000
```

## Recreate it (logic blueprint)
1) Parse example URL into structured slots (order + duplicates).  
2) Store template (example URL, parsed slots, mapping rules).  
3) Mapping UI: assign variables to slots; show format only for dates; filterable list.  
4) Auto-suggest mappings; let users override.  
5) Preview: read test data, derive totals/nights, apply transforms, rebuild URL with order.  
6) Validate and surface issues non-blockingly (inline + toast).  
7) Persist templates (local or API) for reuse.
