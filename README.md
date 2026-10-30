# Marco Pescador Compara

Aplicación web documental de Marco Pescador. Disponible en [GitHub Pages](https://peskysa.github.io/marco-compara/). Solo web, sin instaladores ni aplicaciones de escritorio o Android, por indicación expresa del propietario.

## Uso

Ejecutar `npm start` en esta carpeta y abrir http://127.0.0.1:5197/ en el navegador. Servidor limitado a la interfaz local del ordenador. No requiere dependencias de npm.

Ofrece tres listas, búsqueda, filtros por tema y edición, detalle con fuentes y descarga de siete PDF originales. No usa cookies ni analítica; las selecciones explícitas permanecen únicamente en el navegador.

## Selecciones y recuento

En cada ficha se puede marcar PP o Vox pulsando su propuesta. Elegir el otro partido cambia la selección; pulsar de nuevo la elegida la quita. Si no hay propuesta documentada, ese lado no puede seleccionarse. El título y la flecha siguen abriendo las fuentes.

El recuento suma literalmente una elección por ficha, sin pesos, porcentajes de afinidad, recomendaciones ni conclusiones políticas. Los filtros no alteran el total. Las ediciones recientes y el archivo histórico tienen selecciones y recuentos separados. Se puede abrir el resumen y quitar selecciones individualmente o borrar las de la edición activa.

Las selecciones se guardan en `localStorage`, solo en ese navegador, sin enviarse al servidor. Si el almacenamiento falla, funcionan durante la sesión abierta. Al cargar se descartan registros cuyo partido no sea válido, cuya propuesta no esté documentada o cuyo contenido haya cambiado.

## Contenido y alcance

Revisión: **30 de octubre de 2026**. Se han localizado compromisos de PP para el 29N, documentación sectorial y anuncios oficiales nacionales. No se han localizado ambos programas completos de las generales de 2026 en las fuentes revisadas. Los documentos de 2025 se identifican como antecedentes, sin presumir su vigencia electoral automática. El corpus está enumerado en `web/data.json`.

Documentos 2025–2026: **129 propuestas inventariadas** (77 PP y 52 VOX) en cinco PDF revisados íntegramente, con repeticiones fusionadas, y **86 fichas de comparación**. Una ficha puede agrupar varias propuestas y una propuesta compuesta puede aparecer vinculada por un aspecto concreto. No es un inventario exhaustivo de todos los compromisos posibles de los partidos.

Archivo de generales de 2023: dos programas completos (112 y 178 páginas), **746 medidas principales numeradas** (365 PP y 381 VOX) y **53 fichas contrastadas**. Las demás medidas permanecen consultables y señaladas como pendientes de comparación. No se cuentan subapartados como medidas principales adicionales ni se cruzan posiciones del archivo con la edición reciente.

Los contadores diferencian propuestas inventariadas, fichas comparativas, propuestas vinculadas y pendientes. Las listas muestran todas las fichas de la edición y los filtros elegidos, sin paginación. El inventario completo se conserva en los datos y en investigación; no tiene un apartado propio en la interfaz.

Las tres listas distinguen medidas compartidas, posiciones expresas incompatibles, y diferencias de alcance o medidas sin equivalencia localizada en el corpus. La falta de correspondencia no demuestra que un partido carezca de esa propuesta. Coincidir en una medida no implica identidad integral de sus programas ni de las condiciones de aplicación.

Las páginas citadas corresponden al índice de páginas del PDF (empezando por 1), no a una numeración inferida. La fecha visible es la del documento o del anuncio. Las fechas interiores de las hojas de campaña PP prevalecen sobre la fecha diferente de su nombre de archivo. La edición de VOX es de octubre de 2025, aunque la presentación del programa sectorial se produjo en junio.

## Verificación

`npm test`: integridad, tamaños, hashes SHA-256, referencias, páginas, ediciones, cobertura y secuencia de medidas numeradas. También prueba el renderizado en memoria, filtros, búsqueda y presentación de todas las fichas, sin navegador ni red. No sustituye una revisión visual. Investigación y textos extraídos en `research/`, fuera de la carpeta web servida. Las capturas de `test-output/` anteriores a esta ampliación no documentan esta versión.

## Desarrollo y publicación

HTML, CSS y JavaScript sin herramientas de compilación. `npm run prepare` reúne la revisión actual, las correspondencias del archivo y los inventarios; genera datos y copias locales sin modificar los PDF. Cada documento contiene autoría, enlace original, fecha, alcance, páginas y SHA-256. Los textos íntegros extraídos quedan solo en investigación; la web sirve fichas propias breves y referencias.

El repositorio público es [Peskysa/marco-compara](https://github.com/Peskysa/marco-compara). Actions ejecuta las pruebas, prepara `dist/` con `node scripts/build-web.mjs` y publica en GitHub Pages. Los PDF de VOX no se suben al repositorio ni al alojamiento: se abren desde el servidor oficial. Las copias de PP conservan atribución y licencia. El uso de GitHub Pages puede generar registros técnicos del proveedor; no se transmiten selecciones.

La publicación no requiere los archivos de investigación: `web/data.json` es la instantánea documental versionada. `npm run prepare` es una herramienta de investigación del autor y necesita sus archivos locales excluidos de Git.

## Licencia

Código y gráficos originales: **AGPL-3.0-only**. Documentos de terceros, nombres y marcas quedan excluidos. Véanse `NOTICE` y `THIRD_PARTY.md`.

