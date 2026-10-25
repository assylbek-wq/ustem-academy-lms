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
    """Змейка для широкого экрана: ряды по 4 этапа, направление чередуется (сколько угодно этапов).
    На поворотах линия уходит за край ряда, чтобы не проходить по подписям этапов."""
    per, row_h, top = 4, 170, 90
    xs = [120, 340, 560, 780]
    nodes: list[tuple[float, float]] = []
    for i in range(n):
        r, c = divmod(i, per)
        nodes.append((xs[c] if r % 2 == 0 else xs[per - 1 - c], top + r * row_h))
    route: list[list[tuple[float, float]]] = []
    pts: list[tuple[float, float]] = []
    for i, p in enumerate(nodes):
        pts.append(p)
        route.append(list(pts))
        if i < n - 1 and (i + 1) % per == 0:  # поворот на следующий ряд
            r = i // per
            x = 905 if r % 2 == 0 else 95
            pts.extend([(x, p[1] + 30), (x, p[1] + row_h - 30)])
    rows = (n + per - 1) // per or 1
    return {"w": 1000, "h": top + (rows - 1) * row_h + 90, "nodes": nodes,
            "path": _catmull(route[-1]) if route else "", "parts": [_catmull(r) for r in route]}


def tall(n: int) -> dict:
    """Для телефона: этапы столбиком слева, подписи справа от кружков."""
    pts = [(62.0, 62.0 + i * 100) for i in range(n)]
    return {"w": 360, "h": 62 + (n - 1) * 100 + 70, "nodes": pts, "path": _catmull(pts),
            "parts": [_catmull(pts[: i + 1]) for i in range(n)], "side": True}
