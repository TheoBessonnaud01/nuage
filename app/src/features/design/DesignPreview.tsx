import { useState, type ReactNode } from 'react';
import { Mascot } from '../../mascot/Mascot';
import { allMoods, moods, type Mood } from '../../mascot/moods';
import { Face, GrowthStage, type Stage } from '../../ui/Garden';
import { Icon, iconNames } from '../../ui/Icon';
import { BottomNav, Bubble, Btn, Choice, IconBtn, Panel, Ring, SectionHeader, Tag, type NavItem } from '../../ui/kit';

/** Planche de validation du nouveau design (#/design). Maquettes non fonctionnelles. */

const nav: NavItem[] = [
  { to: '/', label: 'Accueil', icon: 'home' },
  { to: '/calendrier', label: 'Journal', icon: 'calendar' },
  { to: '/analyses', label: 'Évolution', icon: 'chart' },
  { to: '/comprendre', label: 'Comprendre', icon: 'book' },
];

function Phone({ title, children, crisis = false, nav: withNav = false }: { title: string; children: ReactNode; crisis?: boolean; nav?: boolean }) {
  return (
    <figure className="space-y-2">
      <figcaption className="font-text text-[13px] font-bold uppercase tracking-wider text-c-muted px-2">{title}</figcaption>
      <div className={`relative mx-auto w-full max-w-[400px] rounded-[44px] overflow-hidden page-glow text-c-ink ring-1 ring-c-line shadow-float ${crisis ? 'mode-crise' : ''}`}
        style={{ minHeight: 760 }}>
        <div className={withNav ? 'pb-28' : ''}>{children}</div>
        {withNav && (
          <div className="absolute left-3 right-3 bottom-4">
            <BottomNav items={nav} active="/" onAction={() => undefined} actionLabel="Ajouter" />
          </div>
        )}
      </div>
    </figure>
  );
}

function HomeMock() {
  const days = [
    { d: 'L', s: 'done' }, { d: 'M', s: 'done' }, { d: 'M', s: 'crisis' }, { d: 'J', s: 'empty' }, { d: 'V', s: 'done' }, { d: 'S', s: 'today' }, { d: 'D', s: 'future' },
  ];
  return (
    <div className="px-5 pt-7 space-y-5">
      <header className="flex items-center gap-3">
        <div className="grid place-items-center w-12 h-12 rounded-full bg-c-surface shadow-soft overflow-hidden"><Mascot mood="joyeux" portrait size={44} animated={false} /></div>
        <div className="flex-1">
          <p className="font-text text-[13px] font-semibold text-c-muted">Samedi 26 octobre</p>
          <h1 className="font-display text-[26px] font-semibold leading-tight">Bonsoir, Noémie</h1>
        </div>
        <IconBtn icon="settings" label="Réglages" />
      </header>

      <Panel tone="hero" className="!p-0 min-h-[210px]">
        <div className="relative z-10 p-5 pr-0 w-[62%] space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-c-surface/60 px-3 py-1 font-text text-[12px] font-bold text-c-on-grad"><Icon name="clock" size={14} />1 minute</span>
          <h2 className="font-display text-[27px] leading-[1.1] font-semibold text-c-on-grad">Comment s’est passée ta journée&nbsp;?</h2>
          <Btn size="md" iconRight="arrow-right">Commencer</Btn>
        </div>
        <div className="absolute -right-3 -bottom-4"><Mascot mood="coucou" size={170} animated /></div>
      </Panel>

      <Panel tone="plain" className="!p-4">
        <div className="flex items-center gap-3">
          <GrowthStage stage="pousse" size={56} />
          <div className="flex-1">
            <p className="font-text text-[13px] font-bold text-c-muted">Ton jardin · Pousse</p>
            <p className="font-display text-[19px] font-semibold">2 sur 3 cette semaine</p>
          </div>
          <Ring value={2 / 3}><span className="font-text text-[13px] font-bold">2/3</span></Ring>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
          {days.map((x, i) => (
            <div key={i} className="space-y-1.5">
              <p className="font-text text-[12px] font-bold text-c-muted">{x.d}</p>
              <div className={`mx-auto grid place-items-center w-9 h-9 rounded-full
                ${x.s === 'done' ? 'grad-mint' : x.s === 'crisis' ? 'grad-lilac' : x.s === 'today' ? 'ring-2 ring-c-accent bg-c-surface' : x.s === 'empty' ? 'border-2 border-dashed border-c-line' : 'bg-c-surface-2'}`}>
                {x.s === 'done' && <Icon name="leaf" size={16} className="text-c-on-grad" />}
                {x.s === 'crisis' && <Icon name="rain" size={16} className="text-c-on-grad" />}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel tone="lilac" className="!p-4">
        <button type="button" className="press w-full flex items-center gap-4 text-left">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-c-surface/70 text-c-on-grad"><Icon name="rain" size={24} /></span>
          <span className="flex-1">
            <span className="block font-display text-[19px] font-semibold text-c-on-grad">J’ai une migraine</span>
            <span className="block font-text text-[13.5px] font-medium text-c-on-grad-muted">On note juste l’essentiel</span>
          </span>
          <Icon name="chevron-right" className="text-c-on-grad-muted" />
        </button>
      </Panel>

      <div className="grid grid-cols-2 gap-3">
        <Panel tone="peach" className="!p-4 space-y-3">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-c-surface/70 text-c-on-grad"><Icon name="calendar" /></span>
          <p className="font-display text-[18px] font-semibold text-c-on-grad leading-tight">Mon calendrier</p>
          <div className="grid grid-cols-7 gap-1">{Array.from({ length: 21 }, (_, i) => <span key={i} className={`aspect-square rounded-full ${[2, 9, 10].includes(i) ? 'bg-[#8C78F6]' : [4, 13, 17].includes(i) ? 'bg-white/50' : 'bg-white'}`} />)}</div>
        </Panel>
        <Panel tone="mint" className="!p-4 space-y-3">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-c-surface/70 text-c-on-grad"><Icon name="chart" /></span>
          <p className="font-display text-[18px] font-semibold text-c-on-grad leading-tight">Mes analyses</p>
          <svg viewBox="0 0 120 40" className="w-full text-c-on-grad" aria-hidden><path d="M2 32 C 20 30, 26 12, 44 18 S 70 34, 84 20 S 108 6, 118 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
        </Panel>
      </div>

      <Panel tone="plain" className="!p-4 flex items-center gap-4">
        <span className="grid place-items-center w-12 h-12 rounded-2xl grad-sky text-c-on-grad"><Icon name="book" /></span>
        <div className="flex-1">
          <p className="font-text text-[12.5px] font-bold text-c-muted">Comprendre · 2 min</p>
          <p className="font-display text-[18px] font-semibold">Les petits signaux d’avant</p>
        </div>
        <Icon name="chevron-right" className="text-c-muted" />
      </Panel>
    </div>
  );
}

function QuestionMock() {
  const [q, setQ] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [h, setH] = useState(7.5);
  const [tags, setTags] = useState<string[]>(['Bâillements répétés']);
  const toggle = (t: string) => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));
  return (
    <div className="flex flex-col min-h-[760px]">
      <div className="px-5 pt-7 space-y-5 flex-1">
        <div className="flex items-center gap-3">
          <IconBtn icon="chevron-left" label="Retour" />
          <div className="flex-1 flex gap-1.5">{Array.from({ length: 12 }, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < 1 ? 'bg-c-accent' : 'bg-c-ink/10'}`} />)}</div>
          <span className="font-text text-[13px] font-bold text-c-muted">1/12</span>
        </div>
        <div className="flex items-end gap-2">
          <Mascot mood="pense" size={72} />
          <Bubble className="mb-6">Pas de bonne ou de mauvaise réponse ici.</Bubble>
        </div>
        <h1 className="font-display text-[32px] leading-[1.1] font-semibold">Ta nuit dernière&nbsp;?</h1>
        <Panel tone="plain" className="space-y-3">
          <p className="font-text text-[14px] font-bold text-c-muted">Durée de sommeil</p>
          <div className="flex items-center justify-between">
            <button type="button" aria-label="Moins" onClick={() => setH(Math.max(0, h - .5))} className="press grid place-items-center w-12 h-12 rounded-full bg-c-surface-2"><Icon name="minus" /></button>
            <p className="font-display text-[46px] font-semibold tabular-nums">{String(h).replace('.5', ' h 30').replace(/^(\d+)$/, '$1 h')}</p>
            <button type="button" aria-label="Plus" onClick={() => setH(Math.min(12, h + .5))} className="press grid place-items-center w-12 h-12 rounded-full bg-c-surface-2"><Icon name="plus" /></button>
          </div>
        </Panel>
        <Panel tone="plain" className="space-y-3">
          <p className="font-text text-[14px] font-bold text-c-muted">Et la qualité&nbsp;?</p>
          <div className="grid grid-cols-5 gap-2">
            {([1, 2, 3, 4, 5] as const).map((l) => (
              <button key={l} type="button" aria-pressed={q === l} onClick={() => setQ(l)}
                className={`press flex flex-col items-center gap-1 rounded-2xl py-2 ${q === l ? 'bg-c-surface-2 ring-2 ring-c-accent' : ''}`}>
                <Face level={l} size={44} />
                <span className="font-text text-[11px] font-bold text-c-muted">{['Dure', 'Bof', 'Moyenne', 'Bonne', 'Top'][l - 1]}</span>
              </button>
            ))}
          </div>
        </Panel>
        <div className="flex flex-wrap gap-2">
          {['Bâillements répétés', 'Fatigue inhabituelle', 'Nuque raide', 'Fringales'].map((t) => <Tag key={t} selected={tags.includes(t)} onClick={() => toggle(t)}>{t}</Tag>)}
        </div>
      </div>
      <div className="sticky bottom-0 glass px-5 pt-3 pb-6 grid grid-cols-2 gap-3 mt-6">
        <Btn variant="ghost">Passer</Btn>
        <Btn iconRight="arrow-right">Suivant</Btn>
      </div>
    </div>
  );
}

function CrisisMock() {
  return (
    <div className="px-5 pt-7 space-y-5">
      <div className="flex items-center gap-3">
        <IconBtn icon="chevron-left" label="Accueil" />
        <p className="flex-1 font-text text-[14px] font-bold text-c-muted">Ta crise · jour 1</p>
        <button type="button" className="press inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full bg-c-surface font-text text-[13px] font-bold text-c-ink"><Icon name="alert" size={16} />Urgence</button>
      </div>
      <div className="flex items-end gap-2">
        <Mascot mood="calin" size={110} animated={false} />
        <Bubble className="mb-10">Je suis là. Repose-toi.</Bubble>
      </div>
      <Panel tone="soft" className="space-y-2 font-text text-[15px]">
        <p>Ta crise a commencé <b>à 13 h 26</b>, il y a 2 h.</p>
        <p>Dernière douleur notée : <b>6/10</b>, en baisse.</p>
        <p>Aucun traitement noté pour l’instant.</p>
      </Panel>
      <div className="space-y-3">
        <Btn className="w-full" icon="edit">Noter comment ça va</Btn>
        <Btn variant="soft" className="w-full" icon="pill">J’ai pris un traitement</Btn>
        <Btn variant="ghost" className="w-full" icon="sun">La douleur est partie</Btn>
      </div>
    </div>
  );
}

function GardenMock() {
  const stages: { s: Stage; label: string; info: string; state: 'done' | 'now' | 'next' }[] = [
    { s: 'graine', label: 'Graine', info: '2 / semaine', state: 'done' },
    { s: 'pousse', label: 'Pousse', info: '3 / semaine', state: 'done' },
    { s: 'arbre', label: 'Arbre', info: '4 / semaine', state: 'now' },
    { s: 'floraison', label: 'Floraison', info: 'Rythme libre', state: 'next' },
  ];
  return (
    <div className="px-5 pt-7 space-y-5">
      <div className="flex items-center gap-3">
        <IconBtn icon="chevron-left" label="Retour" />
        <h1 className="font-display text-[28px] font-semibold">Ton jardin</h1>
      </div>
      <Panel tone="mint" className="text-center !pt-6">
        <div className="mx-auto w-fit"><GrowthStage stage="arbre" size={170} badge={false} title="Arbre" /></div>
        <p className="font-display text-[26px] font-semibold text-c-on-grad">Arbre</p>
        <p className="font-text text-[14px] font-semibold text-c-on-grad-muted">4 points du jour par semaine · 1 semaine validée sur 4</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Ring value={3 / 4} size={64}><span className="font-text text-[14px] font-bold text-c-on-grad">3/4</span></Ring>
          <p className="font-text text-[14px] font-semibold text-c-on-grad text-left">Encore 1 point du jour<br />pour valider la semaine</p>
        </div>
      </Panel>
      <div className="relative">
        <div className="absolute left-[30px] top-8 bottom-8 w-1 rounded-full bg-c-ink/10" aria-hidden />
        <ul className="space-y-3">
          {stages.map((x) => (
            <li key={x.s} className={`relative flex items-center gap-4 ${x.state === 'next' ? 'opacity-70' : ''}`}>
              <div className={`rounded-full ${x.state === 'now' ? 'ring-4 ring-c-accent/40' : ''}`}><GrowthStage stage={x.s} size={62} /></div>
              <div className="flex-1">
                <p className="font-display text-[19px] font-semibold">{x.label}</p>
                <p className="font-text text-[13.5px] font-medium text-c-muted">{x.info}</p>
              </div>
              {x.state === 'done' && <span className="grid place-items-center w-8 h-8 rounded-full grad-mint text-c-on-grad"><Icon name="check" size={18} strokeWidth={2.4} /></span>}
              {x.state === 'now' && <span className="font-text text-[12px] font-bold rounded-full bg-c-accent-soft text-c-ink px-3 py-1">En cours</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function DesignPreview() {
  const [direction, setDirection] = useState<'aube' | 'lagon'>('aube');
  const [theme, setTheme] = useState<'clair' | 'sombre'>('clair');
  const [mood, setMood] = useState<Mood>('joyeux');
  const seg = (options: [string, string][], value: string, set: (v: string) => void) => (
    <div className="inline-flex rounded-full bg-c-surface-2 p-1">
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => set(v)}
          className={`press min-h-[40px] px-3.5 rounded-full font-text text-[13.5px] font-bold ${value === v ? 'bg-c-primary text-c-on-primary shadow-soft' : 'text-c-muted'}`}>{l}</button>
      ))}
    </div>
  );

  return (
    <div data-direction={direction} data-theme={theme} className="page-glow min-h-screen font-text text-c-ink">
      <div className="sticky top-0 z-20 glass shadow-soft">
        <div className="mx-auto max-w-5xl px-3 py-2.5 flex items-center justify-center gap-2">
          <p className="hidden sm:block font-display text-[20px] font-semibold flex-1">Nouveau design</p>
          {seg([['aube', 'Aube'], ['lagon', 'Lagon']], direction, (v) => setDirection(v as 'aube' | 'lagon'))}
          {seg([['clair', 'Clair'], ['sombre', 'Sombre']], theme, (v) => setTheme(v as 'clair' | 'sombre'))}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-12">
        <section className="space-y-3">
          <h1 className="font-display text-[34px] leading-tight font-semibold">Une proposition à valider</h1>
          <p className="text-[16px] text-c-muted max-w-2xl">Deux ambiances : <b className="text-c-ink">Aube</b> (pêche, rose, lavande — chaleureuse) et <b className="text-c-ink">Lagon</b> (menthe, ciel — fraîche). Change en haut pour comparer, en clair et en sombre. Les maquettes sont des aperçus : elles ne fonctionnent pas encore.</p>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Pépite, nouvelle version" />
          <Panel tone="hero" className="!p-0">
            <div className="grid md:grid-cols-[1fr_1.2fr] items-center">
              <div className="flex justify-center pt-6"><Mascot mood={mood} size={260} onTap={() => undefined} /></div>
              <div className="p-6 space-y-3 text-c-on-grad">
                <p className="font-display text-[28px] font-semibold leading-tight">En volume, sans contours, tout en douceur.</p>
                <p className="text-[15px] font-medium text-c-on-grad-muted">Toutes ses humeurs restent pilotées par l’app (crise, post-crise, fête…). Touche une humeur :</p>
                <div className="flex flex-wrap gap-2">
                  {allMoods.map((m) => (
                    <button key={m} type="button" aria-pressed={mood === m} onClick={() => setMood(m)}
                      className={`press min-h-[40px] px-3 rounded-full text-[13.5px] font-bold ${mood === m ? 'bg-c-primary text-c-on-primary' : 'bg-c-surface/70 text-c-ink'}`}>{moods[m].label}</button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {allMoods.map((m) => (
              <Panel key={m} tone="plain" className="!p-2 flex flex-col items-center">
                <Mascot mood={m} size={104} animated={false} />
                <p className="text-[12.5px] font-bold text-c-muted">{moods[m].label}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Les écrans" />
          <div className="grid gap-8 md:grid-cols-2">
            <Phone title="Accueil" nav><HomeMock /></Phone>
            <Phone title="Point du jour"><QuestionMock /></Phone>
            <Phone title="Mode crise (nuit douce)" crisis><CrisisMock /></Phone>
            <Phone title="Jardin (objectifs)"><GardenMock /></Phone>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Le jardin" />
          <Panel tone="plain" className="flex flex-wrap justify-around gap-4">
            {(['graine', 'pousse', 'arbre', 'floraison'] as Stage[]).map((s) => (
              <div key={s} className="text-center"><GrowthStage stage={s} size={110} /><p className="font-display text-[18px] font-semibold capitalize mt-1">{s}</p></div>
            ))}
          </Panel>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Ressenti (sans émojis)" />
          <Panel tone="plain" className="flex justify-around">{([1, 2, 3, 4, 5] as const).map((l) => <Face key={l} level={l} size={56} />)}</Panel>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Icônes sur mesure" />
          <Panel tone="plain" className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {iconNames.map((n) => (
              <div key={n} className="flex flex-col items-center gap-1 text-c-ink"><Icon name={n} size={26} /><span className="text-[10.5px] text-c-muted">{n}</span></div>
            ))}
          </Panel>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Composants" />
          <Panel tone="plain" className="space-y-4">
            <div className="flex flex-wrap gap-3"><Btn iconRight="arrow-right">Bouton principal</Btn><Btn variant="soft" icon="pill">Secondaire</Btn><Btn variant="ghost">Discret</Btn></div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Choice selected onClick={() => undefined} hint="Comme d’habitude">Caféine habituelle</Choice>
              <Choice selected={false} onClick={() => undefined}>Plus que d’habitude</Choice>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['hero', 'peach', 'lilac', 'mint', 'sky', 'sun'] as const).map((t) => <Panel key={t} tone={t} className="!p-3 h-20"><span className="font-text text-[12px] font-bold text-c-on-grad">{t}</span></Panel>)}
            </div>
          </Panel>
        </section>

        <p className="text-center text-[14px] text-c-muted pb-10">Typographies : Fraunces (titres) et Plus Jakarta Sans (textes) — embarquées, fonctionnent hors ligne.</p>
      </main>
    </div>
  );
}
