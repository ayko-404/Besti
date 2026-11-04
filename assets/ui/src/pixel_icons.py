# Пиксельные иконки папок прайса: сетка 20×20 клеток → SVG, показ 40 px (2 px на клетку).
# Запуск: python3 src/pixel_icons.py — перезаписывает assets/ui/icon-*.svg
import math, os
OUT = os.path.join(os.path.dirname(__file__), '..')
N = 20
PAL = {'K': '#2B1A17', 'W': '#FFFFFF', 'B': '#85231A', 'P': '#FFACE4', 'G': '#7E6A66', 'L': '#EBC3B6', 'T': '#B5786C'}

ICONS = {
 # маникюр: кисть тыльной стороной, большой палец слева, четыре пальца вверх, бордовый лак
 'manikyur': [
  "....................",
  "..........KK........",
  ".........KBBKKK.....",
  ".......KKKBBKBBK....",
  "......KBBKWWKBBK....",
  "......KBBKWWKWWKKK..",
  "......KWWKWWKWWKBBK.",
  "......KWWKWWKWWKBBK.",
  ".KKK..KWWKWWKWWKWWK.",
  "KBBBK.KWWKWWKWWKWWK.",
  "KWWWWKKWWKWWKWWKWWK.",
  ".KWWWWWWWWWWWWWWWWK.",
  "..KWWWWWWWWWWWWWWWK.",
  "...KWWWWWWWWWWWWWWK.",
  "....KWWWWWWWWWWWWWK.",
  ".....KWWWWWWWWWWWK..",
  "......KWWWWWWWWWK...",
  "......KWWWWWWWWWK...",
  "......KWWWWWWWWWK...",
  "......KKKKKKKKKKK...",
 ],
 # педикюр: ступня сверху, пять пальцев дугой, розовый лак, пятка внизу
 'pedikyur': [
  "....................",
  "..KKK...............",
  ".KPPPKKK............",
  ".KPPPKPPKKK.........",
  ".KWWWKPPKPPK........",
  ".KWWWKWWKPPKKK......",
  ".KWWWKWWKWWKPPK.....",
  ".KWWWKWWKWWKPPKKK...",
  ".KWWWKWWKWWKWWKPPK..",
  ".KWWWWWWWWWWWWWWWK..",
  ".KWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWK..",
  "...KWWWWWWWWWWWWWK..",
  "....KWWWWWWWWWWWWK..",
  "....KWWWWWWWWWWWK...",
  "....KWWWWWWWWWWWK...",
  "....KWWWWWWWWWWK....",
  ".....KWWWWWWWWWK....",
  "......KWWWWWWWK.....",
  ".......KKKKKKK......",
 ],
 # покрытие: флакон лака с крышкой
 'pokrytie': [
  "........KKKK........",
  "........KGKK........",
  "........KGKK........",
  "........KGKK........",
  "........KGKK........",
  "........KGKK........",
  "........KKKK........",
  ".......KKKKKK.......",
  ".....KKBBBBBBKK.....",
  "....KBBBBBBBBBBK....",
  "...KBBBBBBBBBBBBK...",
  "...KBPPBBBBBBBBBK...",
  "...KBPBBBBBBBBBBK...",
  "...KBPBBBBBBBBBBK...",
  "...KBPBBBBBBBBBBK...",
  "...KBBBBBBBBBBBBK...",
  "...KBBBBBBBBBBBBK...",
  "...KBBBBBBBBBBBBK...",
  "....KBBBBBBBBBBK....",
  ".....KKKKKKKKKK.....",
 ],
 # брови и ресницы: изогнутая бровь, ресницы, глаз с радужкой
 'brovi': [
  "....................",
  "....................",
  "......KKKKKKK.......",
  "....KKKKKKKKKKK.....",
  "...KKK.......KKKK...",
  "..KK............KK..",
  "....................",
  "....K....K....K.....",
  ".....K...K...K......",
  "......KKKKKKKK......",
  "....KKWWKKKKWWKK....",
  "...KWWWKBBBBKWWWK...",
  "..KWWWKBPPBBBKWWWK..",
  ".KWWWWKBPBBBBKWWWWK.",
  "..KWWWKBBBBBBKWWWK..",
  "...KWWWKBBBBKWWWK...",
  "....KKWWKKKKWWKK....",
  "......KKKKKKKK......",
  "....................",
  "....................",
 ],
}

def file_icon():
    # пилка по диагонали: шершавая полоса с закруглёнными концами
    g = [['.'] * N for _ in range(N)]
    ax, ay, bx, by = 4.0, 16.0, 16.0, 4.0
    for y in range(N):
        for x in range(N):
            px, py = x + .5, y + .5
            t = max(0, min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)))
            d = math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)))
            if d <= 2.3:
                g[y][x] = 'T' if (x + 2 * y) % 4 == 0 else 'L'
            elif d <= 3.15:
                g[y][x] = 'K'
    return [''.join(r) for r in g]
ICONS['ukreplenie'] = file_icon()

for name, rows in ICONS.items():
    assert len(rows) == N and all(len(r) == N for r in rows), (name, [len(r) for r in rows])
    rects = []
    for y, row in enumerate(rows):
        x = 0
        while x < N:
            c = row[x]
            if c == '.':
                x += 1; continue
            n = 1
            while x + n < N and row[x + n] == c:
                n += 1
            rects.append(f'<rect x="{x}" y="{y}" width="{n}" height="1" fill="{PAL[c]}"/>')
            x += n
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {N} {N}" width="40" height="40" shape-rendering="crispEdges">' + ''.join(rects) + '</svg>\n'
    open(os.path.join(OUT, f'icon-{name}.svg'), 'w').write(svg)
    print(name, len(rects), 'rects')
