"""Verifica os limites editoriais do retrato público da Alpha."""
import copy
import json
import unittest
import tempfile
import shutil
import hashlib
from html.parser import HTMLParser
from pathlib import Path
from validate_content import validate, validate_page

CONTENT = json.loads((Path(__file__).resolve().parents[1] / 'site/data/content.json').read_text('utf-8'))


def update_media(data):
    return next(item for item in data['updates'] if item.get('media'))['media'][0]


class ContentTests(unittest.TestCase):
    def test_audio_library_points_to_the_approved_original_previews(self):
        root = Path(__file__).resolve().parents[1] / 'site'
        catalog = json.loads((root / 'data/audio-studies.json').read_text())
        self.assertGreaterEqual(len(catalog['tracks']), 8)
        self.assertTrue({'marcha-das-cinzas', 'antes-da-queda', 'guardiao-da-fenda', 'terras-das-cinzas'}.issubset({t['id'] for t in catalog['tracks']}))
        ids = set()
        for track in catalog['tracks']:
            self.assertNotIn(track['id'], ids)
            ids.add(track['id'])
            self.assertIs(track['approved'], True)
            self.assertEqual(track['status'], 'avaliacao')
            self.assertGreater(track['duration'], 0)
            self.assertRegex(track['src'], r'^assets/audio/[a-z0-9-]+\.mp3$')
            audio = (root / track['src']).read_bytes()
            self.assertEqual(hashlib.sha256(audio).hexdigest(), track['sha256'])
            if track.get('score'):
                self.assertTrue((root / track['score']).read_bytes().startswith(b'MThd'))
            if track.get('gameLoop'):
                loop = (root / track['gameLoop']).read_bytes()
                self.assertTrue(loop.startswith(b'OggS'))
                self.assertEqual(hashlib.sha256(loop).hexdigest(), track['gameLoopSha256'])
                self.assertAlmostEqual(track['loopSamples'] / track['loopSampleRate'], track['loopDuration'])
        self.assertEqual(catalog['tracks'][0]['id'], catalog['recommendedTrack'])
        theme = next(t for t in catalog['tracks'] if t['id'] == 'a-queda-das-cinzas')
        combat = next(t for t in catalog['tracks'] if t['id'] == 'a-queda-combate')
        self.assertEqual(theme['motif'], combat['motif'])
        self.assertEqual(len(theme['chapters']), 5)

    def test_home_audio_can_play_without_leaving_the_diary(self):
        class Player(HTMLParser):
            def __init__(self):
                super().__init__()
                self.audio, self.iframes, self.scripts, self.choices = [], 0, [], []
            def handle_starttag(self, tag, attrs):
                attrs = dict(attrs)
                if tag == 'audio': self.audio.append(attrs)
                if tag == 'iframe': self.iframes += 1
                if tag == 'script': self.scripts.append(attrs.get('src'))
                if tag == 'button' and 'data-audio-track' in attrs: self.choices.append(attrs)
        html = (Path(__file__).resolve().parents[1] / 'site/index.html').read_text('utf-8')
        player = Player()
        player.feed(html)
        self.assertEqual(len(player.audio), 1)
        self.assertEqual(player.audio[0]['id'], 'previewAudio')
        self.assertEqual(player.audio[0]['preload'], 'none')
        self.assertNotIn('autoplay', player.audio[0])
        self.assertIn('controls', player.audio[0])
        self.assertEqual(player.iframes, 0)
        self.assertEqual(player.scripts.count('previa-sonora.js'), 1)
        catalog = json.loads((Path(__file__).resolve().parents[1] / 'site/data/audio-studies.json').read_text())
        self.assertEqual(len(player.choices), len(catalog['tracks']))
        self.assertEqual([item['data-audio-track'] for item in player.choices if item['aria-pressed'] == 'true'], [catalog['recommendedTrack']])
        for choice in player.choices:
            track = next(item for item in catalog['tracks'] if item['id'] == choice['data-audio-track'])
            self.assertEqual(choice['data-src'], track['src'])
            self.assertEqual(choice['data-title'], track['title'])
            self.assertEqual(float(choice['data-duration']), track['duration'])
            self.assertEqual(int(choice['data-bpm']), track['bpm'])
        self.assertLess(html.index('id="changelog"'), html.index('id="trilha"'))
        self.assertLess(html.index('id="trilha"'), html.index('id="sobre"'))

    def test_current_content_and_anchors(self):
        validate(CONTENT)
        validate_page()

    def rejects(self, change, expected):
        data = copy.deepcopy(CONTENT)
        change(data)
        with self.assertRaisesRegex(ValueError, expected):
            validate(data)

    def test_rejects_drafts(self):
        for kind in ('updates', 'gallery'):
            with self.subTest(kind=kind):
                self.rejects(lambda data: data[kind][0].update(approved=False), 'rascunhos')

    def test_approval_is_not_truthiness(self):
        self.rejects(lambda data: data['updates'][0].update(approved=1), 'rascunhos')

    def test_unknown_state(self):
        self.rejects(lambda data: data['roadmap'][0].update(state='finalizado-talvez'), 'estado')
        self.rejects(lambda data: data['updates'][0].update(status='lancado'), 'estado')

    def test_incomplete_roster(self):
        self.rejects(lambda data: data['origins'].pop(), 'cinco origens')

    def test_duplicate_origin(self):
        self.rejects(lambda data: data['origins'][1].update(id=data['origins'][0]['id']), 'duplicado')

    def test_invalid_dates(self):
        for value in ('2026-02-30', '26/10/2026', '2026-1-1'):
            with self.subTest(value=value):
                self.rejects(lambda data: data['game'].update(asOf=value), 'data|AAAA')

    def test_unavailable_media(self):
        for value in ('https://example.com/image.webp', 'assets/../secret.webp', 'assets/%2e%2e.webp', 'assets/inexistente.webp'):
            with self.subTest(value=value):
                self.rejects(lambda data: data['gallery'][0].update(src=value), 'mídia|inexistente')

    def test_empty_or_nontext_highlights(self):
        for value in ([], [{}], ['']):
            with self.subTest(value=value):
                self.rejects(lambda data: data['updates'][0].update(highlights=value), 'textos')

    def test_update_media_is_local_and_exists(self):
        for value in ('https://example.com/private.png', 'assets/../secret.png', 'assets/missing.png'):
            with self.subTest(value=value):
                self.rejects(lambda data: update_media(data).update(src=value), 'mídia|inexistente')

    def test_update_media_requires_context(self):
        self.rejects(lambda data: update_media(data).update(caption=''), 'caption')
        self.rejects(lambda data: update_media(data).update(type='video'), 'tipo de imagem')

    def test_four_illustrated_milestones(self):
        self.assertEqual(sum(bool(item.get('media')) for item in CONTENT['updates']), 4)
        review = next(item for item in CONTENT['updates'] if item['status'] == 'avaliacao')
        self.assertIn('avaliação', review['media'][0]['caption'])

    def test_links_to_existing_updates_are_validated(self):
        root = Path(__file__).resolve().parents[1] / 'site'
        with tempfile.TemporaryDirectory() as folder:
            site = Path(folder) / 'site'
            shutil.copytree(root, site)
            html = site / 'index.html'
            text = html.read_text('utf-8')
            self.assertIn('#atualizacao-alpha-build-arauto', text)
            validate_page(site)
            html.write_text(text.replace('#atualizacao-alpha-build-arauto', '#atualizacao-inexistente'), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'âncora inexistente'):
                validate_page(site)

    def test_future_work_is_separate(self):
        data = CONTENT
        self.assertTrue(any(item['state'] == 'avaliacao' for item in data['roadmap']))
        self.assertTrue(any(item['state'] == 'planejado' for item in data['roadmap']))
        self.assertEqual(next(item for item in data['updates'] if item['id'] == 'recompensas-em-avaliacao')['status'], 'avaliacao')


if __name__ == '__main__':
    unittest.main()
