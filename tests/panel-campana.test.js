const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'sitio-estatico', 'index.html'),
  'utf8'
);

for (const view of ['resumen', 'priorizacion', 'capitanes', 'voluntarios', 'grupos', 'propuestas']) {
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
assert.doesNotMatch(html, /stationGoal/);
assert.match(html, /\.map-leaflet\{[^}]*z-index:0[^}]*\}/);
assert.match(html, /function buildVolunteerRegistry\(/);
assert.match(html, /const volunteerRegistry =/);
assert.match(html, /function volunteerRegistryCounts\(/);
assert.match(html, /Confirmadas/);
assert.match(html, /function renderPriorizacion\(/);
assert.match(html, /data-view="priorizacion"/);
assert.match(html, /function captainGoalProgress\(/);
assert.match(html, /captain-goal-track/);
assert.match(html, /function buildCaptainTeams\(/);
assert.match(html, /function refreshStationTotals\(/);
assert.match(html, /function renderCallCenter\(/);
assert.match(html, /function renderCallCenterPanel\(/);
assert.match(html, /function selectCallCenterTab\(/);
assert.match(html, /id="callCenterApp"/);
assert.match(html, /id="callcenterBtn"/);
assert.match(html, /function renderAuditoria\(/);
assert.match(html, /function maskDocument\(/);
assert.match(html, /data-demo-action="cc-status"/);
assert.match(html, /const auditLog = \[/);
assert.match(html, /noanswer/);
assert.match(html, /Plan de recompensas/);
assert.match(html, /Invita a tus voluntarios/);
assert.match(html, /¡Hola, Cristian!/);
assert.doesNotMatch(html, /cycleBadge/);
assert.doesNotMatch(html, /selectIcon/);
assert.doesNotMatch(html, /Lectura rápida/);
assert.equal((html.match(/id:'puesto-\d+'/g) || []).length, 19);

console.log('Panel de campaña: navegación y vistas mock presentes.');
