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


class ManualPageTest(AppTestCase):
    def test_manual_and_images_need_password(self):
        img = "/closed/rukovodstvo/a/admin/01-overview.webp"
        self.assertEqual(self.client.get(img).status_code, 404)
        self.assertNotIn("Словарь", self.client.get("/closed/rukovodstvo").get_data(as_text=True))
        self.assertEqual(self.client.post("/closed/rukovodstvo", data={"password": "Keleshek!"}).status_code, 401)
        self.assertEqual(self.client.post("/closed/rukovodstvo", data={"password": "4444"}).status_code, 302)
        html = self.client.get("/closed/rukovodstvo").get_data(as_text=True)
        self.assertIn("Словарь", html)
        self.assertNotIn("{{CSRF}}", html)
        self.assertEqual(self.client.get(img).status_code, 200)
        self.assertEqual(self.client.get("/closed/rukovodstvo/a/../../keleshek-osnashchenie.html").status_code, 404)
        # пароль одной страницы не открывает другую
        self.assertNotIn("Шесть выводов", self.client.get("/closed/keleshek-osnashchenie").get_data(as_text=True))
