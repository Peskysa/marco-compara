import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../web');
const data=JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8'));
test('Cada comparación conserva evidencia en ambos lados o declara una ausencia acotada',()=>{
 const ids=new Set();
 for(const item of data.items){
  assert.ok(!ids.has(item.id));ids.add(item.id);
  assert.ok(['coinciden','contrarios','diferentes'].includes(item.category));
  for(const party of ['pp','vox']){
   const side=item[party];
   if(side.absent){assert.equal(item.category,'diferentes');assert.ok(side.corpus.length);for(const id of side.corpus)assert.ok(data.sources.some(s=>s.id===id));}
   else{
    const source=data.sources.find(s=>s.id===side.source);assert.ok(source,side.source);assert.equal(source.party,party.toUpperCase());
    const doc=data.documents.find(d=>d.id===side.source);
    if(doc)assert.ok(Number.isInteger(side.page)&&side.page>=1&&side.page<=doc.pages);
    assert.ok(side.section);
   }
  }
  assert.ok(item.note);
 }
});
test('Los PDF servidos son originales y coinciden con los metadatos',()=>{
 for(const d of data.documents){
  const file=path.resolve(root,d.file);assert.ok(file.startsWith(root+path.sep));
  if(d.party==='VOX'){
   const original=new URL(d.url);
   assert.equal(original.protocol,'https:');
   assert.ok(['www.voxespana.es','votaabascal.es'].includes(original.hostname));
   assert.match(d.sha256,/^[a-f0-9]{64}$/);
   if(!fs.existsSync(file))continue;
  }
  const bytes=fs.readFileSync(file);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
  assert.equal(bytes.length,d.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),d.sha256);
  assert.ok(d.rights);assert.ok(d.url.startsWith('https://'));
 }
});
test('Los documentos antiguos no aparecen como programas de las generales de 2026',()=>{
 for(const d of data.documents){
  if(d.date<'2026')assert.match(d.kind,/Antecedente|Archivo histórico/);
  assert.ok(d.date<=data.reviewed);
 }
 assert.match(data.scope,/no exhaustivo/);
 const current=data.documents.filter(d=>d.edition==='actual');
 assert.equal(current.length,2);
 assert.deepEqual(current.map(d=>d.id).sort(),['pp-2026','vox-2026']);
 assert.ok(current.every(d=>d.kind==='Programa electoral · Generales 29N 2026'));
});
test('Inventario, comparaciones y fuentes conservan la misma edición',()=>{
 const ids=new Set();
 for(const i of data.inventory){
  assert.ok(!ids.has(i.id),'Inventario duplicado: '+i.id);ids.add(i.id);
  const d=data.documents.find(d=>d.id===i.source);assert.ok(d);
  assert.equal(d.edition,i.edition);assert.ok(i.page>=1&&i.page<=d.pages);
  assert.ok(i.title&&i.summary&&i.topic);
 }
 for(const i of data.items)for(const side of [i.pp,i.vox]){
  if(!side.absent)assert.equal(data.sources.find(s=>s.id===side.source).edition,i.edition);
  for(const id of side.measureIds||[]){const measure=data.inventory.find(m=>m.id===id);assert.ok(measure,id);assert.equal(measure.edition,i.edition);assert.equal(measure.party,data.sources.find(s=>s.id===side.source).party);}
 }
});
test('Los programas históricos conservan todas las medidas principales sin inflar subapartados',()=>{
 for(const[party,total]of[['PP',365],['VOX',381]]){
  const rows=data.inventory.filter(i=>i.edition==='archivo-2023'&&i.party===party);
  assert.equal(rows.length,total);
  assert.deepEqual(rows.map(i=>Number(i.number)).sort((a,b)=>a-b),Array.from({length:total},(_,i)=>i+1));
 }
});
test('La cobertura informa pendientes reales y no equipara inventario a comparación',()=>{
 for(const e of data.coverage){
  assert.equal(e.inventory,e.pp+e.vox);
  assert.equal(e.pending,e.inventory-e.linked);
  assert.ok(e.linked<=e.inventory);
 }
 assert.ok(data.items.filter(i=>i.edition==='actual').length>25);
});

test('Todos los números de 2026 quedan revisados y los reservados no son seleccionables',()=>{
 const pp=data.inventory.filter(i=>i.source==='pp-2026'),vox=data.inventory.filter(i=>i.source==='vox-2026');
 assert.equal(pp.length,241);assert.equal(vox.length,115);
 assert.deepEqual(data.reservations.map(r=>r.number).sort((a,b)=>a-b),[83,109,132,164,167,173,200,210]);
 assert.deepEqual([...pp.map(i=>i.number),...data.reservations.map(i=>i.number)].sort((a,b)=>a-b),Array.from({length:249},(_,i)=>i+1));
 assert.deepEqual(vox.map(i=>i.number).sort((a,b)=>a-b),Array.from({length:115},(_,i)=>i+1));
 const linked=new Set(data.items.filter(i=>i.edition==='actual').flatMap(i=>[...i.pp.measureIds,...i.vox.measureIds]));
 for(const m of [...pp,...vox])assert.ok(linked.has(m.id),'Medida sin revisar: '+m.id);
 for(const i of data.items.filter(i=>i.edition==='actual'))for(const [party,side]of [['pp',i.pp],['vox',i.vox]]){
  if(side.absent){assert.deepEqual(side.corpus,[party+'-2026']);continue;}
  assert.equal(side.source,party+'-2026');
  assert.ok(side.measureIds.every(id=>!data.reservations.some(r=>id==='pp-2026-'+String(r.number).padStart(3,'0'))));
  const ms=side.measureIds.map(id=>data.inventory.find(m=>m.id===id));
  assert.ok(ms.some(m=>m.pages.includes(side.page)),'Página fuera de la medida en '+i.id);
 }
});

test('Las oposiciones actuales se limitan a decisiones explícitas de los programas nuevos',()=>{
 const rows=data.items.filter(i=>i.edition==='actual'&&i.category==='contrarios');
 assert.equal(rows.length,2);
 assert.ok(rows.every(i=>!i.pp.absent&&!i.vox.absent));
 assert.ok(!data.items.filter(i=>i.edition==='actual').some(i=>/eliminar el Estado autonómico|15\/25|18\/8/.test(i.vox.text)));
});
