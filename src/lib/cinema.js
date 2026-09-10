
export function initCinema() {
  var scenes = [
    {
      title: "TypoReel",
      slug: "typography.io",
      desc: "A kinetic typography generator for Reels and Shorts — 50+ animation effects, mood presets, and one-click MP4 export, all in the browser.",
      url: "https://projecloom.github.io/typography.io/",
      reel: "REEL I"
    },
    {
      title: "Discord Chat Studio",
      slug: "disprop.io",
      desc: "Write a script, cast some characters, and export a fake animated Discord conversation as a GIF. Made for chaos, purely browser-based.",
      url: "https://projecloom.github.io/disprop.io/",
      reel: "REEL II"
    },
    {
      title: "READERS",
      slug: "readersuii.netlify.app",
      desc: "An EPUB reading terminal built for people like me — drag in a book, track your progress, add companion stickers, and let text-to-speech read it back.",
      url: "https://readersuii.netlify.app/",
      reel: "REEL III"
    }
  ];

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frame = document.getElementById('cine');
  if (!frame) return;

  var titleEl = document.getElementById('cine-title');
  var slugEl = document.getElementById('cine-slug');
  var descEl = document.getElementById('cine-desc');
  var barEl = document.getElementById('cine-bar');
  var countEl = document.getElementById('cine-count');
  var prevEl = document.getElementById('cine-prev');
  var nextEl = document.getElementById('cine-next');
  var openEl = document.getElementById('cine-open');
  var reelEl = document.getElementById('cine-reel');

  var cur = 0;
  var timers = [];

  function show(i) {
    timers.forEach(function(t){ clearTimeout(t); });
    timers = [];
    var s = scenes[i];
    titleEl.textContent = s.title;
    slugEl.textContent = s.slug;
    descEl.innerHTML = '';
    s.desc.split(' ').forEach(function(w, j) {
      var sp = document.createElement('span');
      sp.className = 'cine-word';
      sp.textContent = w;
      descEl.appendChild(sp);
      if (reduceMotion) sp.classList.add('show');
      else timers.push(setTimeout(function(){ sp.classList.add('show'); }, 60 + j * 55));
    });
    barEl.style.width = ((i + 1) / scenes.length * 100) + '%';
    countEl.textContent = 'Scene ' + (i + 1) + ' / ' + scenes.length;
    reelEl.textContent = s.reel;
    openEl.href = s.url;
    prevEl.disabled = (i === 0);
    nextEl.disabled = (i === scenes.length - 1);
    nextEl.textContent = (i === scenes.length - 1) ? '✦ fin' : 'next ▸';
  }

  function goNext() { if (cur < scenes.length - 1) { cur++; show(cur); } }
  function goPrev() { if (cur > 0) { cur--; show(cur); } }

  nextEl.addEventListener('click', goNext);
  prevEl.addEventListener('click', goPrev);

  document.addEventListener('keydown', function(e) {
    var r = frame.getBoundingClientRect();
    if (r.top >= window.innerHeight || r.bottom <= 0) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  show(0);
}
