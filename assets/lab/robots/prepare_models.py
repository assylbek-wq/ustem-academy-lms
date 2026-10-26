"""Модели Unitree Go2 и G1 из MuJoCo Menagerie для браузера: python3 assets/lab/robots/prepare_models.py <путь к mujoco_menagerie>.

Что делает:
- упрощает крупные сетки (меши) и сохраняет их в компактном двоичном формате MuJoCo .msh (вершины и индексы):
  модель весит 2-4 МБ, а не 30-40;
- G1: приводы position заменяет на motor с пределами момента из actuatorfrcrange, чтобы ПД-регулятор считала
  программа, как в unitree_sdk2 (q, dq, kp, kd, tau), и отключает столкновения звеньев робота между собой
  (с полом столкновения остаются) - так симуляция быстрее в браузере;
- упаковывает scene.xml, модель и сетки в один файл <робот>.pack и кладет рядом LICENSE Unitree (BSD-3-Clause)
  в app/static/robots/<робот>/.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

import fast_simplification
import numpy as np
import trimesh

OUT = Path(__file__).resolve().parents[3] / "app" / "static" / "robots"
# сколько треугольников оставить: не меньше TARGET и не меньше доли KEEP от исходного. Go2 не упрощаем: детали из двух
# слоев (серый и белый, металл и пластик): при сильном упрощении слои прорастают друг через друга
TARGET_FACES = {"go2": 6000, "g1": 5000}
KEEP = {"go2": 1.0, "g1": 0.15}

SCENE = """<mujoco model="{name} scene">
  <include file="{model}"/>
  <statistic center="0 0 0.3" extent="1.2"/>
  <visual>
    <headlight diffuse="0.6 0.6 0.6" ambient="0.3 0.3 0.3" specular="0 0 0"/>
    <global azimuth="-130" elevation="-20" offwidth="1280" offheight="720"/>
  </visual>
  <worldbody>
    <light pos="0 0 3" dir="0 0 -1" directional="true"/>
    <geom name="floor" size="0 0 0.05" type="plane" rgba="0.82 0.85 0.88 1" contype="1" conaffinity="3"/>
  </worldbody>
</mujoco>
"""


def write_msh(dst: Path, mesh: trimesh.Trimesh) -> None:
    """Формат MSH MuJoCo: int32 nvertex, nnormal, ntexcoord, nface; float32 вершины; int32 треугольники."""
    v = np.asarray(mesh.vertices, dtype="<f4")
    f = np.asarray(mesh.faces, dtype="<i4")
    dst.write_bytes(np.array([len(v), 0, 0, len(f)], dtype="<i4").tobytes() + v.tobytes() + f.tobytes())


def simplify(src: Path, dst: Path, target: int) -> tuple[int, int]:
    mesh = trimesh.load(src, force="mesh", process=True)
    faces0 = len(mesh.faces)
    if faces0 > target:
        ratio = 1 - target / faces0
        v, f = fast_simplification.simplify(np.asarray(mesh.vertices, dtype=np.float32), np.asarray(mesh.faces), target_reduction=ratio)
        mesh = trimesh.Trimesh(vertices=v, faces=f, process=True)
    write_msh(dst, mesh)
    return faces0, len(mesh.faces)


def prepare(menagerie: Path, robot: str, src_dir: str, model_file: str) -> None:
    src = menagerie / src_dir
    out = OUT / robot
    if out.exists():
        shutil.rmtree(out)
    (out / "assets").mkdir(parents=True)
    xml = (src / model_file).read_text(encoding="utf-8")
    total0 = total1 = 0
    for m in re.finditer(r'<mesh\b[^>]*file="([^"]+)"', xml):
        f = m.group(1)
        stem = Path(f).stem
        n0 = len(trimesh.load(src / "assets" / f, force="mesh", process=False).faces)
        a, b = simplify(src / "assets" / f, out / "assets" / f"{stem}.msh", max(TARGET_FACES[robot], int(n0 * KEEP[robot])))
        total0 += a; total1 += b
        xml = xml.replace(f'file="{f}"', f'file="{stem}.msh"')
    if robot == "g1":
        # ПД считает программа: моторы с пределом момента сустава
        xml = xml.replace('<position kp="500" dampratio="1" inheritrange="1"/>', "<motor/>")
        ranges = dict(re.findall(r'<joint name="([^"]+)"[^>]*actuatorfrcrange="([^"]+)"', xml))
        def motor(m):
            name, joint = m.group(1), m.group(2)
            lo, hi = ranges.get(joint, "-50 50").split()
            return f'<motor class="g1" name="{name}" joint="{joint}" ctrlrange="{lo} {hi}"/>'
        xml = re.sub(r'<position class="g1" name="([^"]+)" joint="([^"]+)"/>', motor, xml)
        # звенья не сталкиваются друг с другом, только с полом
        xml = xml.replace('<geom group="3" type="mesh"/>', '<geom group="3" type="mesh" contype="2" conaffinity="1"/>')
        xml = xml.replace('<geom type="sphere" size="0.005" priority="1" friction="0.6" condim="3"/>',
                          '<geom type="sphere" size="0.005" priority="1" friction="0.8" condim="3" contype="2" conaffinity="1"/>')
        xml = re.sub(r'\s*<light [^>]*/>', "", xml, count=1)
    if robot == "go2":
        xml = xml.replace('<geom group="3"/>', '<geom group="3" contype="2" conaffinity="1"/>')
    (out / model_file).write_text(xml, encoding="utf-8")
    (out / "scene.xml").write_text(SCENE.format(name=robot, model=model_file), encoding="utf-8")
    shutil.copy(src / "LICENSE", out / "LICENSE")
    # один файл вместо десятков запросов: [4 байта длина заголовка][заголовок JSON][данные файлов подряд]
    files = sorted(p for p in out.rglob("*") if p.is_file() and p.suffix in (".xml", ".msh"))
    blobs, index, off = [], [], 0
    for p in files:
        b = p.read_bytes()
        index.append({"name": str(p.relative_to(out)), "off": off, "len": len(b)})
        blobs.append(b); off += len(b)
    head = json.dumps({"model": model_file, "files": index}, ensure_ascii=False).encode()
    (out / f"{robot}.pack").write_bytes(len(head).to_bytes(4, "little") + head + b"".join(blobs))
    for p in files:
        p.unlink()
    (out / "assets").rmdir()
    size = sum(p.stat().st_size for p in out.rglob("*") if p.is_file())
    print(f"{robot}: треугольников {total0} -> {total1}, {size / 1e6:.1f} МБ")


if __name__ == "__main__":
    root = Path(sys.argv[1])
    prepare(root, "go2", "unitree_go2", "go2.xml")
    prepare(root, "g1", "unitree_g1", "g1.xml")
