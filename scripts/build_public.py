#!/usr/bin/env python3
"""Prepara o Pages com arquivos identificados pelo conteúdo, preservando a fonte."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fingerprint(filename, content):
    digest = hashlib.sha256(content).hexdigest()[:16]
    return f'{filename}?v={digest}'


def build(source, target):
    source, target = source.resolve(), target.resolve()
    if source == target or source in target.parents or target in source.parents:
        raise ValueError('A saída precisa ficar fora da pasta fonte e não pode conter a fonte.')
    target.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, target, dirs_exist_ok=True)
    manifest = {}
    for filename in ('content-model.mjs', 'styles.css'):
        content = (source / filename).read_bytes()
        name = fingerprint(filename, content)
        manifest[filename] = name
    app = (source / 'app.js').read_text('utf-8').replace("'./content-model.mjs'", f"'./{manifest['content-model.mjs']}'")
    if app == (source / 'app.js').read_text('utf-8'):
        raise ValueError('Importação do módulo não encontrada; publicação interrompida.')
    app_bytes = app.encode('utf-8')
    app_name = fingerprint('app.js', app_bytes)
    manifest['app.js'] = app_name
    # Os caminhos permanecem estáveis, inclusive para HTML de versões anteriores.
    (target / 'app.js').write_bytes(app_bytes)
    html = (source / 'index.html').read_text('utf-8')
    html = html.replace('href="styles.css"', f'href="{manifest["styles.css"]}"')
    html = html.replace('src="app.js"', f'src="{app_name}"')
    (target / 'index.html').write_text(html, encoding='utf-8')
    (target / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / '_public')
    args = parser.parse_args()
    manifest = build(ROOT / 'site', args.output)
    print('OK: pacote público preparado com versões de CSS, JavaScript e módulo.')
    print(json.dumps(manifest))


if __name__ == '__main__':
    main()
