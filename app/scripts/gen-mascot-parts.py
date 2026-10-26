"""Pépite v2 — génère les calques SVG en volume (style « peluche 3D », sans contours).

Usage :  python3 scripts/gen-mascot-parts.py src/mascot/parts

- Chaque calque est un fichier autonome : app/src/mascot/parts/<emplacement>/<nom>.svg
- Les dégradés partagés sont dans parts/_defs/defs.svg (référencés par url(#pp-…)).
- Les couleurs sont des variables CSS (--pp-…) avec une valeur de secours : le mode crise
  et le thème sombre les atténuent sans redessiner.
- Repère : viewBox 0 -10 200 215, tête centrée en (100, 84).
"""
import pathlib
import sys

OUT = pathlib.Path(sys.argv[1])
VB = '0 -10 200 215'

PAL = {
    'FUR1': ('fur-1', '#FFC98A'), 'FUR2': ('fur-2', '#FF9C4F'), 'FUR3': ('fur-3', '#F5762F'), 'FUR4': ('fur-4', '#D2561F'),
    'CREAM1': ('cream-1', '#FFFFFF'), 'CREAM2': ('cream-2', '#FFF3E4'), 'CREAM3': ('cream-3', '#EBD2BA'),
    'STRIPE1': ('stripe-1', '#73361D'), 'STRIPE2': ('stripe-2', '#4A2214'),
    'EAR1': ('ear-1', '#FFD9DF'), 'EAR2': ('ear-2', '#FF9DB1'),
    'EYE1': ('eye-1', '#46303A'), 'EYE2': ('eye-2', '#120A0E'),
    'IRIS1': ('iris-1', '#9A6148'), 'IRIS2': ('iris-2', '#2A1418'),
    'NOSE1': ('nose-1', '#FFB6C4'), 'NOSE2': ('nose-2', '#E8607F'),
    'MOUTH1': ('mouth-1', '#7A2638'), 'MOUTH2': ('mouth-2', '#3A0F1A'),
    'TONGUE1': ('tongue-1', '#FFAABB'), 'TONGUE2': ('tongue-2', '#EA5A7B'),
    'CHEEK': ('cheek', '#FF86A2'), 'SHADOW': ('shadow', '#3A2440'), 'WHITE': ('white', '#FFFFFF'),
    'INK': ('ink', '#2B1A1F'), 'PAD1': ('pad-1', '#FFC3CF'), 'PAD2': ('pad-2', '#F48BA2'),
    'LAV1': ('lav-1', '#DCD1FF'), 'LAV2': ('lav-2', '#8C78F6'),
    'MINT1': ('mint-1', '#B8F6E0'), 'MINT2': ('mint-2', '#2EC49A'),
    'SKY1': ('sky-1', '#D3EDFF'), 'SKY2': ('sky-2', '#56AEF0'),
    'GOLD1': ('gold-1', '#FFE9A3'), 'GOLD2': ('gold-2', '#FFAB2E'),
    'PEACH1': ('peach-1', '#FFDCC8'), 'PEACH2': ('peach-2', '#FF8866'),
    'PINK1': ('pink-1', '#FFB8CB'), 'PINK2': ('pink-2', '#FF5A8A'),
    'BROWN1': ('brown-1', '#D9A87A'), 'BROWN2': ('brown-2', '#8A5733'),
}


def c(tok):
    name, fb = PAL[tok]
    return f'var(--pp-{name},{fb})'


def stop(off, tok, op=1):
    return f'<stop offset="{off}" style="stop-color:{c(tok)};stop-opacity:{op}"/>'


def radial(id_, stops, cx=.38, cy=.3, r=.78, fx=None, fy=None):
    f = f' fx="{fx}" fy="{fy}"' if fx is not None else ''
    return f'<radialGradient id="pp-{id_}" cx="{cx}" cy="{cy}" r="{r}"{f}>{"".join(stops)}</radialGradient>'


def linear(id_, stops, x2=0, y2=1):
    return f'<linearGradient id="pp-{id_}" x1="0" y1="0" x2="{x2}" y2="{y2}">{"".join(stops)}</linearGradient>'


DEFS = ''.join([
    radial('fur', [stop(0, 'FUR1'), stop(.42, 'FUR2'), stop(.8, 'FUR3'), stop(1, 'FUR4')], .38, .28, .8, .32, .22),
    radial('cream', [stop(0, 'CREAM1'), stop(.55, 'CREAM2'), stop(1, 'CREAM3')], .42, .3, .8),
    linear('stripe', [stop(0, 'STRIPE1'), stop(1, 'STRIPE2')]),
    radial('ear', [stop(0, 'EAR1'), stop(1, 'EAR2')], .5, .75, .8),
    radial('eye', [stop(0, 'EYE1'), stop(1, 'EYE2')], .42, .32, .75),
    radial('iris', [stop(0, 'IRIS1', .95), stop(1, 'IRIS2', 0)], .5, .7, .6),
    radial('sclera', [stop(0, 'WHITE'), stop(1, 'CREAM3', .9)], .42, .3, .85),
    radial('nose', [stop(0, 'NOSE1'), stop(1, 'NOSE2')], .4, .25, .8),
    linear('mouth', [stop(0, 'MOUTH1'), stop(1, 'MOUTH2')]),
    radial('tongue', [stop(0, 'TONGUE1'), stop(1, 'TONGUE2')], .45, .3, .8),
    radial('cheek', [stop(0, 'CHEEK', .6), stop(1, 'CHEEK', 0)], .5, .5, .5),
    radial('sheen', [stop(0, 'WHITE', .65), stop(1, 'WHITE', 0)], .5, .5, .5),
    radial('ground', [stop(0, 'SHADOW', .28), stop(1, 'SHADOW', 0)], .5, .5, .5),
    radial('ao', [stop(0, 'STRIPE2', .3), stop(1, 'STRIPE2', 0)], .5, .5, .5),
    radial('pad', [stop(0, 'PAD1'), stop(1, 'PAD2')], .4, .3, .8),
    linear('tail', [stop(0, 'FUR2'), stop(1, 'FUR4')], 1, 1),
    radial('lav', [stop(0, 'LAV1'), stop(1, 'LAV2')], .35, .25, .9),
    radial('mint', [stop(0, 'MINT1'), stop(1, 'MINT2')], .35, .25, .9),
    radial('sky', [stop(0, 'SKY1'), stop(1, 'SKY2')], .35, .25, .9),
    radial('gold', [stop(0, 'GOLD1'), stop(1, 'GOLD2')], .35, .25, .9),
    radial('peach', [stop(0, 'PEACH1'), stop(1, 'PEACH2')], .35, .25, .9),
    radial('pink', [stop(0, 'PINK1'), stop(1, 'PINK2')], .35, .25, .9),
    radial('brown', [stop(0, 'BROWN1'), stop(1, 'BROWN2')], .35, .25, .9),
    linear('glass', [stop(0, 'WHITE', .75), stop(1, 'SKY1', .25)], 1, 1),
    linear('hat', [stop(0, 'LAV1'), stop(.55, 'PINK1'), stop(1, 'PINK2')], 1, 1),
])

U = lambda id_: f'url(#pp-{id_})'
INK = c('INK')


def mirror_x(x):
    return 200 - x


def sheen(cx, cy, rx, ry, rot=-20, op=1):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({rot} {cx} {cy})" fill="{U("sheen")}" opacity="{op}"/>'


def paw_front(cx, cy, r=12):
    """Patte vue de face : coussinet + 3 petits coussinets (toe beans)."""
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{U("fur")}"/>'
            + sheen(cx - 3, cy - 4, r * .5, r * .3, -20, .7)
            + f'<ellipse cx="{cx}" cy="{cy + 2.5}" rx="{r * .42}" ry="{r * .34}" fill="{U("pad")}"/>'
            + ''.join(f'<circle cx="{cx + dx}" cy="{cy - r * .38}" r="{r * .16}" fill="{U("pad")}"/>' for dx in (-r * .42, 0, r * .42)))


def limb(cx, cy, rx, ry, rot):
    return (f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({rot} {cx} {cy})" fill="{U("fur")}"/>'
            + f'<ellipse cx="{cx}" cy="{cy}" rx="{rx * .5}" ry="{ry * .5}" transform="rotate({rot} {cx} {cy}) translate({-rx * .35} {-ry * .35})" fill="{U("sheen")}" opacity=".45"/>')


def mitten(cx, cy, rx, ry, rot):
    """Bras le long du corps, bout de patte clair."""
    return (f'<ellipse cx="{cx}" cy="{cy + 3}" rx="{rx + 2}" ry="{ry}" transform="rotate({rot} {cx} {cy})" fill="{U("ao")}"/>'
            + limb(cx, cy, rx, ry, rot))


def tail(d, tip, rings):
    return (f'<path d="{d}" fill="none" stroke="{c("FUR4")}" stroke-width="14" stroke-linecap="round" opacity=".55" transform="translate(1.5 2)"/>'
            f'<path d="{d}" fill="none" stroke="{U("tail")}" stroke-width="13" stroke-linecap="round"/>'
            f'<path d="{d}" fill="none" stroke="{c("FUR1")}" stroke-width="3" stroke-linecap="round" opacity=".55" transform="translate(-2.5 -2.5)"/>'
            + ''.join(f'<path d="{r}" fill="none" stroke="{U("stripe")}" stroke-width="3.2" stroke-linecap="round" opacity=".8"/>' for r in rings)
            + f'<circle cx="{tip[0]}" cy="{tip[1]}" r="8.5" fill="{U("cream")}"/>'
            + sheen(tip[0] - 2, tip[1] - 3, 4, 2.5, -20, .8))


def sparkle(x, y, r, grad='gold'):
    k = r * .2
    return (f'<path d="M{x} {y - r} Q{x + k} {y - k} {x + r} {y} Q{x + k} {y + k} {x} {y + r} Q{x - k} {y + k} {x - r} {y} Q{x - k} {y - k} {x} {y - r}Z" fill="{U(grad)}"/>'
            + f'<circle cx="{x - r * .12}" cy="{y - r * .12}" r="{r * .16}" fill="{c("WHITE")}" opacity=".9"/>')


def heart(x, y, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="M0 9 C -15 -1, -11 -17, 0 -8 C 11 -17, 15 -1, 0 9Z" fill="{U("pink")}"/>'
            f'<ellipse cx="-5" cy="-6" rx="3.2" ry="2" transform="rotate(-30 -5 -6)" fill="{c("WHITE")}" opacity=".8"/></g>')


# ---------------- Tête ----------------
HEAD_PATH = ('M100 28 C 137 28, 165 51, 167 82 C 168 92, 166 99, 162 105 L 170 110 L 160 113 L 165 121 L 152 120 '
             'C 141 133, 122 139, 100 139 C 78 139, 59 133, 48 120 L 35 121 L 40 113 L 30 110 L 38 105 '
             'C 34 99, 32 92, 33 82 C 35 51, 63 28, 100 28 Z')


def ears():
    out = ''
    for m in (False, True):
        X = (lambda x: mirror_x(x)) if m else (lambda x: x)
        out += (f'<path d="M{X(50)} 62 C {X(42)} 38, {X(48)} 19, {X(63)} 16 C {X(76)} 14, {X(87)} 27, {X(93)} 40 Z" fill="{U("fur")}"/>'
                f'<path d="M{X(59)} 54 C {X(55)} 38, {X(59)} 28, {X(66)} 26 C {X(73)} 25, {X(80)} 33, {X(85)} 41 Z" fill="{U("ear")}"/>')
    return out


def stripe(d):
    return f'<path d="{d}" fill="{U("stripe")}" opacity=".92"/>'


HEAD = (
    ears()
    + f'<path d="{HEAD_PATH}" fill="{U("fur")}"/>'
    # front : trois rayures effilées
    + stripe('M100 32 C 95.5 40, 95.5 50, 100 59 C 104.5 50, 104.5 40, 100 32Z')
    + stripe('M83 35 C 78.5 42, 80 51, 87 56 C 87.5 49, 87 42, 83 35Z')
    + stripe(f'M{mirror_x(83)} 35 C {mirror_x(78.5)} 42, {mirror_x(80)} 51, {mirror_x(87)} 56 C {mirror_x(87.5)} 49, {mirror_x(87)} 42, {mirror_x(83)} 35Z')
    # joues : rayures latérales
    + stripe('M37 82 C 46 82, 54 85, 59 91 C 52 91.5, 43 90, 37 82Z')
    + stripe('M39 97 C 47 97, 54 99.5, 58 104 C 51 104.5, 44 103, 39 97Z')
    + stripe(f'M{mirror_x(37)} 82 C {mirror_x(46)} 82, {mirror_x(54)} 85, {mirror_x(59)} 91 C {mirror_x(52)} 91.5, {mirror_x(43)} 90, {mirror_x(37)} 82Z')
    + stripe(f'M{mirror_x(39)} 97 C {mirror_x(47)} 97, {mirror_x(54)} 99.5, {mirror_x(58)} 104 C {mirror_x(51)} 104.5, {mirror_x(44)} 103, {mirror_x(39)} 97Z')
    # taches claires au-dessus des yeux
    + f'<ellipse cx="77" cy="66" rx="8" ry="4.5" fill="{U("cream")}" opacity=".85"/>'
    + f'<ellipse cx="123" cy="66" rx="8" ry="4.5" fill="{U("cream")}" opacity=".85"/>'
    # masque clair du museau
    + f'<path d="M68 102 C 67 88, 84 84, 100 93 C 116 84, 133 88, 132 102 C 133 119, 118 131, 100 131 C 82 131, 67 119, 68 102Z" fill="{U("cream")}"/>'
    # reflet (volume)
    + sheen(76, 50, 30, 15, -22, .85)
    # joues roses
    + f'<ellipse cx="60" cy="106" rx="13" ry="8" fill="{U("cheek")}"/>'
    + f'<ellipse cx="140" cy="106" rx="13" ry="8" fill="{U("cheek")}"/>'
    # moustaches (points)
    + ''.join(f'<circle cx="{x}" cy="{y}" r="1.7" fill="{c("CREAM3")}"/>' for x, y in [(86, 110), (81, 105), (114, 110), (119, 105)])
    # nez
    + f'<path d="M92.5 97 Q100 92.5 107.5 97 Q105.5 104.5 100 106.5 Q94.5 104.5 92.5 97Z" fill="{U("nose")}"/>'
    + f'<ellipse cx="97.6" cy="97.4" rx="2.6" ry="1.3" fill="{c("WHITE")}" opacity=".75"/>'
)

# ---------------- Yeux ----------------


def eye_open(x, cy=84):
    return (f'<ellipse cx="{x}" cy="{cy}" rx="11.2" ry="13.2" fill="{U("eye")}"/>'
            f'<ellipse cx="{x}" cy="{cy + 3}" rx="8" ry="9" fill="{U("iris")}"/>'
            f'<ellipse cx="{x + 3.6}" cy="{cy - 5.4}" rx="4.4" ry="5.1" fill="{c("WHITE")}"/>'
            f'<circle cx="{x - 3.8}" cy="{cy + 5.6}" r="1.9" fill="{c("WHITE")}" opacity=".85"/>'
            f'<path d="M{x - 6.5} {cy + 8.6} Q{x} {cy + 12.6} {x + 6.5} {cy + 8.6}" fill="none" stroke="{c("WHITE")}" stroke-width="1.4" stroke-linecap="round" opacity=".3"/>')


ARC = f'fill="none" stroke="{INK}" stroke-linecap="round"'

EYES = {
    'open': ''.join(eye_open(x) for x in (79, 121)),
    'happy': ''.join(f'<path d="M{x - 10} 89 Q{x} 74 {x + 10} 89" {ARC} stroke-width="5.5"/>' for x in (79, 121)),
    'closed': ''.join(f'<path d="M{x - 10} 84 Q{x} 93.5 {x + 10} 84" {ARC} stroke-width="4.6"/>' for x in (79, 121)),
    'soft': ''.join(f'<path d="M{x - 10} 85 Q{x} 94 {x + 10} 85" {ARC} stroke-width="4.6"/>'
                    f'<path d="M{x - 10 if x < 100 else x + 10} 85 l{-4 if x < 100 else 4} 1.5" {ARC} stroke-width="3"/>' for x in (79, 121)),
    'heavy': ''.join(f'<path d="M{x - 9.5} 85 L{x + 9.5} 85 Q{x + 9.5} 96 {x} 96 Q{x - 9.5} 96 {x - 9.5} 85Z" fill="{U("eye")}"/>'
                     f'<circle cx="{x + 3}" cy="89" r="2.2" fill="{c("WHITE")}"/>'
                     for x in (79, 121))
             + f'<path d="M66 89 Q76 82 91 85 M109 85 Q124 82 134 89" {ARC} stroke-width="3.6"/>',
    'up': ''.join(f'<ellipse cx="{x}" cy="84" rx="11.2" ry="13.2" fill="{U("sclera")}"/>'
                  f'<circle cx="{x + 1.5}" cy="78.5" r="7.4" fill="{U("eye")}"/>'
                  f'<circle cx="{x + 3.6}" cy="76" r="2.5" fill="{c("WHITE")}"/>' for x in (79, 121)),
}

BROWS = {
    'raised': f'<path d="M69 66 q9 -5 18 0" fill="none" stroke="{U("stripe")}" stroke-width="4" stroke-linecap="round"/>'
              f'<path d="M113 59 q9 -7 18 -1" fill="none" stroke="{U("stripe")}" stroke-width="4" stroke-linecap="round"/>',
    'soft': f'<path d="M70 68 q8 -4 16 -2 M114 66 q8 -2 16 2" fill="none" stroke="{U("stripe")}" stroke-width="3.6" stroke-linecap="round" opacity=".85"/>',
}

MOUTHS = {
    'smile': f'<path d="M88.5 112 Q94.3 118.5 100 112.6 Q105.7 118.5 111.5 112" fill="none" stroke="{c("MOUTH2")}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    'grin': f'<path d="M86 111 Q100 134 114 111 Q100 115.5 86 111Z" fill="{U("mouth")}"/>'
            f'<ellipse cx="100" cy="123.5" rx="7" ry="4.3" fill="{U("tongue")}"/>'
            f'<path d="M90 112.5 Q100 116 110 112.5" fill="none" stroke="{c("WHITE")}" stroke-width="2" stroke-linecap="round" opacity=".9"/>',
    'small': f'<path d="M94 113 Q100 118.5 106 113" fill="none" stroke="{c("MOUTH2")}" stroke-width="3" stroke-linecap="round"/>',
    'o': f'<ellipse cx="100" cy="117" rx="5" ry="6" fill="{U("mouth")}"/><ellipse cx="100" cy="120" rx="3" ry="2" fill="{U("tongue")}"/>',
    'flat': f'<path d="M93 115 Q100 117 107 115" fill="none" stroke="{c("MOUTH2")}" stroke-width="3" stroke-linecap="round"/>',
}

# ---------------- Corps ----------------
GROUND = f'<ellipse cx="100" cy="201" rx="54" ry="7" fill="{U("ground")}"/>'


def feet():
    out = ''
    for x in (80, 120):
        out += (f'<ellipse cx="{x}" cy="193" rx="16" ry="9" fill="{U("fur")}"/>'
                + sheen(x - 4, 190, 6, 2.6, 0, .6)
                + f'<ellipse cx="{x}" cy="196" rx="6" ry="3.2" fill="{U("pad")}"/>'
                + ''.join(f'<circle cx="{x + dx}" cy="192" r="1.6" fill="{U("pad")}"/>' for dx in (-6, 0, 6)))
    return out


def side_stripes(left=60, right=140):
    out = ''
    for y in (158, 172):
        out += stripe(f'M{left + 1} {y} C {left + 7} {y - 1}, {left + 13} {y + 1}, {left + 16} {y + 4} C {left + 11} {y + 5}, {left + 5} {y + 4}, {left + 1} {y}Z')
        out += stripe(f'M{right - 1} {y} C {right - 7} {y - 1}, {right - 13} {y + 1}, {right - 16} {y + 4} C {right - 11} {y + 5}, {right - 5} {y + 4}, {right - 1} {y}Z')
    return out


BODY = {
    'sit': GROUND
    + f'<path d="M59 172 C 57 145, 76 127, 100 127 C 124 127, 143 145, 141 172 C 140 189, 122 197, 100 197 C 78 197, 60 189, 59 172Z" fill="{U("fur")}"/>'
    + f'<ellipse cx="100" cy="133" rx="40" ry="9" fill="{U("ao")}"/>'
    + f'<path d="M78 169 C 78 151, 88 142, 100 142 C 112 142, 122 151, 122 169 C 122 183, 112 191, 100 191 C 88 191, 78 183, 78 169Z" fill="{U("cream")}"/>'
    + side_stripes() + feet(),
    'proud': GROUND
    + f'<path d="M55 170 C 53 141, 74 123, 100 123 C 126 123, 147 141, 145 170 C 144 189, 124 197, 100 197 C 76 197, 56 189, 55 170Z" fill="{U("fur")}"/>'
    + f'<ellipse cx="100" cy="129" rx="42" ry="9" fill="{U("ao")}"/>'
    + f'<path d="M74 164 C 74 145, 86 136, 100 136 C 114 136, 126 145, 126 164 C 126 181, 114 190, 100 190 C 86 190, 74 181, 74 164Z" fill="{U("cream")}"/>'
    + sheen(88, 148, 10, 5, -25, .9)
    + side_stripes(56, 144) + feet(),
    'curled': f'<ellipse cx="106" cy="196" rx="74" ry="8" fill="{U("ground")}"/>'
    + f'<ellipse cx="108" cy="168" rx="67" ry="28" fill="{U("fur")}"/>'
    + sheen(98, 152, 34, 8, -4, .8)
    + ''.join(stripe(f'M{x} 141 C {x + 5} 148, {x + 5} 154, {x + 1} 160 C {x - 2} 154, {x - 2} 148, {x} 141Z') for x in (100, 120, 140))
    + stripe('M158 150 C 162 155, 163 160, 160 165 C 157 161, 156 156, 158 150Z'),
}

# ---------------- Bras ----------------
ARMS = {
    'down': mitten(67, 159, 11.5, 20, 16) + mitten(133, 159, 11.5, 20, -16),
    'wave': mitten(67, 159, 11.5, 20, 16) + limb(156, 125, 10.5, 30, 37) + paw_front(175, 96)
    + '<path d="M189 80 q6 8 2 18 M196 72 q8 11 3 23" fill="none" stroke="' + c('GOLD2') + '" stroke-width="3" stroke-linecap="round" opacity=".7"/>',
    'open': limb(48, 128, 10.5, 28, -40) + paw_front(31, 104) + limb(152, 128, 10.5, 28, 40) + paw_front(169, 104),
    'hold': ''.join(f'<ellipse cx="{x}" cy="163" rx="14" ry="10" fill="{U("ao")}"/><ellipse cx="{x}" cy="160" rx="13" ry="11" fill="{U("fur")}"/>'
                    + sheen(x - 3, 156, 5, 3, -20, .6)
                    + ''.join(f'<path d="M{x + dx} 166 v-3.5" stroke="{c("FUR4")}" stroke-width="2" stroke-linecap="round" opacity=".6"/>' for dx in (-4, 0, 4))
                    for x in (82, 118)),
    'chin': mitten(67, 159, 11.5, 20, 16) + limb(129, 140, 9, 15, -28) + paw_front(122, 125, 10.5),
}

# ---------------- Queue ----------------
TAILS = {
    'up': tail('M138 176 C 172 176, 182 150, 173 120', (173, 117), ['M159 169 q5 1 7 -5', 'M171 153 q5 3 10 -1', 'M172 136 q5 3 9 0']),
    'down': tail('M138 182 C 158 192, 176 191, 186 178', (187, 175), ['M157 184 q3 4 3 9', 'M171 183 q3 3 4 8']),
    'curled': tail('M168 172 C 172 198, 92 203, 58 189', (55, 188), ['M143 189 q-3 4 -2 9', 'M115 192 q-3 4 -2 9', 'M88 191 q-3 4 -2 9']),
}

# ---------------- Accessoires ----------------
ACC = {
    'stars': sparkle(34, 58, 12) + sparkle(168, 44, 14) + sparkle(178, 120, 8, 'lav') + sparkle(26, 130, 7, 'pink'),
    'party-hat': '<g transform="rotate(14 104 40)">'
    + f'<path d="M81 43 L104 -3 L127 43 Q104 50 81 43Z" fill="{U("hat")}"/>'
    + f'<path d="M92 22 Q104 26 116 22 M86 34 Q104 39 122 34" fill="none" stroke="{c("WHITE")}" stroke-width="3" stroke-linecap="round" opacity=".7"/>'
    + sheen(96, 18, 4, 10, 25, .7)
    + f'<circle cx="104" cy="-4" r="7.5" fill="{U("gold")}"/><circle cx="101.5" cy="-6.5" r="2.2" fill="{c("WHITE")}" opacity=".85"/></g>',
    'confetti': ''.join(f'<rect x="{x}" y="{y}" width="8" height="4.5" rx="2" fill="{U(g)}" transform="rotate({r} {x} {y})"/>' for x, y, r, g in
                        [(22, 30, 30, 'lav'), (40, 6, -20, 'sky'), (158, 12, 40, 'mint'), (178, 58, -30, 'gold'), (12, 90, 60, 'gold'), (184, 100, 20, 'pink'), (28, 150, -40, 'sky'), (172, 146, 70, 'lav')])
    + ''.join(f'<circle cx="{x}" cy="{y}" r="3.2" fill="{U(g)}"/>' for x, y, g in [(60, 2, 'pink'), (146, 0, 'sky'), (8, 60, 'mint'), (194, 82, 'lav')]),
    'detective-hat': f'<path d="M48 50 Q100 -8 152 50 Q100 40 48 50Z" fill="{U("brown")}"/>'
    + f'<path d="M82 30 L85 45 M100 22 L100 44 M118 30 L115 45 M64 40 Q100 30 136 40" fill="none" stroke="{c("BROWN2")}" stroke-width="2" stroke-linecap="round" opacity=".45"/>'
    + sheen(84, 22, 16, 6, -15, .6)
    + f'<path d="M42 52 Q100 37 158 52" fill="none" stroke="{c("BROWN2")}" stroke-width="6" stroke-linecap="round"/>'
    + f'<circle cx="100" cy="21" r="4.5" fill="{U("brown")}"/>',
    'magnifier': f'<path d="M146 141 L133 162" stroke="{U("brown")}" stroke-width="10" stroke-linecap="round"/>'
    + f'<circle cx="157" cy="122" r="20" fill="{U("glass")}" stroke="{U("gold")}" stroke-width="6"/>'
    + f'<path d="M146 113 q5 -7 13 -7" fill="none" stroke="{c("WHITE")}" stroke-width="3.6" stroke-linecap="round" opacity=".9"/>',
    'glasses': ''.join(f'<circle cx="{x}" cy="84" r="16.5" fill="{U("glass")}" fill-opacity=".35" stroke="{INK}" stroke-width="3.4"/>'
                       f'<path d="M{x - 9} 76 q4 -4 9 -4" fill="none" stroke="{c("WHITE")}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>' for x in (79, 121))
    + f'<path d="M95.5 82 Q100 77 104.5 82 M62.5 80 L46 75 M137.5 80 L154 75" fill="none" stroke="{INK}" stroke-width="3.4" stroke-linecap="round"/>',
    'blanket': f'<path d="M58 140 C 70 128, 86 126, 100 130 C 114 126, 130 128, 142 140 C 152 152, 156 172, 156 188 C 146 194, 138 189, 128 195 C 118 200, 110 193, 100 198 C 90 193, 82 200, 72 195 C 62 189, 54 194, 44 188 C 44 172, 48 152, 58 140Z" fill="{U("lav")}"/>'
    + sheen(80, 145, 22, 6, -18, .75)
    + f'<path d="M70 150 C 66 165, 66 178, 70 192 M130 150 C 134 165, 134 178, 130 192" fill="none" stroke="{c("LAV2")}" stroke-width="3" stroke-linecap="round" opacity=".35"/>'
    + ''.join(f'<path d="M{x} 160 l3 4 l3 -4 M{x} 172 l3 4 l3 -4" fill="none" stroke="{c("WHITE")}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>' for x in (80, 114)),
    'hot-water-bottle': f'<rect x="81" y="146" width="38" height="40" rx="15" fill="{U("peach")}"/>'
    + sheen(92, 155, 7, 4, -25, .8) + heart(100, 168, .55),
    'pillow': f'<path d="M69 149 Q100 138 131 149 Q140 166 131 183 Q100 192 69 183 Q60 166 69 149Z" fill="{U("sky")}"/>'
    + sheen(88, 155, 14, 5, -8, .8)
    + f'<path d="M79 158 q21 -4 42 0" fill="none" stroke="{c("WHITE")}" stroke-width="2.6" stroke-linecap="round" opacity=".6"/>',
    'heart': heart(160, 34, 1.35) + heart(38, 50, .85),
    'zzz': ''.join(f'<text x="{x}" y="{y}" font-family="Fraunces Variable, Georgia, serif" font-weight="800" font-size="{s}" fill="{U("lav")}">z</text>'
                   for x, y, s in [(128, 100, 18), (146, 78, 25), (166, 52, 32)]),
    'shine': sparkle(150, 106, 7) + sparkle(46, 106, 6),
}

PARTS = {'_defs/defs': f'<defs>{DEFS}</defs>', 'head/base': HEAD}
PARTS.update({f'eyes/{k}': v for k, v in EYES.items()})
PARTS.update({f'brows/{k}': v for k, v in BROWS.items()})
PARTS.update({f'mouth/{k}': v for k, v in MOUTHS.items()})
PARTS.update({f'body/{k}': v for k, v in BODY.items()})
PARTS.update({f'arms/{k}': v for k, v in ARMS.items()})
PARTS.update({f'tail/{k}': v for k, v in TAILS.items()})
PARTS.update({f'acc/{k}': v for k, v in ACC.items()})

for key, body in PARTS.items():
    path = OUT / f'{key}.svg'
    path.parent.mkdir(parents=True, exist_ok=True)
    # Chaque fichier embarque les dégradés pour rester visible seul dans un éditeur SVG.
    defs = '' if key == '_defs/defs' else f'<defs>{DEFS}</defs>\n'
    path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}">\n{defs if key != "_defs/defs" else ""}{body}\n</svg>\n')
print(len(PARTS), 'calques écrits dans', OUT)
