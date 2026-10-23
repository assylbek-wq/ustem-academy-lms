"""Видео урока, загруженное файлом в Студии: загрузка частями, привязка к уроку, просмотр с перемоткой, права."""
from pathlib import Path

from tests.base import AppTestCase

from app.models import Cohort, Enrollment, Lesson, User, db


class LessonVideoTest(AppTestCase):
    def upload(self, client, name="урок.mov", size=5000):
        data = self.video_bytes(size)
        up = client.post("/api/uploads", json={"name": name, "size": len(data)}).get_json()
        received, file_id = 0, None
        while received < len(data):
            body = client.put(f"/api/uploads/{up['id']}?offset={received}", data=data[received:received + 1024]).get_json()
            received, file_id = body["received"], body.get("file_id") or file_id
        return file_id, data

    def setUp(self):
        super().setUp()
        enr = Enrollment.query.join(User, Enrollment.user_id == User.id).filter(User.email == "teacher1@academy.demo").first()
        self.cohort = enr.cohort
        self.lesson = Lesson.query.filter(Lesson.module.has(level_id=self.cohort.level_id)).first()
        self.m = self.new_client("methodist@academy.demo")

    def test_upload_attach_play_and_remove(self):
        file_id, data = self.upload(self.m)
        r = self.m.post(f"/studio/lessons/{self.lesson.id}/video", json={"file_id": file_id, "lang": "all"})
        self.assertEqual(r.status_code, 200, r.get_data(as_text=True))
        url = r.get_json()["url"]
        db.session.refresh(self.lesson)
        self.assertEqual(set(self.lesson.video_url.values()), {url})
        name = url.rsplit("/", 1)[1]
        stored = Path(self.upload_dir) / "videos" / name
        self.assertTrue(stored.exists())

        # слушатель потока видит плеер и может перематывать (Range -> 206)
        t = self.new_client("teacher1@academy.demo")
        page = t.get(f"/my/cohort/{self.cohort.id}/lesson/{self.lesson.id}").get_data(as_text=True)
        self.assertIn(f'<video src="{url}"', page)
        r = t.get(url, headers={"Range": "bytes=100-199"})
        self.assertEqual(r.status_code, 206)
        self.assertEqual(r.data, data[100:200])
        self.assertEqual(r.mimetype, "video/quicktime")
        r.close()

        # готовая версия .web.mp4 отдается вместо исходника
        (stored.parent / (stored.stem + ".web.mp4")).write_bytes(b"web")
        r = t.get(url)
        self.assertEqual((r.data, r.mimetype), (b"web", "video/mp4"))
        r.close()

        # чужой человек и выдуманное имя файла - 404
        outsider = User.query.filter_by(email="teacher1@academy.demo").first()
        self.assertEqual(self.new_client("customer@academy.demo").get(url).status_code, 404)
        self.assertEqual(t.get(f"/lesson-video/{self.lesson.id}/{'0' * 24}.mp4").status_code, 404)
        self.assertTrue(outsider)

        # страница Студии показывает загруженное видео; «убрать» удаляет файлы
        self.assertIn(url, self.m.get(f"/studio/lessons/{self.lesson.id}").get_data(as_text=True))
        self.m.post(f"/studio/lessons/{self.lesson.id}", data={"action": "remove_video"})
        db.session.refresh(self.lesson)
        self.assertFalse(any(v.startswith("/lesson-video/") for v in self.lesson.video_url.values()))
        self.assertFalse(stored.exists())

    def test_one_language_and_replace(self):
        f1, _ = self.upload(self.m)
        u1 = self.m.post(f"/studio/lessons/{self.lesson.id}/video", json={"file_id": f1, "lang": "kk"}).get_json()["url"]
        f2, _ = self.upload(self.m, "new.mp4")
        u2 = self.m.post(f"/studio/lessons/{self.lesson.id}/video", json={"file_id": f2, "lang": "kk"}).get_json()["url"]
        db.session.refresh(self.lesson)
        self.assertEqual(self.lesson.video_url["kk"], u2)
        self.assertNotEqual(self.lesson.video_url.get("ru"), u1)
        self.assertFalse((Path(self.upload_dir) / "videos" / u1.rsplit("/", 1)[1]).exists())  # старый файл удален

    def test_rejects_foreign_or_non_video_files(self):
        t = self.new_client("teacher1@academy.demo")
        fid, _ = self.upload(t)
        # чужой файл и не методист
        self.assertEqual(self.m.post(f"/studio/lessons/{self.lesson.id}/video", json={"file_id": fid}).status_code, 400)
        self.assertNotEqual(t.post(f"/studio/lessons/{self.lesson.id}/video", json={"file_id": fid}).status_code, 200)
        pdf, _ = self.upload(self.m, "plan.pdf")
        self.assertEqual(self.m.post(f"/studio/lessons/{self.lesson.id}/video", json={"file_id": pdf}).status_code, 400)

    def test_too_big_material_gives_friendly_message(self):
        self.app.config["MAX_CONTENT_LENGTH"] = 2000
        r = self.m.post(f"/studio/lessons/{self.lesson.id}", data={"action": "upload_material", "material": (
            __import__("io").BytesIO(b"x" * 5000), "video.mp4")}, content_type="multipart/form-data")
        self.assertEqual(r.status_code, 302)
        self.assertIn("50", self.m.get(r.headers["Location"]).get_data(as_text=True))
        self.assertTrue(Cohort.query.count())
