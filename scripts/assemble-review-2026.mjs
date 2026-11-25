// Herramienta de investigación. La web se regenera desde data/ con prepare-2026.mjs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const inventories=['pp','vox'].map(p=>read(`research/2026/${p}-inventory.json`));
const proposals=inventories.flatMap(d=>d.items);
const definitions=[
 {party:'PP',id:'pp-2026',title:'La Reconstrucción Nacional',date:'2026-11-10',pages:64,url:'https://www.pp.es/wp-content/uploads/2026/11/PROGRAMA-ELECTORAL-PP-2026-RECONSTRUCCION-NACIONAL.pdf',announcement:'https://www.pp.es/actualidad/articulos/feijoo-presenta-el-programa-del-pp-como-la-cura-con-la-que-sanar-una-espana-herida-y-la-respuesta-para-reconstruir-el-pais/'},
 {party:'VOX',id:'vox-2026',title:'Es sentido común',date:'2026-11-12',pages:66,url:'https://www.voxespana.es/wp-content/uploads/2026/11/Programa-completo-A5-1.pdf',announcement:'https://www.voxespana.es/abascal/es-sentido-comun-estas-son-las-medidas-de-vox-para-el-29n-20261112'}
];
const documents=definitions.map(d=>{
 const bytes=fs.readFileSync(path.join(root,`research/2026/${d.party.toLowerCase()}.pdf`));
 return{...d,kind:'Programa electoral · Generales 29N 2026',description:d.party==='PP'?'Programa publicado para el 29N: 249 posiciones numeradas, ocho todavía reservadas sin contenido.':'Programa publicado para el 29N: 115 medidas principales numeradas.',dateNote:'Fecha de presentación oficial del programa.',file:`pdf/${d.party.toLowerCase()}-generales-2026.pdf`,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),edition:'actual',rights:d.party==='PP'?'Autoría Partido Popular. Copia inalterada; contenido informativo bajo CC BY-NC 3.0 España según aviso legal. Código y marcas excluidos de esa licencia.':'Autoría VOX. PDF en servidor oficial; no se redistribuye la copia en GitHub.'};
});
const sources=documents.flatMap(d=>[
 {id:d.id,party:d.party,title:d.title,date:d.date,url:d.url,scope:d.kind,edition:'actual'},
 {id:d.id+'-presentacion',party:d.party,title:'Presentación oficial de '+d.title,date:d.date,url:d.announcement,scope:'Presentación del programa; la comparación se basa en el PDF.',edition:'actual'}
]);
const topicMap={'Justicia e instituciones':'Justicia','Cohesión territorial':'Modelo territorial','Empleo y autónomos':'Empleo y autónomos','Industria e innovación':'Industria y tecnología','Sector primario y mundo rural':'Sector primario','Política exterior':'Exterior','Tecnología':'Industria y tecnología','Anticorrupción':'Justicia','Medios públicos':'Instituciones','Cuidados':'Sanidad y cuidados','Sanidad':'Sanidad y cuidados','Agricultura':'Sector primario','Transportes':'Infraestructuras','Cultura y deporte':'Cultura y deporte'};
const normalizeTopic=t=>topicMap[t]||t;
const inventory=proposals.filter(i=>!i.placeholder).map(i=>({...i,source:i.party.toLowerCase()+'-2026',edition:'actual',topic:normalizeTopic(i.topic)}));
const reservations=proposals.filter(i=>i.placeholder).map(i=>({number:i.number,page:i.page,party:i.party,source:'pp-2026',note:'Posición reservada en el PDF sin propuesta publicada. Excluida de las fichas y selecciones.'}));
const measure=(party,n)=>inventory.find(i=>i.party===party&&i.number===n);
const side=(party,numbers,text,page)=>{
 const ms=numbers.map(n=>{const m=measure(party,n);if(!m)throw Error('Referencia sin medida: '+party+n);return m;});
 const first=page||ms[0].page;
 if(!ms.some(m=>m.pages.includes(first)))throw Error('Página no corresponde: '+party+numbers+' p'+first);
 return{text,source:party.toLowerCase()+'-2026',page:first,pages:[...new Set(ms.flatMap(m=>m.pages))],section:'Medida'+(numbers.length>1?'s ':' ')+numbers.join(', '),measureIds:ms.map(m=>m.id)};
};
const pairs=read('research/2026/pairs.json').items;
for(const party of ['pp','vox']){
 const file=`research/2026/${party}-page-corrections.json`;
 if(fs.existsSync(path.join(root,file)))for(const c of read(file).corrections){
  const p=pairs.find(p=>p.title===c.title);if(p)p[party+'Page']=c.page;
 }
}
const items=pairs.map(p=>({title:p.title,topic:normalizeTopic(p.topic),category:p.category,pp:side('PP',p.ppNumbers,p.ppText,p.ppPage),vox:side('VOX',p.voxNumbers,p.voxText,p.voxPage),note:p.note,subtype:p.subtype||null}));
const linked=new Set(items.flatMap(i=>[...i.pp.measureIds,...i.vox.measureIds]));
const rootReviews=fs.existsSync(path.join(root,'research/2026/root-review-adjustments.json'))?read('research/2026/root-review-adjustments.json').rows:[];
const reviews=[...rootReviews,...read('research/2026/pp-unmatched-review.json').rows,...read('research/2026/vox-crosswalk.json').rows];
const unmatched=inventory.filter(m=>!linked.has(m.id));
for(const m of unmatched){
 const review=reviews.find(r=>(m.party==='PP'?r.pp===m.number:r.vox===m.number));
 if(!review)throw Error('Falta revisión expresa: '+m.id);
 if(review.status!=='not-found')throw Error('Existe posible contraparte que revisar: '+m.id+' '+JSON.stringify(review));
 const key=m.party.toLowerCase(),other=key==='pp'?'vox':'pp';
 items.push({title:m.title,topic:m.topic,category:'diferentes',[key]:side(m.party,[m.number],m.summary,m.page),[other]:{absent:true,text:'No se ha localizado este compromiso concreto en el programa.',corpus:[other+'-2026'],measureIds:[]},note:review.reason+' La ausencia queda limitada a este compromiso concreto en el programa oficial revisado y no implica oposición ni silencio del otro partido sobre todo el tema.',subtype:'Compromiso concreto sin equivalencia localizada'});
}
// Las diferencias parciales dentro de una medida compuesta requieren revisión propia.
const extras=fs.existsSync(path.join(root,'research/2026/additional-differences.json'))?read('research/2026/additional-differences.json').items:[];
for(const x of extras){
 const key=x.party.toLowerCase(),other=key==='pp'?'vox':'pp';
 items.push({title:x.title,topic:normalizeTopic(x.topic),category:'diferentes',[key]:side(x.party,x.numbers,x.text,x.page),[other]:{absent:true,text:'No se ha localizado una propuesta equivalente para este punto concreto.',corpus:[other+'-2026'],measureIds:[]},note:x.note+' La ficha se refiere solo a este aspecto, aunque la medida citada tenga otros apartados compartidos.',subtype:'Aspecto específico sin equivalencia localizada'});
}
const seen=new Set();
items.forEach((i,index)=>{
 const key=JSON.stringify([i.title,i.pp.measureIds,i.vox.measureIds]);if(seen.has(key))throw Error('Ficha duplicada: '+i.title);seen.add(key);
 i.id='generales-2026-'+crypto.createHash('sha256').update(key).digest('hex').slice(0,12);i.displayNumber=String(index+1).padStart(3,'0');i.edition='actual';
});
const result={documents,sources,inventory,reservations,items,reviewNotes:[
 'Todas las medidas principales con contenido tienen al menos una referencia comparativa. Una referencia no implica que cada actuación subordinada sea idéntica o esté desglosada.',
 'Se excluyen las ocho posiciones reservadas del PP sin contenido: 83, 109, 132, 164, 167, 173, 200 y 210.',
 'Las comparaciones recientes anteriores, basadas en documentos parciales de 2025–2026, no se utilizan para inferir posiciones en estos programas.',
 'La coincidencia se limita a la actuación descrita; las diferencias de alcance, condiciones y ejecución permanecen en las notas.'
]};
fs.writeFileSync(path.join(root,'data/2026/review.json'),JSON.stringify(result,null,2)+'\n');
console.log({measures:inventory.length,reservations:reservations.length,paired:pairs.length,solo:unmatched.length,extras:extras.length,items:items.length});
