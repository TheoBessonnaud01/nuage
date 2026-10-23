"""Génère les calques SVG de Pépite dans app/src/mascot/parts/<slot>/<name>.svg.

Couleurs écrites en jetons (FUR, LINE…) remplacés par var(--pp-xxx, #fallback)
pour que chaque fichier reste visible seul dans un éditeur SVG.
"""
import sys, pathlib

OUT = pathlib.Path(sys.argv[1])
PAL = {
    'FUR': ('fur', '#F2A766'),
    'CREAM': ('cream', '#FFF1DC'),
    'STRIPE': ('stripe', '#7A4A2E'),
    'LINE': ('line', '#5A3A2A'),
    'CHEEK': ('cheek', '#F4A6A0'),
    'EAR': ('inner-ear', '#F6C1B5'),
    'EYE': ('eye', '#3A2A22'),
    'NOSE': ('nose', '#C9706B'),
    'MOUTH': ('mouth', '#8A3B3B'),
    'TONGUE': ('tongue', '#F08A8A'),
    'GOLD': ('gold', '#F5C66B'),
    'LAV': ('lavande', '#C5BAE0'),
    'SKY': ('ciel', '#C4DEEE'),
    'SAGE': ('sauge', '#8FA98F'),
    'PEACH': ('peche', '#F4C4AA'),
    'BROWN': ('brun', '#B98B5E'),
    'WHITE': ('white', '#FFFFFF'),
    'ZZZ': ('zzz', '#7A6A60'),
}
VB = '0 -10 200 215'
O = 'stroke="LINE" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"'
S = 'fill="none" stroke="STRIPE" stroke-width="4.5" stroke-linecap="round"'


def mirror(d_left):
    return d_left  # (miroirs écrits à la main ci-dessous)


def tube(d, outer=19, inner=11, color='FUR'):
    return (f'<path d="{d}" fill="none" stroke="LINE" stroke-width="{outer}" stroke-linecap="round"/>'
            f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{inner}" stroke-linecap="round"/>')


def paw(cx, cy, r=12):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="FUR" {O}/>'
            f'<path d="M{cx-4} {cy+r-5} v-4 M{cx+4} {cy+r-5} v-4" {S.replace("4.5", "2.5")}/>')


def sparkle(x, y, r, color='GOLD'):
    k = r * 0.22
    return (f'<path d="M{x} {y-r} Q{x+k} {y-k} {x+r} {y} Q{x+k} {y+k} {x} {y+r} '
            f'Q{x-k} {y+k} {x-r} {y} Q{x-k} {y-k} {x} {y-r}Z" fill="{color}" stroke="LINE" stroke-width="2.5" stroke-linejoin="round"/>')


def heart(x, y, s=1.0, color='TONGUE'):
    return (f'<path transform="translate({x} {y}) scale({s})" d="M0 8 C -14 -2, -10 -16, 0 -8 C 10 -16, 14 -2, 0 8Z" '
            f'fill="{color}" stroke="LINE" stroke-width="{3/s:.1f}" stroke-linejoin="round"/>')


PARTS = {
    # ---------- QUEUE ----------
    'tail/up': tube('M138 174 C 170 174, 180 150, 172 120')
        + '<path d="M162 168 l6 -6 M175 148 l8 -1" stroke="STRIPE" stroke-width="5" stroke-linecap="round"/>'
        + f'<circle cx="172" cy="118" r="8" fill="CREAM" {O}/>',
    'tail/down': tube('M138 180 C 158 190, 176 190, 186 178')
        + '<path d="M160 184 l2 -8 M174 184 l4 -7" stroke="STRIPE" stroke-width="5" stroke-linecap="round"/>'
        + f'<circle cx="187" cy="176" r="8" fill="CREAM" {O}/>',
    'tail/curled': tube('M168 170 C 172 196, 90 202, 58 188')
        + '<path d="M140 190 l-2 -8 M110 194 l-2 -8 M84 193 l-1 -8" stroke="STRIPE" stroke-width="5" stroke-linecap="round"/>'
        + f'<circle cx="55" cy="187" r="8" fill="CREAM" {O}/>',

    # ---------- CORPS ----------
    'body/sit': f'<ellipse cx="100" cy="158" rx="44" ry="34" fill="FUR" {O}/>'
        + '<ellipse cx="100" cy="165" rx="25" ry="22" fill="CREAM"/>'
        + f'<path d="M58 150 q9 4 13 0 M57 165 q8 4 12 0 M142 150 q-9 4 -13 0 M143 165 q-8 4 -12 0" {S}/>'
        + f'<ellipse cx="80" cy="190" rx="15" ry="8" fill="FUR" {O}/><ellipse cx="120" cy="190" rx="15" ry="8" fill="FUR" {O}/>'
        + f'<path d="M76 192 v-4 M84 192 v-4 M116 192 v-4 M124 192 v-4" {S.replace("4.5", "2.5")}/>',
    'body/proud': f'<ellipse cx="100" cy="156" rx="48" ry="37" fill="FUR" {O}/>'
        + '<ellipse cx="100" cy="158" rx="31" ry="27" fill="CREAM"/>'
        + '<path d="M86 146 q6 -6 14 -6" fill="none" stroke="WHITE" stroke-width="4" stroke-linecap="round" opacity=".9"/>'
        + f'<path d="M55 150 q9 4 13 0 M54 165 q8 4 12 0 M145 150 q-9 4 -13 0 M146 165 q-8 4 -12 0" {S}/>'
        + f'<ellipse cx="80" cy="190" rx="15" ry="8" fill="FUR" {O}/><ellipse cx="120" cy="190" rx="15" ry="8" fill="FUR" {O}/>'
        + f'<path d="M76 192 v-4 M84 192 v-4 M116 192 v-4 M124 192 v-4" {S.replace("4.5", "2.5")}/>',
    'body/curled': f'<ellipse cx="108" cy="168" rx="66" ry="27" fill="FUR" {O}/>'
        + f'<path d="M100 142 q4 8 0 14 M120 142 q4 8 0 14 M140 145 q4 7 0 13 M158 152 q3 6 0 11" {S}/>',

    # ---------- BRAS / PATTES ----------
    'arms/down': f'<ellipse cx="66" cy="162" rx="11" ry="17" transform="rotate(18 66 162)" fill="FUR" {O}/>'
        + f'<ellipse cx="134" cy="162" rx="11" ry="17" transform="rotate(-18 134 162)" fill="FUR" {O}/>',
    'arms/wave': f'<ellipse cx="66" cy="162" rx="11" ry="17" transform="rotate(18 66 162)" fill="FUR" {O}/>'
        + tube('M136 150 C 160 140, 172 120, 174 100') + paw(176, 94)
        + '<path d="M186 80 q5 7 2 15 M193 73 q7 10 3 22" fill="none" stroke="LINE" stroke-width="3" stroke-linecap="round" opacity=".6"/>',
    'arms/open': tube('M64 150 C 48 138, 40 124, 36 112') + paw(34, 106)
        + tube('M136 150 C 152 138, 160 124, 164 112') + paw(166, 106),
    'arms/hold': f'<ellipse cx="82" cy="160" rx="12" ry="11" fill="FUR" {O}/>'
        + f'<ellipse cx="118" cy="160" rx="12" ry="11" fill="FUR" {O}/>'
        + f'<path d="M78 166 v-4 M86 166 v-4 M114 166 v-4 M122 166 v-4" {S.replace("4.5", "2.5")}/>',
    'arms/chin': f'<ellipse cx="66" cy="162" rx="11" ry="17" transform="rotate(18 66 162)" fill="FUR" {O}/>'
        + tube('M134 152 C 132 140, 128 132, 124 128') + paw(122, 126, 11),

    # ---------- TÊTE ----------
    'head/base':
        f'<path d="M52 62 C 44 38, 52 22, 66 24 C 76 26, 86 36, 90 44 Z" fill="FUR" {O}/>'
        + '<path d="M60 52 C 57 40, 61 33, 67 34 C 72 35, 77 40, 80 44 Z" fill="EAR"/>'
        + f'<path d="M148 62 C 156 38, 148 22, 134 24 C 124 26, 114 36, 110 44 Z" fill="FUR" {O}/>'
        + '<path d="M140 52 C 143 40, 139 33, 133 34 C 128 35, 123 40, 120 44 Z" fill="EAR"/>'
        + f'<ellipse cx="100" cy="84" rx="60" ry="50" fill="FUR" {O}/>'
        + f'<path d="M100 36 v13 M86 38 q4 7 2 12 M114 38 q-4 7 -2 12" {S}/>'
        + f'<path d="M42 76 q10 3 15 -1 M43 92 q9 3 13 -1 M158 76 q-10 3 -15 -1 M157 92 q-9 3 -13 -1" {S}/>'
        + '<ellipse cx="89" cy="107" rx="16" ry="13" fill="CREAM"/><ellipse cx="111" cy="107" rx="16" ry="13" fill="CREAM"/>'
        + '<circle cx="62" cy="102" r="9" fill="CHEEK" opacity=".75"/><circle cx="138" cy="102" r="9" fill="CHEEK" opacity=".75"/>'
        + '<g fill="STRIPE"><circle cx="84" cy="110" r="1.8"/><circle cx="80" cy="105" r="1.8"/><circle cx="116" cy="110" r="1.8"/><circle cx="120" cy="105" r="1.8"/></g>'
        + '<path d="M93 96 Q100 92 107 96 Q104 103 100 104 Q96 103 93 96Z" fill="NOSE" stroke="LINE" stroke-width="3" stroke-linejoin="round"/>',

    # ---------- YEUX ----------
    'eyes/open': ''.join(f'<ellipse cx="{x}" cy="80" rx="9" ry="11" fill="EYE"/><circle cx="{x+3}" cy="75.5" r="3.6" fill="WHITE"/><circle cx="{x-3}" cy="84.5" r="1.6" fill="WHITE"/>' for x in (78, 122)),
    'eyes/happy': '<path d="M69 84 Q78 71 87 84 M113 84 Q122 71 131 84" fill="none" stroke="EYE" stroke-width="5" stroke-linecap="round"/>',
    'eyes/closed': '<path d="M69 80 Q78 89 87 80 M113 80 Q122 89 131 80" fill="none" stroke="EYE" stroke-width="4.5" stroke-linecap="round"/>',
    'eyes/soft': '<path d="M70 82 Q78 90 86 82 M114 82 Q122 90 130 82" fill="none" stroke="EYE" stroke-width="5" stroke-linecap="round"/>'
        + '<path d="M70 86 l-4 2 M130 86 l4 2" stroke="EYE" stroke-width="3" stroke-linecap="round"/>',
    'eyes/heavy': ''.join(f'<path d="M{x-8} 83 L{x+8} 83 Q{x+8} 91 {x} 91 Q{x-8} 91 {x-8} 83Z" fill="EYE"/><circle cx="{x+3}" cy="86.5" r="2" fill="WHITE"/>' for x in (78, 122))
        + '<path d="M66 87 Q75 81 89 83 M111 83 Q125 81 134 87" fill="none" stroke="LINE" stroke-width="3.5" stroke-linecap="round"/>'
        + '<path d="M72 96 q6 3 12 0 M116 96 q6 3 12 0" fill="none" stroke="STRIPE" stroke-width="2.5" stroke-linecap="round" opacity=".4"/>',
    'eyes/up': ''.join(f'<ellipse cx="{x}" cy="80" rx="10" ry="12" fill="WHITE" stroke="LINE" stroke-width="3"/><circle cx="{x+2}" cy="74" r="6.5" fill="EYE"/><circle cx="{x+4}" cy="72" r="2" fill="WHITE"/>' for x in (78, 122)),

    # ---------- SOURCILS ----------
    'brows/raised': '<path d="M69 64 q9 -5 18 0 M113 56 q9 -7 18 -1" fill="none" stroke="STRIPE" stroke-width="4" stroke-linecap="round"/>',
    'brows/soft': '<path d="M70 66 q8 -4 16 -2 M114 64 q8 -2 16 2" fill="none" stroke="STRIPE" stroke-width="4" stroke-linecap="round"/>',

    # ---------- BOUCHE ----------
    'mouth/smile': '<path d="M88 110 Q94 118 100 110 Q106 118 112 110" fill="none" stroke="LINE" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
    'mouth/grin': '<path d="M86 109 Q100 134 114 109 Q100 114 86 109Z" fill="MOUTH" stroke="LINE" stroke-width="3.5" stroke-linejoin="round"/>'
        + '<ellipse cx="100" cy="122" rx="6.5" ry="4" fill="TONGUE"/>',
    'mouth/small': '<path d="M94 112 Q100 117 106 112" fill="none" stroke="LINE" stroke-width="3.5" stroke-linecap="round"/>',
    'mouth/o': '<ellipse cx="100" cy="116" rx="5" ry="6" fill="MOUTH" stroke="LINE" stroke-width="3"/>',
    'mouth/flat': '<path d="M93 114 Q100 116 107 114" fill="none" stroke="LINE" stroke-width="3.5" stroke-linecap="round"/>',

    # ---------- ACCESSOIRES ----------
    'acc/stars': sparkle(36, 58, 11) + sparkle(168, 46, 13) + sparkle(176, 118, 8) + sparkle(28, 128, 7),
    'acc/party-hat': '<g transform="rotate(14 104 40)">'
        + '<path d="M82 42 L104 -2 L126 42 Q104 48 82 42Z" fill="LAV" stroke="LINE" stroke-width="3.5" stroke-linejoin="round"/>'
        + '<path d="M93 20 l5 3 M110 16 l4 3 M100 32 l5 3 M116 34 l4 2" stroke="WHITE" stroke-width="3" stroke-linecap="round"/>'
        + '<circle cx="104" cy="-3" r="7" fill="GOLD" stroke="LINE" stroke-width="3"/></g>',
    'acc/confetti': ''.join(f'<rect x="{x}" y="{y}" width="7" height="4" rx="1.5" fill="{c}" transform="rotate({r} {x} {y})"/>' for x, y, r, c in
        [(22, 30, 30, 'LAV'), (40, 8, -20, 'SKY'), (160, 14, 40, 'SAGE'), (178, 60, -30, 'GOLD'), (14, 90, 60, 'GOLD'), (182, 100, 20, 'TONGUE'), (30, 150, -40, 'SKY'), (172, 146, 70, 'LAV')])
        + ''.join(f'<circle cx="{x}" cy="{y}" r="3" fill="{c}"/>' for x, y, c in [(60, 4, 'TONGUE'), (146, 2, 'SKY'), (8, 60, 'SAGE'), (192, 82, 'LAV')]),
    'acc/detective-hat': '<path d="M50 50 Q100 -6 150 50 Q100 40 50 50Z" fill="BROWN" stroke="LINE" stroke-width="4" stroke-linejoin="round"/>'
        + '<path d="M78 24 L84 46 M100 12 L100 44 M122 24 L116 46" stroke="STRIPE" stroke-width="2.5" opacity=".6"/>'
        + '<path d="M60 36 Q100 26 140 36" fill="none" stroke="STRIPE" stroke-width="2.5" opacity=".6"/>'
        + '<path d="M44 52 Q100 38 156 52" fill="none" stroke="LINE" stroke-width="5" stroke-linecap="round"/>'
        + '<circle cx="100" cy="12" r="4" fill="STRIPE"/>',
    'acc/magnifier': '<path d="M146 140 L134 160" stroke="STRIPE" stroke-width="9" stroke-linecap="round"/>'
        + '<circle cx="156" cy="122" r="19" fill="SKY" fill-opacity=".55" stroke="LINE" stroke-width="5"/>'
        + '<path d="M146 114 q4 -6 11 -6" fill="none" stroke="WHITE" stroke-width="3.5" stroke-linecap="round"/>',
    'acc/glasses': '<circle cx="78" cy="80" r="16" fill="WHITE" fill-opacity=".18" stroke="LINE" stroke-width="3.5"/>'
        + '<circle cx="122" cy="80" r="16" fill="WHITE" fill-opacity=".18" stroke="LINE" stroke-width="3.5"/>'
        + '<path d="M94 78 Q100 73 106 78 M62 77 L46 72 M138 77 L154 72" fill="none" stroke="LINE" stroke-width="3.5" stroke-linecap="round"/>',
    'acc/blanket': '<path d="M50 142 Q100 122 150 142 L154 190 Q100 200 46 190 Z" fill="LAV" stroke="LINE" stroke-width="4" stroke-linejoin="round"/>'
        + '<path d="M66 136 L64 194 M100 128 L100 197 M134 136 L136 194 M49 160 Q100 150 151 160 M48 178 Q100 170 152 178" fill="none" stroke="WHITE" stroke-width="3" opacity=".5"/>',
    'acc/hot-water-bottle': '<rect x="94" y="140" width="12" height="9" rx="2" fill="PEACH" stroke="LINE" stroke-width="3"/>'
        + '<rect x="82" y="147" width="36" height="38" rx="12" fill="PEACH" stroke="LINE" stroke-width="3.5"/>'
        + heart(100, 166, 0.55, 'CHEEK'),
    'acc/pillow': '<path d="M70 150 Q100 140 130 150 Q138 166 130 182 Q100 190 70 182 Q62 166 70 150Z" fill="SKY" stroke="LINE" stroke-width="3.5" stroke-linejoin="round"/>'
        + '<path d="M80 158 q20 -4 40 0" fill="none" stroke="WHITE" stroke-width="3" stroke-linecap="round" opacity=".7"/>',
    'acc/heart': heart(160, 34, 1.3) + heart(38, 50, 0.8),
    'acc/zzz': ''.join(f'<text x="{x}" y="{y}" font-family="Nunito Variable, Nunito, sans-serif" font-weight="800" font-size="{s}" fill="ZZZ">z</text>' for x, y, s in [(128, 100, 18), (146, 78, 24), (166, 52, 30)]),
    'acc/shine': '<path d="M150 110 q8 -2 12 -10 M44 110 q-8 -2 -12 -10" fill="none" stroke="GOLD" stroke-width="3.5" stroke-linecap="round"/>',
}

for key, body in PARTS.items():
    for tok, (name, fb) in PAL.items():
        body = body.replace(f'"{tok}"', f'"var(--pp-{name}, {fb})"')
    path = OUT / f'{key}.svg'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}">\n{body}\n</svg>\n')
print(len(PARTS), 'calques écrits dans', OUT)
