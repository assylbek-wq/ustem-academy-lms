"""Регистрация: телефон обязателен, письмо с подтверждением почты, до подтверждения курсы закрыты."""
import re
from unittest import mock

from tests.base import AppTestCase

from app.blueprints.auth import normalize_phone
from app.models import User


FORM = {"email": "new@school.kz", "full_name": "Айгерим Новая", "password": "secret123", "consent": "1", "phone": "8 (701) 123-45-67"}


class PhoneTest(AppTestCase):
    def test_normalize(self):
        self.assertEqual(normalize_phone("8 (701) 123-45-67"), "+77011234567")
        self.assertEqual(normalize_phone("+7 701 123 45 67"), "+77011234567")
        self.assertEqual(normalize_phone("7011234567"), "+77011234567")
        self.assertEqual(normalize_phone("+998 90 123 45 67"), "+998901234567")
        self.assertIsNone(normalize_phone(""))
        self.assertIsNone(normalize_phone("12345"))
        self.assertIsNone(normalize_phone("+7 701 123"))

    def test_phone_required(self):
        r = self.client.post("/register", data={**FORM, "phone": ""})
        self.assertEqual(r.status_code, 400)
        self.assertIsNone(User.query.filter_by(email="new@school.kz").first())


class VerifyTest(AppTestCase):
    def setUp(self):
        super().setUp()
        self.app.config["SMTP_HOST"] = "smtp.example.test"
        self.sent = []
        patcher = mock.patch("app.blueprints.auth.send_mail", side_effect=lambda to, subj, body: self.sent.append((to, subj, body)))
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_register_sends_link_and_blocks_until_verified(self):
        r = self.client.post("/register", data=FORM)
        self.assertEqual(r.status_code, 302)
        self.assertIn("/confirm-email", r.headers["Location"])
        u = User.query.filter_by(email="new@school.kz").first()
        self.assertEqual(u.phone, "+77011234567")
        self.assertIsNone(u.email_verified_at)
        self.assertEqual(len(self.sent), 1)
        self.assertEqual(self.sent[0][0], "new@school.kz")
        # курсы закрыты
        r = self.client.get("/my")
        self.assertEqual(r.status_code, 302)
        self.assertIn("/confirm-email", r.headers["Location"])
        self.assertEqual(self.client.get("/confirm-email").status_code, 200)
        # ссылка из письма
        link = re.search(r"https?://\S+/confirm-email/\S+", self.sent[0][2]).group(0)
        r = self.client.get(link[link.index("/confirm-email/"):])
        self.assertEqual(r.status_code, 302)
        self.assertIsNotNone(User.query.filter_by(email="new@school.kz").first().email_verified_at)
        self.assertEqual(self.client.get("/my").status_code, 200)

    def test_bad_token_and_resend(self):
        self.client.post("/register", data=FORM)
        self.assertEqual(self.client.get("/confirm-email/garbage").status_code, 404)
        self.client.post("/confirm-email/resend")
        self.assertEqual(len(self.sent), 2)

    def test_existing_users_not_blocked(self):
        self.login("teacher1@academy.demo")
        self.assertEqual(self.client.get("/my").status_code, 200)


class NoSmtpTest(AppTestCase):
    def test_without_smtp_registration_is_verified_at_once(self):
        r = self.client.post("/register", data=FORM)
        self.assertEqual(r.status_code, 302)
        self.assertNotIn("/confirm-email", r.headers["Location"])
        self.assertIsNotNone(User.query.filter_by(email="new@school.kz").first().email_verified_at)
