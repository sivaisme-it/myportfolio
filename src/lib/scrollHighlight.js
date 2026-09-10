import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initScrollHighlight() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var paragraphs = document.querySelectorAll('.scroll-highlight');
  paragraphs.forEach(function(p) {
    var text = p.getAttribute('data-text');
    if (!text) return;

    // split into words first so lines never break mid-word
    var words = text.split(' ');
    p.innerHTML = '';
    words.forEach(function(word, wi) {
      var w = document.createElement('span');
      w.className = 'word';
      word.split('').forEach(function(ch) {
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        span.style.color = 'rgba(255,255,255,0.15)';
        w.appendChild(span);
      });
      p.appendChild(w);
      if (wi < words.length - 1) p.appendChild(document.createTextNode(' '));
    });

    var targets = p.querySelectorAll('.char');
    gsap.set(targets, { color: 'rgba(255,255,255,0.15)', textShadow: '0 0 0px rgba(255,170,100,0)' });
    gsap.to(targets, {
      color: '#FFC890',
      textShadow: '0 0 14px rgba(255,170,100,0.6), 0 0 46px rgba(255,150,70,0.28)',
      stagger: 0.03,
      scrollTrigger: {
        trigger: p,
        start: 'top center',
        end: 'bottom center',
        scrub: true,
      },
    });
  });
}
