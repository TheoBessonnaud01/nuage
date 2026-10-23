import { useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ComingSoon } from './components/ComingSoon';
import { copy } from './content/copy';
import { CalendarPage } from './features/calendar/CalendarPage';
import { DayPage } from './features/calendar/DayPage';
import { CheckinPage } from './features/checkin/CheckinPage';
import { CrisisDigestPage } from './features/crisis/CrisisDigestPage';
import { CrisisHubPage } from './features/crisis/CrisisHubPage';
import { CrisisLogPage } from './features/crisis/CrisisLogPage';
import { CrisisStartPage } from './features/crisis/CrisisStartPage';
import { EndPainPage } from './features/crisis/EndPainPage';
import { InvestigationPage } from './features/crisis/InvestigationPage';
import { MedicationPage } from './features/crisis/MedicationPage';
import { PostdromePage } from './features/crisis/PostdromePage';
import { RecapPage } from './features/crisis/RecapPage';
import { UrgentPage } from './features/crisis/UrgentPage';
import { CelebrationPage } from './features/goals/CelebrationPage';
import { GoalsPage } from './features/goals/GoalsPage';
import { HomePage } from './features/home/HomePage';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { MascotPreview } from './mascot/MascotPreview';
import { SettingsPage } from './features/settings/SettingsPage';
import { applyTheme } from './lib/theme';
import { useCrisisActive, useSettings } from './lib/useSettings';
import type { Settings } from './db/types';

export function App() {
  const settings = useSettings();

  return (
    <HashRouter>
      <ThemeSync theme={settings?.theme ?? 'auto'} />
      <OnboardingGate done={settings ? settings.onboardingDone : null} />
      <Routes>
        <Route path="/bienvenue" element={<OnboardingPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/checkin" element={<CheckinPage />} />
        <Route path="/checkin/:date" element={<CheckinPage />} />
        <Route path="/jour/:date" element={<DayPage />} />
        <Route path="/objectifs" element={<GoalsPage />} />
        <Route path="/palier" element={<CelebrationPage />} />
        <Route path="/crise" element={<CrisisHubPage />} />
        <Route path="/crise/debut" element={<CrisisStartPage />} />
        <Route path="/crise/suivi" element={<CrisisLogPage />} />
        <Route path="/crise/bilan" element={<CrisisDigestPage />} />
        <Route path="/crise/traitement" element={<MedicationPage />} />
        <Route path="/crise/enquete" element={<InvestigationPage />} />
        <Route path="/crise/fin" element={<EndPainPage />} />
        <Route path="/crise/post" element={<PostdromePage />} />
        <Route path="/crise/recap/:id" element={<RecapPage />} />
        <Route path="/urgence" element={<UrgentPage />} />
        <Route path="/calendrier" element={<CalendarPage />} />
        <Route path="/mois" element={<ComingSoon title={copy.home.nav.months} />} />
        <Route path="/comprendre" element={<ComingSoon title={copy.home.nav.info} />} />
        <Route path="/reglages" element={<SettingsPage />} />
        {import.meta.env.DEV && <Route path="/mascot-preview" element={<MascotPreview />} />}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </HashRouter>
  );
}

/** Thème + mode crise (sombre atténué) : pendant une crise en cours et sur tous les écrans de crise. */
function ThemeSync({ theme }: { theme: Settings['theme'] }) {
  const crisisActive = useCrisisActive();
  const { pathname } = useLocation();
  const onCrisisScreen = pathname === '/crise' || pathname === '/urgence'
    || (pathname.startsWith('/crise/') && !pathname.startsWith('/crise/recap'));
  const crisis = crisisActive || onCrisisScreen;
  useEffect(() => {
    applyTheme(theme, crisis);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(theme, crisis);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme, crisis]);
  return null;
}

/** Premier lancement : redirige une seule fois vers la présentation, au chargement de l'app. */
function OnboardingGate({ done }: { done: boolean | null }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const checked = useRef(false);
  useEffect(() => {
    if (checked.current || done === null) return;
    checked.current = true;
    if (!done && pathname !== '/bienvenue' && pathname !== '/mascot-preview') navigate('/bienvenue', { replace: true });
  }, [done, pathname, navigate]);
  return null;
}
