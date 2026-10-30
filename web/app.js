const $ = selector => document.querySelector(selector);
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups = {
  coinciden:{title:'Coinciden en la medida',short:'Coinciden',icon:'=',description:'Una medida explícita compartida, con sus matices.'},
  contrarios:{title:'Posiciones contrarias',short:'Se oponen',icon:'↔',description:'Posiciones explícitas incompatibles sobre un mismo punto.'},
  diferentes:{title:'Diferencias sin oposición directa',short:'Otras diferencias',icon:'≠',description:'Distinto diseño o una medida sin correspondencia localizada.'}
};
let data;
let category='all';
let edition='actual';
let returnFocus;
let choices={};
let canStoreChoices=true;
const CHOICE_STORAGE='marco-pescador-compara:selecciones:v1';
const date = value => value.length===7 ? new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'-01T12:00:00Z')) : new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
const sourceById = id => data.sources.find(s=>s.id===id);
const docById = id => data.documents.find(d=>d.id===id);
const docHref = (d,page) => (d.party==='VOX'?d.url:'./'+d.file)+(page?'#page='+page:'');
const editionItems=()=>data.items.filter(i=>i.edition===edition);
const editionInventory=()=>data.inventory.filter(i=>i.edition===edition);
const editionDocs=()=>data.documents.filter(d=>d.edition===edition);
const coveredIds=()=>new Set(editionItems().flatMap(i=>[...(i.pp.measureIds||[]),...(i.vox.measureIds||[])]));
const fingerprint=i=>JSON.stringify([i.edition,i.title,i.pp.text,i.pp.source,i.pp.section,i.vox.text,i.vox.source,i.vox.section]);
function loadChoices(){
  choices={};
  try{
    const saved=JSON.parse(localStorage.getItem(CHOICE_STORAGE)||'null');
    if(saved?.version!==1||!saved.selections||typeof saved.selections!=='object')return;
    for(const i of data.items){const c=saved.selections[i.id];if(c&&['PP','VOX'].includes(c.party)&&c.fingerprint===fingerprint(i)&&!i[c.party.toLowerCase()].absent)choices[i.id]=c;}
  }catch{canStoreChoices=false;}
}
function saveChoices(){try{localStorage.setItem(CHOICE_STORAGE,JSON.stringify({version:1,selections:choices}));canStoreChoices=true;}catch{canStoreChoices=false;}}
function selectionCounts(){
  const items=editionItems();let pp=0,vox=0;
  for(const i of items){if(choices[i.id]?.party==='PP')pp++;if(choices[i.id]?.party==='VOX')vox++;}
  return{pp,vox,selected:pp+vox,unselected:items.length-pp-vox,total:items.length};
}
function totalsHtml(counts){return `<div class="selection-total pp-total"><span>PP</span><strong>${counts.pp}</strong><small>${counts.pp===1?'selección':'selecciones'}</small></div><div class="selection-total vox-total"><span>Vox</span><strong>${counts.vox}</strong><small>${counts.vox===1?'selección':'selecciones'}</small></div><div class="selection-total remaining-total"><span>Sin seleccionar</span><strong>${counts.unselected}</strong><small>de ${counts.total} fichas</small></div>`;}
function selectedListHtml(){
  const selected=editionItems().filter(i=>choices[i.id]);
  if(!selected.length)return '<p class="selection-none">Todavía no has seleccionado ninguna propuesta en esta edición.</p>';
  return selected.map(i=>{const party=choices[i.id].party;return `<div class="selected-entry"><span class="party party-${party.toLowerCase()}">${party==='VOX'?'Vox':party}</span><button class="selected-title" data-item="${i.id}">Ficha ${esc(i.displayNumber)} · ${esc(i.title)}</button><button class="quiet-button" data-remove-choice="${i.id}" aria-label="Quitar selección de la ficha ${esc(i.displayNumber)}">Quitar ×</button></div>`;}).join('');
}
function renderSelections(){
  const counts=selectionCounts();
  $('#selection-quick-count').textContent=`PP: ${counts.pp} · Vox: ${counts.vox} · ${counts.selected} seleccionadas`;
  $('#selection-edition').textContent=data.editions.find(e=>e.id===edition).title;
  $('#selection-totals').innerHTML=totalsHtml(counts);
  $('#selection-list').innerHTML=selectedListHtml();
  $('#clear-selections').disabled=counts.selected===0;
  $('#selection-storage').textContent=canStoreChoices?'Tus selecciones se guardan solo en este navegador. No se envían al servidor.':'El navegador no permite guardar las selecciones. Se conservarán mientras esta página siga abierta.';
}
function chooseParty(id,party){
  const i=data.items.find(i=>i.id===id);
  if(!i||i.edition!==edition||!['PP','VOX'].includes(party)||i[party.toLowerCase()].absent)return;
  if(choices[id]?.party===party)delete choices[id];else choices[id]={party,fingerprint:fingerprint(i)};
  saveChoices();renderItems();renderSelections();
}
function removeChoice(id){delete choices[id];saveChoices();renderItems();renderSelections();}
function clearChoices(){for(const i of editionItems())delete choices[i.id];saveChoices();renderItems();renderSelections();}
function partyChoice(i,party){
  const side=i[party.toLowerCase()],selected=choices[i.id]?.party===party,label=party==='VOX'?'Vox':party;
  return `<button class="row-side choice-button choice-${party.toLowerCase()}${selected?' chosen':''}" data-choice="${i.id}" data-party="${party}" aria-pressed="${selected}" aria-label="${side.absent?'Sin propuesta seleccionable de':'Seleccionar'} ${label} en la ficha ${esc(i.displayNumber)}: ${esc(i.title)}"${side.absent?' disabled':''}><span class="party-name ${party.toLowerCase()}">${label}</span>${esc(side.text)}<span class="row-meta">${refLabel(side)}</span><span class="choice-hint">${side.absent?'Sin propuesta documentada':selected?'✓ Seleccionada · pulsa para quitar':'○ Seleccionar '+label}</span></button>`;
}
function refLabel(side){const source=sourceById(side.source);return side.absent?'Corpus revisado · sin equivalencia localizada':`${source.date.slice(0,4)} · ${side.page?'PDF, pág. '+side.page:'Anuncio oficial'}`;}
function renderSummary(){
  const selected=editionItems();
  $('#summary-grid').innerHTML=Object.entries(groups).map(([key,g])=>{const count=selected.filter(i=>i.category===key).length;return `<button class="summary-card" data-filter="${key}" aria-label="${g.short}: ${count} ${count===1?'ficha':'fichas'}"><span class="summary-top"><span class="summary-icon" aria-hidden="true">${g.icon}</span><span class="summary-number">${String(count).padStart(2,'0')}</span></span><span class="summary-title">${g.title}</span><span class="summary-text">${g.description}</span></button>`;}).join('');
  const inv=editionInventory(),covered=coveredIds();
  $('#coverage-bar').innerHTML=`<span><strong>${selected.length}</strong> fichas de comparación</span><span><strong>${inv.length}</strong> propuestas inventariadas</span><span><strong>${covered.size}</strong> propuestas vinculadas a fichas</span>`;
}
function setCategory(value){category=value;document.querySelectorAll('.filter-tab').forEach(b=>{b.classList.toggle('active',b.dataset.filter===category);b.setAttribute('aria-pressed',String(b.dataset.filter===category));});renderItems();}
function renderItems(){
  const term=normalize($('#search').value),topic=$('#topic').value;
  const matches=editionItems().filter(i=>(category==='all'||i.category===category)&&(topic==='all'||i.topic===topic)&&(!term||normalize([i.title,i.topic,i.note,i.subtype||'',i.pp.text,i.vox.text].join(' ')).includes(term)));
  const items=Object.keys(groups).flatMap(c=>matches.filter(i=>i.category===c));
  $('#result-count').textContent=`${matches.length} de ${editionItems().length} fichas en esta edición`;
  $('#clear-filters').hidden=category==='all'&&!term&&topic==='all';
  $('#empty-state').hidden=items.length>0;
  $('#comparison-list').innerHTML=Object.entries(groups).map(([key,g])=>{
    const part=items.filter(i=>i.category===key);if(!part.length)return '';
    return `<section class="list-group" data-kind="${key}" aria-label="${g.title}"><h3 class="group-title"><span class="group-dot"></span>${g.title}<span class="group-total">${part.length} ${part.length===1?'ficha':'fichas'}</span></h3>${part.map(i=>`<article class="comparison-row"><div class="row-trigger"><span class="row-number">${esc(i.displayNumber||i.id.split('-').pop())}</span><button class="row-head row-detail" data-item="${i.id}" aria-label="Ver fuentes: ${esc(i.title)}"><span class="row-topic">${esc(i.topic)}</span><span class="row-title">${esc(i.title)}</span>${i.subtype?`<span class="row-meta">${esc(i.subtype)}</span>`:''}</button>${partyChoice(i,'PP')}${partyChoice(i,'VOX')}<button class="row-arrow row-detail" data-item="${i.id}" aria-label="Abrir detalle de ${esc(i.title)}">↗</button></div></article>`).join('')}</section>`;
  }).join('');
}
function renderDocuments(){
  $('#document-grid').innerHTML=editionDocs().map(d=>`<article class="document-card"><div class="doc-top"><span class="party party-${d.party.toLowerCase()}">${d.party}</span><span class="doc-year">${d.date.slice(0,4)} · PDF ORIGINAL</span></div><h3>${esc(d.title)}</h3><span class="doc-kind">${esc(d.kind)}</span><p class="doc-description">${esc(d.description)}</p><div class="doc-meta"><time datetime="${d.date}">${date(d.date)}</time><span>·</span><span>${d.pages} ${d.pages===1?'página':'páginas'}</span><span>·</span><span>${new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(d.bytes/1000000)} MB</span></div><div class="doc-actions"><a class="download-link" href="${docHref(d)}" ${d.party==='VOX'?'target="_blank" rel="noopener noreferrer"':'download="'+d.file.split('/').pop()+'"'} aria-label="Descargar PDF: ${esc(d.title)}">${d.party==='VOX'?'Abrir PDF oficial':'Descargar PDF'} <span aria-hidden="true">↓</span></a><a class="original-link" href="${d.url}" target="_blank" rel="noopener noreferrer" aria-label="Fuente original: ${esc(d.title)}">Original ↗</a></div><small class="doc-hash" title="SHA-256 completo: ${d.sha256}">SHA-256 ${d.sha256.slice(0,16)}… <span>· ${d.party==='VOX'?'Archivo en servidor oficial':'Copia sin modificar'}</span></small><small class="doc-hash">${d.party==='PP'?'Autor: Partido Popular · <a href="https://creativecommons.org/licenses/by-nc/3.0/es/" target="_blank" rel="noopener noreferrer">CC BY-NC 3.0 España</a>':'Autor: VOX · derechos reservados'}</small></article>`).join('');
  $('#source-links').innerHTML=data.sources.filter(s=>!docById(s.id)&&(s.edition===edition||s.party==='BOE')).map(s=>`<div><a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.party)} · ${esc(s.title)} ↗</a><small>${date(s.date)} · ${esc(s.scope)}</small></div>`).join('');
  $('#document-context').innerHTML=edition==='actual'?'<strong>Programas completos del 29N: no localizados en esta revisión.</strong> Estos son los compromisos y antecedentes sectoriales disponibles, con su fecha original.':'<strong>Archivo histórico · Elecciones generales del 23 de julio de 2023.</strong> Dos programas completos, de 112 y 178 páginas. Su inclusión no les atribuye vigencia para las elecciones de 2026.';
}
function selectEdition(){
 edition=$('#edition').value;category='all';$('#search').value='';
 $('#topic').innerHTML='<option value="all">Todos los temas</option>';
 [...new Set(editionItems().map(i=>i.topic))].sort((a,b)=>a.localeCompare(b,'es')).forEach(topic=>{const o=document.createElement('option');o.value=topic;o.textContent=topic;$('#topic').append(o);});
 $('#edition-context').textContent=data.editions.find(e=>e.id===edition).description;
 document.querySelector('.edition-bar').classList.toggle('historical',edition==='archivo-2023');
 renderSummary();setCategory('all');renderDocuments();renderSelections();
}
function openDialog(title,eyebrow,html){if(!$('#detail-dialog').open)returnFocus=document.activeElement;$('#dialog-title').textContent=title;$('#dialog-eyebrow').textContent=eyebrow;$('#dialog-body').innerHTML=html;if(!$('#detail-dialog').open)$('#detail-dialog').showModal();$('#dialog-close').focus();}
function evidence(party,side){
  if(side.absent)return `<article class="evidence-card"><span class="party party-${party.toLowerCase()}">${party}</span><p>Medida equivalente no localizada.</p><small>Solo en este corpus: ${side.corpus.map(id=>esc(sourceById(id).title)+' ('+sourceById(id).date.slice(0,4)+')').join('; ')}.</small><small>Esto no prueba que el partido no la proponga. La documentación disponible es parcial.</small></article>`;
  const s=sourceById(side.source),d=docById(side.source);
  return `<article class="evidence-card"><span class="party party-${party.toLowerCase()}">${party}</span><p>${esc(side.text)}</p><small>${esc(s.title)}<br>${date(s.date)} · ${esc(s.scope)}<br>${side.page?`Página ${side.page} del PDF · `:''}${esc(side.section)}</small>${(side.measureIds||[]).map(id=>{const m=data.inventory.find(i=>i.id===id);return m?`<button class="quiet-button" data-inventory="${esc(id)}">Ver ficha de la medida ${esc(m.number||m.section)} · pág. ${m.page}</button>`:'';}).join('')}<a class="text-link" href="${d?docHref(d,side.page):s.url}" target="_blank" rel="noopener noreferrer">${d?'Abrir PDF en la página':'Leer anuncio oficial'} ↗</a>${d?`<a class="original-link" href="${s.url}${side.page?'#page='+side.page:''}" target="_blank" rel="noopener noreferrer">Consultar el original del partido ↗</a>`:''}</article>`;
}
function openItem(id){const i=data.items.find(i=>i.id===id);openDialog(i.title,groups[i.category].title+' · '+i.topic,`<p class="dialog-note">${esc(i.note)}</p><div class="evidence-grid">${evidence('PP',i.pp)}${evidence('VOX',i.vox)}</div><p class="dialog-date">Clasificación editorial · Revisado el 30 de octubre de 2026 · Resúmenes propios; las fuentes contienen el texto íntegro. La fecha de cada documento es parte de la comparación.</p>`);}
function reset(){category='all';$('#search').value='';$('#topic').value='all';setCategory('all');}
document.addEventListener('click',event=>{
  const choice=event.target.closest('[data-choice]');if(choice){const id=choice.dataset.choice,party=choice.dataset.party;chooseParty(id,party);document.querySelector(`[data-choice="${id}"][data-party="${party}"]`)?.focus({preventScroll:true});return;}
  const remove=event.target.closest('[data-remove-choice]');if(remove){removeChoice(remove.dataset.removeChoice);if($('#detail-dialog').open)showSelectionSummary();return;}
  const filter=event.target.closest('[data-filter]');if(filter){setCategory(filter.dataset.filter);if(filter.classList.contains('summary-card'))$('#comparison-list').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  const item=event.target.closest('[data-item]');if(item)openItem(item.dataset.item);
  const inv=event.target.closest('[data-inventory]');if(inv){const i=data.inventory.find(i=>i.id===inv.dataset.inventory);if($('#detail-dialog').open)$('#detail-dialog').close();openDialog(i.title,(i.edition==='archivo-2023'?'Archivo histórico 2023':'Inventario documental')+' · '+i.party,`<p class="dialog-note">${coveredIds().has(i.id)?'Esta propuesta está vinculada a una ficha de comparación. Una ficha puede tratar solo parte de una medida compuesta.':'Propuesta pendiente de comparación. No se atribuye por ello una posición al otro partido.'}</p>${evidence(i.party,{text:i.summary,source:i.source,page:i.page,section:i.number?'Medida '+i.number:i.section})}<p class="dialog-date">${i.edition==='archivo-2023'?'Elecciones de 2023. No se presume vigencia para 2026.':'La fecha y el alcance del documento forman parte de esta ficha.'}</p>`);}
});
$('#search').addEventListener('input',renderItems);$('#topic').addEventListener('change',renderItems);$('#clear-filters').addEventListener('click',reset);$('#reset-empty').addEventListener('click',reset);
$('#edition').addEventListener('change',selectEdition);
function showSelectionSummary(){openDialog('Recuento de tus selecciones',data.editions.find(e=>e.id===edition).title,`<div class="selection-totals">${totalsHtml(selectionCounts())}</div><p class="selection-explanation">Se cuenta una selección por ficha; las fichas sin marcar figuran aparte. Puedes revisar o quitar tus selecciones a continuación.</p><div class="selection-list">${selectedListHtml()}</div>`);}
$('#show-selection-summary').addEventListener('click',showSelectionSummary);
$('#clear-selections').addEventListener('click',clearChoices);
$('#dialog-close').addEventListener('click',()=>$('#detail-dialog').close());
$('#detail-dialog').addEventListener('click',event=>{if(event.target===$('#detail-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
$('#detail-dialog').addEventListener('close',()=>returnFocus?.focus());
$('#privacy-open').addEventListener('click',()=>openDialog('Privacidad y créditos','Marco Pescador Compara',`<div class="privacy-content"><p>Autor del código y gráficos originales: <strong>Marco Pescador</strong>. Licencia AGPL-3.0-only. Los textos de comparación son resúmenes editoriales, no citas literales ni mensajes oficiales de los partidos.</p><p>Esta web no usa cuentas, cookies ni analítica. La búsqueda y el recuento se realizan en el navegador. Las opciones que marcas se guardan únicamente en este navegador y puedes borrarlas desde el recuento; no se envían al servidor. Los enlaces externos se abren solo al solicitarlos; la visita al sitio del partido queda sujeta a su política de privacidad.</p><p>Los PDF pertenecen a sus autores. El contenido informativo de PP se ofrece conforme a su aviso legal CC BY-NC 3.0 España. Los PDF de VOX se abren desde su servidor oficial y no se alojan en GitHub. La licencia del código no se aplica a los documentos ni a las marcas. Los documentos de PP se conservan sin modificar con atribución y licencia visible.</p><p>Alojamiento: GitHub Pages. GitHub puede registrar datos técnicos de las visitas conforme a su política de privacidad. Las selecciones no salen de este navegador. <a href="https://docs.github.com/es/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">Privacidad de GitHub</a>. <a href="https://github.com/Peskysa/marco-compara" target="_blank" rel="noopener noreferrer">Código fuente</a>.</p></div>`));
try{
  const response=await fetch('./data.json');if(!response.ok)throw Error('No se pueden cargar los datos');data=await response.json();loadChoices();
  selectEdition();
}catch(error){$('#result-count').textContent='No se ha podido cargar la comparación. Recarga la página.';console.error(error);}



