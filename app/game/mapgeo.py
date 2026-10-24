"""Геометрия карты пути сезона: точки маршрута на «поле» и плавная линия через них (SVG)."""
from __future__ import annotations


def _catmull(points: list[tuple[float, float]]) -> str:
    """Плавный путь через точки: кривая Катмулла-Рома, переведенная в кубические Безье."""
    if not points:
        return ""
    d = [f"M{points[0][0]:.1f},{points[0][1]:.1f}"]
    pts = [points[0], *points, points[-1]]
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}")
    return " ".join(d)


def wide(n: int) -> dict:
    """Змейка в три ряда для широкого экрана: 4 слева направо, 3 обратно, остальные снова вправо.
    На поворотах линия уходит за край ряда, чтобы не проходить по подписям этапов."""
    rows = [(90, [110, 330, 550, 770]), (260, [690, 470, 250]), (430, [300, 530, 760, 880])]
    turns = {3: [(905, 120), (905, 230)], 6: [(115, 290), (115, 400)]}  # после 4-го и 7-го этапа
    nodes: list[tuple[float, float]] = [(x, y) for y, xs in rows for x in xs][:n]
    route: list[list[tuple[float, float]]] = []  # точки маршрута до каждого этапа включительно
    pts: list[tuple[float, float]] = []
    for i, p in enumerate(nodes):
        pts.append(p)
        route.append(list(pts))
        pts.extend(turns.get(i, []) if i < n - 1 else [])
    return {"w": 1000, "h": 520, "nodes": nodes, "path": _catmull(route[-1]), "parts": [_catmull(r) for r in route]}


def tall(n: int) -> dict:
    """Для телефона: этапы столбиком слева, подписи справа от кружков."""
    pts = [(62.0, 62.0 + i * 100) for i in range(n)]
    return {"w": 360, "h": 62 + (n - 1) * 100 + 70, "nodes": pts, "path": _catmull(pts),
            "parts": [_catmull(pts[: i + 1]) for i in range(n)], "side": True}
