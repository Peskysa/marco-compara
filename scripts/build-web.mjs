import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','app.js','styles.css','assets'])fs.cpSync(path.join(root,'web',name),path.join(out,name),{recursive:true});
const data=JSON.parse(fs.readFileSync(path.join(root,'web/data.json'),'utf8'));
const hashes=[];
fs.mkdirSync(path.join(out,'pdf'),{recursive:true});
for(const d of data.documents){
 if(d.party==='VOX'){
  if(fs.existsSync(path.join(out,d.file)))throw Error('El destino contiene un PDF de VOX: use una carpeta dist limpia.');
  d.rights='Autoría VOX. Descarga desde el servidor oficial; no se redistribuye el PDF en este repositorio.';
  continue;
 }
 const bytes=fs.readFileSync(path.join(root,'web',d.file));
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==d.sha256)throw Error('PDF alterado: '+d.file);
 fs.writeFileSync(path.join(out,d.file),bytes);hashes.push(`${d.sha256}  ${d.file}`);
}
fs.writeFileSync(path.join(out,'data.json'),JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(path.join(out,'pdf/SHA256SUMS.txt'),hashes.join('\n')+'\n');
fs.writeFileSync(path.join(out,'.nojekyll'),'');
for(const name of ['LICENSE','NOTICE','THIRD_PARTY.md'])fs.copyFileSync(path.join(root,name),path.join(out,name));
console.log('Web preparada: cinco PDF de PP y dos enlaces oficiales a PDF de VOX.');
