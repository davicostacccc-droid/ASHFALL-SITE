"""Verifica que o Pages não mistura importações e estilos de versões diferentes."""
import tempfile
import unittest
from pathlib import Path
from urllib.parse import urlsplit
from build_public import build

SOURCE = Path(__file__).resolve().parents[1] / 'site'


class PublicBuildTests(unittest.TestCase):
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
