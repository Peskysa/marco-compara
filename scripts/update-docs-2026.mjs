import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const d=JSON.parse(fs.readFileSync(path.join(root,'web/data.json'),'utf8'));
const rows=d.items.filter(i=>i.edition==='actual');
const counts=Object.fromEntries(['coinciden','contrarios','diferentes'].map(c=>[c,rows.filter(i=>i.category===c).length]));
const write=(name,s)=>fs.writeFileSync(path.join(root,name),s.trim()+'\n');
write('README.md',`# Marco Pescador Compara

Aplicación web documental de Marco Pescador. [Abrir la web](https://peskysa.github.io/marco-compara/) · [Código público](https://github.com/Peskysa/marco-compara).

Compara los dos programas oficiales publicados para las elecciones generales del **29 de noviembre de 2026**: **La Reconstrucción Nacional**, del PP (64 páginas, presentado el 10 de noviembre), y **Es sentido común**, de Vox (66 páginas, presentado el 12 de noviembre). Revisión: **25 de noviembre de 2026**.

## Comparación

${rows.length} fichas: **${counts.coinciden} coincidencias**, **${counts.contrarios} oposiciones explícitas** y **${counts.diferentes} diferencias** de diseño, alcance o compromisos concretos sin equivalente localizado. Se han revisado 241 medidas numeradas con contenido del PP y 115 de Vox. Ocho posiciones del PP están reservadas sin contenido y quedan excluidas: 83, 109, 132, 164, 167, 173, 200 y 210.

Cada ficha cita el número y la página del PDF. Una ficha puede comparar solo un aspecto de una medida compuesta; enlazar una medida no significa que todos sus apartados coincidan. Las notas conservan condiciones y límites. Una ausencia se refiere al compromiso concreto en el programa revisado y no implica oposición ni silencio del partido sobre todo el tema.

Las fichas recientes anteriores, basadas en documentos de 2025 y compromisos de precampaña, se han sustituido. No se trasladan porcentajes fiscales, propuestas ni oposiciones de aquellos textos a los programas nuevos. El archivo de 2023 permanece separado, con sus 53 fichas históricas.

## Uso y selecciones

Busca una propuesta, filtra por tema o categoría y pulsa su título para consultar las fuentes. Todas las fichas se muestran sin paginación. En cada ficha puedes marcar PP o Vox; pulsar de nuevo desmarca y elegir el otro cambia la opción. Una ausencia documental no se puede seleccionar.

Ver recuento suma literalmente una elección por ficha, sin pesos, afinidad ni recomendaciones de voto. Los filtros no cambian el total y las ediciones tienen recuentos separados. Las selecciones se guardan solo en ese navegador. Las fichas modificadas o sustituidas no heredan selecciones antiguas; las del archivo histórico se conservan si no han cambiado.

## Fuentes y PDF

En Documentos están los programas y los enlaces originales. El PDF del PP se ofrece inalterado, con atribución y licencia CC BY-NC 3.0 España. El de Vox se abre desde su servidor oficial y no se redistribuye en GitHub. Los metadatos y SHA-256 están en web/data.json; la copia del PP se descarga y verifica al compilar la web.

## Desarrollo y verificación

Solo modalidad web, por instrucción expresa del propietario. HTML, CSS y JavaScript sin dependencias de aplicación. Node.js 24: ejecutar \`node scripts/serve.cjs\` y abrir http://127.0.0.1:5197/.

\`node scripts/download-2026.mjs\` descarga los originales y rechaza cualquier cambio de SHA-256 respecto de la revisión. \`node scripts/prepare-2026.mjs\` regenera los datos desde data/. \`node --test tests/*.test.mjs\` verifica datos, cobertura, reservas, referencias, filtros y selecciones. \`node scripts/build-web.mjs\` prepara dist/ sin copias de Vox ni archivos obsoletos. Las herramientas de investigación y extracción de PDF requieren sus dependencias indicadas; no son necesarias para utilizar la web.

GitHub Actions comprueba y publica main en Pages. Tras un despliegue correcto, publica una versión con web, documentación, fuente del mismo commit y SHA256SUMS.txt. Las capturas y verificaciones visuales no equivalen a una prueba en todos los teléfonos físicos.

## Privacidad y licencia

Sin cuentas, publicidad, cookies propias ni analítica. Las selecciones no se envían al servidor. GitHub Pages y los sitios oficiales pueden registrar datos técnicos de las visitas conforme a sus políticas. Código y gráficos originales: **AGPL-3.0-only**. Los documentos y marcas de terceros quedan excluidos. Véanse NOTICE y THIRD_PARTY.md.

Autor: Marco Pescador. [Manual](docs/MANUAL.md) · [Desarrollo](docs/DESARROLLO.md) · [Privacidad](docs/PRIVACIDAD.md) · [Historial](CHANGELOG.md).
`);
write('THIRD_PARTY.md',`# Materiales de terceros

Los programas conservan su autoría, contenido y derechos; no se relicencian bajo AGPL. La web actual compara las ediciones publicadas para el 29N de 2026 y conserva un archivo independiente de 2023.

- **Partido Popular:** La Reconstrucción Nacional (2026, 64 páginas) y programa completo de 2023 (112 páginas). Copias inalteradas con atribución y enlaces de origen. Contenido informativo bajo [CC BY-NC 3.0 España](https://creativecommons.org/licenses/by-nc/3.0/es/), conforme al apartado 7 del [aviso legal](https://www.pp.es/aviso-legal/) revisado el 25 de noviembre de 2026. Código y marcas son materiales distintos. El PDF 2026 se obtiene desde el servidor oficial durante la compilación y su SHA-256 debe coincidir con el revisado.
- **Vox:** Es sentido común (2026, 66 páginas) y Un programa para lo que importa (2023, 178 páginas). Se enlazan los PDF oficiales; no se publican copias en el repositorio ni en los paquetes. Original 2026: https://www.voxespana.es/wp-content/uploads/2026/11/Programa-completo-A5-1.pdf . No se ha localizado una licencia general de redistribución.
- Los resúmenes y las clasificaciones son redacción editorial propia, no citas literales ni declaraciones oficiales. Las fechas corresponden a las presentaciones oficiales, sin atribuir fecha de vigencia nueva a textos históricos.
- Arial/Helvetica y Georgia son tipografías del sistema; no se redistribuyen fuentes.
- La extracción opcional usa PyMuPDF, AGPL, instalado únicamente en investigación local. No se entrega su código ni binarios en la aplicación. Node.js, Python y GitHub Actions son herramientas de desarrollo y alojamiento.

Metadatos y SHA-256: web/data.json. Sumatorias de copias alojadas: web/pdf/SHA256SUMS.txt.
`);
write('docs/DESARROLLO.md',`# Desarrollo

La instantánea editorial versionada está en data/2026/review.json y data/archive-2023.json. No se necesita la carpeta privada de investigación para regenerar la web.

1. Node.js 24: \`node scripts/download-2026.mjs\`.
2. \`node scripts/prepare-2026.mjs\`.
3. \`node --test tests/*.test.mjs\`.
4. \`node scripts/build-web.mjs\`.
5. \`node scripts/serve.cjs\` para vista local en el puerto 5197.

El original del PP se descarga al compilar y se comprueba por hash; Vox se descarga solo para investigación y queda fuera del alojamiento. El servidor de vista previa sirve web/, y dist/ es el contenido estático de producción. La compilación limpia únicamente dist/, dentro del proyecto.

scripts/assemble-review-2026.mjs requiere inventarios y revisiones de investigación locales. scripts/pdf-runtime.cjs y extract-2026.py requieren PyMuPDF. Esas herramientas no participan en la ejecución de la página.

Actions regenera, comprueba los datos y publica Pages. La tarea de versión usa el mismo commit, adjunta tres paquetes web/documentación/fuente y verifica los ZIP y sumas. No se compilan aplicaciones nativas por encargo explícito de solo web.
`);
write('docs/RELEASE.md',`Programas oficiales publicados para las generales del 29N de 2026: PP (64 páginas) y Vox (66 páginas).

${rows.length} fichas de comparación, basadas en la revisión de 241 medidas del PP y 115 de Vox. Las ocho posiciones reservadas del PP no son propuestas seleccionables. Fuentes, números de medida y páginas disponibles en cada ficha. Las selecciones de fichas anteriores sustituidas no se transfieren al contenido nuevo.

Web: https://peskysa.github.io/marco-compara/

Solo modalidad web. Los PDF de Vox se abren desde el servidor oficial. Las copias del PP conservan atribución y licencia. Código original AGPL-3.0-only. Paquetes web, documentación, fuente de este mismo commit y SHA256SUMS.txt.
`);
const change=fs.readFileSync(path.join(root,'CHANGELOG.md'),'utf8');
if(!change.includes('## 0.3.0'))write('CHANGELOG.md',change.replace('# Historial','# Historial\n\n## 0.3.0 · 25 de noviembre de 2026\n\nSustitución de los documentos recientes de precampaña por los programas oficiales del 29N. Revisión integral de medidas numeradas, referencias a páginas y exclusión de reservas sin contenido. Nuevas coincidencias, diferencias y oposiciones explícitas. Se conservan el recuento manual local y el archivo histórico separado.'));
