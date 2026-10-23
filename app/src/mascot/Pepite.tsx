import { useEffect, useState } from 'react';
import type { Settings } from '../db/types';
import { useSettings } from '../lib/useSettings';
import { Mascot } from './Mascot';
import type { Mood } from './moods';
import { pickLine, type LineContext } from './lines';
import { SpeechBubble } from './SpeechBubble';

interface PepiteProps {
  mood: Mood;
  /** Contexte de la bulle ; sans contexte, pas de bulle. */
  lineContext?: LineContext;
  /** Texte imposé (prioritaire sur lineContext). */
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  /** En mode discret, la bulle ne s'affiche que si `importantBubble` (accueil, célébrations). */
  importantBubble?: boolean;
  animated?: boolean;
  tappable?: boolean;
}

const smaller: Record<'sm' | 'md' | 'lg', 'xs' | 'sm' | 'md'> = { sm: 'xs', md: 'sm', lg: 'md' };

/** Pépite + sa bulle, en respectant le réglage normal / discret / masqué. */
export function Pepite({
  mood, lineContext, text, size = 'md', importantBubble = false, animated = true, tappable = true,
}: PepiteProps) {
  const settings = useSettings();
  const mode: Settings['mascotMode'] = settings?.mascotMode ?? 'normal';
  const firstName = settings?.firstName ?? '';
  const [line, setLine] = useState<string | null>(null);
  const [bubbleKey, setBubbleKey] = useState(0);

  useEffect(() => {
    if (text) setLine(text);
    else if (lineContext && firstName) setLine(pickLine(lineContext, firstName));
    else setLine(null);
  }, [lineContext, text, firstName]);

  if (mode === 'masqué') return null;
  const discreet = mode === 'discret';
  const showBubble = line && (!discreet || importantBubble);

  const onTap = () => {
    setLine(pickLine('tap', firstName));
    setBubbleKey((k) => k + 1);
  };

  return (
    <div className="flex items-start gap-2">
      <div className="shrink-0">
        <Mascot mood={mood} size={discreet ? smaller[size] : size} animated={animated} onTap={tappable ? onTap : undefined} />
      </div>
      {showBubble && (
        <SpeechBubble key={`${bubbleKey}-${line}`} pointer="left" className="mt-4 flex-1">{line}</SpeechBubble>
      )}
    </div>
  );
}
