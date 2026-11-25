# Desarrollo

La instantánea editorial versionada está en data/2026/review.json y data/archive-2023.json. No se necesita la carpeta privada de investigación para regenerar la web.

1. Node.js 24: `node scripts/download-2026.mjs`.
2. `node scripts/prepare-2026.mjs`.
3. `node --test tests/*.test.mjs`.
4. `node scripts/build-web.mjs`.
5. `node scripts/serve.cjs` para vista local en el puerto 5197.

El original del PP se descarga al compilar y se comprueba por hash; Vox se descarga solo para investigación y queda fuera del alojamiento. El servidor de vista previa sirve web/, y dist/ es el contenido estático de producción. La compilación limpia únicamente dist/, dentro del proyecto.

scripts/assemble-review-2026.mjs requiere inventarios y revisiones de investigación locales. scripts/pdf-runtime.cjs y extract-2026.py requieren PyMuPDF. Esas herramientas no participan en la ejecución de la página.

Actions regenera, comprueba los datos y publica Pages. La tarea de versión usa el mismo commit, adjunta tres paquetes web/documentación/fuente y verifica los ZIP y sumas. No se compilan aplicaciones nativas por encargo explícito de solo web.
