#!/usr/bin/env python3
"""Valida o retrato público da Alpha e seus arquivos, sem acessar o jogo privado."""
import json
import re
import sys
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
CATEGORIES = {'arte', 'gameplay', 'sistemas', 'site'}
STATES = {'integrado', 'avaliacao', 'planejado'}
ACCENTS = {'ember', 'steel', 'plague', 'electric', 'sacred'}
IDENTIFIER = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
MEDIA = re.compile(r'^assets/[a-z0-9][a-z0-9_-]*\.(?:webp|png|jpe?g|avif)$', re.I)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text_fields(item, fields, context):
    for field in fields:
        require(isinstance(item.get(field), str) and item[field].strip(), f'{context}: {field} obrigatório')


def text_list(value, context):
    require(isinstance(value, list) and value and all(isinstance(text, str) and text.strip() for text in value), f'{context}: use uma lista de textos não vazios')


def iso_date(value, context):
    require(isinstance(value, str) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', value), f'{context}: use AAAA-MM-DD')
    try:
        date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f'{context}: data inválida') from exc


def entries(data, kind):
    require(isinstance(data.get(kind), list) and data[kind], f'{kind}: lista obrigatória')
    ids = set()
    for item in data[kind]:
        require(isinstance(item, dict), f'{kind}: entrada inválida')
        ident = item.get('id')
        require(isinstance(ident, str) and IDENTIFIER.fullmatch(ident) and ident not in ids, f'{kind}: id inválido ou duplicado: {ident!r}')
        ids.add(ident)
        yield item


def validate(data, site=SITE):
    require(isinstance(data, dict) and data.get('schemaVersion') == 1, 'schemaVersion precisa ser 1')
    game = data.get('game')
    require(isinstance(game, dict), 'game: retrato da Alpha obrigatório')
    text_fields(game, ('stage', 'headline', 'summary', 'focus'), 'game')
    iso_date(game.get('asOf'), 'game/asOf')
    for field in ('available', 'review', 'next'):
        text_list(game.get(field), f'game/{field}')
    require(len(data.get('origins', [])) == 5, 'origins: informe as cinco origens jogáveis')
    for origin in entries(data, 'origins'):
        text_fields(origin, ('name', 'role', 'weapon', 'symbol', 'description', 'mechanic'), origin['id'])
        require(origin.get('accent') in ACCENTS, f'{origin["id"]}: cor de origem inválida')
    for milestone in entries(data, 'roadmap'):
        text_fields(milestone, ('title', 'description', 'label'), milestone['id'])
        require(milestone.get('state') in STATES, f'{milestone["id"]}: estado de roteiro inválido')
    for kind in ('updates', 'gallery'):
        for item in entries(data, kind):
            ident = item['id']
            require(item.get('approved') is True, f'{kind}/{ident}: rascunhos não podem ser enviados ao repositório público')
            if kind == 'updates':
                text_fields(item, ('title', 'summary', 'version', 'date'), ident)
                iso_date(item['date'], ident)
                require(item.get('category') in CATEGORIES, f'{ident}: categoria inválida')
                require(item.get('status', 'integrado') in STATES, f'{ident}: estado de atualização inválido')
                text_list(item.get('highlights'), f'{ident}/highlights')
                media_items = item.get('media', [])
                require(isinstance(media_items, list), f'{ident}/media: use uma lista de imagens')
                for media in media_items:
                    require(isinstance(media, dict) and media.get('type') == 'image', f'{ident}/media: tipo de imagem inválido')
                    text_fields(media, ('src', 'alt', 'caption'), f'{ident}/media')
                    require(MEDIA.fullmatch(media['src']), f'{ident}/media: caminho de mídia inválido')
                    require((site / media['src']).is_file(), f'{ident}/media: imagem inexistente: {media["src"]}')
            else:
                text_fields(item, ('title', 'subtitle', 'type', 'src', 'alt'), ident)
                require(MEDIA.fullmatch(item['src']), f'{ident}: caminho de mídia inválido')
                require((site / item['src']).is_file(), f'{ident}: imagem inexistente: {item["src"]}')


class PageLinks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.files = [], [], []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a' and attrs.get('href', '').startswith('#'):
            self.links.append(attrs['href'][1:])
        if tag in {'script', 'img'} and attrs.get('src'):
            self.files.append(attrs['src'])
        if tag == 'link' and attrs.get('href'):
            self.files.append(attrs['href'])


def validate_page(site=SITE):
    for filename in ('index.html', 'styles.css', 'app.js', 'content-model.mjs', 'robots.txt', 'assets/sigil.svg'):
        require((site / filename).is_file(), f'Arquivo obrigatório ausente: {filename}')
    page = PageLinks()
    page.feed((site / 'index.html').read_text('utf-8'))
    require(len(page.ids) == len(set(page.ids)), 'HTML: há IDs duplicados')
    data = json.loads((site / 'data/content.json').read_text('utf-8'))
    public_anchors = {f'atualizacao-{item["id"]}' for item in data.get('updates', []) if item.get('approved') is True}
    for ident in page.links:
        require(ident in page.ids or ident in public_anchors, f'HTML: âncora inexistente: #{ident}')
    for filename in page.files:
        require(not filename.startswith(('/', 'http:', 'https:')) and '..' not in Path(filename).parts and (site / filename).is_file(), f'HTML: recurso local inválido ou ausente: {filename}')


def main():
    try:
        validate(json.loads((SITE / 'data/content.json').read_text('utf-8')))
        validate_page()
    except (OSError, ValueError, TypeError) as exc:
        print(f'ERRO: {exc}', file=sys.stderr)
        return 1
    print('OK: conteúdo público, estados, cinco origens, imagens, âncoras e arquivos validados.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
