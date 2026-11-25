const {spawnSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const python=path.resolve(path.dirname(process.execPath),'../../python/python.exe');
const args=process.argv.includes('--install')?['-m','pip','install','--target',path.join(root,'research/python-deps'),'pymupdf']:[path.join(__dirname,'extract-2026.py')];
const result=spawnSync(python,args,{stdio:'inherit',env:{...process.env,PYTHONPATH:path.join(root,'research/python-deps')}});
if(result.error)console.error(result.error.message);
process.exitCode=result.status??1;
