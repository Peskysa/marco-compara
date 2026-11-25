import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=path.resolve(import.meta.dirname,'../research/2026');
fs.mkdirSync(dir,{recursive:true});
await Promise.all([
 ['pp','https://www.pp.es/wp-content/uploads/2026/11/PROGRAMA-ELECTORAL-PP-2026-RECONSTRUCCION-NACIONAL.pdf'],
 ['vox','https://www.voxespana.es/wp-content/uploads/2026/11/Programa-completo-A5-1.pdf']
].map(async([party,url])=>{
 const r=await fetch(url);if(!r.ok)throw Error(party+': HTTP '+r.status);
 const b=Buffer.from(await r.arrayBuffer());if(b.subarray(0,5).toString()!=='%PDF-')throw Error('No es PDF: '+party);
 const manifest=path.resolve(import.meta.dirname,'../data/2026/review.json');
 if(fs.existsSync(manifest)){
  const d=JSON.parse(fs.readFileSync(manifest,'utf8')).documents.find(d=>d.party.toLowerCase()===party);
  if(d&&crypto.createHash('sha256').update(b).digest('hex')!==d.sha256)throw Error('El original ha cambiado: revisar '+party+' antes de publicar');
 }
 fs.writeFileSync(path.join(dir,party+'.pdf'),b);
 if(party==='pp')fs.writeFileSync(path.resolve(import.meta.dirname,'../web/pdf/pp-generales-2026.pdf'),b);
 console.log(party,b.length,'bytes');
}));
