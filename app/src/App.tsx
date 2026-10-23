import { useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ComingSoon } from './components/ComingSoon';
import { copy } from './content/copy';
import { HomePage } from './features/home/HomePage';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { MascotPreview } from './mascot/MascotPreview';
import { SettingsPage } from './features/settings/SettingsPage';
import { applyTheme } from './lib/theme';
import { useCrisisActive, useSettings } from './lib/useSettings';

export function App() {
  const settings = useSettings();
  const crisis = useCrisisActive();
  const theme = settings?.theme ?? 'auto';

  useEffect(() => {
    applyTheme(theme, crisis);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme(theme, crisis);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme, crisis]);

  return (
    <HashRouter>
      <OnboardingGate done={settings ? settings.onboardingDone : null} />
      <Routes>
        <Route path="/bienvenue" element={<OnboardingPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/checkin" element={<ComingSoon title={copy.home.dailyCardTitle} />} />
        <Route path="/crise" element={<ComingSoon title="Ma crise" />} />
        <Route path="/calendrier" element={<ComingSoon title={copy.home.nav.calendar} />} />
        <Route path="/mois" element={<ComingSoon title={copy.home.nav.months} />} />
        <Route path="/comprendre" element={<ComingSoon title={copy.home.nav.info} />} />
        <Route path="/reglages" element={<SettingsPage />} />
        {import.meta.env.DEV && <Route path="/mascot-preview" element={<MascotPreview />} />}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </HashRouter>
  );
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
