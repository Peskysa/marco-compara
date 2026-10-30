# Desarrollo

HTML, CSS y JavaScript sin compilador. `web/data.json` conserva la instantánea de fuentes y fichas. `node --test tests/*.test.mjs` verifica los datos y la interfaz en memoria. `node scripts/build-web.mjs` prepara `dist/` para alojamiento estático, excluyendo copias de VOX.

Las herramientas de investigación requieren archivos locales del autor que no se distribuyen. Para cambios de interfaz o despliegue no se necesita regenerar esa investigación. Actions prueba y publica al actualizar main.
