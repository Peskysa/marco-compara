"""Paquetes de la modalidad web, a partir del commit desplegado."""
from pathlib import Path
import hashlib
import subprocess
import zipfile

root = Path(__file__).resolve().parent.parent
out = root / 'release'
out.mkdir(exist_ok=True)

def package(name, files, base):
    with zipfile.ZipFile(out / name, 'w', zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(files):
            if file.is_file():
                archive.write(file, file.relative_to(base).as_posix())

package('Marco-Compara-Web.zip', (root / 'dist').rglob('*'), root / 'dist')
docs = list((root / 'docs').rglob('*')) + [root / p for p in ['README.md','LICENSE','NOTICE','THIRD_PARTY.md','CHANGELOG.md','CONTRIBUTING.md','SECURITY.md']]
package('Marco-Compara-Documentacion.zip', docs, root)
subprocess.run(['git','archive','--format=zip','--prefix=marco-compara/','--output='+str(out / 'Marco-Compara-Source.zip'),'HEAD'],cwd=root,check=True)
hashes=[]
for file in sorted(out.glob('*.zip')):
    with zipfile.ZipFile(file) as archive:
        if archive.testzip():
            raise RuntimeError('Paquete no íntegro: '+file.name)
        if any('vox-' in name and name.endswith('.pdf') for name in archive.namelist()):
            raise RuntimeError('PDF VOX no redistribuible en '+file.name)
    hashes.append(hashlib.sha256(file.read_bytes()).hexdigest()+'  '+file.name)
(out / 'SHA256SUMS.txt').write_text('\n'.join(hashes)+'\n',encoding='utf-8')
print('Paquetes web, documentación, fuente y sumas verificados.')
