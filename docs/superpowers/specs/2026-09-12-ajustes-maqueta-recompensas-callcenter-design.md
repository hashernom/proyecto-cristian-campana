# Ajustes de maqueta: plan de recompensas, puestos de votación y call center

## Objetivo

Aplicar sobre la demo estática un conjunto de ajustes de producto: reemplazar la "meta de voluntarios confirmados" por un "plan de recompensas", retirar de la app móvil la edición de estados de voluntarios, concentrar esa facultad en un panel de call center con observaciones fechadas y auditoría, reforzar la protección de datos con invitaciones, y corregir terminología y cifras de puestos de votación.

## Base y alcance

- Base: `main` actual (`837ee7a`) después de traer los 20 commits remotos.
- Alcance: `sitio-estatico/index.html` y `tests/panel-campana.test.js`.
- Sin backend ni persistencia: los cambios del call center y la auditoría viven en memoria y se reinician al recargar la página.
- Ejecución secuencial en un solo pase, sin worktrees ni subagentes, según decisión del usuario.
- Se mantienen Leaflet, OpenStreetMap, Poppins, la paleta y el layout responsive existentes.
- Los datos siguen siendo mock de demostración.

## Cambios

### 1. App móvil

**1.1 Inicio (s5).** El saludo pasa a "¡Hola, Cristian!" (antes María). El rótulo "Meta de voluntarios confirmados" pasa a "Plan de recompensas"; se conserva la barra al 34% y la frase, quitando la mención a la meta ("Cada persona que confirmas te acerca a nuevos beneficios."). El box de la Red del capitán que hoy dice "Meta de voluntarios confirmados" también pasa a "Plan de recompensas" y sus mensajes se ajustan a beneficios ("Faltan X confirmados para el siguiente beneficio").

**1.2 Tus voluntarios (s6).** Los badges de estado dejan de ser botones interactivos: se muestran como indicador estático (span) sin `onclick`. Desde la app móvil ya no se puede cambiar el estado de un voluntario.

**1.3 Ranking (s8).** Los iconos de acción dejan de ser interactivos y quedan como indicador estático. El podio y las filas muestran el total de personas de la red de cada capitán (`team.length` de `campaignMockData.capitanes`), ordenados de mayor a menor: Juan Pablo 108, Hernán 88, Carmen 82.

**1.4 Nueva persona (s7) pasa a Invitación + autorregistro.**
- Título "Invita a tus voluntarios" y link de invitación mock con botones "Copiar link" y "Enviar por WhatsApp" (toast de confirmación).
- Aviso de protección de datos (Ley 1581 de 2012): no se pueden registrar personas ajenas, solo invitarlas.
- Formulario mínimo de autorregistro (nombre completo, cédula, celular, barrio, puesto de votación) sin selector de estado ni notas internas, con la nota de que la persona lo completa desde el link.

**1.5 Limpieza.** Se eliminan las funciones `cycleBadge` y `selectIcon` si quedan sin uso.

### 2. Panel desktop

**2.1 Terminología y meta de puestos.** "Estaciones de votación" pasa a "Puestos de votación". Se elimina la tarjeta "Meta puestos" del panel lateral de comuna y el dato `stationGoal` de las zonas; el resumen de comuna queda con 4 métricas (Puestos cubiertos, Asignadas, Confirmadas, Pendientes) y la rejilla CSS pasa de 5 a 4 columnas. La ficha del pin conserva su "Meta" por puesto.

**2.2 Ranking de capitanes.** "Agregados" pasa a ser el total de personas de la red del capitán (`team.length`, incluye confirmados, pendientes y rechazados) en la tabla del Resumen, en la vista Capitanes y en el ranking móvil. Se ajustan las barras de avance del Resumen a los valores derivados de `captainGoalProgress` (82%, 88%, 65%, 57%, 70%) y el stat "Promedio por capitán" a 83,3 para mantener coherencia.

**2.3 Grupos.** El stat del Resumen y la nota de la vista pasan a "Grupos de WhatsApp activos" manteniendo 17. Las 6 tarjetas de ejemplo se conservan.

**2.4 Red del capitán.**
- Se elimina la tarjeta flotante sobre el mapa (`.captain-map-card`) con el nombre del capitán y las métricas globales.
- La fila de stats añade "Puestos de votación" con el total de puestos de su red (`stationsForCaptain`) y el detalle de cuántos tienen cobertura.
- Los pines propios abren una ficha con las métricas del capitán en ese puesto: personas de su equipo asignadas (ok + pendientes, sin rechazados), confirmadas y pendientes, con avance sobre asignadas. No se muestran las cifras globales del puesto.
- Los pines de otras redes muestran solo nombre, barrio y el aviso "Dato referencial · pertenece a otra red", sin métricas.
- Se mantienen el toggle "Mostrar puestos de referencia" y el mapa Leaflet.

### 3. Call center y auditoría

**3.1 Sección Call center (desktop).** Nuevo ítem "Call center" en la navegación lateral.
- Barra de búsqueda (nombre, cédula o barrio) y chips de filtro por estado (Todos, Confirmado, Pendiente, Rechazo, No contestó).
- Tabla con Nombre, Número, Barrio, Cédula enmascarada, Puesto y Estado. Se muestran máximo 60 filas filtradas con nota de cuántas hay en total.
- Panel de detalle del registro seleccionado con botones de estado (Confirmado, Pendiente, Rechazo en rojo, No contestó) y observaciones con fecha: lista de observaciones y campo para agregar una nueva con la fecha del día.
- Cada consulta o cambio genera un evento de auditoría; al cambiar el estado se recalculan los totales de puestos (asignadas/confirmadas) en memoria y se refresca la vista.

**3.2 Sección Auditoría (desktop).** Nuevo ítem "Auditoría" con tabla de eventos (fecha y hora, usuario, acción, registro afectado y detalle). Se precargan eventos mock y se agregan en vivo desde el Call center. El usuario mock es "Laura Méndez · Call center".

**3.3 Estados.** Se agrega el estado `noanswer` ("No contestó") al mapa de badges reutilizando el tono ámbar. `rejected` conserva el tono rojo.

### 4. Datos y utilidades

- `maskDocument`: enmascara el documento dejando el primer grupo visible (`1 097 452 118` → `1 097 *** ***`).
- `observations`: cada persona puede tener `observations: [{date, text}]`; el campo `notes` existente se conserva.
- `auditLog`: arreglo de `{timestamp, user, action, target, detail}` con eventos iniciales mock y crecimiento en vivo.
- `refreshStationTotals()`: extrae el cálculo actual de `assigned` y `registered` por puesto para recalcular tras cambios del call center.
- La fuente del call center es `volunteerRegistry`; los cambios de estado mutan esos registros en memoria.

### 5. Verificación

- `node tests/panel-campana.test.js` con asserts actualizados: se retira `stationGoal`; se agregan Call center, Auditoría, "Plan de recompensas", "Invita a tus voluntarios", `maskDocument`, `renderCallCenter` y `renderAuditoria`; se verifica que `cycleBadge` ya no exista.
- Revisión con navegador (Playwright): navegación de todas las vistas, cambio de estado en Call center reflejado en la tabla y en Auditoría, fichas de pines por capitán, app móvil (invitación, ranking) y responsive.

## Fuera de alcance

- Backend, persistencia real, autenticación o integración real con WhatsApp.
- Nuevos puestos de votación o cambios de coordenadas.
- Rediseño visual general de la maqueta.
