import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export function extendData(data,root){
 const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/,''));
 const exists=file=>fs.existsSync(path.join(root,file));
 data.version='0.2.0';
 data.scope='Inventario ampliado de documentos nacionales y fichas contrastadas. Corpus acotado, no exhaustivo respecto de todas las posiciones de los partidos. No localizados ambos programas completos de generales 2026. Archivo 2023 separado, sin atribuir vigencia electoral automática.';
 data.editions=[{id:'actual',title:'Documentos 2025–2026',description:'Compromisos de precampaña y antecedentes sectoriales. No se han localizado ambos programas completos del 29N. La falta de equivalencia se limita a estos documentos.'},{id:'archivo-2023',title:'Archivo histórico · Generales 23J de 2023',description:'Programas completos de 2023, comparados entre sí. Este archivo no representa por defecto las propuestas de las elecciones de 2026.'}];
 data.documents.forEach(d=>d.edition='actual');data.sources.forEach(s=>s.edition='actual');
 const current=read('research/inventario-actual.json');
 data.inventory=current.items.map(i=>({id:i.id,party:i.party||i.partido,source:i.source,page:i.page,section:i.section,topic:i.topic,title:i.title,summary:i.summary,edition:'actual',alsoFoundAt:i.alsoFoundAt||[]}));
 data.inventoryCoverage={actual:current.coverage};
 const initial=data.items;
 const comparative=read('research/comparaciones-actuales-completadas.json');
 data.items=comparative.items.map((i,index)=>{
  const item={...i,id:'actual-'+String(index+1).padStart(3,'0'),displayNumber:String(index+1).padStart(2,'0'),edition:'actual'};
  for(const party of ['pp','vox']){
   const ids=i[party+'Ids']||i[party]?.measureIds||[i[party]?.inventoryId].filter(Boolean);
   item[party]={...i[party],measureIds:ids};
   if(!item[party].section&&!item[party].absent)item[party].section='Apartado indicado en la fuente';
  }
  return item;
 });
 const definitions=[
  {party:'PP',source:'pp-2023',inventory:'research/pp/inventario-2023.json',pdf:'research/pp/programa-generales-2023.pdf',title:'Programa electoral · 365 medidas',url:'https://www.pp.es/storage/2023/07/programa_electoral_pp_23j_feijoo_2023.pdf',pages:112},
  {party:'VOX',source:'vox-2023',inventory:'research/vox/inventario-2023.json',pdf:'research/vox/vox-programa-generales-2023.pdf',title:'Un programa para lo que importa',url:'https://votaabascal.es/assets/pdf/Programa-VOX-2023.pdf',pages:178}
 ];
 for(const def of definitions){
  if(!exists(def.inventory))continue;
  const raw=read(def.inventory),entries=(raw.entries||raw.items||raw.measures||raw).filter(i=>!i.parent_id&&!i.parentId);
  const file=`pdf/${def.party.toLowerCase()}-generales-2023.pdf`;
  const bytes=fs.readFileSync(path.join(root,def.pdf));fs.writeFileSync(path.join(root,'web',file),bytes);
  const d={id:def.source,party:def.party,title:def.title,date:'2023-07',kind:'Archivo histórico · Programa completo 23J 2023',description:`Programa completo de las elecciones de 2023: ${entries.length} medidas principales numeradas. No es un programa de 2026.`,url:def.url,file,pages:def.pages,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),edition:'archivo-2023',rights:def.party==='PP'?'Autoría Partido Popular. Licencia del código excluida; contenido informativo según aviso legal CC BY-NC 3.0 España.':'Autoría VOX. Copia local de investigación; no se ha localizado licencia general de redistribución. Excluido de AGPL.'};
  data.documents.push(d);data.sources.push({id:d.id,party:d.party,title:d.title,date:d.date,url:d.url,scope:d.kind,edition:d.edition});
  for(const i of entries){
   data.inventory.push({id:`${def.party.toLowerCase()}-2023-${String(i.number).padStart(3,'0')}`,party:def.party,number:i.number,page:i.page||i.page_pdf,source:def.source,section:'Medida '+i.number,topic:i.topic||i.tema||'Otras políticas',title:i.title,summary:i.summary,edition:'archivo-2023'});
  }
 }
 const pairFiles=['research/comparaciones-archivo-pp.json','research/comparaciones-archivo-vox.json'];
 const pairs=pairFiles.filter(exists).flatMap(file=>{const raw=read(file);return raw.items||raw.comparisons||raw;});
 const seen=new Set();let index=0;
 for(const pair of pairs){
  const ppNums=pair.ppNumbers||[],voxNums=pair.voxNumbers||[];
  if(!ppNums.length||!voxNums.length)continue;
  const key=JSON.stringify([ppNums.slice().sort(),voxNums.slice().sort()]);if(seen.has(key))continue;seen.add(key);
  const sides={};
  for(const [party,numbers]of[['pp',ppNums],['vox',voxNums]]){
   const measures=numbers.map(n=>data.inventory.find(i=>i.source===party+'-2023'&&String(i.number)===String(n)));
   if(measures.some(m=>!m))throw Error('Referencia de archivo inexistente: '+JSON.stringify(pair));
   sides[party]={text:pair[party+'Text']||measures.map(m=>m.summary).join(' '),source:party+'-2023',page:measures[0].page,section:'Medida'+(numbers.length>1?'s ':' ')+numbers.join(', '),measureIds:measures.map(m=>m.id)};
  }
  index++;data.items.push({id:'archivo-'+String(index).padStart(3,'0'),displayNumber:String(index).padStart(2,'0'),edition:'archivo-2023',category:pair.category,topic:pair.topic,title:pair.title,pp:sides.pp,vox:sides.vox,note:pair.note,subtype:pair.subtype||null});
 }
 data.coverage=data.editions.map(e=>{
  const inv=data.inventory.filter(i=>i.edition===e.id),items=data.items.filter(i=>i.edition===e.id);
  const linked=new Set(items.flatMap(i=>[...(i.pp.measureIds||[]),...(i.vox.measureIds||[])]));
  return{edition:e.id,inventory:inv.length,pp:inv.filter(i=>i.party==='PP').length,vox:inv.filter(i=>i.party==='VOX').length,comparisons:items.length,linked:linked.size,pending:inv.filter(i=>!linked.has(i.id)).length};
 });
 return data;
}
