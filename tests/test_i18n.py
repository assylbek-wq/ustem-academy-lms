"""Полнота переводов: каждый ключ из шаблонов и кода есть в словаре на трех языках."""
import pathlib
import re
import unittest

from app.i18n_strings import STRINGS

ROOT = pathlib.Path(__file__).resolve().parent.parent / "app"
KEY_RE = re.compile(r"""\bt\(\s*['"]([a-z_][\w.\-]*[\w])['"]\s*[,)]""")


def used_keys() -> set[str]:
    keys = set()
    for p in list(ROOT.rglob("*.html")) + list(ROOT.rglob("*.py")):
        keys |= set(KEY_RE.findall(p.read_text(encoding="utf-8")))
    return keys


class I18nTest(unittest.TestCase):
    def test_all_used_keys_exist(self):
        missing = sorted(k for k in used_keys() if k not in STRINGS)
        self.assertEqual(missing, [])

    def test_dynamic_key_families(self):
        """Ключи, которые шаблоны собирают из частей (статусы, роли, направления, журнал)."""
        from app.models import DIRECTIONS, EVIDENCE_KINDS, LESSON_KINDS, ROLES
        from app.blueprints.admin import CUSTOMER_KINDS
        fam = {
            "status": ("todo", "submitted", "returned", "accepted"), "enr": ("active", "completed", "dropped"),
            "cstatus": ("planned", "active", "finished"), "pstatus": ("draft", "published", "archived"),
            "cert": ("valid", "revoked"), "lead": ("new", "in_progress", "done"), "session": ("intensive", "online"),
            "dir": DIRECTIONS, "role": ROLES, "ckind": CUSTOMER_KINDS,
        }
        keys = [f"{p}.{v}" for p, vals in fam.items() for v in vals]
        keys += [f"role.{r}_hint" for r in ROLES]
        keys += [f"lesson.kind_{k}" for k in LESSON_KINDS] + [f"assignment.kind_{k}" for k in EVIDENCE_KINDS]
        keys += [f"level.{x}_{n}" for x in ("name", "desc") for n in range(1, 5)]
        keys += [f"pub.step{n}_{x}" for n in range(1, 6) for x in ("t", "d")] + [f"pub.request_b{n}" for n in range(1, 4)]
        keys += [f"err.{c}" for c in (400, 403, 404, 409, 413, 500)]
        variants = {"enrollment.{action}": ("drop", "restore"), "certificate.{action}": ("revoke", "restore"),
                    "evidence.{decision}": ("accepted", "returned")}
        for path in ROOT.rglob("*.py"):
            for a in re.findall(r"""\baudit\(\s*f?['"]([\w.{}]+)['"]""", path.read_text(encoding="utf-8")):
                for v in variants.get(a, (None,)):
                    keys.append("audit." + (a.split("{")[0] + v if v else a))
        self.assertEqual(sorted(set(keys) - set(STRINGS)), [])

    def test_all_languages_filled(self):
        empty = [(k, l) for k, v in STRINGS.items() for l in ("ru", "kk", "en") if not v.get(l)]
        self.assertEqual(empty, [])

    def test_russian_style(self):
        """В русских текстах без буквы «ё» и без длинного тире."""
        bad = [k for k, v in STRINGS.items() if re.search("[ёЁ—]", v["ru"])]
        self.assertEqual(bad, [])

    def test_placeholders_match(self):
        bad = []
        for k, v in STRINGS.items():
            ref = set(re.findall(r"{(\w+)}", v["ru"]))
            for l in ("kk", "en"):
                if set(re.findall(r"{(\w+)}", v[l])) != ref:
                    bad.append((k, l))
        self.assertEqual(bad, [])


if __name__ == "__main__":
    unittest.main()
