"""Verifica os limites editoriais do retrato público da Alpha."""
import copy
import json
import unittest
from pathlib import Path
from validate_content import validate, validate_page

CONTENT = json.loads((Path(__file__).resolve().parents[1] / 'site/data/content.json').read_text('utf-8'))


class ContentTests(unittest.TestCase):
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

    def test_future_work_is_separate(self):
        data = CONTENT
        self.assertTrue(any(item['state'] == 'avaliacao' for item in data['roadmap']))
        self.assertTrue(any(item['state'] == 'planejado' for item in data['roadmap']))
        self.assertEqual(next(item for item in data['updates'] if item['id'] == 'recompensas-em-avaliacao')['status'], 'avaliacao')


if __name__ == '__main__':
    unittest.main()
