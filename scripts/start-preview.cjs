const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
(async()=>{
 try{
  const r=await fetch('http://127.0.0.1:5197/');
  const html=await r.text();if(!r.ok||!html.includes('Marco Pescador Compara'))throw Error('El puerto 5197 está ocupado por otro servicio.');
  console.log('Vista previa existente: http://127.0.0.1:5197/');return;
 }catch(e){if(!String(e.message).includes('fetch failed'))throw e;}
 fs.mkdirSync(path.join(root,'test-output'),{recursive:true});
 const output=fs.openSync(path.join(root,'test-output/preview-server.log'),'a');
 const errors=fs.openSync(path.join(root,'test-output/preview-server-error.log'),'a');
 const child=spawn(process.execPath,[path.join(__dirname,'serve.cjs')],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',output,errors]});
 child.unref();
 fs.writeFileSync(path.join(root,'test-output/preview-state.json'),JSON.stringify({pid:child.pid,url:'http://127.0.0.1:5197/'}));
 console.log('Vista previa iniciada:',child.pid,'http://127.0.0.1:5197/');
})().catch(e=>{console.error(e.message);process.exitCode=1});
