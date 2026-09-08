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

console.log('Panel de campaña: navegación y vistas mock presentes.');
