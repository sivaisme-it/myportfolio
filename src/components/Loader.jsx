import { useEffect, useState } from 'react';
import OrbConverge from './OrbConverge.jsx';

export default function Loader({ visible }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => setGone(true), 650);
    return () => clearTimeout(t);
  }, [visible]);

  if (gone) return null;

  return (
    <div className={'loader' + (visible ? '' : ' loader--hide')} aria-hidden={!visible}>
      <div className="loader-orb">
        <OrbConverge />
      </div>
      <div className="loader-word">
        dummy<span className="loader-dot">.</span>
      </div>
      <div className="loader-sub">warming up the ink…</div>
    </div>
  );
}
