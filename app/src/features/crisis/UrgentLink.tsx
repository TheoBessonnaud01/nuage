import { Link } from 'react-router-dom';
import { copy } from '../../content/copy';

/** Lien sobre vers la fiche urgence, en haut de chaque écran de crise. */
export function UrgentLink() {
  return (
    <Link to="/urgence" className="block text-center text-sm font-bold underline text-muted min-h-touch py-3">
      {copy.crisis.urgentLink}
    </Link>
  );
}
