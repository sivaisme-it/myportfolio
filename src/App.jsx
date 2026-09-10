import { useEffect } from 'react';
import Body from './Body.jsx';
import Cursor from './components/Cursor.jsx';
import { initBackgrounds } from './lib/backgrounds.js';
import { initLiquidCarveButtons } from './lib/liquidCarve.js';
import { initScrollHighlight } from './lib/scrollHighlight.js';
import { initCinema } from './lib/cinema.js';
import { initTilt } from './lib/tilt.js';
import { initAnimeFx } from './lib/animeFx.js';
import { initDrift } from './lib/drift.js';

export default function App() {
  useEffect(() => {
    initBackgrounds();
    initLiquidCarveButtons();
    initScrollHighlight();
    initCinema();
    initTilt();
    initAnimeFx();
    initDrift();
  }, []);

  return (
    <>
      <Body />
      <Cursor />
    </>
  );
}
