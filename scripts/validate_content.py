#!/usr/bin/env python3
"""Confere estrutura e aprovações editoriais do site público ASHFALL."""
import json
from datetime import date
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
ALLOWED_CATEGORIES = {'arte','gameplay','sistemas','site'}

def error(message):
    print(f'ERRO: {message}', file=sys.stderr)
    raise SystemExit(1)

content_path = SITE / 'data' / 'content.json'
try:
    data = json.loads(content_path.read_text('utf-8'))
except (OSError, json.JSONDecodeError) as exc:
    error(f'Não foi possível ler JSON: {exc}')
if data.get('schemaVersion') != 1:
    error('schemaVersion precisa ser 1')

for kind in ('updates','gallery'):
    if not isinstance(data.get(kind), list):
        error(f'{kind} precisa ser lista')
    ids = set()
    for item in data[kind]:
        if not isinstance(item, dict):
            error(f'{kind}: entrada inválida')
        ident = item.get('id')
        if not isinstance(ident, str) or not ident or ident in ids:
            error(f'{kind}: id vazio ou duplicado: {ident!r}')
        ids.add(ident)
        if type(item.get('approved')) is not bool:
            error(f'{kind}/{ident}: approved precisa ser true ou false')
        if not item['approved']:
            error(f'{kind}/{ident}: rascunhos não podem ser enviados ao repositório público; mantenha-os no repositório privado')
        if kind == 'updates':
            if item.get('category') not in ALLOWED_CATEGORIES:
                error(f'{ident}: categoria inválida')
            for field in ('title','summary','version','date'):
                if not isinstance(item.get(field), str) or not item[field].strip():
                    error(f'{ident}: {field} obrigatório para publicar')
            try:
                date.fromisoformat(item['date'])
            except ValueError:
                error(f'{ident}: data precisa usar AAAA-MM-DD')
            if not isinstance(item.get('highlights', []), list):
                error(f'{ident}: highlights precisa ser lista')
        else:
            for field in ('title','subtitle','type','src','alt'):
                if not isinstance(item.get(field), str) or not item[field].strip():
                    error(f'{ident}: {field} obrigatório para publicar')
            src = item['src']
            if src.startswith('/') or '..' in Path(src).parts or not src.startswith('assets/'):
                error(f'{ident}: caminho de mídia inválido')
            if not (SITE / src).is_file():
                error(f'{ident}: imagem inexistente: {src}')

required = ('index.html','styles.css','app.js','robots.txt','assets/sigil.svg')
for filename in required:
    if not (SITE / filename).is_file():
        error(f'Arquivo obrigatório ausente: {filename}')

print('OK: arquivos públicos e metadados validados.')
print('NOTA: validação automática não substitui sua aprovação editorial ou auditoria de segredos.')
