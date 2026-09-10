/* =========================================================================
   Liquid Carve Button — vanilla JS port of button.md
   ========================================================================= */
export function initLiquidCarveButtons() {
  var GOO_STRENGTH = 8;
  var FOLLOW_TAU_MIN = 0.02;
  var FOLLOW_TAU_MAX = 0.4;
  var SQUASH_TAU = 0.09;
  var SQUASH_PER_PX_PER_SEC = 0.0011;
  var SQUASH_MAX = 1.6;

  function parseColor(input) {
    if (!input) return { r: 255, g: 255, b: 255, a: 1 };
    var c = String(input).trim();
    if (c[0] === '#') {
      var h = c.slice(1);
      if (h.length === 3 || h.length === 4) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]+(h.length===4?h[3]+h[3]:'');
      if (h.length !== 6 && h.length !== 8) return { r: 255, g: 255, b: 255, a: 1 };
      var n = parseInt(h, 16);
      if (isNaN(n)) return { r: 255, g: 255, b: 255, a: 1 };
      return h.length === 6
        ? { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }
        : { r: (n >>> 24) & 255, g: (n >>> 16) & 255, b: (n >>> 8) & 255, a: (n & 255) / 255 };
    }
    var fn = c.match(/rgba?\(([^)]+)\)/i);
    if (fn) {
      var p = fn[1].split(/[,\s\/]+/).filter(Boolean).map(Number);
      if (p.length >= 3 && p.slice(0, 3).every(function(v){ return !isNaN(v); }))
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 && !isNaN(p[3]) ? p[3] : 1 };
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  function opaque(c) {
    return 'rgb(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ')';
  }

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag) { return document.createElementNS(NS, tag); }

  var uid = 0;
  document.querySelectorAll('.lc-btn').forEach(function(btn) {
    var id = uid++;
    var filterId = 'goo-lc-' + id;
    var maskId = 'bite-lc-' + id;

    var fill = btn.getAttribute('data-fill') || '#FFFFFF';
    var textColor = btn.getAttribute('data-text-color') || '#000000';
    var blobColor = btn.getAttribute('data-blob-color') || '#FC731C';
    var blobSize = parseInt(btn.getAttribute('data-blob-size')) || 80;
    var rounded = parseInt(btn.getAttribute('data-rounded')) || 32;

    var fillRGB = parseColor(fill);
    var blobRGB = parseColor(blobColor);

    var svg = el('svg');
    svg.setAttribute('class', 'lc-svg');
    svg.setAttribute('aria-hidden', 'true');

    var defs = el('defs');

    var filter = el('filter');
    filter.setAttribute('id', filterId);
    var blur = el('feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', GOO_STRENGTH);
    blur.setAttribute('result', 'blur');
    filter.appendChild(blur);
    var cm = el('feColorMatrix');
    cm.setAttribute('in', 'blur');
    cm.setAttribute('mode', 'matrix');
    cm.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9');
    filter.appendChild(cm);
    defs.appendChild(filter);

    var mask = el('mask');
    mask.setAttribute('id', maskId);
    var maskRect = el('rect');
    maskRect.setAttribute('width', '100%');
    maskRect.setAttribute('height', '100%');
    maskRect.setAttribute('fill', '#fff');
    mask.appendChild(maskRect);

    var maskCircle = el('circle');
    maskCircle.setAttribute('cx', '50%');
    maskCircle.setAttribute('cy', '50%');
    maskCircle.setAttribute('r', blobSize / 2);
    maskCircle.setAttribute('fill', '#000');
    mask.appendChild(maskCircle);

    defs.appendChild(mask);
    svg.appendChild(defs);

    var blobG = el('g');
    blobG.setAttribute('filter', 'url(#' + filterId + ')');
    blobG.setAttribute('opacity', String(blobRGB.a));
    var blobRect = el('rect');
    blobRect.setAttribute('width', '100%');
    blobRect.setAttribute('height', '100%');
    blobRect.setAttribute('rx', rounded);
    blobRect.setAttribute('ry', rounded);
    blobRect.setAttribute('fill', opaque(blobRGB));
    blobG.appendChild(blobRect);
    svg.appendChild(blobG);

    var fillG = el('g');
    fillG.setAttribute('filter', 'url(#' + filterId + ')');
    fillG.setAttribute('opacity', '1');
    var fillRect = el('rect');
    fillRect.setAttribute('width', '100%');
    fillRect.setAttribute('height', '100%');
    fillRect.setAttribute('rx', rounded);
    fillRect.setAttribute('ry', rounded);
    fillRect.setAttribute('fill', 'rgba(' + Math.round(fillRGB.r) + ',' + Math.round(fillRGB.g) + ',' + Math.round(fillRGB.b) + ',0.15)');
    fillRect.setAttribute('mask', 'url(#' + maskId + ')');
    fillG.appendChild(fillRect);
    svg.appendChild(fillG);

    btn.insertBefore(svg, btn.firstChild);
    btn.style.color = textColor;

    var chase = { x: 0, y: 0, tx: 0, ty: 0, squash: 1, angle: 0 };
    var hovered = false;
    var lastTime = 0;

    function offset(e) {
      var r = btn.getBoundingClientRect();
      return {
        dx: e.clientX - (r.left + r.width / 2),
        dy: e.clientY - (r.top + r.height / 2)
      };
    }

    function animateLoop(now) {
      var dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1/60;
      lastTime = now;

      var t = 0.5;
      var tau = FOLLOW_TAU_MIN + t * (FOLLOW_TAU_MAX - FOLLOW_TAU_MIN);
      var k = 1 - Math.exp(-dt / tau);
      var dx = (chase.tx - chase.x) * k;
      var dy = (chase.ty - chase.y) * k;
      chase.x += dx;
      chase.y += dy;

      var speed = Math.hypot(dx, dy) / dt;
      var want = Math.min(SQUASH_MAX, 1 + speed * SQUASH_PER_PX_PER_SEC);
      chase.squash += (want - chase.squash) * (1 - Math.exp(-dt / SQUASH_TAU));
      if (speed > 8) chase.angle = Math.atan2(dy, dx) * 180 / Math.PI;

      maskCircle.setAttribute('cx', String(50 + (chase.x / btn.offsetWidth * 100)) + '%');
      maskCircle.setAttribute('cy', String(50 + (chase.y / btn.offsetHeight * 100)) + '%');

      requestAnimationFrame(animateLoop);
    }
    requestAnimationFrame(animateLoop);

    btn.addEventListener('pointerenter', function(e) {
      hovered = true;
      var o = offset(e);
      chase.tx = o.dx; chase.ty = o.dy;
      chase.x = o.dx; chase.y = o.dy;
      maskCircle.setAttribute('cx', String(50 + (o.dx / btn.offsetWidth * 100)) + '%');
      maskCircle.setAttribute('cy', String(50 + (o.dy / btn.offsetHeight * 100)) + '%');
    });

    btn.addEventListener('pointermove', function(e) {
      if (!hovered) return;
      var o = offset(e);
      chase.tx = o.dx;
      chase.ty = o.dy;
    });

    btn.addEventListener('pointerleave', function() {
      hovered = false;
      chase.tx = 0;
      chase.ty = 0;
    });
  });
}
