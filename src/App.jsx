import { useEffect, useState } from 'react';
import Body from './Body.jsx';
import Loader from './components/Loader.jsx';
import { initBackgrounds } from './lib/backgrounds.js';
import { initLiquidCarveButtons } from './lib/liquidCarve.js';
import { initScrollHighlight } from './lib/scrollHighlight.js';
import { initCinema } from './lib/cinema.js';
import { initTilt } from './lib/tilt.js';
import { initAnimeFx } from './lib/animeFx.js';
import { initDrift } from './lib/drift.js';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initBackgrounds();
    initLiquidCarveButtons();
    initScrollHighlight();
    initCinema();
    initTilt();
    initAnimeFx();
    initDrift();

    let cancelled = false;
    const minTime = new Promise((r) => setTimeout(r, 1800));
    const fontsReady =
      document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([minTime, fontsReady]).then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Loader visible={loading} />
      <Body />
    </>
  );
}
