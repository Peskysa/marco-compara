// Renderizado en memoria: no abre navegador ni usa red.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../web');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8'));
async function start(storage=new Map(),denyWrites=false){
 const elements=new Map();
 const create=(id='')=>({id,value:'',textContent:'',hidden:false,open:false,children:[],listeners:{},classList:{toggle(){}},setAttribute(){},addEventListener(event,fn){this.listeners[event]=fn;},append(child){this.children.push(child);},focus(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;},set innerHTML(v){this._html=v;if(this.id==='topic')this.value='all';},get innerHTML(){return this._html||'';}});
 for(const m of html.matchAll(/id="([^"]+)"/g)){assert.ok(!elements.has(m[1]),'ID duplicado');elements.set(m[1],create(m[1]));}
 for(const m of app.matchAll(/\$\('#([^']+)'\)/g))assert.ok(elements.has(m[1]),'Selector sin elemento: '+m[1]);
 for(const[id,value]of[['edition','actual'],['topic','all']])elements.get(id).value=value;
 const tabs=['all','coinciden','contrarios','diferentes'].map(filter=>Object.assign(create(),{dataset:{filter}})),bar=create(),errors=[];
 const document={activeElement:null,querySelector(s){if(s==='.edition-bar')return bar;const e=elements.get(s.slice(1));if(!e)throw Error(s);return e;},querySelectorAll(){return tabs;},createElement(){return create();},addEventListener(){}};
 const fetches=[];
 const localStorage={getItem:key=>storage.get(key)||null,setItem(key,value){if(denyWrites)throw Error('Almacenamiento no disponible');storage.set(key,value);}};
 const context=vm.createContext({document,localStorage,console:{error:e=>errors.push(e.stack||String(e)),log(){}},Intl,Date,Set,matchMedia:()=>({matches:true}),fetch:async(url)=>{fetches.push(url);return{ok:true,json:async()=>structuredClone(data)};}});
 await vm.runInContext(`(async()=>{${app}\nglobalThis.harness={selectEdition,setCategory,renderItems,openItem,chooseParty,clearChoices,removeChoice,counts:selectionCounts};})()`,context);
 assert.deepEqual(errors,[]);return{e:elements,ui:context.harness,storage,fetches};
}
const rowCount=e=>(e.get('comparison-list').innerHTML.match(/class="comparison-row"/g)||[]).length;
test('Todas las fichas aparecen sin paginación en ambas ediciones',async()=>{
 const{e,ui}=await start();
 for(const edition of ['actual','archivo-2023']){
  e.get('edition').value=edition;ui.selectEdition();
  const expected=data.items.filter(i=>i.edition===edition).length;
  assert.equal(rowCount(e),expected);assert.ok(!e.get('result-count').textContent.includes('mostrando'));
 }
 assert.ok(!e.has('more-comparisons'));
});
test('Búsqueda vacía y filtros no cambian las cuentas de cobertura',async()=>{
 const{e,ui}=await start();const before=e.get('coverage-bar').innerHTML;
 e.get('search').value='NO-EXISTE-ESTA-PROPUESTA';ui.renderItems();assert.equal(e.get('empty-state').hidden,false);
 e.get('search').value='';e.get('topic').value='Vivienda';ui.setCategory('diferentes');
 const n=data.items.filter(i=>i.edition==='actual'&&i.topic==='Vivienda'&&i.category==='diferentes').length;
 assert.match(e.get('result-count').textContent,new RegExp(`^${n} de `));assert.equal(e.get('coverage-bar').innerHTML,before);
});
test('El archivo separa fichas, documentos y detalle',async()=>{
 const{e,ui}=await start();e.get('edition').value='archivo-2023';ui.selectEdition();
 const n=data.items.filter(i=>i.edition==='archivo-2023').length;
 assert.match(e.get('result-count').textContent,new RegExp(`${n} de ${n}`));assert.match(e.get('document-context').innerHTML,/Archivo histórico/);
 assert.equal((e.get('document-grid').innerHTML.match(/class="document-card"/g)||[]).length,2);assert.ok(!e.get('document-grid').innerHTML.includes('contrato-espana-2026'));
 ui.openItem(data.items.find(i=>i.edition==='archivo-2023').id);assert.equal(e.get('detail-dialog').open,true);assert.match(e.get('dialog-body').innerHTML,/2023/);
});
test('La página omite los apartados retirados y sus enlaces',async()=>{
 const{e}=await start();
 for(const id of ['metodologia','inventario','more-inventory','inventory-list'])assert.ok(!e.has(id));
 assert.ok(!html.includes('href="#metodologia"'));assert.ok(!html.includes('href="#inventario"'));
 assert.ok(!html.includes('Vista previa local'));assert.ok(!html.includes('Una comparación con fecha y contexto.'));
});
test('Cada ficha admite una elección y volver a pulsar la desmarca',async()=>{
 const{ui,e,fetches}=await start();const i=data.items.find(i=>i.edition==='actual'&&!i.pp.absent&&!i.vox.absent);
 ui.chooseParty(i.id,'PP');assert.equal(ui.counts().pp,1);assert.equal(ui.counts().vox,0);
 ui.chooseParty(i.id,'VOX');assert.equal(ui.counts().pp,0);assert.equal(ui.counts().vox,1);assert.equal(ui.counts().selected,1);
 ui.chooseParty(i.id,'VOX');assert.equal(ui.counts().selected,0);
 assert.ok(!e.get('selection-totals').innerHTML.includes('%'));assert.deepEqual(fetches,['./data.json']);
});
test('No permite seleccionar la ausencia de una propuesta',async()=>{
 const{ui}=await start();const i=data.items.find(i=>i.edition==='actual'&&i.vox.absent);
 ui.chooseParty(i.id,'VOX');assert.equal(ui.counts().selected,0);
 ui.chooseParty(i.id,'PP');assert.equal(ui.counts().selected,1);
 ui.chooseParty(i.id,'OTRO');assert.equal(ui.counts().selected,1);
});
test('Los filtros conservan el recuento de las selecciones ocultas',async()=>{
 const{ui,e}=await start();const i=data.items.find(i=>i.edition==='actual'&&!i.pp.absent);
 ui.chooseParty(i.id,'PP');e.get('search').value='NO-HAY-ESTA-FICHA';ui.renderItems();
 assert.equal(rowCount(e),0);assert.equal(ui.counts().pp,1);assert.match(e.get('selection-quick-count').textContent,/PP: 1 · Vox: 0/);
});
test('Los recuentos y el borrado se mantienen separados por edición',async()=>{
 const{ui,e}=await start();const current=data.items.find(i=>i.edition==='actual'&&!i.pp.absent),archived=data.items.find(i=>i.edition==='archivo-2023');
 ui.chooseParty(current.id,'PP');e.get('edition').value='archivo-2023';ui.selectEdition();assert.equal(ui.counts().selected,0);
 ui.chooseParty(archived.id,'VOX');assert.equal(ui.counts().vox,1);ui.clearChoices();assert.equal(ui.counts().selected,0);
 e.get('edition').value='actual';ui.selectEdition();assert.equal(ui.counts().pp,1);
});
test('Recupera selecciones locales y descarta registros con contenido cambiado',async()=>{
 const store=new Map(),a=await start(store);const i=data.items.find(i=>i.edition==='actual'&&!i.pp.absent);
 a.ui.chooseParty(i.id,'PP');const b=await start(store);assert.equal(b.ui.counts().pp,1);
 const key=[...store.keys()][0],saved=JSON.parse(store.get(key));saved.selections[i.id].fingerprint='contenido distinto';store.set(key,JSON.stringify(saved));
 const c=await start(store);assert.equal(c.ui.counts().selected,0);
});
test('Sin almacenamiento permite seleccionar e informa de la limitación',async()=>{
 const{ui,e}=await start(new Map(),true);const i=data.items.find(i=>i.edition==='actual'&&!i.pp.absent);
 ui.chooseParty(i.id,'PP');assert.equal(ui.counts().pp,1);assert.match(e.get('selection-storage').textContent,/mientras esta página siga abierta/);
});
