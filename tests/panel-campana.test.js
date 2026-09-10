const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'sitio-estatico', 'index.html'),
  'utf8'
);

for (const view of ['resumen', 'capitanes', 'voluntarios', 'grupos', 'propuestas']) {
  assert.match(html, new RegExp(`data-view="${view}"`));
}

for (const section of ['capitanes', 'voluntarios', 'grupos', 'propuestas']) {
  assert.match(html, new RegExp(`id="view-${section}"`));
}

assert.match(html, /function selectDashboardView\(/);
assert.match(html, /const campaignMockData =/);
assert.match(html, /const pollingStations =/);
assert.match(html, /function renderPollingStationCard\(/);
assert.match(html, /function renderCaptainNetworkMap\(/);
assert.match(html, /function selectPollingStation\(/);
assert.match(html, /data-demo-action="reference-toggle"/);
assert.match(html, /showReferenceStations/);
assert.match(html, /stationGoal/);
assert.match(html, /\.map-leaflet\{[^}]*z-index:0[^}]*\}/);
assert.match(html, /function buildVolunteerRegistry\(/);
assert.match(html, /const volunteerRegistry =/);

console.log('Panel de campaña: navegación y vistas mock presentes.');
