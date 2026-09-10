# Puestos de votacion y red territorial de capitanes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small, interactive polling-station layer to the Ocaña campaign map and show each captain's territorial network with highlighted stations, assigned/registered counts, and reference-station visibility controls.

**Architecture:** Keep the static demo in one HTML file. A centralized `pollingStations` mock collection will feed both the existing territorial map and a new captain-network map. Leaflet will remain the map engine; the territorial view will use soft intensity halos and station markers, while the captain view will reuse the same data with dimmed reference markers and a floating summary card.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Leaflet 1.9.4, OpenStreetMap tiles, Node.js built-in `assert` tests.

---

## Files and Responsibilities

- Modify `sitio-estatico/index.html`: add polling-station mock data, derived metrics, map-layer rendering, station cards, captain network map, reference visibility toggle, responsive styles, and Leaflet fallback state.
- Modify `tests/panel-campana.test.js`: add structural contract checks for the new data collection, controls, views, and rendering functions.
- Do not add runtime dependencies, backend files, API calls, or new published assets.
- Keep `.superpowers/brainstorm/` out of commits; it contains only the temporary visual companion session.

### Task 1: Extend the structural test contract

**Files:**
- Modify: `tests/panel-campana.test.js:10-20`
- Test: `tests/panel-campana.test.js`

- [ ] **Step 1: Add failing assertions for the new public demo contract.**

Append these assertions after the existing `campaignMockData` assertion:

```js
assert.match(html, /const pollingStations =/);
assert.match(html, /function renderPollingStationCard\(/);
assert.match(html, /function renderCaptainNetworkMap\(/);
assert.match(html, /function selectPollingStation\(/);
assert.match(html, /data-demo-action="reference-toggle"/);
assert.match(html, /showReferenceStations/);
assert.match(html, /stationGoal/);
```

- [ ] **Step 2: Run the test and verify it fails for the missing implementation.**

Run:

```bash
node tests/panel-campana.test.js
```

Expected: `AssertionError` at the first new assertion because the current HTML has no `pollingStations` collection.

- [ ] **Step 3: Commit the test contract.**

```bash
git add tests/panel-campana.test.js
git commit -m "test: specify polling station map contract"
```

### Task 2: Add the shared station data and metric helpers

**Files:**
- Modify: `sitio-estatico/index.html:664-705` for the data block
- Modify: `sitio-estatico/index.html:797-805` for captain identifiers
- Test: `tests/panel-campana.test.js`

- [ ] **Step 1: Add stable ids to the six existing captain records.**

Add an `id` property to the records in `campaignMockData.capitanes` before `initials`:

```js
{ id:'juan-pablo', initials:'JZ', name:'Juan Pablo Zuluaga', ... }
{ id:'carmen', initials:'CV', name:'Carmen Villalobos', ... }
{ id:'hernan', initials:'HP', name:'Hernán Pérez', ... }
{ id:'susana', initials:'SR', name:'Susana Ramírez', ... }
{ id:'david', initials:'DL', name:'David Londoño', ... }
{ id:'andrea', initials:'AM', name:'Andrea Márquez', ... }
```

Preserve every existing field and team member.

- [ ] **Step 2: Add a small `pollingStations` collection after `ocanaZones`.**

Use 8 stations, with at least one station in each existing comuna and a second station only in comunas 2 and 3. Keep coordinates approximate and use the existing Ocaña map area:

```js
const pollingStations = [
  {id:'puesto-1', name:'Colegio Nacional José Eusebio Caro', comunaId:'comuna-1', barrio:'Centro', position:[8.2468,-73.3550], meta:42, assigned:31, registered:24, captainIds:['juan-pablo'], status:'active'},
  {id:'puesto-2', name:'Institución Educativa La Salle', comunaId:'comuna-2', barrio:'Cristo Rey', position:[8.2528,-73.3488], meta:48, assigned:36, registered:29, captainIds:['juan-pablo','david'], status:'active'},
  {id:'puesto-3', name:'Colegio José Eusebio Caro - sede norte', comunaId:'comuna-2', barrio:'El Dorado', position:[8.2547,-73.3469], meta:36, assigned:18, registered:11, captainIds:['andrea'], status:'pending'},
  {id:'puesto-4', name:'Puesto Comuna 3 · Olaya Herrera', comunaId:'comuna-3', barrio:'La Piñuela', position:[8.2408,-73.3480], meta:44, assigned:29, registered:21, captainIds:['hernan'], status:'active'},
  {id:'puesto-5', name:'Institución Educativa Francisco Fernández de Contreras', comunaId:'comuna-3', barrio:'Villa Nueva', position:[8.2389,-73.3470], meta:40, assigned:22, registered:14, captainIds:['susana'], status:'pending'},
  {id:'puesto-6', name:'Puesto Comuna 4 · Adolfo Milanés', comunaId:'comuna-4', barrio:'Marabel', position:[8.2403,-73.3620], meta:32, assigned:13, registered:8, captainIds:[], status:'pending'},
  {id:'puesto-7', name:'Puesto Comuna 5 · Fernández de Contreras', comunaId:'comuna-5', barrio:'Buenos Aires', position:[8.2515,-73.3610], meta:46, assigned:28, registered:20, captainIds:['carmen'], status:'active'},
  {id:'puesto-8', name:'Puesto Comuna 6 · Ciudadela Norte', comunaId:'comuna-6', barrio:'Santa Clara', position:[8.2584,-73.3551], meta:34, assigned:16, registered:9, captainIds:['andrea'], status:'pending'}
];
```

The names and coordinates are demo references, not official polling-place data. Keep this note in the map caption.

- [ ] **Step 3: Add helpers for station lookup and zone metrics.**

Place these functions after `escapeHtml` so all renderers can use them:

```js
function stationsForZone(comunaId){
  return pollingStations.filter(function(station){ return station.comunaId === comunaId; });
}

function stationsForCaptain(captainId){
  return pollingStations.filter(function(station){ return station.captainIds.indexOf(captainId) !== -1; });
}

function stationProgress(station){
  return station.assigned ? Math.round((station.registered / station.assigned) * 100) : 0;
}

function zoneStationSummary(comunaId){
  const stations = stationsForZone(comunaId);
  const zone = ocanaZones.find(function(item){ return item.id === comunaId; });
  const stationGoal = zone && zone.stationGoal ? zone.stationGoal : Math.max(stations.length, 2);
  return stations.reduce(function(summary, station){
    summary.assigned += station.assigned;
    summary.registered += station.registered;
    summary.covered += station.assigned > 0 ? 1 : 0;
    return summary;
  }, {goal:stationGoal, covered:0, assigned:0, registered:0, total:stations.length});
}
```

Add `stationGoal` to each `ocanaZones` record with values `2`, `3`, `3`, `2`, `2`, and `2` respectively. The zone goal is intentionally separate from the number of mock records rendered.

- [ ] **Step 4: Run the test and verify only the rendering assertions remain failing.**

Run:

```bash
node tests/panel-campana.test.js
```

Expected: the `pollingStations` assertion passes; rendering-function and control assertions still fail until the map UI is added.

- [ ] **Step 5: Commit the shared data model.**

```bash
git add sitio-estatico/index.html
git commit -m "feat: add polling station demo data"
```

### Task 3: Upgrade the territorial map with polished halos and station pins

**Files:**
- Modify: `sitio-estatico/index.html:242-276` for map styles
- Modify: `sitio-estatico/index.html:930-1028` for map rendering and zone selection
- Modify: `sitio-estatico/index.html:1120-1241` for event handling
- Test: `tests/panel-campana.test.js`

- [ ] **Step 1: Add the map control and station-card CSS.**

Add styles beside the existing map rules for the following classes:

```css
.map-panel{position:relative;}
.map-tools{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}
.map-note{font-size:9px;color:#9aa1b5;font-style:italic;}
.station-pin-wrap{background:transparent;border:0;}
.station-pin{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--blue);color:#fff;box-shadow:0 4px 10px rgba(35,31,32,.25);font:800 9px Poppins,sans-serif;}
.station-pin span{transform:rotate(45deg);}
.station-pin.pending{background:var(--amber);}
.station-pin.dim{opacity:.28;filter:grayscale(.5);}
.station-card{position:absolute;z-index:500;left:24px;bottom:24px;width:min(280px,calc(100% - 48px));padding:14px;border:1px solid rgba(255,255,255,.8);border-radius:14px;background:rgba(255,255,255,.95);box-shadow:0 14px 30px rgba(20,30,60,.2);}
.station-card[hidden]{display:none;}
.station-card h4{margin:0 24px 2px 0;font-size:12px;line-height:1.3;}
.station-card .station-meta{font-size:9px;color:#9aa1b5;}
.station-card .station-numbers{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0;}
.station-card .station-number{padding:8px 5px;border-radius:9px;background:#F8F9FC;text-align:center;}
.station-card .station-number strong{display:block;font-size:13px;}
.station-card .station-number span{font-size:8px;color:#9aa1b5;}
.station-card .station-bar{height:7px;border-radius:99px;background:#EEF0F6;overflow:hidden;}
.station-card .station-bar i{display:block;height:100%;border-radius:99px;background:var(--green);}
.map-fallback{display:flex;align-items:center;justify-content:center;min-height:360px;border:1px dashed #D8DDEA;border-radius:14px;color:#9aa1b5;font-size:11px;text-align:center;padding:20px;}
```

- [ ] **Step 2: Replace hard-edged hexagon rendering with soft zone layers.**

Replace `zonePolygons` with `zoneLayers`, where each zone owns a large low-opacity `L.circle` halo and a smaller outline circle. Keep the same `zoneLayout` centers and use the existing tier colors:

```js
const zoneLayers = {};

function createZoneLayer(zone){
  const layout = zoneLayout[zone.id];
  const tier = mapTier(zone.support);
  const halo = L.circle(layout.center, {radius:layout.radius * 98000, color:tier.stroke, weight:1, opacity:.22, fillColor:tier.fill, fillOpacity:.12});
  const outline = L.circle(layout.center, {radius:layout.radius * 52000, color:tier.stroke, weight:1, opacity:.34, fill:false});
  halo.bindTooltip(zone.code+' · '+zone.shortName+' — '+zone.support+'% de apoyo', {sticky:true});
  halo.on('click', function(){ selectZone(zone.id); });
  outline.on('click', function(){ selectZone(zone.id); });
  halo.addTo(ocanaLeafletMap);
  outline.addTo(ocanaLeafletMap);
  zoneLayers[zone.id] = {halo:halo, outline:outline};
}
```

Update `applyZoneSelectionStyles` to style both layers: active zone gets a darker outline, stronger halo opacity, and `weight:2`; inactive zones use the tier color, `weight:1`, and low opacity. Remove calls to `hexPoints` and do not render six-sided fake boundaries.

Inside `initOcanaMap`, call `ocanaZones.forEach(createZoneLayer)` after adding the tile layer and before fitting the map bounds. Keep the existing `applyZoneSelectionStyles()` call after all zone layers and station markers have been created.

- [ ] **Step 3: Add station markers and the station card to the territorial map.**

Add these variables and functions near `initOcanaMap`:

```js
const stationMarkers = {};
let selectedStationId = null;

function stationIcon(station, dim){
  const stateClass = station.status === 'pending' ? ' pending' : '';
  const dimClass = dim ? ' dim' : '';
  return L.divIcon({className:'station-pin-wrap', iconSize:[28,28], iconAnchor:[14,28], html:'<div class="station-pin'+stateClass+dimClass+'"><span>'+station.registered+'</span></div>'});
}

function renderPollingStationCard(station, reference){
  const progress = stationProgress(station);
  const zone = ocanaZones.find(function(item){ return item.id === station.comunaId; });
  return '<button class="modal-close" type="button" data-demo-action="close-station-card" aria-label="Cerrar detalle">×</button>'+
    '<h4>'+escapeHtml(station.name)+'</h4>'+
    '<div class="station-meta">'+escapeHtml(station.barrio)+' · '+escapeHtml(zone ? zone.name : station.comunaId)+'</div>'+
    (reference ? '<div class="station-meta">Puesto de referencia de otra red</div>' : '')+
    '<div class="station-numbers">'+
      '<div class="station-number"><strong>'+station.meta+'</strong><span>Meta</span></div>'+
      '<div class="station-number"><strong>'+station.assigned+'</strong><span>Asignadas</span></div>'+
      '<div class="station-number"><strong>'+station.registered+'</strong><span>Registradas</span></div>'+
    '</div>'+
    '<div class="station-bar"><i style="width:'+Math.min(progress,100)+'%;"></i></div>'+
    '<div class="station-meta" style="margin-top:6px;">Avance de registro: '+progress+'%</div>';
}

function selectPollingStation(stationId, reference, cardId){
  const station = pollingStations.find(function(item){ return item.id === stationId; });
  const card = document.getElementById(cardId || 'stationCard');
  if(!station || !card) return;
  selectedStationId = stationId;
  card.innerHTML = renderPollingStationCard(station, reference);
  card.hidden = false;
}
```

Add a hidden `<div class="station-card" id="stationCard"></div>` inside `.map-panel` immediately after `.map-leaflet`, and update `renderOcanaMapShell` to include a `.map-tools` row with the referential-data note. In `initOcanaMap`, create markers for `pollingStations`, bind a click handler to call `selectPollingStation(station.id, false)`, and store each marker in `stationMarkers`.

Update `renderZoneSide(zone)` to include a station summary card using `zoneStationSummary(zone.id)` with `goal`, `covered`, `assigned`, and `registered`, plus a compact list of that zone's station names and registered/assigned values.

- [ ] **Step 4: Add Leaflet fallback and close-card behavior.**

Change `initOcanaMap` so a missing Leaflet instance writes this exact fallback into the map container:

```js
if(!mapEl || typeof L === 'undefined'){
  if(mapEl) mapEl.outerHTML = '<div class="map-fallback">El mapa no está disponible en este momento.<br>Los datos de puestos siguen disponibles en el panel lateral.</div>';
  return;
}
```

Extend the existing desktop click delegation with:

```js
if(kind === 'close-station-card'){
  const card = action.closest('.station-card');
  if(card) card.hidden = true;
  selectedStationId = null;
  return;
}
```

Ensure the event delegation is scoped so the close button is reachable from the `desktopApp` click handler.

- [ ] **Step 5: Run the structural test.**

Run:

```bash
node tests/panel-campana.test.js
```

Expected: PASS with `Panel de campaña: navegación y vistas mock presentes.`

- [ ] **Step 6: Commit the territorial map changes.**

```bash
git add sitio-estatico/index.html tests/panel-campana.test.js
git commit -m "feat: add polling stations to Ocana map"
```

### Task 4: Add the captain-network map and reference toggle

**Files:**
- Modify: `sitio-estatico/index.html:242-319` for captain-map responsive styles
- Modify: `sitio-estatico/index.html:1055-1080` for the network renderer
- Modify: `sitio-estatico/index.html:1140-1241` for event delegation and map lifecycle
- Test: `tests/panel-campana.test.js`

- [ ] **Step 1: Add the network-map styles.**

Add these styles beside the existing captain-network rules:

```css
.captain-map-shell{position:relative;min-height:390px;border:1px solid #ECEEF5;border-radius:14px;overflow:hidden;background:#F8F9FC;}
.captain-map-shell .map-leaflet{height:390px;border:0;border-radius:0;}
.captain-map-card{position:absolute;z-index:450;left:auto;right:18px;top:18px;width:min(280px,calc(100% - 36px));}
.captain-station-detail{left:18px;right:auto;bottom:18px;}
.reference-toggle{position:absolute;z-index:460;left:18px;top:18px;display:flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 5px 16px rgba(20,30,60,.12);font:700 9px Poppins,sans-serif;color:#4b5563;}
.reference-toggle input{accent-color:var(--blue);}
.captain-map-caption{position:absolute;z-index:440;left:18px;bottom:12px;padding:5px 8px;border-radius:6px;background:rgba(255,255,255,.86);font-size:8px;color:#9aa1b5;}
@media (max-width:820px){
  .captain-map-shell,.captain-map-shell .map-leaflet{min-height:470px;height:470px;}
  .captain-map-card{left:18px;right:18px;top:auto;bottom:18px;width:auto;}
}
```

- [ ] **Step 2: Define the captain map state and shared station-layer helpers.**

Add these variables after `activeCaptainFilter`:

```js
let captainNetworkMap = null;
const captainStationMarkers = {};
let showReferenceStations = true;

function captainOwnsStation(captain, station){
  return station.captainIds.indexOf(captain.id) !== -1;
}

function captainStationSummary(captain){
  return stationsForCaptain(captain.id).reduce(function(summary, station){
    summary.covered += 1;
    summary.assigned += station.assigned;
    summary.registered += station.registered;
    return summary;
  }, {covered:0, assigned:0, registered:0});
}
```

- [ ] **Step 3: Render the captain map shell and floating card.**

Add `renderCaptainNetworkMap(captain)` before `renderCaptainNetwork`:

```js
function renderCaptainNetworkMap(captain){
  const summary = captainStationSummary(captain);
  const progress = summary.assigned ? Math.round((summary.registered / summary.assigned) * 100) : 0;
  const toggleLabel = showReferenceStations ? 'Ocultar puestos de referencia' : 'Mostrar puestos de referencia';
  return '<div class="captain-map-shell">'+
    '<div class="map-leaflet" id="captainLeafletMap"></div>'+
    '<label class="reference-toggle"><input type="checkbox" data-demo-action="reference-toggle" '+(showReferenceStations?'checked':'')+'> '+toggleLabel+'</label>'+
    '<div class="captain-map-card station-card">'+
      '<div class="station-meta">Cobertura territorial</div>'+
      '<h4>'+escapeHtml(captain.name)+'</h4>'+
      '<div class="station-meta">'+escapeHtml(captain.neighborhood)+' · '+escapeHtml(captain.comuna)+'</div>'+
      '<div class="station-numbers">'+
        '<div class="station-number"><strong>'+summary.covered+'</strong><span>Puestos</span></div>'+
        '<div class="station-number"><strong>'+summary.assigned+'</strong><span>Asignadas</span></div>'+
        '<div class="station-number"><strong>'+summary.registered+'</strong><span>Registradas</span></div>'+
      '</div>'+
      '<div class="station-bar"><i style="width:'+Math.min(progress,100)+'%;"></i></div>'+
      '<div class="station-meta" style="margin-top:6px;">Avance de registro: '+progress+'%</div>'+
    '</div>'+
    '<div class="captain-station-detail station-card" id="captainStationCard" hidden></div>'+
    '<div class="captain-map-caption">Puestos y cobertura referenciales para la demo</div>'+
  '</div>';
}
```

Insert `renderCaptainNetworkMap(captain)` between the captain stats and the volunteer table in `renderCaptainNetwork`. Keep the existing filters and table below the map.

- [ ] **Step 4: Initialize and update the captain Leaflet map.**

Add these functions after `renderCaptainNetworkMap`:

```js
function destroyCaptainNetworkMap(){
  if(captainNetworkMap){
    captainNetworkMap.remove();
    captainNetworkMap = null;
  }
  Object.keys(captainStationMarkers).forEach(function(key){ delete captainStationMarkers[key]; });
}

function renderCaptainNetworkMapLayers(captain){
  const mapEl = document.getElementById('captainLeafletMap');
  if(!mapEl || typeof L === 'undefined'){
    if(mapEl) mapEl.outerHTML = '<div class="map-fallback">El mapa de red no está disponible en este momento.</div>';
    return;
  }
  captainNetworkMap = L.map(mapEl, {center:[8.2481,-73.3553], zoom:14, scrollWheelZoom:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:18, attribution:'&copy; OpenStreetMap'}).addTo(captainNetworkMap);

  ocanaZones.forEach(function(zone){
    const tier = mapTier(zone.support);
    L.circle(zoneLayout[zone.id].center, {radius:zoneLayout[zone.id].radius * 98000, color:tier.stroke, weight:1, opacity:.16, fillColor:tier.fill, fillOpacity:.06}).addTo(captainNetworkMap);
  });

  pollingStations.forEach(function(station){
    const own = captainOwnsStation(captain, station);
    if(!own && !showReferenceStations) return;
    const marker = L.marker(station.position, {icon:stationIcon(station, !own), keyboard:true, title:station.name}).addTo(captainNetworkMap);
    marker.on('click', function(){ selectPollingStation(station.id, !own, 'captainStationCard'); });
    captainStationMarkers[station.id] = marker;
  });
  captainNetworkMap.fitBounds(L.latLngBounds(pollingStations.map(function(station){ return station.position; })), {padding:[30,30]});
}
```

Use `setTimeout(function(){ renderCaptainNetworkMapLayers(captain); }, 0)` after `selectDashboardView('capitan-red')` because the map container must be visible before Leaflet measures it. When filters rerender the network view, call `destroyCaptainNetworkMap()` before replacing `innerHTML`, then reinitialize after rendering.

- [ ] **Step 5: Wire the reference toggle and station-card events.**

In the existing desktop click handler, process `reference-toggle` before the generic action branches:

```js
if(kind === 'reference-toggle'){
  showReferenceStations = action.checked;
  const captain = campaignMockData.capitanes[activeCaptainIndex];
  if(captain){
    destroyCaptainNetworkMap();
    document.getElementById('view-capitan-red').innerHTML = renderCaptainNetwork();
    setTimeout(function(){ renderCaptainNetworkMapLayers(captain); }, 0);
  }
  return;
}
```

Update the `captain` branch to initialize the network map after rendering. Update `back-to-capitanes` to call `destroyCaptainNetworkMap()` before changing views. Keep `team-filter` behavior intact and reinitialize the map after the filtered table render.

- [ ] **Step 6: Run tests and commit the captain-network view.**

Run:

```bash
node tests/panel-campana.test.js
```

Expected: PASS with all existing and new structural assertions.

```bash
git add sitio-estatico/index.html tests/panel-campana.test.js
git commit -m "feat: add captain network polling map"
```

### Task 5: Verify browser behavior and responsive presentation

**Files:**
- Modify: `sitio-estatico/index.html` only if verification finds a concrete defect
- Test: `tests/panel-campana.test.js`

- [ ] **Step 1: Validate JavaScript syntax without executing browser globals.**

Run:

```bash
node -e "const fs=require('node:fs'); const html=fs.readFileSync('sitio-estatico/index.html','utf8'); const match=html.match(/<script>([\s\S]*)<\/script>/); if(!match) throw new Error('inline script not found'); new Function(match[1]); console.log('Inline JavaScript syntax: OK');"
```

Expected: `Inline JavaScript syntax: OK`.

- [ ] **Step 2: Run the repository test.**

Run:

```bash
node tests/panel-campana.test.js
```

Expected: `Panel de campaña: navegación y vistas mock presentes.`

- [ ] **Step 3: Start the static demo for browser verification.**

Run from the repository root:

```bash
python3 -m http.server 4173 --directory sitio-estatico
```

Open `http://localhost:4173` in Chromium and click `Ver panel del candidato`.

- [ ] **Step 4: Verify the territorial map flow.**

Check all of the following in the browser:

1. `Resumen` renders OpenStreetMap with soft comuna halos instead of hard hexagons.
2. The map contains the eight station pins and the legend/note is readable.
3. Clicking each comuna control updates the side panel with station goal, covered stations, assigned people, and registered people.
4. Clicking a station pin opens the floating station card with `Meta`, `Asignadas`, `Registradas`, and the registration progress bar.
5. Switching between the mobile app and desktop panel does not leave Leaflet with a blank or incorrectly sized map.

- [ ] **Step 5: Verify the captain-network flow.**

Check all of the following:

1. Open `Capitanes` and click `Ver red` for Juan Pablo, Carmen, and Hernán.
2. Each network map shows the same Ocaña base, dimmed reference stations, and highlighted stations belonging to the selected captain.
3. The floating card totals match the selected captain's station records.
4. Uncheck `Mostrar puestos de referencia`; only the captain's own station pins remain.
5. Click an own station and confirm its station card opens; click a reference station before hiding references and confirm it is labeled as another network.
6. Use the volunteer status filters and return to `Capitanes` without a console error or stale Leaflet instance.

- [ ] **Step 6: Verify mobile layout and console output.**

Use a mobile viewport around `390x844` and confirm the map card moves below the map, controls remain usable, and the map does not overflow horizontally. Inspect the browser console and confirm there are no JavaScript errors.

- [ ] **Step 7: Commit only concrete verification fixes.**

If a browser defect was found and fixed, run both checks again and commit the fix with:

```bash
git add sitio-estatico/index.html tests/panel-campana.test.js
git commit -m "fix: polish polling map demo interactions"
```

If no defect was found, do not create an empty commit.
