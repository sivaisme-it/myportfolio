import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const WORD_COLORS = ['#ffd3e0', '#ff9ebb', '#ff7fa5'];

export default function LetterDrop() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const text = 'Suvam Sugyan Sahoo';
    const chars = text.split('');

    const h1 = document.createElement('h1');
    h1.style.cssText =
      "margin:0;display:block;width:100%;white-space:pre-wrap;color:#f3efe4;font-family:'Fraunces',Georgia,serif;font-weight:300;font-size:clamp(2.8rem,9vw,6.4rem);line-height:0.98;letter-spacing:-0.02em;text-align:left;text-shadow:0 2px 30px rgba(0,0,0,0.55), 0 0 60px rgba(255,127,165,0.25);";

    let wordIndex = 0;
    chars.forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.display = 'inline-block';
      if (ch === ' ') wordIndex++;
      span.textContent = ch === ' ' ? String.fromCharCode(160) : ch;
      span.style.color = WORD_COLORS[wordIndex % WORD_COLORS.length];
      h1.appendChild(span);
    });

    container.appendChild(h1);

    const charEls = h1.querySelectorAll('.char');
    gsap.set(charEls, { y: -115, opacity: 0 });
    const tween = gsap.to(charEls, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      delay: 0.2,
      stagger: { each: 0.04, from: 'start' },
      ease: 'power2.out',
    });

    return () => {
      tween.kill();
      h1.remove();
    };
  }, []);

  return <div id="fluid-root" ref={containerRef} />;
}
