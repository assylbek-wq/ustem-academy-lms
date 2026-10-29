"""Закрытые страницы по паролю (/closed/<slug>)."""
from tests.base import AppTestCase

URL = "/closed/keleshek-osnashchenie"


class PrivatePageTest(AppTestCase):
    def test_password_gate(self):
        r = self.client.get(URL)
        self.assertEqual(r.status_code, 200)
        self.assertNotIn("Шесть выводов", r.get_data(as_text=True))
        self.assertIn("noindex", r.headers["X-Robots-Tag"])
        r = self.client.post(URL, data={"password": "keleshek"})
        self.assertEqual(r.status_code, 401)
        self.assertNotIn("Шесть выводов", r.get_data(as_text=True))
        r = self.client.post(URL, data={"password": "Keleshek!"})
        self.assertEqual(r.status_code, 302)
        r = self.client.get(URL)
        self.assertIn("Шесть выводов", r.get_data(as_text=True))
        self.assertEqual(r.headers["Cache-Control"], "private, no-store")

    def test_file_not_public_and_unknown_slug(self):
        self.assertEqual(self.client.get("/closed/nope").status_code, 404)
        self.assertEqual(self.client.get("/static/../private_pages/keleshek-osnashchenie.html").status_code, 404)
