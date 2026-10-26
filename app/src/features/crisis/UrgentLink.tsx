import { Link } from 'react-router-dom';
import { copy } from '../../content/copy';
import { Icon } from '../../ui/Icon';

/** Accès sobre à la fiche urgence, en haut de chaque écran de crise. */
export function UrgentLink() {
  return (
    <Link to="/urgence" aria-label={copy.crisis.urgentLink}
      className="press inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-full glass shadow-soft text-[13.5px] font-bold text-c-ink">
      <Icon name="alert" size={17} />{copy.crisis.urgentShort}
    </Link>
  );
}
