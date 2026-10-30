import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { extendData } from './extend-data.mjs';
const root = path.resolve(import.meta.dirname, '..');
const pp = JSON.parse(fs.readFileSync(path.join(root, 'research/pp/fuentes-pp.json'), 'utf8').replace(/^\uFEFF/, ''));
const vox = JSON.parse(fs.readFileSync(path.join(root, 'research/vox/registro-vox.json'), 'utf8').replace(/^\uFEFF/, ''));
const web = path.join(root, 'web');
fs.mkdirSync(path.join(web, 'pdf'), { recursive: true });
const descriptions = {
  'pp-contrato': 'Compromisos de precampaña para el 29N. No es el programa electoral completo.',
  'pp-vivienda': 'Hoja de campaña sobre el acceso a la vivienda. Fecha indicada dentro del PDF.',
  'pp-fiscal': 'Hoja de campaña sobre fiscalidad. Fecha indicada dentro del PDF.',
  'pp-autonomos': 'Plan sectorial anterior, todavía enlazado desde la web oficial. No es un programa del 29N.'
};
const titles = {'pp-contrato':'Contrato con España','pp-vivienda':'Una nueva generación de propietarios','pp-fiscal':'Menos impuestos, más prosperidad','pp-autonomos':'Plan de autónomos'};
const docs = pp.documentos.map(d => {
  const name = 'pp-' + d.archivo;
  fs.copyFileSync(path.join(root,'research/pp',d.archivo),path.join(web,'pdf',name));
  return {id:d.id,party:'PP',title:titles[d.id],date:d.fecha,kind:d.id==='pp-contrato'?'Compromisos de precampaña':d.id==='pp-autonomos'?'Antecedente sectorial · 2025':'Documento de campaña',description:descriptions[d.id],url:d.url,file:`pdf/${name}`,pages:d.paginas,bytes:d.bytes,sha256:d.sha256,dateNote:d.nota_fecha||null,rights:'Partido Popular. Contenido informativo: CC BY-NC 3.0 España, según aviso legal. Marcas y otros elementos conservan sus derechos.'};
});
const vd=vox.documents[0];
fs.copyFileSync(path.join(root,vd.local_pdf),path.join(web,'pdf','vox-economia-vivienda-2025.pdf'));
docs.splice(1,0,{id:'vox-economia',party:'VOX',title:'Programa económico y de vivienda',date:'2025-10',kind:'Antecedente sectorial · 2025',description:'Documento nacional sectorial anterior. No es el programa completo de las elecciones de 2026.',url:vd.source_url,file:'pdf/vox-economia-vivienda-2025.pdf',pages:vd.pages,bytes:vd.bytes,sha256:vd.sha256,rights:'Autoría VOX. No se ha localizado una licencia general de redistribución. Copia local de investigación, sin modificación. Derechos ajenos a AGPL.'});
const source=(id,party,title,date,url,scope)=>({id,party,title,date,url,scope});
const sources=[
 ...docs.map(d=>source(d.id,d.party,d.title,d.date,d.url,d.kind)),
 source('pp-bilbao','PP','Modelo territorial y estrategia industrial','2026-07-07','https://www.pp.es/actualidad/articulos/feijoo-dice-a-empresarios-vascos-que-no-hay-ninguna-diferencia-ideologica-que-permita-estirar-un-ciclo-politico-de-corrupcion-generalizada/','Declaraciones oficiales nacionales, anteriores a la convocatoria'),
 source('pp-alquiler','PP','Propuestas de vivienda y alquiler','2026-10-21','https://www.pp.es/actualidad/articulos/feijoo-anuncia-deducciones-para-alquileres-y-aprobara-en-sus-cien-dias-las-leyes-para-construir-un-millon-de-viviendas-y-desalojar-okupas/','Anuncio oficial de precampaña'),
 source('vox-plasencia','VOX','Ejes de precampaña en Plasencia','2026-10-27',vox.current_campaign_sources[0].url,'Declaraciones oficiales de precampaña; no programa completo'),
 source('convocatoria','BOE','Convocatoria oficial de las elecciones','2026-10-06','https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20742','Real Decreto 806/2026, artículo 2; no propuesta partidista')
];
const side=(text,source,page,section)=>({text,source,page,section});
const absent=(party)=>({text:'Medida equivalente no localizada.',absent:true,corpus:party==='PP'?['pp-contrato','pp-vivienda','pp-fiscal','pp-autonomos','pp-bilbao','pp-alquiler']:['vox-economia','vox-plasencia']});
let n=0;const items=[];
function add(category,topic,title,a,b,note,subtype){items.push({id:'medida-'+String(++n).padStart(2,'0'),category,topic,title,pp:a,vox:b,note,subtype:subtype||null});}
add('coinciden','Administración','Auditar el gasto público',side('Auditar el gasto estatal.','pp-contrato',2,'Compromiso 3'),side('Auditoría del gasto prescindible.','vox-economia',39,'III'), 'Coincidencia limitada a auditar. El alcance y la ejecución pueden diferir.');
add('coinciden','Administración','Reducir los altos cargos',side('Menos altos cargos y asesores.','pp-contrato',2,'Compromiso 3'),side('Reducir cargos políticos y de confianza.','vox-economia',39,'III'), 'Comparten la reducción; no hay una cifra común de puestos.');
add('coinciden','Vivienda','Ampliar el suelo disponible',side('Facilitar suelo mediante una nueva ley.','pp-vivienda',1,'Un millón de viviendas nuevas'),side('Ampliar suelo y acelerar su transformación.','vox-economia',44,'VI'), 'Coinciden en ampliar el suelo; las condiciones requieren desarrollo normativo.');
add('coinciden','Vivienda','Simplificar los trámites de construcción',side('Reducir los trámites para construir.','pp-vivienda',1,'Un millón de viviendas nuevas'),side('Simplificación administrativa para construir.','vox-economia',45,'VI'), 'Coincidencia en esa medida concreta, sin equiparar todas las normas propuestas.');
add('coinciden','Energía','Mantener las centrales nucleares existentes',side('Revertir el cierre nuclear.','pp-bilbao',null,'Estrategia industrial, eje 3'),side('Conservar las centrales nucleares actuales.','vox-economia',41,'IV'), 'La coincidencia se limita a las instalaciones existentes.');
add('diferentes','Fiscalidad','Diseño de las rebajas fiscales',side('Bajar impuestos y revisar subidas.','pp-contrato',3,'Compromiso 10'),side('Rebajas fiscales para trabajadores, pymes y autónomos.','vox-plasencia',null,'Párrafo sobre acoso fiscal'), 'El objetivo compartido no permite afirmar que las medidas concretas sean idénticas.', 'Objetivo común, distinto diseño');
add('diferentes','Vivienda','Incentivos fiscales al alquiler estable',side('Deducciones al prorrogar alquileres bajo el IPC.','pp-alquiler',null,'Primer punto y anuncio de deducciones'),side('Incentivos al alquiler estable y asequible.','vox-economia',45,'VI'), 'La herramienta coincide, pero no se documentan requisitos idénticos.', 'Distintos requisitos');
add('contrarios','Modelo territorial','Mantener o eliminar el Estado autonómico',side('Defender autonomías, estatutos y foralidades.','pp-bilbao',null,'Párrafo sobre Constitución y Estatuto de Guernika'),side('Objetivo final: eliminar el Estado autonómico.','vox-economia',39,'III'), 'Mantener y eliminar ese mismo modelo son posiciones incompatibles. No describe cada acuerdo territorial de gobierno.');
add('diferentes','Vivienda','Impuestos en la compra de vivienda',side('Jóvenes: reducción del 60 % de IVA e ITP.','pp-vivienda',1,'Un millón de viviendas nuevas'),side('Eliminar el IVA de primera vivienda.','vox-economia',46,'VI'), 'Distinto alcance y diseño fiscal; no son medidas opuestas.', 'Distinto diseño');
add('diferentes','Vivienda','Avales y financiación de la compra',side('Avales de hasta el 100 % para jóvenes.','pp-vivienda',1,'Un millón de viviendas nuevas'),side('Avales; créditos vinculados a hijos.','vox-economia',47,'VI'), 'Coinciden en financiar, con condiciones distintas.', 'Distinto diseño');
add('diferentes','Pensiones','Cómo garantizar las pensiones',side('Actualización con el IPC; Pacto de Toledo.','pp-contrato',3,'Compromiso 6'),side('Transición a pensiones mixtas.','vox-economia',38,'III'), 'Comparan instrumentos distintos. No se deduce que una posición niegue la otra.', 'Distinto diseño');
add('diferentes','Administración','Silencio administrativo positivo',side('A los 90 días, en el plan de vivienda.','pp-vivienda',1,'Un millón de viviendas nuevas'),side('Regla general del silencio positivo.','vox-economia',36,'I'), 'El principio coincide, pero cambian el ámbito y la concreción del plazo.', 'Distinto alcance');
add('diferentes','Inmigración','Orientación de la política migratoria',side('Vías legales; prohibir regularizaciones colectivas.','pp-contrato',2,'Compromiso 5, continúa en página 3'),side('Remigración y prioridad nacional.','vox-plasencia',null,'Ejes del mensaje y párrafo sobre inmigración'), 'Formulaciones con alcance distinto. Esta fila no las reduce a favor o en contra.', 'Distinto alcance');
add('diferentes','Vivienda','Prioridades en el acceso a las ayudas',side('Prioridad para jóvenes en compra y alquiler.','pp-contrato',2,'Compromiso 4'),side('Españoles primero en ayudas al alquiler.','vox-plasencia',null,'Párrafo sobre acceso a ayudas sociales'), 'Edad y nacionalidad son criterios diferentes que pueden solaparse.', 'Distinto criterio');
add('diferentes','Administración','Reglas para los presupuestos',side('Elecciones tras más de una prórroga presupuestaria.','pp-contrato',2,'Compromiso 2'),side('Presupuestos elaborados desde cero.','vox-economia',39,'III'), 'Dos reglas para cuestiones diferentes; no implican una oposición directa.', 'Distinto objeto');
add('diferentes','Justicia','Elección judicial de los jueces',side('Los jueces elegirán a los jueces.','pp-contrato',2,'Compromiso 2'),absent('VOX'), 'La cobertura sectorial es limitada. No permite concluir una posición contraria.', 'Sin correspondencia localizada');
add('diferentes','Sanidad','Plantillas y condiciones médicas',side('Más médicos y mejores condiciones laborales.','pp-contrato',3,'Compromiso 7'),absent('VOX'), 'La ausencia se limita al corpus revisado; no atribuye silencio al partido.', 'Sin correspondencia localizada');
add('diferentes','Educación','Contenidos elaborados por reales academias',side('Encargar los contenidos a las reales academias.','pp-contrato',3,'Compromiso 8'),absent('VOX'), 'No localizada una medida equivalente dentro de las fuentes consultadas.', 'Sin correspondencia localizada');
add('diferentes','Administración','Regla de tres derogaciones por cada norma',absent('PP'),side('Derogar tres normas por cada nueva.','vox-economia',35,'I'), 'Una regla cuantificada sin equivalente localizado en el corpus del otro partido.', 'Sin correspondencia localizada');
add('diferentes','Fiscalidad','Tipo del impuesto sobre sociedades',absent('PP'),side('Sociedades al 15 %.','vox-economia',37,'II'), 'No localizar ese mismo tipo no equivale a rechazo.', 'Sin correspondencia localizada');
add('diferentes','Medio ambiente','Adhesión al Acuerdo de París',absent('PP'),side('Retirar la adhesión al Acuerdo de París.','vox-economia',40,'IV'), 'No se completa la postura del otro partido con documentos ajenos al corpus.', 'Sin correspondencia localizada');
add('diferentes','Sanidad','Central de compras nacional',absent('PP'),side('Central de compras sanitaria y educativa.','vox-economia',39,'III'), 'Medida específica sin correspondencia localizada en el corpus del otro partido.', 'Sin correspondencia localizada');
add('diferentes','Agua','Interconexión de cuencas',absent('PP'),side('Plan del agua con interconexión de cuencas.','vox-economia',42,'IV'), 'La clasificación se limita a estos documentos, no a todo el historial político.', 'Sin correspondencia localizada');
add('diferentes','Vivienda','Objetivo de un millón de viviendas',side('Construir al menos un millón de viviendas.','pp-contrato',2,'Compromiso 4'),absent('VOX'), 'No localizada esa misma cifra. No implica que el otro partido se oponga a construir.', 'Sin correspondencia localizada');
add('diferentes','Autónomos','Franquicia de IVA o exención de cuota',side('Franquicia de IVA bajo 85.000 € de facturación.','pp-autonomos',5,'Medida 1'),side('Sin cuota si ingresos inferiores al SMI.','vox-economia',37,'II'), 'Se refieren a obligaciones distintas. Ambos documentos son antecedentes sectoriales de 2025.', 'Distinto objeto');
const data={version:'0.1.0',reviewed:'2026-10-30',election:'2026-11-29',scope:'Selección editorial de medidas en documentos oficiales disponibles. Corpus nacional acotado, no exhaustivo. No localizados ambos programas completos de generales 2026. Documentos de 2025 identificados como antecedentes; no se les atribuye vigencia electoral automática.',documents:docs,sources,items};
extendData(data,root);
fs.writeFileSync(path.join(web,'data.json'),JSON.stringify(data,null,2)+'\n');
const files=fs.readdirSync(path.join(web,'pdf')).filter(f=>f.endsWith('.pdf'));
fs.writeFileSync(path.join(web,'pdf','SHA256SUMS.txt'),files.map(f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(web,'pdf',f))).digest('hex')+'  '+f).join('\n')+'\n');
console.log(JSON.stringify({documents:data.documents.length,items:data.items.length,coverage:data.coverage}));
