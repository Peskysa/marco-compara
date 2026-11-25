import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const archive=read('data/archive-2023.json');
const current=read('data/2026/review.json');
const data={
 version:'0.3.0',reviewed:'2026-11-25',election:'2026-11-29',
 scope:'Comparación documental de los dos programas electorales publicados para las generales del 29N de 2026. Revisión de todas las entradas numeradas; resumen editorial no exhaustivo de cada actuación subordinada. Las posiciones reservadas sin propuesta se identifican y se excluyen de las selecciones. Archivo 2023 independiente.',
 editions:[
  {id:'actual',title:'Programas electorales · Generales 29N 2026',description:'PP: La Reconstrucción Nacional · VOX: Es sentido común. Dos programas oficiales completos, revisados el 25 de noviembre de 2026.'},
  ...archive.editions
 ],
 documents:[...current.documents,...archive.documents],sources:[...current.sources,...archive.sources],
 inventory:[...current.inventory,...archive.inventory],items:[...current.items,...archive.items],
 reservations:current.reservations||[],reviewNotes:current.reviewNotes||[]
};
data.coverage=data.editions.map(e=>{
 const inv=data.inventory.filter(i=>i.edition===e.id),items=data.items.filter(i=>i.edition===e.id);
 const linked=new Set(items.flatMap(i=>[...(i.pp.measureIds||[]),...(i.vox.measureIds||[])]));
 return{edition:e.id,inventory:inv.length,pp:inv.filter(i=>i.party==='PP').length,vox:inv.filter(i=>i.party==='VOX').length,comparisons:items.length,linked:linked.size,pending:inv.filter(i=>!linked.has(i.id)).length};
});
fs.writeFileSync(path.join(root,'web/data.json'),JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(path.join(root,'web/pdf/SHA256SUMS.txt'),data.documents.filter(d=>d.party==='PP').map(d=>d.sha256+'  '+path.basename(d.file)).join('\n')+'\n');
console.log(JSON.stringify({coverage:data.coverage,reservations:data.reservations.length}));
