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
   assert.ok(['voxespana.es','www.voxespana.es'].includes(original.hostname));
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
 assert.match(data.scope,/No localizados/);
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
