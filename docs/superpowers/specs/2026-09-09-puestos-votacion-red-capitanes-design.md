# Puestos de votacion y red territorial de capitanes

## Objetivo

Ampliar la demo estatica del panel de campana para que el mapa de Ocaña muestre puestos de votacion simulados, sus cifras operativas y la cobertura territorial de cada capitan. La experiencia debe comunicar la idea con pocos puntos, datos coherentes y una apariencia mas cercana a un producto profesional.

## Base y alcance

- La base de trabajo es el commit remoto actualizado `origin/main` (`895ed73`).
- El cambio publicado se limita a `sitio-estatico/index.html`.
- Se mantienen Leaflet, OpenStreetMap, la paleta existente, Poppins y el layout responsive del panel.
- Los datos de puestos son mock para demo. Los nombres pueden corresponder a instituciones o puestos de Ocaña, pero las coordenadas son aproximadas y no se presentan como ubicaciones oficiales.
- Se usaran entre 6 y 8 puestos distribuidos en las comunas ya modeladas; no se agregara una lista exhaustiva de puestos reales.
- No se agrega backend, persistencia, autenticacion ni API.

## Modelo de datos

Se agregara una coleccion centralizada de puestos de votacion reutilizada por el resumen y la red de cada capitan. Cada puesto incluira:

- `id`, `name`, `barrio`, `comunaId` y coordenadas aproximadas.
- `meta`: objetivo de personas registradas para el puesto.
- `asignadas`: personas vinculadas actualmente al puesto.
- `registradas`: personas de esas asignadas que ya completaron el registro.
- `captainIds` o referencias equivalentes para determinar las redes asociadas.

La vista territorial derivara por comuna:

- meta de puestos para la zona;
- puestos cubiertos, definidos como puestos con personas asignadas;
- total de personas asignadas;
- total de personas registradas;
- avance de puestos y avance de registros.

La barra de cada puesto mostrara `registradas / asignadas`. La meta de puestos de la zona se mostrara separada para no confundirla con la meta de personas de un puesto.

## Mapa territorial en Resumen

El mapa actual de Leaflet seguira usando Ocaña como mapa base y conservara la seleccion por comuna. El tratamiento visual de intensidad cambiara para evitar poligonos artificiales:

- halos circulares translúcidos por comuna, coloreados por nivel de apoyo;
- contornos y etiquetas sutiles, sin simular limites oficiales;
- leyenda separada para intensidad, puestos y cobertura;
- pines compactos para los puestos, con color por estado y contador visible.

La seleccion de una comuna actualizara el panel lateral y enfocara el mapa. La seleccion de un pin abrira una tarjeta con:

- nombre del colegio o puesto;
- barrio y comuna;
- meta del puesto;
- personas asignadas;
- personas registradas;
- barra de avance y estado.

El mapa tendra una nota visible indicando que los limites y ubicaciones son referenciales.

## Red de un capitan

El boton `Ver red` de la vista `Capitanes` abrira una vista interna `Red del capitan` sin recargar.

- La composicion usara el mapa como protagonista y una tarjeta flotante, no un heatmap.
- Se mostraran todos los puestos para dar contexto territorial.
- Los puestos ajenos a la red activa se renderizaran tenues.
- Los puestos asociados al capitan se resaltaran con color, contador y cobertura.
- Un control `Mostrar puestos de referencia` permitira ocultar o mostrar los puestos ajenos.
- La tarjeta flotante resumira capitan, comuna/barrio, puestos cubiertos, personas asignadas y personas registradas.
- Hacer clic en un puesto propio abrira su detalle. Un puesto tenue mostrara que pertenece a otra red sin cambiar el capitan activo.
- La vista conservara el retorno a `Capitanes`, los filtros actuales de voluntarios y la navegacion lateral.

## Responsive y estados de error

- En escritorio el mapa y la tarjeta se mostraran en una composicion amplia con la tarjeta superpuesta.
- En pantallas pequeñas se usara una sola columna y controles desplazables horizontalmente.
- Si Leaflet no esta disponible, el contenedor mostrara un estado de mapa no disponible en lugar de quedar vacio.
- Si una seleccion no encuentra datos, se usara un estado vacio legible sin romper la vista.
- Las interacciones son de demo y vuelven a los datos iniciales al recargar.

## Verificacion

- Ejecutar `node tests/panel-campana.test.js`.
- Comprobar que las vistas existentes siguen navegando.
- Comprobar seleccion de comuna, seleccion de puesto y actualizacion de cifras.
- Abrir `Capitanes`, entrar a la red de varios capitanes y validar puestos propios y ajenos.
- Activar y desactivar `Mostrar puestos de referencia`.
- Revisar desktop y movil, incluyendo el mapa en una sola columna.
- Abrir la demo en Chromium y confirmar que no hay errores JavaScript, que los marcadores responden y que el mapa se redimensiona al cambiar de app.
