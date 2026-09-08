# Datos mock para el panel de campaña

## Objetivo

Convertir el panel de escritorio existente en una demo estática navegable. La vista `Resumen` seguirá siendo la entrada inicial y las secciones `Capitanes`, `Voluntarios`, `Grupos WhatsApp` y `Propuestas` mostrarán datos mock con el mismo lenguaje visual del panel actual.

## Alcance

- Modificar únicamente `sitio-estatico/index.html` para la experiencia publicada.
- Mantener Poppins, la paleta azul/verde actual, tarjetas blancas, bordes sutiles y el comportamiento responsive existente.
- Hacer funcional la navegación lateral sin recargar la página.
- Centralizar los registros mock en arreglos JavaScript dentro del documento.
- Incluir interacciones de demo pequeñas, como cambiar un estado o mostrar un toast, sin persistencia ni backend.
- No implementar autenticación, API, base de datos ni datos reales.

## Experiencia y vistas

### Resumen

Conservar la vista actual como dashboard inicial: cuatro indicadores, ranking resumido, meta general y grupos activos.

### Capitanes

Mostrar indicadores de capitanes activos, nuevos durante la semana y promedio de personas agregadas. La tabla mock incluirá nombre, barrio, personas agregadas, avance y estado de seguimiento.

### Voluntarios

Mostrar totales de confirmados, pendientes y nuevos. La tabla incluirá nombre, barrio, capitán responsable, fecha de registro y estado. El estilo de badges seguirá los estados existentes (`ok`, `pend` y `no`).

### Grupos WhatsApp

Mostrar tarjetas de grupos con nombre, zona o comunidad, cantidad de integrantes, crecimiento reciente y estado activo. Las tarjetas conservarán el tratamiento visual de los grupos que ya aparecen en el resumen.

### Propuestas

Mostrar tarjetas o tabla compacta con propuesta, categoría, barrio, autor, fecha y estado de revisión. Los estados usarán los colores existentes para aprobación, revisión y pendientes.

## Arquitectura técnica

- Un contenedor de vista activa dentro de `.dcontent` será reemplazado por contenido renderizado desde JavaScript.
- Cada elemento de navegación tendrá un identificador de vista mediante `data-view`.
- Un mapa de datos mock será la única fuente de contenido de las nuevas vistas.
- Una función de renderizado por sección generará HTML con plantillas de strings simples, sin dependencias externas.
- La navegación actualizará el elemento activo, el título y el subtítulo del topbar, y devolverá el scroll al inicio del contenido.
- Las reglas CSS nuevas reutilizarán tokens y componentes existentes; los ajustes responsive mantendrán la barra lateral horizontal en pantallas pequeñas.

## Comportamiento y límites

- La navegación debe funcionar con clic y con elementos nativos enfocables.
- Los controles de demo no deben implicar persistencia: al recargar, regresan a los datos iniciales.
- Si una vista no tiene registros, se mostrará un estado vacío legible en lugar de romper el layout.
- Los datos se identificarán visualmente como demo mediante el contexto del panel y no incluirán información sensible real.

## Verificación

- Abrir `sitio-estatico/index.html` en Chromium y comprobar que Resumen, Capitanes, Voluntarios, Grupos WhatsApp y Propuestas cambian correctamente.
- Confirmar que el menú activo, título y subtítulo corresponden a la vista seleccionada.
- Probar el layout en viewport desktop y móvil, incluyendo el menú horizontal responsive.
- Revisar que no haya errores JavaScript en la consola.
- Publicar el directorio `sitio-estatico` como sitio estático en GitHub Pages una vez exista un repositorio remoto configurado.
