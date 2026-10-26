/** Couleur d'un jeton CSS (--sauge-fort…) utilisable dans un graphique SVG. */
export function cssColor(token: string, alpha = 1): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
  return v ? `rgb(${v} / ${alpha})` : '#888';
}
