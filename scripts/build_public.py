#!/usr/bin/env python3
"""Prepara o Pages com arquivos identificados pelo conteúdo, preservando a fonte."""
import argparse
import base64
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_URL = 'https://davicostacccc-droid.github.io/ASHFALL-SITE/'


def fingerprint(filename, content):
    digest = hashlib.sha256(content).hexdigest()[:16]
    return f'{filename}?v={digest}'


def portable_preview(source):
    """Inclui os recursos na prévia para funcionar também fora da URL do Pages."""
    html = (source / 'previa-sonora.template.html').read_text('utf-8')
    css = (source / 'previa-sonora.css').read_text('utf-8')
    stylesheet = '<link rel="stylesheet" href="previa-sonora.css" />'
    if stylesheet not in html:
        raise ValueError('Estilo da prévia sonora não encontrado; publicação interrompida.')
    html = html.replace(stylesheet, f'<style>\n{css}\n</style>')
    script_tag = '<script src="previa-sonora.js"></script>'
    if script_tag not in html:
        raise ValueError('Player da prévia sonora não encontrado; publicação interrompida.')
    script = (source / 'previa-sonora.js').read_text('utf-8')
    html = html.replace(script_tag, f'<script>\n{script}\n</script>')
    resources = {
        'assets/sigil.svg': 'image/svg+xml',
        'assets/terras-das-cinzas.webp': 'image/webp',
        'assets/audio/terras-das-cinzas-estudo-01.mp3': 'audio/mpeg',
    }
    for path, mime in resources.items():
        encoded = base64.b64encode((source / path).read_bytes()).decode('ascii')
        html = html.replace(f'src="{path}"', f'src="data:{mime};base64,{encoded}"')
        if mime == 'image/svg+xml':
            html = html.replace(f'href="{path}"', f'href="data:{mime};base64,{encoded}"')
        # Download e navegação continuam abrindo o endereço real fora de uma prévia.
        html = html.replace(f'href="{path}"', f'href="{PUBLIC_URL}{path}"')
    html = html.replace('href="./"', f'href="{PUBLIC_URL}"')
    html = html.replace('href="./#changelog"', f'href="{PUBLIC_URL}#changelog"')
    return html


def build(source, target):
    source, target = source.resolve(), target.resolve()
    if source == target or source in target.parents or target in source.parents:
        raise ValueError('A saída precisa ficar fora da pasta fonte e não pode conter a fonte.')
    target.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, target, dirs_exist_ok=True, ignore=shutil.ignore_patterns('previa-sonora.template.html'))
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
    (target / 'previa-sonora.html').write_text(portable_preview(source), encoding='utf-8')
    (target / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / '_public')
    parser.add_argument('--refresh-preview', action='store_true', help='Atualiza também o HTML completo que pode ser aberto sozinho.')
    args = parser.parse_args()
    if args.refresh_preview:
        (ROOT / 'site/previa-sonora.html').write_text(portable_preview(ROOT / 'site'), encoding='utf-8')
    manifest = build(ROOT / 'site', args.output)
    print('OK: pacote público preparado com versões de CSS, JavaScript e módulo.')
    print(json.dumps(manifest))


if __name__ == '__main__':
    main()
