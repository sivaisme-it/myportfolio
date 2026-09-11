
/* Vanilla JS port of drift.md — a swarm of shader-drawn butterflies drifting
   across the hero, layered above the botanical flower, below the text.
   They scatter from the pointer and settle back into their wander. */
export function initDrift() {
  // phones get a lighter swarm: fewer bugs, no retina buffer
  var SMALL_SCREEN = window.innerWidth < 640;
  var MAX_DPR = SMALL_SCREEN ? 1 : 1.5;
  var MAX_COUNT = 140;
  var VERTS_PER_BUG = 6;
  var FLOATS_PER_VERT = 12;
  var STRIDE = FLOATS_PER_VERT * 4;
  var TAU = Math.PI * 2;

  var SPAN = 0.042;
  var CRUISE = 0.075;
  var FLAP_HZ = 5.5;
  var PUSH = 2.6;
  var BOB = 0.55;
  var CLOCK_WRAP = 600;

  var CORNERS = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

  var V = {
    baseColor: "#b8a6ff",
    accentColor: "#74e9c9",
    count: SMALL_SCREEN ? 16 : 32,
    span: 0.025,
    speed: 1.4,
    flap: 0.6,
    wander: 0.3,
    depth: 0.8,
    blur: 0.4,
    hover: 1.2,
    reach: 0.25
  };

  var VERT_SRC = [
    "attribute vec2 a_corner;",
    "attribute vec2 a_center;",
    "attribute vec2 a_dir;",
    "attribute vec4 a_ext;",
    "attribute vec2 a_shade;",
    "uniform vec2  uHalf;",
    "uniform float uPxUnit;",
    "varying vec2  v_local;",
    "varying float v_fold;",
    "varying float v_seed;",
    "varying float v_aa;",
    "varying vec2  v_shade;",
    "void main() {",
    "  v_local = a_corner;",
    "  v_fold = a_ext.y;",
    "  v_seed = a_ext.z;",
    "  v_shade = a_shade;",
    "  vec2 right = vec2(a_dir.y, -a_dir.x);",
    "  vec2 world = a_center + (a_corner.x * right + a_corner.y * a_dir) * a_ext.x;",
    "  float px = max(a_ext.x * uPxUnit, 1.0);",
    "  v_aa = (1.0 + a_ext.w) / px;",
    "  gl_Position = vec4(world / uHalf, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAG_SRC = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec3 uBase;",
    "uniform vec3 uAccent;",
    "varying vec2  v_local;",
    "varying float v_fold;",
    "varying float v_seed;",
    "varying float v_aa;",
    "varying vec2  v_shade;",
    "float hash11(float n) { return fract(sin(n * 78.233) * 43758.5453123); }",
    "vec2 rot(vec2 p, float a) {",
    "  float c = cos(a), s = sin(a);",
    "  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);",
    "}",
    "float sdEllipse(vec2 p, vec2 c, vec2 r) {",
    "  vec2 q = (p - c) / r;",
    "  return (length(q) - 1.0) * min(r.x, r.y);",
    "}",
    "float sdLobe(vec2 p, vec2 c, vec2 r, float ang, float e) {",
    "  vec2 q = abs(rot(p - c, -ang) / r) + 1e-4;",
    "  return (pow(pow(q.x, e) + pow(q.y, e), 1.0 / e) - 1.0) * min(r.x, r.y);",
    "}",
    "float sdSeg(vec2 p, vec2 a, vec2 b) {",
    "  vec2 pa = p - a, ba = b - a;",
    "  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);",
    "  return length(pa - ba * h);",
    "}",
    "float smin(float a, float b, float k) {",
    "  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);",
    "  return mix(b, a, h) - k * h * (1.0 - h);",
    "}",
    "void main() {",
    "  vec2 p = v_local;",
    "  float fold = max(v_fold, 0.08);",
    "  vec2 w = vec2(abs(p.x) / fold, p.y);",
    "  float dFore = sdLobe(w, vec2(0.40, 0.28), vec2(0.46, 0.21), 0.60, 1.38);",
    "  float dHind = sdLobe(w, vec2(0.26, -0.24), vec2(0.32, 0.22), -0.80, 2.0);",
    "  float dRoot = sdLobe(w, vec2(0.16, 0.01), vec2(0.23, 0.29), 0.0, 2.0);",
    "  float dWing = smin(smin(dFore, dHind, 0.03), dRoot, 0.05);",
    "  float dBody = sdEllipse(p, vec2(0.0, -0.16), vec2(0.030, 0.28));",
    "  dBody = smin(dBody, sdEllipse(p, vec2(0.0, 0.17), vec2(0.048, 0.14)), 0.04);",
    "  dBody = smin(dBody, length(p - vec2(0.0, 0.33)) - 0.042, 0.03);",
    "  vec2 ap = vec2(abs(p.x), p.y);",
    "  float dAnt = sdSeg(ap, vec2(0.02, 0.36), vec2(0.12, 0.57)) - 0.008;",
    "  dAnt = min(dAnt, length(ap - vec2(0.131, 0.593)) - 0.018);",
    "  float aa = v_aa;",
    "  float wingA = 1.0 - smoothstep(-aa, aa, dWing);",
    "  float bodyA = 1.0 - smoothstep(-aa, aa, dBody);",
    "  float antA = 1.0 - smoothstep(-aa, aa, dAnt);",
    "  float cover = max(max(wingA, bodyA), antA * 0.9);",
    "  if (cover < 0.004) discard;",
    "  vec3 ink = uBase * 0.38;",
    "  vec3 bodyInk = uBase * 0.20;",
    "  vec2 hq = w - vec2(0.04, 0.05);",
    "  float rad = length(hq);",
    "  float t = smoothstep(0.16, 0.74, rad);",
    "  vec3 wing = mix(uBase, uAccent, clamp(t * 0.95 + v_shade.y * 0.25 - 0.12, 0.0, 1.0));",
    "  float va = atan(hq.y, max(hq.x, 1e-4));",
    "  float vein = 1.0 - smoothstep(0.0, 0.06, abs(fract(va * 1.45 + 0.5) - 0.5) * 2.0);",
    "  wing = mix(wing, ink, vein * 0.30 * smoothstep(0.12, 0.45, rad));",
    "  float rim = smoothstep(-0.055, -0.004, dWing);",
    "  vec2 qf = rot(w - vec2(0.40, 0.28), -0.60) / vec2(0.46, 0.21);",
    "  float spots = 0.0;",
    "  for (int i = 0; i < 2; i++) {",
    "    float fi = float(i);",
    "    float sd = v_seed * 97.0 + fi * 11.0;",
    "    vec2 sc = vec2(-0.30 + 1.05 * hash11(sd), -0.55 + 1.10 * hash11(sd + 4.7));",
    "    spots = max(spots, 1.0 - smoothstep(0.0, 0.06, length(qf - sc) - 0.13));",
    "  }",
    "  spots *= step(dWing, 0.0);",
    "  vec3 col = mix(wing, ink, clamp(rim * 0.9 + spots * 0.5, 0.0, 1.0));",
    "  col *= 1.0 + 0.12 * p.x;",
    "  col *= mix(0.72, 1.0, fold);",
    "  col = mix(col, bodyInk, bodyA);",
    "  col = mix(col, bodyInk, antA * 0.9);",
    "  float a = cover * v_shade.x;",
    "  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * a, a);",
    "}"
  ].join("\n");

  function parseColor(input, fb) {
    if (!input) return fb;
    var str = String(input).trim();
    if (str.charAt(0) === "#") {
      var hex = str.slice(1);
      if (hex.length === 3 || hex.length === 4)
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      if (hex.length >= 6) {
        var r = parseInt(hex.slice(0, 2), 16);
        var g = parseInt(hex.slice(2, 4), 16);
        var b = parseInt(hex.slice(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255];
      }
      return fb;
    }
    var m = str.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      return [Math.min(255, parseFloat(m[0])) / 255,
              Math.min(255, parseFloat(m[1])) / 255,
              Math.min(255, parseFloat(m[2])) / 255];
    }
    return fb;
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      if (window.console) console.error("Drift shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function makeSwarm() {
    var f = function() { return new Float32Array(MAX_COUNT); };
    var sw = {
      x: f(), y: f(), vx: f(), vy: f(), dx: f(), dy: f(),
      th: f(), ph: f(), k1: f(), k2: f(), rate: f(), spd: f(),
      seed: f(), z: f(), panic: f(),
      order: new Int32Array(MAX_COUNT), ordered: -1, bx: 0, by: 0
    };
    var s = 0x2f6e2b1 >>> 0;
    var rnd = function() {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (var i = 0; i < MAX_COUNT; i++) {
      sw.th[i] = rnd() * TAU;
      sw.ph[i] = rnd() * TAU;
      sw.k1[i] = rnd() * TAU;
      sw.k2[i] = rnd() * TAU;
      sw.rate[i] = rnd();
      sw.spd[i] = 0.75 + rnd() * 0.5;
      sw.seed[i] = rnd();
      sw.z[i] = (((i + 1) * 0.7320508075688772) % 1);
      sw.dx[i] = Math.cos(sw.th[i]);
      sw.dy[i] = Math.sin(sw.th[i]);
    }
    return sw;
  }

  function place(sw, bx, by) {
    for (var i = 0; i < MAX_COUNT; i++) {
      sw.x[i] = (((i + 1) * 0.6180339887498949) % 1) * 2 * bx - bx;
      sw.y[i] = (((i + 1) * 0.41421356237309503) % 1) * 2 * by - by;
    }
    sw.bx = bx;
    sw.by = by;
  }

  function reorder(sw, n) {
    var idx = [];
    for (var i = 0; i < n; i++) idx.push(i);
    idx.sort(function(a, b) { return sw.z[a] - sw.z[b]; });
    for (var j = 0; j < n; j++) sw.order[j] = idx[j];
    sw.ordered = n;
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.getElementById("drift-root");
  var hero = document.getElementById("hero");
  if (!root || !hero) return;

  var canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  root.appendChild(canvas);

  var gl = canvas.getContext("webgl", { antialias: false, alpha: true, depth: false });
  if (!gl) {
    if (window.console) console.error("Drift: WebGL unavailable");
    return;
  }

  var vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
  var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  if (!prog) return;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (window.console) console.error("Drift link:", gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  var data = new Float32Array(MAX_COUNT * VERTS_PER_BUG * FLOATS_PER_VERT);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);

  function attr(name, n, offset) {
    var loc = gl.getAttribLocation(prog, name);
    if (loc < 0) {
      if (window.console) console.error("Drift: missing attribute", name);
      return;
    }
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, n, gl.FLOAT, false, STRIDE, offset * 4);
  }
  attr("a_corner", 2, 0);
  attr("a_center", 2, 2);
  attr("a_dir", 2, 4);
  attr("a_ext", 4, 6);
  attr("a_shade", 2, 10);

  var locs = {};
  function u(name) {
    if (!(name in locs)) locs[name] = gl.getUniformLocation(prog, name);
    return locs[name];
  }

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  var sw = makeSwarm();
  var ptr = { x: 0, y: 0, on: 0, onTarget: 0 };
  var raf = 0, last = performance.now(), clock = 0, visible = true;

  function track(e) {
    var r = canvas.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    var fx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    var fy = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    var aspect = canvas.width / Math.max(1, canvas.height);
    ptr.x = (fx - 0.5) * aspect;
    ptr.y = 0.5 - fy;
    ptr.onTarget = 1;
  }
  function leave() { ptr.onTarget = 0; }
  window.addEventListener("pointermove", track);
  document.documentElement.addEventListener("pointerleave", leave);

  function render(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    var cw = root.clientWidth || 1200;
    var ch = root.clientHeight || 800;
    var bw = Math.max(1, Math.round(cw * dpr));
    var bh = Math.max(1, Math.round(ch * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      gl.viewport(0, 0, bw, bh);
    }

    var aspect = bw / bh;
    var halfW = aspect * 0.5;
    var margin = V.span * 1.4;
    var bx = halfW + margin;
    var by = 0.5 + margin;

    if (sw.bx === 0) {
      place(sw, bx, by);
    } else if (Math.abs(bx - sw.bx) > sw.bx * 0.02) {
      var k = bx / sw.bx;
      for (var i = 0; i < MAX_COUNT; i++) sw.x[i] *= k;
      sw.bx = bx;
    }
    sw.by = by;
    if (sw.ordered !== V.count) reorder(sw, V.count);

    var dts = dt * V.speed;
    clock = (clock + dts) % CLOCK_WRAP;

    ptr.on += (ptr.onTarget - ptr.on) * (1 - Math.exp(-6 * dt));

    var reachW = Math.max(1e-4, V.reach * 1.0);
    var spread = V.depth;
    var cruise = CRUISE * V.speed;
    var flapRate = FLAP_HZ * V.flap * V.speed;

    var o = 0;
    for (var kk = 0; kk < V.count; kk++) {
      var ii = sw.order[kk];
      var z = sw.z[ii];
      var par = 0.65 + 0.55 * z;

      sw.th[ii] += (Math.sin(clock * 0.9 + sw.k1[ii]) * 0.85 +
                    Math.sin(clock * 2.3 + sw.k2[ii]) * 0.5) * V.wander * 3.0 * dts;
      sw.ph[ii] += flapRate * (1 + sw.panic[ii] * 1.5) * (0.85 + 0.3 * sw.rate[ii]) * TAU * dt;
      if (sw.ph[ii] > TAU * 1024) sw.ph[ii] -= TAU * 1024;

      var cs = Math.cos(sw.th[ii]), sn = Math.sin(sw.th[ii]);
      var drive = cruise * sw.spd[ii] * par;
      var thrust = 0.55 + 0.75 * Math.max(0, Math.sin(sw.ph[ii]));
      var sway = Math.cos(sw.ph[ii]) * drive * BOB;
      var wantX = cs * drive * thrust - sn * sway;
      var wantY = sn * drive * thrust + cs * sway;

      var kv = 1 - Math.exp(-3.5 * dt);
      sw.vx[ii] += (wantX - sw.vx[ii]) * kv;
      sw.vy[ii] += (wantY - sw.vy[ii]) * kv;

      if (ptr.on > 0.001 && V.hover > 0) {
        var ddx = sw.x[ii] - ptr.x, ddy = sw.y[ii] - ptr.y;
        var dd = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dd < reachW) {
          var f0 = 1 - dd / reachW;
          var f = f0 * f0 * ptr.on;
          var inv = 1 / Math.max(dd, 1e-4);
          sw.vx[ii] += ddx * inv * PUSH * V.hover * f * dt;
          sw.vy[ii] += ddy * inv * PUSH * V.hover * f * dt;
          var away = Math.atan2(ddy, ddx);
          var diff = away - sw.th[ii];
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          sw.th[ii] += diff * Math.min(1, f * 7 * dt);
          if (f > sw.panic[ii]) sw.panic[ii] = f;
        }
      }
      sw.panic[ii] *= Math.exp(-1.2 * dt);

      var spd = Math.sqrt(sw.vx[ii] * sw.vx[ii] + sw.vy[ii] * sw.vy[ii]);
      var maxSpd = drive * (1.8 + 6 * sw.panic[ii]) + 1e-6;
      if (spd > maxSpd) {
        var sc = maxSpd / spd;
        sw.vx[ii] *= sc;
        sw.vy[ii] *= sc;
      }

      sw.x[ii] += sw.vx[ii] * dt;
      sw.y[ii] += sw.vy[ii] * dt;

      if (sw.x[ii] > bx) sw.x[ii] -= 2 * bx;
      else if (sw.x[ii] < -bx) sw.x[ii] += 2 * bx;
      if (sw.y[ii] > by) sw.y[ii] -= 2 * by;
      else if (sw.y[ii] < -by) sw.y[ii] += 2 * by;

      var vl = Math.sqrt(sw.vx[ii] * sw.vx[ii] + sw.vy[ii] * sw.vy[ii]);
      var tx = vl > 1e-5 ? sw.vx[ii] / vl : cs;
      var ty = vl > 1e-5 ? sw.vy[ii] / vl : sn;
      var kd = 1 - Math.exp(-9 * dt);
      sw.dx[ii] += (tx - sw.dx[ii]) * kd;
      sw.dy[ii] += (ty - sw.dy[ii]) * kd;
      var dl = Math.sqrt(sw.dx[ii] * sw.dx[ii] + sw.dy[ii] * sw.dy[ii]) || 1;
      sw.dx[ii] /= dl;
      sw.dy[ii] /= dl;

      var fold = 0.24 + 0.76 * Math.pow(0.5 + 0.5 * Math.cos(sw.ph[ii]), 0.62);
      var half = V.span * (1 + (z - 0.5) * spread * 0.9);
      var far = 1 - z;
      var alpha = 1 - spread * 0.6 * far;
      // edge merge: fade out toward the canvas borders so no seam shows
      var edgeX = Math.min(1, (bx - Math.abs(sw.x[ii])) / (bx * 0.18 + 0.05));
      var edgeY = Math.min(1, (by - Math.abs(sw.y[ii])) / (by * 0.18 + 0.05));
      var edge = Math.max(0, Math.min(1, Math.min(edgeX, edgeY)));
      alpha *= edge * edge;
      var blurPx = V.blur * 4 * far * far * spread;

      for (var c = 0; c < VERTS_PER_BUG; c++) {
        data[o] = CORNERS[c * 2];
        data[o + 1] = CORNERS[c * 2 + 1];
        data[o + 2] = sw.x[ii];
        data[o + 3] = sw.y[ii];
        data[o + 4] = sw.dx[ii];
        data[o + 5] = sw.dy[ii];
        data[o + 6] = half;
        data[o + 7] = fold;
        data[o + 8] = sw.seed[ii];
        data[o + 9] = blurPx;
        data[o + 10] = alpha;
        data[o + 11] = sw.seed[ii];
        o += FLOATS_PER_VERT;
      }
    }

    var base = parseColor(V.baseColor, [0.91, 0.459, 0.169]);
    var accent = parseColor(V.accentColor, [1, 0.851, 0.627]);
    gl.uniform2f(u("uHalf"), halfW, 0.5);
    gl.uniform1f(u("uPxUnit"), bh);
    gl.uniform3f(u("uBase"), base[0], base[1], base[2]);
    gl.uniform3f(u("uAccent"), accent[0], accent[1], accent[2]);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, o));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, V.count * VERTS_PER_BUG);
    raf = requestAnimationFrame(render);
  }

  if (reduceMotion) {
    render(performance.now());
  } else {
    if ("ResizeObserver" in window) {
      new ResizeObserver(function() { /* sized per-frame in render */ }).observe(root);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function(entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !visible) {
          visible = true;
          last = performance.now();
          raf = requestAnimationFrame(render);
        } else if (!vis && visible) {
          visible = false;
          cancelAnimationFrame(raf);
        }
      }, { threshold: 0 }).observe(hero);
    }
    var rzT = 0;
    window.addEventListener('resize', function(){
      clearTimeout(rzT);
      rzT = setTimeout(function(){
        SMALL_SCREEN = window.innerWidth < 640;
        MAX_DPR = SMALL_SCREEN ? 1 : 1.5;
        V.count = SMALL_SCREEN ? 16 : 32;
      }, 200);
    });
    last = performance.now();
    raf = requestAnimationFrame(render);
  }
}
