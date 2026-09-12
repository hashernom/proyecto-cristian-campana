# Ajustes de maqueta: recompensas, puestos y call center — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar los ajustes aprobados sobre `sitio-estatico/index.html` y su smoke test: plan de recompensas, estados no editables por capitanes, invitación con autorregistro, terminología de puestos, ranking correcto, red del capitán por métricas propias, y secciones nuevas de Call center y Auditoría.

**Architecture:** Sigue siendo un único HTML estático con CSS, datos mock y renderizado por funciones. Las vistas del panel se registran en `dashboardViewMeta`/`dashboardRenderers` y la interacción usa delegación de eventos `[data-demo-action]`. El Call center muta `volunteerRegistry` en memoria, recalcula totales de puestos y alimenta un `auditLog` que consume la vista Auditoría.

**Tech Stack:** HTML/CSS/JS vanilla, Leaflet 1.9.4 (CDN), Poppins, Node.js (`node:assert/strict`) para el smoke test.

**Spec:** `docs/superpowers/specs/2026-09-12-ajustes-maqueta-recompensas-callcenter-design.md`

**Ejecución:** secuencial en una sola sesión (decisión del usuario), sin worktrees.

---

### Task 1: Contrato de pruebas (rojo)

**Files:**
- Modify: `tests/panel-campana.test.js` (reemplazo total del archivo)
- Test: `tests/panel-campana.test.js`

- [ ] **Step 1: Reemplazar el contenido del test**

Contenido completo nuevo:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'sitio-estatico', 'index.html'),
  'utf8'
);

for (const view of ['resumen', 'priorizacion', 'capitanes', 'voluntarios', 'callcenter', 'auditoria', 'grupos', 'propuestas']) {
  assert.match(html, new RegExp(`data-view="${view}"`));
}

for (const section of ['capitanes', 'voluntarios', 'callcenter', 'auditoria', 'grupos', 'propuestas']) {
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
```

- [ ] **Step 2: Ejecutar el test para verlo fallar**

Run: `node tests/panel-campana.test.js`
Expected: FAIL con `AssertionError` en `data-view="callcenter"` (la vista aún no existe).

- [ ] **Step 3: Commit**

```bash
git add tests/panel-campana.test.js
git commit -m "test: specify mockup adjustments contract"
```

---

### Task 2: Textos y estados no editables (móvil + recompensas)

**Files:**
- Modify: `sitio-estatico/index.html` (líneas ~481-486, ~503-507, ~512-530, ~537-562, ~724-742, ~1496-1503, CSS ~111-115 de zona móvil)

- [ ] **Step 1: Inicio (s5): saludo y plan de recompensas**

Reemplazar:

```html
        <div style="margin-top:14px;font-size:23px;font-weight:800;">¡Hola, María!</div>
        <div style="font-size:11px;font-weight:600;opacity:.85;">Meta de voluntarios confirmados</div>
        <div class="bartrack"><div class="barfill">34%</div><div class="barend">100%</div></div>
        <div style="font-size:10.5px;font-weight:400;opacity:.75;margin:0 0 14px;font-style:italic;">Cada persona que confirmas te acerca a tu meta y a nuevos beneficios.</div>
```

por:

```html
        <div style="margin-top:14px;font-size:23px;font-weight:800;">¡Hola, Cristian!</div>
        <div style="font-size:11px;font-weight:600;opacity:.85;">Plan de recompensas</div>
        <div class="bartrack"><div class="barfill">34%</div><div class="barend">100%</div></div>
        <div style="font-size:10.5px;font-weight:400;opacity:.75;margin:0 0 14px;font-style:italic;">Cada persona que confirmas te acerca a nuevos beneficios.</div>
```

- [ ] **Step 2: Tus voluntarios (s6): badges estáticos**

Reemplazar el bloque completo del `div style="overflow-y:auto;flex:1;"` (5 filas) por:

```html
        <div style="overflow-y:auto;flex:1;">
          <div class="row"><div class="avatar">JZ</div><div><div class="rname">Juan Pablo Zuluaga</div><div class="rmeta">300 456 7890 · Cristo Rey</div></div><span class="badge ok">Confirmado</span></div>
          <div class="row"><div class="avatar">CV</div><div><div class="rname">Carmen Villalobos</div><div class="rmeta">301 234 5678 · Buenos Aires</div></div><span class="badge ok">Confirmado</span></div>
          <div class="row"><div class="avatar">HP</div><div><div class="rname">Hernán Pérez</div><div class="rmeta">302 987 6543 · La Piñuela</div></div><span class="badge pend">Pendiente</span></div>
          <div class="row"><div class="avatar">SR</div><div><div class="rname">Susana Ramírez</div><div class="rmeta">304 555 1122 · Villa Nueva</div></div><span class="badge no">No confirma</span></div>
          <div class="row"><div class="avatar">DL</div><div><div class="rname">David Londoño</div><div class="rmeta">315 222 3344 · Cristo Rey</div></div><span class="badge ok">Confirmado</span></div>
        </div>
```

- [ ] **Step 3: Nueva persona (s7) → Invitar + autorregistro**

Reemplazar la pantalla completa `<!-- 7. AGREGAR --> ... </div>` por:

```html
      <!-- 7. INVITAR / AUTORREGISTRO -->
      <div class="screen white" id="s7">
        <button class="back" onclick="go('s6')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 19l-7-7 7-7"/></svg></button>
        <div style="margin-top:26px;font-size:20px;font-weight:800;">Invita a tus voluntarios</div>
        <div style="font-size:10px;color:#8892b0;margin-bottom:14px;">Comparte tu link; cada persona autoriza sus datos y se registra por su cuenta.</div>
        <div class="invite-link"><div class="url">campana-cristiam.co/invita/TU-CODIGO</div><button class="copy" onclick="toast('Link copiado')">Copiar link</button></div>
        <button class="pill dark" style="background:var(--green);" onclick="toast('Link enviado por WhatsApp')">Enviar por WhatsApp</button>
        <div class="invite-note" style="margin-top:12px;">Ley 1581 de 2012 · Protección de datos: no puedes registrar personas ajenas. Envía el link para que cada persona complete y autorice su propio registro.</div>
        <div style="font-size:12px;font-weight:800;margin:14px 0 8px;">Así completa el registro tu invitado</div>
        <div class="field"><label>Nombre completo</label><div class="box">Andrea Salazar</div></div>
        <div class="fh"><div class="field"><label>Cédula</label><div class="box">1 098 234 552</div></div><div class="field"><label>Celular</label><div class="box">311 445 6677</div></div></div>
        <div class="field"><label>Barrio</label><div class="box" style="justify-content:space-between;">La Piñuela <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8892b0" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg></div></div>
        <div class="field"><label>Puesto de votación</label><div class="box" style="justify-content:space-between;">Puesto Comuna 3 · Olaya Herrera <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8892b0" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg></div></div>
        <button class="pill dark" style="margin-top:6px;" onclick="toast('Autorregistro guardado');go('s6')">Guardar autorregistro</button>
      </div>
```

- [ ] **Step 4: CSS de invitación**

Justo antes de `  /* ---------- toast ---------- */` agregar:

```css
  .invite-link{display:flex;align-items:center;gap:8px;background:var(--blue-tint);border-radius:999px;padding:7px 8px 7px 14px;margin-bottom:10px;}
  .invite-link .url{flex:1;min-width:0;font-size:10px;font-weight:700;color:var(--blue);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .invite-link .copy{flex-shrink:0;background:var(--ink);color:#fff;font:700 9.5px Poppins,sans-serif;border-radius:999px;padding:8px 11px;}
  .invite-note{background:#FCF1DE;color:#9A6916;border-radius:14px;padding:11px 13px;font-size:9.5px;line-height:1.5;font-weight:600;margin-bottom:14px;}
```

- [ ] **Step 5: Ranking (s8): podio con totales de red**

Reemplazar el bloque `<div class="podium">...</div>` por (orden por total: JZ 108, HP 88, CV 82):

```html
        <div class="podium">
          <div class="pcol"><div class="pav" style="width:44px;height:44px;font-size:13px;">HP</div><div class="pname">Hernán<br>Pérez</div><div class="pmeta">88 personas</div></div>
          <div class="pcol"><svg width="24" height="16" viewBox="0 0 24 16" fill="#FCEE21" style="margin-bottom:-3px;"><path d="M2 14l-2-9 5 3 5-7 5 7 5-3-2 9z"/></svg><div class="pav" style="width:58px;height:58px;font-size:17px;">JZ</div><div class="pname">Juan Pablo<br>Zuluaga</div><div class="pmeta">108 personas</div></div>
          <div class="pcol"><div class="pav" style="width:44px;height:44px;font-size:13px;">CV</div><div class="pname">Carmen<br>Villalobos</div><div class="pmeta">82 personas</div></div>
        </div>
```

- [ ] **Step 6: Ranking (s8): lista con totales e iconos estáticos**

Reemplazar el bloque `<div class="listwrap">...</div>` completo por:

```html
        <div class="listwrap">
          <div class="row"><div><div class="rname">Juan Pablo Zuluaga</div><div class="rmeta">108 personas en su red</div></div><div class="icons">
            <span class="ic sel" style="background:#E3F7EB;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0BA451" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></span>
            <span class="ic" style="background:#FCF1DE;color:#E8A93B;font-weight:900;">−</span>
            <span class="ic" style="background:#FCE7E7;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#EB1F27" stroke-width="3"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
          </div></div>
          <div class="row"><div><div class="rname">Hernán Pérez</div><div class="rmeta">88 personas en su red</div></div><div class="icons">
            <span class="ic sel" style="background:#E3F7EB;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0BA451" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></span>
            <span class="ic" style="background:#FCF1DE;color:#E8A93B;font-weight:900;">−</span>
            <span class="ic" style="background:#FCE7E7;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#EB1F27" stroke-width="3"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
          </div></div>
          <div class="row"><div><div class="rname">Carmen Villalobos</div><div class="rmeta">82 personas en su red</div></div><div class="icons">
            <span class="ic sel" style="background:#E3F7EB;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0BA451" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></span>
            <span class="ic" style="background:#FCF1DE;color:#E8A93B;font-weight:900;">−</span>
            <span class="ic" style="background:#FCE7E7;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#EB1F27" stroke-width="3"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
          </div></div>
          <div class="row"><div><div class="rname">Susana Ramírez</div><div class="rmeta">72 personas en su red</div></div><div class="icons">
            <span class="ic sel" style="background:#E3F7EB;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0BA451" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></span>
            <span class="ic" style="background:#FCF1DE;color:#E8A93B;font-weight:900;">−</span>
            <span class="ic" style="background:#FCE7E7;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#EB1F27" stroke-width="3"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
          </div></div>
        </div>
```

- [ ] **Step 7: Eliminar funciones sin uso**

Eliminar del script:

```js
  function cycleBadge(el){
    var states = ['ok','pend','no'];
    var labels = {ok:'Confirmado', pend:'Pendiente', no:'No confirma'};
    var cur = states.filter(function(s){ return el.classList.contains(s); })[0] || 'pend';
    var next = states[(states.indexOf(cur)+1) % states.length];
    states.forEach(function(s){ el.classList.remove(s); });
    el.classList.add(next);
    el.textContent = labels[next];
  }

```

y

```js
  function selectIcon(el){
    Array.prototype.forEach.call(el.parentElement.children, function(s){ s.classList.remove('sel'); });
    el.classList.add('sel');
  }

```

- [ ] **Step 8: Box de recompensas en Red del capitán**

En `renderCaptainNetwork()` reemplazar:

```js
      ? 'Meta cumplida · incentivo desbloqueado'
      : 'Faltan '+formatNumber(remaining)+' confirmados para la meta';
```

por:

```js
      ? 'Meta cumplida · beneficio desbloqueado'
      : 'Faltan '+formatNumber(remaining)+' confirmados para el siguiente beneficio';
```

y en el `captain-goal-head` reemplazar `Meta de voluntarios confirmados` por `Plan de recompensas`.

- [ ] **Step 9: Ejecutar el test**

Run: `node tests/panel-campana.test.js`
Expected: FAIL en `data-view="callcenter"` (sigue rojo hasta Task 6). Las nuevas aserciones de móvil ya pasan.

- [ ] **Step 10: Commit**

```bash
git add sitio-estatico/index.html
git commit -m "feat: update mobile rewards, invitations and static statuses"
```

---

### Task 3: Terminología de puestos y sin meta por comuna

**Files:**
- Modify: `sitio-estatico/index.html` (datos de zonas ~749-786, CSS ~300, `zoneStationSummary` ~1063, `renderZoneSide` ~1196-1202)

- [ ] **Step 1: Quitar `stationGoal` de las 6 zonas**

En cada objeto de `ocanaZones` eliminar el fragmento `, stationGoal:4` / `:5` / `:3` según corresponda. Ejemplo exacto (comuna 1):

```js
      support:52, volunteers:512, captains:22, stationGoal:4, trend:'+3% esta semana',
```

→

```js
      support:52, volunteers:512, captains:22, trend:'+3% esta semana',
```

Repetir la misma operación en las líneas de `support/volunteers/captains` de las comunas 2 a 6.

- [ ] **Step 2: Simplificar `zoneStationSummary`**

Reemplazar:

```js
  function zoneStationSummary(comunaId){ const stations = stationsForZone(comunaId); const zone = ocanaZones.find(function(item){ return item.id === comunaId; }); const stationGoal = zone && Number.isFinite(zone.stationGoal) && zone.stationGoal > 0 ? zone.stationGoal : Math.max(stations.length, 2); return stations.reduce(function(summary, station){ const assigned = stationNumber(station.assigned); const registered = Math.min(stationNumber(station.registered), assigned); summary.assigned += assigned; summary.registered += registered; summary.covered += assigned > 0 ? 1 : 0; return summary; }, {stationGoal:stationGoal, covered:0, assigned:0, registered:0, total:stations.length}); }
```

por:

```js
  function zoneStationSummary(comunaId){ const stations = stationsForZone(comunaId); return stations.reduce(function(summary, station){ const assigned = stationNumber(station.assigned); const registered = Math.min(stationNumber(station.registered), assigned); summary.assigned += assigned; summary.registered += registered; summary.covered += assigned > 0 ? 1 : 0; return summary; }, {covered:0, assigned:0, registered:0, total:stations.length}); }
```

- [ ] **Step 3: Rejilla CSS de 5 a 4 columnas**

Reemplazar:

```css
  .map-station-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;}
```

por:

```css
  .map-station-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;}
```

- [ ] **Step 4: `renderZoneSide`: título y métricas**

Reemplazar:

```js
      '<div><h4>Estaciones de votación</h4><div class="map-station-summary">'+
        '<div class="map-station-stat"><div class="v">'+stationSummary.stationGoal+'</div><div class="l">Meta puestos</div></div>'+
        '<div class="map-station-stat"><div class="v">'+stationSummary.covered+'</div><div class="l">Puestos cubiertos</div></div>'+
```

por:

```js
      '<div><h4>Puestos de votación</h4><div class="map-station-summary">'+
        '<div class="map-station-stat"><div class="v">'+stationSummary.covered+'</div><div class="l">Puestos cubiertos</div></div>'+
```

- [ ] **Step 5: Verificar que no queda `stationGoal`**

Run: `node -e "const fs=require('fs');const h=fs.readFileSync('sitio-estatico/index.html','utf8');if(h.includes('stationGoal')){process.exit(1)};console.log('stationGoal eliminado')"`
Expected: `stationGoal eliminado`

- [ ] **Step 6: Commit**

```bash
git add sitio-estatico/index.html
git commit -m "refactor: rename voting posts and drop station goal"
```

---

### Task 4: Ranking con totales de red y etiquetas de grupos

**Files:**
- Modify: `sitio-estatico/index.html` (tabla Resumen ~645-652, stat grupos ~638, `renderCapitanes` ~1086-1100, `renderGrupos` ~1125-1131)

- [ ] **Step 1: Tabla del Resumen**

Reemplazar el bloque `<div class="tbl-wrap"><table> ... </table></div>` por:

```html
              <div class="tbl-wrap"><table>
                <tr><th>Capitán</th><th>Barrio</th><th>Agreg.</th><th>Avance</th><th>Estado</th></tr>
                <tr><td><div class="nm"><div class="av2">JZ</div>Juan Pablo Zuluaga</div></td><td>Cristo Rey</td><td>108</td><td><div class="bar2"><i style="width:82%;"></i></div></td><td><span class="badge ok">Al día</span></td></tr>
                <tr><td><div class="nm"><div class="av2">CV</div>Carmen Villalobos</div></td><td>Buenos Aires</td><td>82</td><td><div class="bar2"><i style="width:88%;"></i></div></td><td><span class="badge ok">Al día</span></td></tr>
                <tr><td><div class="nm"><div class="av2">HP</div>Hernán Pérez</div></td><td>La Piñuela</td><td>88</td><td><div class="bar2"><i style="width:65%;"></i></div></td><td><span class="badge pend">Seguimiento</span></td></tr>
                <tr><td><div class="nm"><div class="av2">SR</div>Susana Ramírez</div></td><td>Villa Nueva</td><td>72</td><td><div class="bar2"><i style="width:57%;"></i></div></td><td><span class="badge pend">Seguimiento</span></td></tr>
                <tr><td><div class="nm"><div class="av2">DL</div>David Londoño</div></td><td>Cristo Rey</td><td>80</td><td><div class="bar2"><i style="width:70%;"></i></div></td><td><span class="badge pend">Seguimiento</span></td></tr>
              </table></div>
```

- [ ] **Step 2: Stat "Grupos activos" del Resumen**

En el bloque `.stats` del Resumen reemplazar `<div class="l">Grupos activos</div>` por `<div class="l">Grupos de WhatsApp activos</div>`.

- [ ] **Step 3: `renderCapitanes`: agregados y promedio**

Reemplazar:

```js
        '<td>'+escapeHtml(captain.neighborhood)+'</td><td>'+captain.added+'</td><td><div class="bar2"><i style="width:'+Math.min(goalProgress, 100)+'%;"></i></div><div class="muted">'+goalProgress+'% de meta</div></td>'+
```

por:

```js
        '<td>'+escapeHtml(captain.neighborhood)+'</td><td>'+captain.team.length+'</td><td><div class="bar2"><i style="width:'+Math.min(goalProgress, 100)+'%;"></i></div><div class="muted">'+goalProgress+'% de meta</div></td>'+
```

Y reemplazar:

```js
        {value:'16,8',label:'Promedio por capitán',delta:'+1,2 vs. agosto'}
```

por:

```js
        {value:'83,3',label:'Promedio por capitán',delta:'Personas por red'}
```

- [ ] **Step 4: `renderGrupos`: nota y stat**

Reemplazar:

```js
    return '<div class="view-heading"><div><h3>Comunidades de WhatsApp</h3><p>Grupos activos para coordinar voluntariado por territorio y afinidad.</p></div><div class="view-note">17 grupos activos</div></div>'+
      '<div class="view-stats">'+dashboardMetrics([
        {value:'17',label:'Grupos activos',delta:'+2 este mes'},
```

por:

```js
    return '<div class="view-heading"><div><h3>Comunidades de WhatsApp</h3><p>Grupos activos para coordinar voluntariado por territorio y afinidad.</p></div><div class="view-note">17 grupos de WhatsApp activos</div></div>'+
      '<div class="view-stats">'+dashboardMetrics([
        {value:'17',label:'Grupos de WhatsApp activos',delta:'+2 este mes'},
```

- [ ] **Step 5: Commit**

```bash
git add sitio-estatico/index.html
git commit -m "fix: use network totals in captain ranking"
```

---

### Task 5: Red del capitán por métricas propias

**Files:**
- Modify: `sitio-estatico/index.html` (CSS ~338-342 y ~398-399, `renderCaptainNetworkMap` ~1450-1473, `renderCaptainNetwork` ~1505-1511, `renderPollingStationCard` ~1333-1353, `selectPollingStation` ~1355-1370, markers del capitán ~1554-1564)

- [ ] **Step 1: Eliminar la tarjeta flotante del mapa del capitán**

Eliminar del HTML de `renderCaptainNetworkMap()` este bloque:

```js
      '<div class="captain-map-card">'+
        '<div class="name">'+escapeHtml(captain.name)+'</div>'+
        '<div class="meta">'+escapeHtml(captain.neighborhood)+' · '+escapeHtml(captain.comuna||'')+'</div>'+
        '<div class="station-metrics">'+
          '<div class="station-metric"><span class="v">'+summary.covered+'</span><span class="l">Puestos</span></div>'+
          '<div class="station-metric"><span class="v">'+formatNumber(summary.assigned)+'</span><span class="l">Asignadas</span></div>'+
          '<div class="station-metric"><span class="v">'+formatNumber(summary.registered)+'</span><span class="l">Confirmadas</span></div>'+
          '<div class="station-metric"><span class="v">'+formatNumber(pending)+'</span><span class="l">Pendientes</span></div>'+
        '</div>'+
        '<div class="station-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progress+'" aria-label="'+progress+'% de confirmación"><i style="width:'+progress+'%;"></i></div>'+
        '<div class="station-progress-meta"><span>'+progress+'% de confirmación</span><span>'+formatNumber(summary.registered)+' de '+formatNumber(summary.assigned)+'</span></div>'+
      '</div>'+
```

El inicio de la función queda:

```js
  function renderCaptainNetworkMap(captain){
    const toggleLabel = (showReferenceStations ? 'Ocultar' : 'Mostrar')+' puestos de referencia';
    return '<div class="captain-map-shell">'+
      '<div class="map-leaflet" id="captainLeafletMap"></div>'+
      '<label class="reference-toggle"><input type="checkbox" data-demo-action="reference-toggle"'+(showReferenceStations ? ' checked' : '')+'> '+toggleLabel+'</label>'+
      '<div class="station-card captain-station-detail" id="captainStationCard" aria-hidden="true"></div>'+
      '<div class="captain-map-caption">Mapa aproximado · puestos atenuados pertenecen a otras redes</div>'+
      '</div>';
  }
```

Y en `selectPollingStation` eliminar:

```js
    const shell = card.closest('.captain-map-shell');
    if(shell) shell.classList.add('detail-open');
```

- [ ] **Step 2: Eliminar CSS de la tarjeta flotante**

Eliminar:

```css
  .captain-map-card{position:absolute;z-index:15;top:18px;right:18px;width:min(280px,calc(100% - 36px));
    background:rgba(255,255,255,.98);border:1px solid #DCE5FF;border-radius:16px;padding:14px;
    box-shadow:0 18px 38px rgba(20,40,120,.2);}
  .captain-map-card .name{font-size:12px;font-weight:800;line-height:1.3;}
  .captain-map-card .meta{font-size:9px;color:#9aa1b5;margin-top:3px;}
```

y del media query:

```css
    .captain-map-card{top:auto;left:18px;right:18px;bottom:18px;width:auto;}
    .captain-map-shell.detail-open .captain-map-card{display:none;}
```

- [ ] **Step 3: Stat "Puestos de votación" en Red del capitán**

En `renderCaptainNetwork()` reemplazar:

```js
      '<div class="view-stats">'+dashboardMetrics([
        {value:String(counts.ok||0), label:'Equipo confirmado', delta:captain.team.length+' en total'},
        {value:String(counts.pending||0), label:'Equipo pendiente', delta:'Por confirmar'},
        {value:String(counts.rejected||0), label:'Equipo rechazado', delta:'Requieren revisión', tone:'warn'}
      ])+'</div>'+
```

por:

```js
      '<div class="view-stats">'+dashboardMetrics([
        {value:String(stationsForCaptain(captain.id).length), label:'Puestos de votación', delta:captainStationSummary(captain).covered+' con cobertura'},
        {value:String(counts.ok||0), label:'Equipo confirmado', delta:captain.team.length+' en total'},
        {value:String(counts.pending||0), label:'Equipo pendiente', delta:'Por confirmar'},
        {value:String(counts.rejected||0), label:'Equipo rechazado', delta:'Requieren revisión', tone:'warn'}
      ])+'</div>'+
```

- [ ] **Step 4: Métricas del capitán en la ficha del pin**

Agregar antes de `renderPollingStationCard`:

```js
  function captainStationTotals(captain, station){
    const members = captain.team.filter(function(member){
      return member.pollingStationId === station.id && member.status !== 'rejected';
    });
    const registered = members.filter(function(member){ return member.status === 'ok'; }).length;
    return {assigned:members.length, registered:registered, pending:members.length - registered};
  }
```

Reemplazar la función completa `renderPollingStationCard` por:

```js
  function renderPollingStationCard(station, reference, titleId, captainIndex){
    if(!station) return '';
    const titleElementId = titleId || 'stationCardTitle';
    const zone = ocanaZones.find(function(item){ return item.id === station.comunaId; });
    const captain = Number.isInteger(captainIndex) ? campaignMockData.capitanes[captainIndex] : null;
    const captainOwned = captain ? captainOwnsStation(captain, station) : false;
    const referenceLabel = reference ? '<div class="station-reference">Dato referencial · pertenece a otra red</div>' : '';
    const head = '<div class="station-card-head"><div class="station-card-title" id="'+titleElementId+'">'+escapeHtml(station.name)+'</div>'+
      '<button type="button" class="station-card-close" data-demo-action="close-station-card" aria-label="Cerrar ficha del puesto">'+
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 6l12 12M18 6L6 18"/></svg>'+
      '</button></div>'+
      '<div class="station-card-meta">'+escapeHtml(station.barrio)+' · '+escapeHtml(zone ? zone.code : station.comunaId)+'</div>'+referenceLabel;
    if(captain && !captainOwned){
      return head;
    }
    const totals = captain
      ? captainStationTotals(captain, station)
      : {assigned:stationNumber(station.assigned), registered:Math.min(stationNumber(station.registered), stationNumber(station.assigned)), pending:0, meta:stationNumber(station.meta)};
    const assigned = totals.assigned;
    const registered = Math.min(totals.registered, assigned);
    const pending = captain ? totals.pending : Math.max(0, assigned - registered);
    const progress = assigned ? Math.round((registered / assigned) * 100) : 0;
    const metaTile = captain
      ? ''
      : '<div class="station-metric"><span class="v">'+formatNumber(station.meta)+'</span><span class="l">Meta</span></div>';
    return head+
      '<div class="station-metrics'+(captain ? ' three' : '')+'">'+metaTile+
        '<div class="station-metric"><span class="v">'+formatNumber(assigned)+'</span><span class="l">Asignadas</span></div>'+
        '<div class="station-metric"><span class="v">'+formatNumber(registered)+'</span><span class="l">Confirmadas</span></div>'+
        '<div class="station-metric"><span class="v">'+formatNumber(pending)+'</span><span class="l">Pendientes</span></div></div>'+
      '<div class="station-progress" aria-label="'+progress+'% de confirmación"><i style="width:'+progress+'%;"></i></div>'+
      '<div class="station-progress-meta"><span>'+progress+'% de confirmación</span><span>'+formatNumber(registered)+' de '+formatNumber(assigned)+'</span></div>';
  }
```

- [ ] **Step 5: Pasar el capitán a la ficha y ajustar CSS de 3 métricas**

Reemplazar la firma y la llamada en `selectPollingStation`:

```js
  function selectPollingStation(stationId, reference, cardId){
```

→

```js
  function selectPollingStation(stationId, reference, cardId, captainIndex){
```

y

```js
    card.innerHTML = renderPollingStationCard(station, isReference, titleElementId);
```

→

```js
    card.innerHTML = renderPollingStationCard(station, isReference, titleElementId, captainIndex);
```

En `renderCaptainNetworkMapLayers` reemplazar:

```js
      marker.on('click', function(){ selectPollingStation(station.id, !own, 'captainStationCard'); });
```

por:

```js
      marker.on('click', function(){ selectPollingStation(station.id, !own, 'captainStationCard', activeCaptainIndex); });
```

Agregar CSS después de `.station-metrics{...}`:

```css
  .station-metrics.three{grid-template-columns:repeat(3,minmax(0,1fr));}
```

- [ ] **Step 6: Commit**

```bash
git add sitio-estatico/index.html
git commit -m "feat: scope captain network map to captain metrics"
```

---

### Task 6: Call center

**Files:**
- Modify: `sitio-estatico/index.html` (nav ~624, secciones ~675-678, view meta ~1041-1049, `dashboardBadge` ~1065-1077, `refreshStationTotals`, bloque de cálculo de puestos ~973-979, renderers nuevos, delegación de eventos ~1726-1795, CSS)

- [ ] **Step 1: Extraer `refreshStationTotals`**

Reemplazar:

```js
  pollingStations.forEach(function(station){
    const linked = volunteerRegistry.filter(function(person){
      return person.pollingStationId === station.id && person.status !== 'rejected';
    });
    station.assigned = linked.length;
    station.registered = linked.filter(function(person){ return person.status === 'ok'; }).length;
  });
```

por:

```js
  function refreshStationTotals(){
    pollingStations.forEach(function(station){
      const linked = volunteerRegistry.filter(function(person){
        return person.pollingStationId === station.id && person.status !== 'rejected';
      });
      station.assigned = linked.length;
      station.registered = linked.filter(function(person){ return person.status === 'ok'; }).length;
    });
  }

  refreshStationTotals();
```

- [ ] **Step 2: Badge "No contestó"**

En `dashboardBadge` reemplazar:

```js
      pending:{className:'pend', label:'Pendiente'},
      rejected:{className:'no', label:'Rechazado'},
```

por:

```js
      pending:{className:'pend', label:'Pendiente'},
      rejected:{className:'no', label:'Rechazado'},
      noanswer:{className:'pend', label:'No contestó'},
```

- [ ] **Step 3: Navegación y secciones**

Después del botón `data-view="voluntarios"` agregar:

```html
        <button class="nitem" type="button" data-view="callcenter"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5c0-1 1-2 2-2h2l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v2c0 1-1 2-2 2A16 16 0 0 1 4 5Z"/></svg>Call center</button>
```

Después del botón `data-view="propuestas"` agregar:

```html
        <button class="nitem" type="button" data-view="auditoria"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6Z"/><path d="M9 12l2 2 4-4"/></svg>Auditoría</button>
```

Después de `<section id="view-voluntarios" ...></section>` agregar:

```html
          <section id="view-callcenter" class="dashboard-view" aria-label="Call center"></section>
```

Después de `<section id="view-propuestas" ...></section>` agregar:

```html
          <section id="view-auditoria" class="dashboard-view" aria-label="Auditoría"></section>
```

En `dashboardViewMeta` agregar:

```js
    callcenter: { title:'Call center', subtitle:'Confirmación telefónica y observaciones de la jornada' },
    auditoria: { title:'Auditoría', subtitle:'Trazabilidad de consultas y cambios sobre datos sensibles' },
```

- [ ] **Step 4: Datos y utilidades del call center**

Agregar antes de `function renderCallCenter(){` (ver Step 5):

```js
  const CALL_CENTER_USER = 'Laura Méndez · Call center';
  let activeCallCenterIndex = null;
  let activeCallCenterFilter = 'all';
  let activeCallCenterQuery = '';

  const auditLog = [
    { timestamp:'12 sep 2026 · 08:12', user:CALL_CENTER_USER, action:'Inicio de jornada', target:'Sistema', detail:'Carga de lote de llamadas (60 registros)' },
    { timestamp:'12 sep 2026 · 08:31', user:CALL_CENTER_USER, action:'Consulta de ficha', target:'Luis Eduardo Soto', detail:'Verificación de puesto y barrio' },
    { timestamp:'12 sep 2026 · 08:47', user:CALL_CENTER_USER, action:'Cambio de estado', target:'Luis Eduardo Soto', detail:'Pendiente → Confirmado' },
    { timestamp:'12 sep 2026 · 09:05', user:CALL_CENTER_USER, action:'Observación', target:'Karen Luna', detail:'Se dejó mensaje en buzón de voz' },
    { timestamp:'12 sep 2026 · 09:22', user:CALL_CENTER_USER, action:'Cambio de estado', target:'Nicolás Pardo', detail:'Pendiente → Rechazo' },
    { timestamp:'12 sep 2026 · 09:40', user:CALL_CENTER_USER, action:'Cierre parcial', target:'Sistema', detail:'18 llamadas registradas' }
  ];

  const callCenterStatusLabels = {ok:'Confirmado', pending:'Pendiente', rejected:'Rechazo', noanswer:'No contestó'};

  function auditTimestamp(){
    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const now = new Date();
    return now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear()+' · '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  }

  function maskDocument(value){
    const text = String(value || '—');
    const parts = text.split(' ');
    if(parts.length >= 3){
      return parts.map(function(part, index){ return index < 2 ? part : '***'; }).join(' ');
    }
    return text.length > 4 ? text.slice(0, 4) + ' ***' : text;
  }

  function logAudit(action, person, detail){
    auditLog.unshift({
      timestamp:auditTimestamp(),
      user:CALL_CENTER_USER,
      action:action,
      target:person ? person.name : 'Sistema',
      detail:detail || ''
    });
  }
```

- [ ] **Step 5: Render de la vista Call center**

```js
  function callCenterVisibleEntries(){
    const query = activeCallCenterQuery.trim().toLowerCase();
    return volunteerRegistry.filter(function(person){
      if(activeCallCenterFilter !== 'all' && person.status !== activeCallCenterFilter) return false;
      if(!query) return true;
      return person.name.toLowerCase().indexOf(query) !== -1
        || person.document.indexOf(query) !== -1
        || person.neighborhood.toLowerCase().indexOf(query) !== -1;
    });
  }

  function renderCallCenterDetail(){
    const person = volunteerRegistry[activeCallCenterIndex];
    if(!person){
      return '<div class="cc-detail-empty">Selecciona un registro para ver su ficha, cambiar el estado y registrar observaciones con fecha.</div>';
    }
    const statusButtons = ['ok','pending','rejected','noanswer'].map(function(status){
      const active = person.status === status ? ' active' : '';
      return '<button type="button" class="cc-status-btn '+status+active+'" data-demo-action="cc-status" data-status="'+status+'">'+callCenterStatusLabels[status]+'</button>';
    }).join('');
    const observations = person.observations && person.observations.length
      ? person.observations
      : (person.notes ? [{date:person.date, text:person.notes}] : []);
    const observationsHtml = observations.length
      ? observations.map(function(observation){
          return '<div class="cc-observation"><div class="date">'+escapeHtml(observation.date)+'</div><div class="text">'+escapeHtml(observation.text)+'</div></div>';
        }).join('')
      : '<div class="cc-obs-empty">Sin observaciones registradas.</div>';
    return '<div class="cc-detail-head"><div class="av2">'+escapeHtml(person.initials)+'</div><div><div class="cc-detail-name">'+escapeHtml(person.name)+'</div><div class="muted">'+escapeHtml(maskDocument(person.document))+'</div></div></div>'+
      '<div class="cc-detail-grid">'+
        '<div><span class="label">Número</span><span class="value">'+escapeHtml(person.phone)+'</span></div>'+
        '<div><span class="label">Barrio</span><span class="value">'+escapeHtml(person.neighborhood)+'</span></div>'+
        '<div><span class="label">Puesto</span><span class="value">'+escapeHtml(person.pollingStation || 'Sin puesto')+'</span></div>'+
      '</div>'+
      '<div class="cc-status-block"><span class="label">Estado de confirmación</span><div class="cc-status-btns">'+statusButtons+'</div></div>'+
      '<div class="cc-observations"><span class="label">Observaciones</span>'+observationsHtml+'</div>'+
      '<div class="cc-obs-form"><textarea class="cc-obs-input" rows="2" placeholder="Nueva observación con fecha..."></textarea><button type="button" class="view-action" data-demo-action="cc-add-observation">Agregar observación</button></div>';
  }

  function renderCallCenter(){
    const entries = callCenterVisibleEntries();
    const shown = entries.slice(0, 60);
    const counts = volunteerRegistryCounts();
    const filters = [
      {key:'all', label:'Todos'},
      {key:'ok', label:'Confirmado'},
      {key:'pending', label:'Pendiente'},
      {key:'rejected', label:'Rechazo'},
      {key:'noanswer', label:'No contestó'}
    ];
    const chips = filters.map(function(filter){
      return '<button class="filter-chip'+(activeCallCenterFilter===filter.key?' active':'')+'" type="button" data-demo-action="cc-filter" data-cc-filter="'+filter.key+'">'+filter.label+'</button>';
    }).join('');
    const rows = shown.map(function(person){
      const index = volunteerRegistry.indexOf(person);
      const active = index === activeCallCenterIndex ? ' class="cc-row-active"' : '';
      return '<tr'+active+'><td><div class="person"><div class="av2">'+escapeHtml(person.initials)+'</div>'+escapeHtml(person.name)+'</div></td>'+
        '<td class="muted">'+escapeHtml(person.phone)+'</td>'+
        '<td class="muted">'+escapeHtml(person.neighborhood)+'</td>'+
        '<td class="muted">'+escapeHtml(maskDocument(person.document))+'</td>'+
        '<td class="muted">'+escapeHtml(person.pollingStation || '—')+'</td>'+
        '<td>'+dashboardBadge(person.status)+'</td>'+
        '<td><button class="view-action" type="button" data-demo-action="cc-select" data-cc="'+index+'">Abrir</button></td></tr>';
    }).join('');
    const tableNote = entries.length > shown.length
      ? 'Mostrando '+shown.length+' de '+formatNumber(entries.length)+' registros · usa la búsqueda para filtrar.'
      : formatNumber(entries.length)+' registros';
    return '<div class="view-heading"><div><h3>Call center</h3><p>Confirmación telefónica y observaciones de la jornada.</p></div><div class="view-note">Usuario: '+escapeHtml(CALL_CENTER_USER)+'</div></div>'+
      '<div class="view-stats">'+dashboardMetrics([
        {value:formatNumber(volunteerRegistry.length),label:'Registros',delta:'Base total de la red'},
        {value:formatNumber(counts.ok),label:'Confirmados',delta:'Listos para votar'},
        {value:formatNumber(counts.pending),label:'Pendientes',delta:'Por confirmar'},
        {value:formatNumber(counts.noanswer || 0),label:'No contestó',delta:'Reintentar mañana',tone:'warn'}
      ])+'</div>'+
      '<div class="cc-layout">'+
        '<div class="view-panel cc-table-panel"><h3>Llamadas asignadas</h3><div class="ph">Busca por nombre, cédula o barrio. Solo el call center puede cambiar el estado.</div>'+
          '<input class="cc-search" type="search" placeholder="Buscar por nombre, cédula o barrio..." value="'+escapeHtml(activeCallCenterQuery)+'" data-cc-search>'+
          '<div class="filter-chips">'+chips+'</div>'+
          '<div class="view-table-wrap"><table class="view-table"><thead><tr><th>Nombre</th><th>Número</th><th>Barrio</th><th>Cédula</th><th>Puesto</th><th>Estado</th><th></th></tr></thead><tbody>'+(rows || '<tr><td colspan="7" class="muted">Sin registros para este filtro.</td></tr>')+'</tbody></table></div>'+
          '<div class="cc-table-note">'+tableNote+'</div>'+
        '</div>'+
        '<aside class="view-panel cc-detail">'+renderCallCenterDetail()+'</aside>'+
      '</div>';
  }
```

- [ ] **Step 6: Registrar renderer y eventos**

En `dashboardRenderers` reemplazar:

```js
  const dashboardRenderers = {priorizacion:renderPriorizacion, capitanes:renderCapitanes, voluntarios:renderVoluntarios, grupos:renderGrupos, propuestas:renderPropuestas};
```

por:

```js
  const dashboardRenderers = {priorizacion:renderPriorizacion, capitanes:renderCapitanes, voluntarios:renderVoluntarios, callcenter:renderCallCenter, grupos:renderGrupos, propuestas:renderPropuestas};
```

En la delegación de clic del `desktopApp`, antes de `if(kind === 'volunteer'){`, agregar:

```js
    if(kind === 'cc-select'){
      activeCallCenterIndex = Number(action.dataset.cc);
      logAudit('Consulta de ficha', volunteerRegistry[activeCallCenterIndex], 'Apertura de ficha para llamada');
      renderDashboardView('callcenter');
      return;
    }
    if(kind === 'cc-filter'){
      activeCallCenterFilter = action.dataset.ccFilter;
      renderDashboardView('callcenter');
      return;
    }
    if(kind === 'cc-status'){
      const person = volunteerRegistry[activeCallCenterIndex];
      if(person){
        const next = action.dataset.status;
        const previousLabel = callCenterStatusLabels[person.status] || person.status;
        person.status = next;
        refreshStationTotals();
        refreshStationMarkerIcons();
        logAudit('Cambio de estado', person, previousLabel+' → '+callCenterStatusLabels[next]);
        renderDashboardView('callcenter');
        toast('Estado actualizado: '+callCenterStatusLabels[next]);
      }
      return;
    }
    if(kind === 'cc-add-observation'){
      const person = volunteerRegistry[activeCallCenterIndex];
      const input = document.querySelector('.cc-obs-input');
      const text = input ? input.value.trim() : '';
      if(person && text){
        if(!person.observations) person.observations = person.notes ? [{date:person.date, text:person.notes}] : [];
        person.observations.unshift({date:auditTimestamp().split(' · ')[0], text:text});
        logAudit('Observación', person, text);
        renderDashboardView('callcenter');
        toast('Observación agregada');
      }
      return;
    }
```

Después de esa delegación (al final del bloque, antes de `function toggleApp`), agregar el listener de búsqueda:

```js
  document.getElementById('desktopApp').addEventListener('input', function(event){
    if(event.target && event.target.matches('[data-cc-search]')){
      activeCallCenterQuery = event.target.value;
      renderDashboardView('callcenter');
      const input = document.querySelector('[data-cc-search]');
      if(input){ input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }
  });
```

- [ ] **Step 7: Refrescar pines de puestos al cambiar estados**

Reemplazar `renderPollingStations` por:

```js
  const ocanaStationMarkers = {};

  function renderPollingStations(){
    pollingStations.forEach(function(station){
      const marker = L.marker(station.position, {icon:stationIcon(station), keyboard:true, title:station.name}).addTo(ocanaLeafletMap);
      marker.on('click', function(){ selectPollingStation(station.id, false, 'stationCard'); });
      ocanaStationMarkers[station.id] = marker;
    });
  }

  function refreshStationMarkerIcons(){
    pollingStations.forEach(function(station){
      if(ocanaStationMarkers[station.id]) ocanaStationMarkers[station.id].setIcon(stationIcon(station));
      if(captainStationMarkers[station.id]){
        const captain = campaignMockData.capitanes[activeCaptainIndex];
        const dim = captain ? !captainOwnsStation(captain, station) : false;
        captainStationMarkers[station.id].setIcon(stationIcon(station, dim));
      }
    });
    const sideEl = document.getElementById('mapSide');
    if(sideEl){
      const zone = ocanaZones.find(function(item){ return item.id === activeZoneId; });
      if(zone) sideEl.innerHTML = renderZoneSide(zone);
    }
  }
```

- [ ] **Step 8: CSS del call center**

Agregar antes de `  /* ---------- captain network detail ---------- */`:

```css
  /* ---------- call center ---------- */
  .cc-layout{display:grid;grid-template-columns:1.6fr 1fr;gap:16px;min-width:0;}
  .cc-search{width:100%;border:1.5px solid #E4E7F2;border-radius:999px;padding:10px 14px;font:600 11px Poppins,sans-serif;color:var(--ink);margin-bottom:10px;}
  .cc-search:focus-visible{outline:3px solid rgba(49,100,253,.24);outline-offset:2px;border-color:#C7D2FA;}
  .cc-table-note{font-size:9.5px;color:#9aa1b5;margin-top:10px;font-weight:600;}
  .view-table tr.cc-row-active td{background:var(--blue-tint);}
  .cc-detail{display:flex;flex-direction:column;gap:12px;align-self:start;}
  .cc-detail-head{display:flex;align-items:center;gap:10px;}
  .cc-detail-name{font-size:12.5px;font-weight:800;}
  .cc-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;}
  .cc-detail-grid .label,.cc-status-block .label,.cc-observations .label{display:block;font-size:9px;color:#9aa1b5;font-weight:700;text-transform:uppercase;letter-spacing:.35px;margin-bottom:3px;}
  .cc-detail-grid .value{font-size:11px;font-weight:600;word-break:break-word;}
  .cc-status-btns{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
  .cc-status-btn{border:1.5px solid #E4E7F2;border-radius:999px;background:#fff;color:#6b7280;font:700 10px Poppins,sans-serif;padding:8px 6px;}
  .cc-status-btn.active.ok{background:#E3F7EB;border-color:transparent;color:var(--green);}
  .cc-status-btn.active.pending{background:#FCF1DE;border-color:transparent;color:var(--amber);}
  .cc-status-btn.active.rejected{background:#FCE7E7;border-color:transparent;color:var(--red);}
  .cc-status-btn.active.noanswer{background:#EEF1FA;border-color:transparent;color:#4b5563;}
  .cc-observations{display:flex;flex-direction:column;gap:8px;}
  .cc-observation{background:#F8F9FC;border-radius:10px;padding:9px 11px;}
  .cc-observation .date{font-size:8.5px;color:#9aa1b5;font-weight:700;}
  .cc-observation .text{font-size:10.5px;margin-top:2px;line-height:1.45;}
  .cc-obs-empty{font-size:10px;color:#9aa1b5;}
  .cc-obs-form{display:flex;flex-direction:column;gap:8px;}
  .cc-obs-form .view-action{align-self:flex-start;}
  .cc-obs-input{width:100%;border:1.5px solid #E4E7F2;border-radius:12px;padding:9px 11px;font:500 10.5px Poppins,sans-serif;resize:vertical;color:var(--ink);}
  .cc-obs-input:focus-visible{outline:3px solid rgba(49,100,253,.24);outline-offset:2px;border-color:#C7D2FA;}
  .cc-detail-empty{font-size:10.5px;color:#9aa1b5;line-height:1.55;}
```

En el media query `@media (max-width:820px)` agregar:

```css
    .cc-layout{grid-template-columns:1fr;}
```

- [ ] **Step 9: Ejecutar el test**

Run: `node tests/panel-campana.test.js`
Expected: FAIL en `function renderAuditoria(` (Auditoría aún no existe); todo lo demás del call center debe pasar.

- [ ] **Step 10: Commit**

```bash
git add sitio-estatico/index.html
git commit -m "feat: add call center workspace"
```

---

### Task 7: Auditoría

**Files:**
- Modify: `sitio-estatico/index.html` (renderer nuevo + registro)

- [ ] **Step 1: Render de la vista Auditoría**

Agregar antes del bloque `const dashboardRenderers`:

```js
  function renderAuditoria(){
    const rows = auditLog.map(function(entry){
      return '<tr><td class="muted">'+escapeHtml(entry.timestamp)+'</td><td>'+escapeHtml(entry.user)+'</td><td>'+escapeHtml(entry.action)+'</td><td>'+escapeHtml(entry.target)+'</td><td class="muted">'+escapeHtml(entry.detail)+'</td></tr>';
    }).join('');
    return '<div class="view-heading"><div><h3>Auditoría</h3><p>Trazabilidad de consultas y cambios sobre datos sensibles.</p></div><div class="view-note">'+auditLog.length+' eventos</div></div>'+
      '<div class="view-stats">'+dashboardMetrics([
        {value:String(auditLog.filter(function(entry){ return entry.action === 'Cambio de estado'; }).length),label:'Cambios de estado',delta:'Sesión actual'},
        {value:String(auditLog.filter(function(entry){ return entry.action === 'Consulta de ficha'; }).length),label:'Consultas de ficha',delta:'Sesión actual'},
        {value:String(auditLog.filter(function(entry){ return entry.action === 'Observación'; }).length),label:'Observaciones',delta:'Sesión actual'}
      ])+'</div>'+
      '<div class="view-panel"><h3>Eventos registrados</h3><div class="ph">Cada consulta o cambio sobre datos del call center queda firmado con usuario y fecha.</div><div class="view-table-wrap"><table class="view-table"><thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Acción</th><th>Registro</th><th>Detalle</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  }
```

- [ ] **Step 2: Registrar renderer**

Reemplazar:

```js
  const dashboardRenderers = {priorizacion:renderPriorizacion, capitanes:renderCapitanes, voluntarios:renderVoluntarios, callcenter:renderCallCenter, grupos:renderGrupos, propuestas:renderPropuestas};
```

por:

```js
  const dashboardRenderers = {priorizacion:renderPriorizacion, capitanes:renderCapitanes, voluntarios:renderVoluntarios, callcenter:renderCallCenter, grupos:renderGrupos, propuestas:renderPropuestas, auditoria:renderAuditoria};
```

- [ ] **Step 3: Ejecutar el test**

Run: `node tests/panel-campana.test.js`
Expected: PASS con `Panel de campaña: navegación y vistas mock presentes.`

- [ ] **Step 4: Commit**

```bash
git add sitio-estatico/index.html
git commit -m "feat: add audit log view"
```

---

### Task 8: Verificación integral

**Files:**
- Verify: `sitio-estatico/index.html`, `tests/panel-campana.test.js`

- [ ] **Step 1: Smoke test**

Run: `node tests/panel-campana.test.js`
Expected: `Panel de campaña: navegación y vistas mock presentes.`

- [ ] **Step 2: Servir la maqueta y abrir en navegador**

Run (desde la raíz): `python -m http.server 4173 --directory sitio-estatico`
Luego navegar a `http://localhost:4173/`.

- [ ] **Step 3: Recorrido funcional**

Verificar en el panel del candidato:
- Resumen: 4 métricas por comuna (sin "Meta puestos"), ranking con 108/82/88/72/80.
- Call center: buscar "María", abrir ficha, cambiar a "No contestó" y ver el badge actualizado; agregar una observación con fecha.
- Auditoría: confirmar que aparecen los eventos nuevos (consulta, cambio de estado, observación).
- Capitanes → Ver red (Juan Pablo): sin tarjeta flotante, con stat "Puestos de votación"; tocar un pin propio y ver Asignadas/Confirmadas/Pendientes del equipo del capitán; tocar un pin ajeno y ver solo nombre/barrio + aviso.
- Grupos: etiqueta "17 grupos de WhatsApp activos".

Verificar en la app móvil:
- Inicio muestra "¡Hola, Cristian!" y "Plan de recompensas".
- Tus voluntarios: badges no clicables.
- Nueva persona: link de invitación, aviso de ley y autorregistro sin estado.
- Ranking: podio 108/88/82.

- [ ] **Step 4: Verificar responsive**

Reducir el ancho a menos de 820px y repetir el recorrido básico (mapas, tablas scrollables, `cc-layout` en una columna).

- [ ] **Step 5: Commit final (solo si hubo correcciones)**

```bash
git add sitio-estatico/index.html tests/panel-campana.test.js
git commit -m "fix: polish mockup adjustments after verification"
```
