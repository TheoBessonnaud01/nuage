import { useState } from 'react';
import { config } from '../config';
import { Mascot } from './Mascot';
import { allMoods, moods } from './moods';

/** Planche de présentation (route de développement uniquement : #/mascot-preview). */
export function MascotPreview() {
  const [animated, setAnimated] = useState(true);

  const panel = (theme: 'clair' | 'sombre') => (
    <section
      data-theme={theme}
      className="bg-c-bg text-c-ink rounded-[28px] p-4"
      aria-label={`Thème ${theme}`}
    >
      <h2 className="font-display text-[20px] font-semibold mb-3">
        Thème {theme}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allMoods.map((m) => (
          <figure key={m} className="flex flex-col items-center rounded-2xl p-2 bg-c-surface shadow-soft">
            <Mascot mood={m} size="md" animated={animated} onTap={() => undefined} />
            <figcaption className="text-sm font-bold mt-1 text-c-muted">
              {moods[m].label} <code className="font-normal">({m})</code>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold">{config.mascotName} — planche des états</h1>
        <p className="text-c-muted">Touche un tigre pour voir la queue bouger. Clignement des yeux sur les états aux yeux ouverts.</p>
        <label className="inline-flex items-center gap-2 font-bold">
          <input type="checkbox" checked={animated} onChange={(e) => setAnimated(e.target.checked)} className="w-5 h-5" />
          Animations
        </label>
        <div className="flex flex-wrap items-end gap-4 pt-2">
          {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
            <div key={s} className="text-center text-sm text-c-muted">
              <Mascot mood="joyeux" size={s} animated={animated} />
              {s}
            </div>
          ))}
        </div>
      </header>
      {panel('clair')}
      {panel('sombre')}
    </main>
  );
}
