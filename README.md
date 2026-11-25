# Marco Pescador Compara

Aplicación web documental de Marco Pescador. [Abrir la web](https://peskysa.github.io/marco-compara/) · [Código público](https://github.com/Peskysa/marco-compara).

Compara los dos programas oficiales publicados para las elecciones generales del **29 de noviembre de 2026**: **La Reconstrucción Nacional**, del PP (64 páginas, presentado el 10 de noviembre), y **Es sentido común**, de Vox (66 páginas, presentado el 12 de noviembre). Revisión: **25 de noviembre de 2026**.

## Comparación

269 fichas: **78 coincidencias**, **2 oposiciones explícitas** y **189 diferencias** de diseño, alcance o compromisos concretos sin equivalente localizado. Se han revisado 241 medidas numeradas con contenido del PP y 115 de Vox. Ocho posiciones del PP están reservadas sin contenido y quedan excluidas: 83, 109, 132, 164, 167, 173, 200 y 210.

Cada ficha cita el número y la página del PDF. Una ficha puede comparar solo un aspecto de una medida compuesta; enlazar una medida no significa que todos sus apartados coincidan. Las notas conservan condiciones y límites. Una ausencia se refiere al compromiso concreto en el programa revisado y no implica oposición ni silencio del partido sobre todo el tema.

Las fichas recientes anteriores, basadas en documentos de 2025 y compromisos de precampaña, se han sustituido. No se trasladan porcentajes fiscales, propuestas ni oposiciones de aquellos textos a los programas nuevos. El archivo de 2023 permanece separado, con sus 53 fichas históricas.

## Uso y selecciones

Busca una propuesta, filtra por tema o categoría y pulsa su título para consultar las fuentes. Todas las fichas se muestran sin paginación. En cada ficha puedes marcar PP o Vox; pulsar de nuevo desmarca y elegir el otro cambia la opción. Una ausencia documental no se puede seleccionar.

Ver recuento suma literalmente una elección por ficha, sin pesos, afinidad ni recomendaciones de voto. Los filtros no cambian el total y las ediciones tienen recuentos separados. Las selecciones se guardan solo en ese navegador. Las fichas modificadas o sustituidas no heredan selecciones antiguas; las del archivo histórico se conservan si no han cambiado.

## Fuentes y PDF

En Documentos están los programas y los enlaces originales. El PDF del PP se ofrece inalterado, con atribución y licencia CC BY-NC 3.0 España. El de Vox se abre desde su servidor oficial y no se redistribuye en GitHub. Los metadatos y SHA-256 están en web/data.json; la copia del PP se descarga y verifica al compilar la web.

## Desarrollo y verificación

Solo modalidad web, por instrucción expresa del propietario. HTML, CSS y JavaScript sin dependencias de aplicación. Node.js 24: ejecutar `node scripts/serve.cjs` y abrir http://127.0.0.1:5197/.

`node scripts/download-2026.mjs` descarga los originales y rechaza cualquier cambio de SHA-256 respecto de la revisión. `node scripts/prepare-2026.mjs` regenera los datos desde data/. `node --test tests/*.test.mjs` verifica datos, cobertura, reservas, referencias, filtros y selecciones. `node scripts/build-web.mjs` prepara dist/ sin copias de Vox ni archivos obsoletos. Las herramientas de investigación y extracción de PDF requieren sus dependencias indicadas; no son necesarias para utilizar la web.

GitHub Actions comprueba y publica main en Pages. Tras un despliegue correcto, publica una versión con web, documentación, fuente del mismo commit y SHA256SUMS.txt. Las capturas y verificaciones visuales no equivalen a una prueba en todos los teléfonos físicos.

## Privacidad y licencia

Sin cuentas, publicidad, cookies propias ni analítica. Las selecciones no se envían al servidor. GitHub Pages y los sitios oficiales pueden registrar datos técnicos de las visitas conforme a sus políticas. Código y gráficos originales: **AGPL-3.0-only**. Los documentos y marcas de terceros quedan excluidos. Véanse NOTICE y THIRD_PARTY.md.

Autor: Marco Pescador. [Manual](docs/MANUAL.md) · [Desarrollo](docs/DESARROLLO.md) · [Privacidad](docs/PRIVACIDAD.md) · [Historial](CHANGELOG.md).
