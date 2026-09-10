import { animate, stagger, createSpring } from 'animejs';

export function initAnimeFx() {
  

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {

    // 1. Flex number count-up (500+) when it scrolls into view
    var flexNum = document.querySelector('.flex-number');
    if (flexNum && 'IntersectionObserver' in window) {
      var counted = false;
      var cio = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !counted) {
            counted = true;
            cio.disconnect();
            var counter = { value: 0 };
            var textNode = flexNum.firstChild;
            animate(counter, {
              value: 500,
              duration: 1600,
              ease: 'outExpo',
              onUpdate: function() { textNode.nodeValue = Math.round(counter.value); },
              onComplete: function() {
                var plus = flexNum.querySelector('.plus');
                if (plus) animate(plus, { scale: [1, 1.6, 1], duration: 650, ease: 'outExpo' });
              }
            });
          }
        });
      }, { threshold: 0.5 });
      cio.observe(flexNum);
    }

    // 2. Magnetic contact buttons — pull toward the cursor, spring back
    document.querySelectorAll('.glow-btn').forEach(function(btn) {
      btn.addEventListener('pointermove', function(e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        animate(btn, {
          translateX: (x / r.width) * 20,
          translateY: (y / r.height) * 20,
          duration: 300,
          ease: 'outQuad'
        });
      });
      btn.addEventListener('pointerleave', function() {
        animate(btn, {
          translateX: 0,
          translateY: 0,
          ease: createSpring({ stiffness: 170 })
        });
      });
    });

    // 3. Skill pills cascade in with a stagger when the group appears
    var skills = document.querySelector('.skills-groups');
    if (skills && 'IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            pio.disconnect();
            animate(entry.target.querySelectorAll('.pill'), {
              opacity: [0, 1],
              translateY: [14, 0],
              duration: 600,
              ease: 'outExpo',
              delay: stagger(60)
            });
          }
        });
      }, { threshold: 0.2 });
      pio.observe(skills);
    }

    // 4. Hobby cards lift slightly on hover
    document.querySelectorAll('.hobby').forEach(function(h) {
      h.addEventListener('pointerenter', function() {
        animate(h, { translateY: -6, duration: 350, ease: 'outExpo' });
      });
      h.addEventListener('pointerleave', function() {
        animate(h, { translateY: 0, duration: 450, ease: 'outExpo' });
      });
    });

    // 5. Section titles rise in as they enter the viewport
    if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            tio.unobserve(entry.target);
            animate(entry.target, {
              opacity: [0, 1],
              translateY: [26, 0],
              duration: 900,
              ease: 'outExpo'
            });
          }
        });
      }, { threshold: 0.4 });
      document.querySelectorAll('.section-title').forEach(function(t) { tio.observe(t); });
    }

    // 6. Scroll-cue line draws itself in a loop
    var cueLine = document.querySelector('.scroll-cue .line');
    if (cueLine) {
      animate(cueLine, {
        scaleY: [0, 1],
        opacity: [0.2, 1],
        transformOrigin: '50% 0%',
        duration: 1400,
        ease: 'inOutQuad',
        loop: true,
        alternate: true
      });
    }

    // 7. Hero meta dots breathe, staggered
    var dots = document.querySelectorAll('.hero-meta .dot');
    if (dots.length) {
      animate(dots, {
        scale: [1, 1.7],
        opacity: [1, 0.55],
        duration: 900,
        ease: 'inOutSine',
        loop: true,
        alternate: true,
        delay: stagger(220)
      });
    }

    // 8. Kickers slide in from the left on view
    if ('IntersectionObserver' in window) {
      var kio = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            kio.unobserve(entry.target);
            animate(entry.target, {
              opacity: [0, 1],
              translateX: [-18, 0],
              duration: 700,
              ease: 'outExpo'
            });
          }
        });
      }, { threshold: 0.6 });
      document.querySelectorAll('.kicker').forEach(function(k) { kio.observe(k); });
    }

    // 9. Fact rows cascade in
    var facts = document.querySelector('.fact-list');
    if (facts && 'IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            fio.disconnect();
            animate(entry.target.querySelectorAll('.fact-row'), {
              opacity: [0, 1],
              translateX: [22, 0],
              duration: 650,
              ease: 'outExpo',
              delay: stagger(90)
            });
          }
        });
      }, { threshold: 0.3 });
      fio.observe(facts);
    }

    // 10. Pills spring up on hover
    document.querySelectorAll('.pill').forEach(function(p) {
      p.addEventListener('pointerenter', function() {
        animate(p, { scale: 1.08, duration: 350, ease: createSpring({ stiffness: 300 }) });
      });
      p.addEventListener('pointerleave', function() {
        animate(p, { scale: 1, duration: 400, ease: 'outExpo' });
      });
    });

    // 11. Footer links stagger up on view
    var footLinks = document.querySelector('.foot-links');
    if (footLinks && 'IntersectionObserver' in window) {
      var flio = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            flio.disconnect();
            animate(entry.target.querySelectorAll('a'), {
              opacity: [0, 1],
              translateY: [12, 0],
              duration: 550,
              ease: 'outExpo',
              delay: stagger(70)
            });
          }
        });
      }, { threshold: 0.4 });
      flio.observe(footLinks);
    }
  }
}
