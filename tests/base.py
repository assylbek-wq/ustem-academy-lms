import io
import re
import shutil
import tempfile
import unittest

from app import create_app
from app.config import TestConfig
from app.models import db
from app.seed import DEMO_PASSWORD, seed_demo


class AppTestCase(unittest.TestCase):
    """Каждый тест получает свежую базу (SQLite в памяти или TEST_DATABASE_URL) с демо-данными."""

    csrf_off = True

    def setUp(self):
        from app.blueprints import auth as _auth
        _auth._attempts.clear()  # лимит входов общий для процесса: тесты не должны влиять друг на друга
        self.upload_dir = tempfile.mkdtemp(prefix="academy-test-")
        self.app = create_app(TestConfig, UPLOAD_DIR=self.upload_dir, TESTING_NO_CSRF=self.csrf_off,
                              CHUNK_BYTES=1024)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.drop_all()
        db.create_all()
        seed_demo()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()
        shutil.rmtree(self.upload_dir, ignore_errors=True)

    def login(self, email, password=DEMO_PASSWORD, client=None):
        c = client or self.client
        c.get("/logout")
        r = c.post("/login", data={"email": email, "password": password})
        self.assertEqual(r.status_code, 302, f"login failed for {email}")
        return c

    def new_client(self, email=None):
        c = self.app.test_client()
        if email:
            self.login(email, client=c)
        return c

    @staticmethod
    def video_bytes(size=3000) -> bytes:
        return b"\x00\x00\x00\x18ftypmp42" + b"x" * (size - 12)


def csrf_from(html: str) -> str:
    m = re.search(r'name="csrf-token" content="([^"]+)"', html)
    return m.group(1) if m else ""


def xlsx_file(rows):
    from openpyxl import Workbook
    wb = Workbook()
    ws = wb.active
    for r in rows:
        ws.append(r)
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf
