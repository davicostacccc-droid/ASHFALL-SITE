"""Verifica que o Pages não mistura importações e estilos de versões diferentes."""
import tempfile
import unittest
import base64
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from build_public import build

SOURCE = Path(__file__).resolve().parents[1] / 'site'


class PublicBuildTests(unittest.TestCase):
    def test_audio_preview_keeps_its_resources_when_opened_on_its_own(self):
        class Resources(HTMLParser):
            def __init__(self):
                super().__init__()
                self.embedded, self.styles, self.audio, self.scripts = [], 0, [], 0

            def handle_starttag(self, tag, attributes):
                attrs = dict(attributes)
                if tag == 'style':
                    self.styles += 1
                if tag == 'audio':
                    self.audio.append(attrs)
                if tag in ('img', 'source'):
                    self.embedded.append(attrs['src'])
                if tag == 'link':
                    self.assert_no_external_stylesheet(attrs)
                if tag == 'script':
                    if attrs.get('src'):
                        raise AssertionError('A prévia isolada depende de um script externo')
                    self.scripts += 1

            def assert_no_external_stylesheet(self, attrs):
                if attrs.get('rel') == 'stylesheet':
                    raise AssertionError('A prévia isolada depende de um CSS externo')

        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder) / 'public'
            build(SOURCE, out)
            page = (out / 'previa-sonora.html').read_text('utf-8')
            self.assertEqual(page, (SOURCE / 'previa-sonora.html').read_text('utf-8'), 'O arquivo aberto pelo criador precisa conter a mesma prévia completa publicada.')
            self.assertFalse((out / 'previa-sonora.template.html').exists())
            parsed = Resources()
            parsed.feed(page)
            self.assertEqual(parsed.styles, 1)
            self.assertEqual(parsed.scripts, 1)
            self.assertEqual(len(parsed.embedded), 3)
            for resource in parsed.embedded:
                self.assertTrue(resource.startswith('data:'))
                self.assertTrue(base64.b64decode(resource.split(',', 1)[1], validate=True))
            audio = next(src for src in parsed.embedded if src.startswith('data:audio/mpeg;'))
            self.assertEqual(base64.b64decode(audio.split(',', 1)[1]), (SOURCE / 'assets/audio/terras-das-cinzas-estudo-01.mp3').read_bytes())
            self.assertEqual(len(parsed.audio), 1)
            self.assertIn('controls', parsed.audio[0])
            self.assertNotIn('autoplay', parsed.audio[0])
            self.assertIn('href="https://davicostacccc-droid.github.io/ASHFALL-SITE/"', page)
            self.assertNotIn('href="./', page)

    def test_package_points_at_matching_files_and_keeps_originals(self):
        source_app = (SOURCE / 'app.js').read_bytes()
        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder) / 'public'
            manifest = build(SOURCE, out)
            html = (out / 'index.html').read_text()
            app = (out / urlsplit(manifest['app.js']).path).read_text()
            self.assertIn(f'src="{manifest["app.js"]}"', html)
            self.assertIn(f'href="{manifest["styles.css"]}"', html)
            self.assertIn(f"'./{manifest['content-model.mjs']}'", app)
            self.assertEqual((out / 'app.js').read_text(), app)
            for name in manifest.values():
                self.assertTrue((out / urlsplit(name).path).is_file())
            self.assertTrue((out / 'assets/alpha-cartas-build.png').is_file())
        self.assertEqual((SOURCE / 'app.js').read_bytes(), source_app)

    def test_module_change_also_changes_app_address(self):
        import shutil
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / 'source'
            shutil.copytree(SOURCE, source)
            first = build(source, root / 'one')
            with (source / 'content-model.mjs').open('a') as stream:
                stream.write('\n// nova versão\n')
            second = build(source, root / 'two')
            self.assertNotEqual(first['content-model.mjs'], second['content-model.mjs'])
            self.assertNotEqual(first['app.js'], second['app.js'])
            self.assertEqual(first['styles.css'], second['styles.css'])

    def test_refuses_output_in_source(self):
        with self.assertRaises(ValueError):
            build(SOURCE, SOURCE / 'public')
