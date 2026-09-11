import { initMotes } from './motes.js';

export function initBackgrounds() {
/* =========================================================================
   CloudSky — vanilla WebGL port, fixed full-page background (z:-3)
   ========================================================================= */
(function(){
  var MAX_DPR = 1.5;
  var PUFF_UP = 0.34, PUFF_DOWN = 0.19, ERODE = 0.7, SHADOW_STEP = 0.085;
  var NEAR_CELL = 1.05, FAR_CELL = 2.15, FAR_MIX = 0.55;
  var NEAR_DRIFT = 0.055, FAR_DRIFT = 0.026, CIRRUS_DRIFT = 0.014;
  var PUFF_WMAX = 2.15, SHADE_BLEND = 12.0;

  var VERT_SRC = "attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }";

  var FRAG_SRC = [
"#ifdef GL_FRAGMENT_PRECISION_HIGH",
"precision highp float;",
"#else",
"precision mediump float;",
"#endif",
"uniform vec2 uRes;",
"uniform float uNearX, uFarX, uCirrusX;",
"uniform float uCoverage, uSize, uSoftness, uShadow, uCirrus;",
"uniform vec3 uZenith, uHorizon, uCloud;",
"uniform vec4 uGlow;",
"uniform vec2 uSun;",
"uniform vec2 uParallax;",
"vec2 hash22(vec2 p){",
"  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));",
"  q += dot(q, q.yzx + 33.33);",
"  return fract((q.xx + q.yz) * q.zy);",
"}",
"float hash12(vec2 p){",
"  vec3 q = fract(vec3(p.xyx) * 0.1031);",
"  q += dot(q, q.yzx + 33.33);",
"  return fract((q.x + q.y) * q.z);",
"}",
"float vnoise(vec2 x){",
"  vec2 i = floor(x), f = fract(x);",
"  f = f * f * (3.0 - 2.0 * f);",
"  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),",
"             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);",
"}",
"float fbm(vec2 p){",
"  float a = 0.5, s = 0.0;",
"  for (int i = 0; i < 4; i++){",
"    s += a * vnoise(p);",
"    p *= 2.03;",
"    a *= 0.5;",
"  }",
"  return s;",
"}",
"vec2 blobs(vec2 uv, float seed){",
"  vec2 id = floor(uv), f = fract(uv);",
"  float best = -1e4;",
"  float wsum = 0.0, ysum = 0.0;",
"  float wMax = min(" + PUFF_WMAX.toFixed(3) + ", 0.72 * uSize);",
"  float reach = min(2.0, ceil(wMax + 0.85) - 1.0);",
"  for (int j = -2; j <= 2; j++){",
"    for (int i = -2; i <= 2; i++){",
"      vec2 o = vec2(float(i), float(j));",
"      if (max(abs(o.x), abs(o.y)) > reach) continue;",
"      vec2 h = hash22(id + o + seed);",
"      if (fract(h.x * 37.1) > uCoverage) continue;",
"      vec2 c = o + 0.15 + h * 0.7;",
"      float w = min(" + PUFF_WMAX.toFixed(3) + ", (0.30 + 0.42 * fract(h.y * 19.7)) * uSize);",
"      vec2 d = f - c;",
"      float ry = (d.y > 0.0 ? " + PUFF_UP.toFixed(3) + " : " + PUFF_DOWN.toFixed(3) + ") * uSize * (0.8 + 0.5 * fract(h.y * 7.3));",
"      float e = length(vec2(d.x / max(w, 1e-3), d.y / max(ry, 1e-3)));",
"      float val = 1.0 - e;",
"      float yN = d.y / max(ry, 1e-3);",
"      if (val > best){",
"        float k = exp(" + SHADE_BLEND.toFixed(1) + " * (best - val));",
"        wsum = wsum * k + 1.0;",
"        ysum = ysum * k + yN;",
"        best = val;",
"      } else {",
"        float g = exp(" + SHADE_BLEND.toFixed(1) + " * (val - best));",
"        wsum += g;",
"        ysum += g * yN;",
"      }",
"    }",
"  }",
"  return vec2(best, ysum / max(wsum, 1e-4));",
"}",
"vec2 cloudField(vec2 uv, float seed, float detailScale){",
"  vec2 b = blobs(uv, seed);",
"  float n = fbm(uv * detailScale + seed * 3.1) * 0.72",
"          + fbm(uv * detailScale * 3.3 + seed * 7.7) * 0.28;",
"  return vec2(b.x - (1.0 - n) * " + ERODE.toFixed(3) + ", b.y);",
"}",
"vec3 shadeCloud(float dyNorm, vec3 sky){",
"  float t = smoothstep(-0.95, 0.25, dyNorm);",
"  vec3 base = mix(uCloud * 0.52, sky, 0.34);",
"  return mix(mix(uCloud, base, uShadow), uCloud, t);",
"}",
"void main(){",
"  vec2 frag = gl_FragCoord.xy / max(uRes.y, 1.0);",
"  float aspect = uRes.x / max(uRes.y, 1.0);",
"  vec2 p = vec2(frag.x, frag.y);",
"  vec3 sky = mix(uHorizon, uZenith, smoothstep(-0.15, 1.05, p.y));",
"  vec2 sunP = vec2(uSun.x * aspect, uSun.y);",
"  float sd = length(p - sunP);",
"  sky += uGlow.rgb * uGlow.a * exp(-sd * 3.4) * 0.30;",
"  vec3 col = sky;",
"  if (uCirrus > 0.0) {",
"    vec2 cuv = vec2(p.x * 1.4 + uCirrusX, p.y * 5.5);",
"    float veil = fbm(cuv) * fbm(cuv * 2.3 + 9.0);",
"    veil = smoothstep(0.24, 0.55, veil) * smoothstep(0.15, 0.7, p.y);",
"    col = mix(col, uCloud, veil * uCirrus * 0.5);",
"  }",
"  vec2 fuv = vec2(p.x + uFarX, p.y) * " + FAR_CELL.toFixed(3) + " + uParallax * 0.4;",
"  vec2 fd = cloudField(fuv, 17.0, 11.0);",
"  float fa = clamp(fd.x * uSoftness, 0.0, 1.0);",
"  if (fa > 0.0) {",
"    vec3 lit = shadeCloud(fd.y, sky);",
"    col = mix(col, mix(lit, sky, " + FAR_MIX.toFixed(3) + "), fa);",
"  }",
"  vec2 nuv = vec2(p.x + uNearX, p.y) * " + NEAR_CELL.toFixed(3) + " + uParallax;",
"  vec2 nd = cloudField(nuv, 3.0, 8.5);",
"  float na = clamp(nd.x * uSoftness, 0.0, 1.0);",
"  if (na > 0.0) {",
"    vec3 lit = shadeCloud(nd.y, sky);",
"    float above = clamp(cloudField(nuv + vec2(0.0, " + SHADOW_STEP.toFixed(3) + "), 3.0, 8.5).x * uSoftness, 0.0, 1.0);",
"    lit *= 1.0 - 0.18 * uShadow * above;",
"    lit += uGlow.rgb * uGlow.a * 0.22 * exp(-length(p - sunP) * 1.6);",
"    col = mix(col, lit, na);",
"  }",
"  gl_FragColor = vec4(col, 1.0);",
"}"
  ].join("\n");

  function compile(gl, type, src){
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      console.error("CloudSky shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function parseColor(input, fb){
    if (!input) return fb;
    var str = String(input).trim();
    if (str.charAt(0) === "#"){
      var hex = str.slice(1);
      if (hex.length === 3 || hex.length === 4){
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+(hex.length===4?hex[3]+hex[3]:"");
      }
      if (hex.length >= 6){
        var r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
        var a = hex.length >= 8 ? parseInt(hex.slice(6,8),16)/255 : 1;
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r/255, g/255, b/255, a];
      }
      return fb;
    }
    var m = str.match(/[\d.]+/g);
    if (m && m.length >= 3){
      return [
        Math.min(255, parseFloat(m[0]))/255,
        Math.min(255, parseFloat(m[1]))/255,
        Math.min(255, parseFloat(m[2]))/255,
        m.length >= 4 ? Math.min(1, parseFloat(m[3])) : 1
      ];
    }
    return fb;
  }

  window.__initCloudSky = function(canvas, reduceMotion){
    var gl = canvas.getContext("webgl", { alpha:false, antialias:false, depth:false });
    if (!gl){ console.error("CloudSky: WebGL unavailable"); return; }

    var vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)){
      console.error("CloudSky link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var locs = {};
    function u(name){
      if (!(name in locs)) locs[name] = gl.getUniformLocation(prog, name);
      return locs[name];
    }

    var settings = {
      zenith: "#1E63D8",
      horizon: "#BEDCF7",
      cloud: "#FFFDF8",
      glow: "rgba(255, 214, 170, 0.9)",
      coverage: 58/100,
      speed: (reduceMotion ? 8 : 42)/50,
      size: 138/100,
      softness: 4.5 / Math.max(0.15, 150/100),
      shadow: 95/100,
      cirrus: 55/100,
      sunX: 76/100,
      sunY: 88/100,
      parallax: reduceMotion ? 0 : 110/100,
      wind: reduceMotion ? 0 : 90/100,
      damping: 18
    };

    var ptr = { x:0, y:0, inside:false };
    var raf = 0, last = performance.now();
    var nearX = 0, farX = 0, cirrusX = 0, leanX = 0, leanY = 0;

    function render(now){
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      var k = 1 - Math.exp(-settings.damping * 0.12 * dt);
      leanX += ((ptr.inside ? ptr.x : 0) - leanX) * k;
      leanY += ((ptr.inside ? ptr.y : 0) - leanY) * k;

      var gust = 1 + leanX * settings.wind;
      var rate = settings.speed * gust;
      nearX = (nearX - NEAR_DRIFT * rate * dt) % 1000;
      farX = (farX - FAR_DRIFT * rate * dt) % 1000;
      cirrusX = (cirrusX - CIRRUS_DRIFT * rate * dt) % 1000;

      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var cw = canvas.clientWidth || window.innerWidth || 1200, ch = canvas.clientHeight || window.innerHeight || 800;
      var bw = Math.max(1, Math.round(cw * dpr)), bh = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== bw || canvas.height !== bh){
        canvas.width = bw;
        canvas.height = bh;
      }
      gl.viewport(0, 0, bw, bh);

      var zen = parseColor(settings.zenith, [0.369,0.576,0.824,1]);
      var hor = parseColor(settings.horizon, [0.706,0.824,0.941,1]);
      var cld = parseColor(settings.cloud, [1,1,1,1]);
      var glow = parseColor(settings.glow, [0.91,0.953,1,0.9]);

      gl.uniform2f(u("uRes"), bw, bh);
      gl.uniform1f(u("uNearX"), nearX);
      gl.uniform1f(u("uFarX"), farX);
      gl.uniform1f(u("uCirrusX"), cirrusX);
      gl.uniform1f(u("uCoverage"), settings.coverage);
      gl.uniform1f(u("uSize"), settings.size);
      gl.uniform1f(u("uSoftness"), settings.softness);
      gl.uniform1f(u("uShadow"), settings.shadow);
      gl.uniform1f(u("uCirrus"), settings.cirrus);
      gl.uniform2f(u("uSun"), settings.sunX, settings.sunY);
      gl.uniform2f(u("uParallax"), -leanX * settings.parallax * 0.07, -leanY * settings.parallax * 0.05);
      gl.uniform3f(u("uZenith"), zen[0], zen[1], zen[2]);
      gl.uniform3f(u("uHorizon"), hor[0], hor[1], hor[2]);
      gl.uniform3f(u("uCloud"), cld[0], cld[1], cld[2]);
      gl.uniform4f(u("uGlow"), glow[0], glow[1], glow[2], glow[3]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    }

    window.addEventListener("pointermove", function(e){
      ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.y = 1 - (e.clientY / window.innerHeight) * 2;
      ptr.inside = true;
    });

    raf = requestAnimationFrame(render);
  };
})();

/* =========================================================================
   CycloneInk — vanilla WebGL port, fixed full-page background (z:-2)
   crossfades in after the CloudSky + About zone.
   ========================================================================= */
(function(){
  var MAX_DPR = 1.25, MAX_DT = 0.05, PULSE_DECAY = 0.9;
  var SPIN_RATE = 0.1, DRIFT_RATE = 0.06, RADIAL_LOOP = 8;
  var CELLS_PER_TURN = 26, CELLS_PER_EFOLD = 4;
  var GRAIN = "0.0550";

  var VERT_SRC = "attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }";

  var FRAG_SRC = [
"precision highp float;",
"#define TAU 6.28318530718",
"#define OCT 7",
"uniform vec2 uRes;",
"uniform float uPx;",
"uniform float uSpin;",
"uniform float uDrift;",
"uniform float uB;",
"uniform float uArms;",
"uniform vec2 uCells;",
"uniform vec2 uCellsW;",
"uniform vec2 uPer;",
"uniform vec2 uPerW;",
"uniform float uTurb;",
"uniform float uBlur;",
"uniform float uCoreR;",
"uniform float uHard;",
"uniform vec2 uLight;",
"uniform float uSpread;",
"uniform vec3 uBg;",
"uniform vec3 uBase;",
"uniform vec3 uAccent;",
"float hash21(vec2 p) {",
"    vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));",
"    q += dot(q, q.yzx + 33.33);",
"    return fract((q.x + q.y) * q.z);",
"}",
"float vnoise(vec2 x, vec2 per) {",
"    vec2 i = floor(x);",
"    vec2 f = fract(x);",
"    f = f * f * (3.0 - 2.0 * f);",
"    vec2 i0 = mod(i, per);",
"    vec2 i1 = mod(i + 1.0, per);",
"    float a = hash21(vec2(i0.x, i0.y));",
"    float b = hash21(vec2(i1.x, i0.y));",
"    float c = hash21(vec2(i0.x, i1.y));",
"    float d = hash21(vec2(i1.x, i1.y));",
"    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
"}",
"float fbm(vec2 x, vec2 per, float cut) {",
"    float sum = 0.0;",
"    float wsum = 0.0;",
"    float amp = 1.0;",
"    vec2 p = x;",
"    vec2 pr = per;",
"    for (int i = 0; i < OCT; i++) {",
"        float f = exp2(float(i));",
"        float fc = f * cut;",
"        float k = 1.0 / (1.0 + fc * fc);",
"        float wg = amp * k;",
"        sum += wg * abs(2.0 * vnoise(p, pr) - 1.0);",
"        wsum += wg;",
"        p *= 2.0;",
"        pr *= 2.0;",
"        amp *= 0.62;",
"    }",
"    return 1.0 - 1.55 * (sum / max(wsum, 1e-5));",
"}",
"void main() {",
"    vec2 fc = gl_FragCoord.xy;",
"    float m = min(uRes.x, uRes.y);",
"    vec2 p = (fc - 0.5 * uRes) / m;",
"    float r = length(p);",
"    float rs = max(r, 1e-4);",
"    float lr = log(rs);",
"    float a = atan(p.y, p.x);",
"    float b = max(uB, 0.02);",
"    float w = lr / b - (a + uSpin);",
"    float turns = w / TAU;",
"    float lrz = lr + uDrift;",
"    float invr = 1.0 / rs;",
"    float gw = invr * sqrt(1.0 + 1.0 / (b * b));",
"    float jac = max(uCells.x * gw / TAU, uCells.y * invr) * uPx;",
"    float smear = 1.0 + uBlur * pow(r, 1.5) * 18.0;",
"    float cut = min(jac * 0.9 * smear, 4096.0);",
"    float cutW = min(cut * (uCellsW.x / max(uCells.x, 1.0)), 4096.0);",
"    vec2 q = vec2(turns * uCells.x, lrz * uCells.y);",
"    vec2 qw = vec2(turns * uCellsW.x, lrz * uCellsW.y);",
"    vec2 warp = vec2(fbm(qw, uPerW, cutW), fbm(qw + 19.7, uPerW, cutW)) - 0.5;",
"    float n = fbm(q + warp * (uTurb * 3.2), uPer, cut);",
"    float bandv = 0.5 + 0.5 * cos(w * uArms);",
"    float nd = n - 0.5;",
"    float v = bandv + nd * 1.25;",
"    float env = smoothstep(uCoreR * 0.35, uCoreR * 1.15, r);",
"    env *= 1.0 - 0.42 * smoothstep(0.30, 1.05, r);",
"    float bandAA = 0.5 * uArms * gw * uPx;",
"    float aa = clamp(max(bandAA, min(jac, 1.0) * 0.9), 0.0015, 0.45);",
"    float wdt = max(aa, 0.45 * pow(1.0 - uHard, 1.6)) * (1.0 + uBlur * pow(r, 1.5) * 2.2);",
"    float vv = mix(0.5 - wdt - 0.02, v, env);",
"    float ink = smoothstep(0.5 - wdt, 0.5 + wdt, vv);",
"    vec2 luv = fc / uRes - 0.5;",
"    luv.x *= uRes.x / uRes.y;",
"    float sp = max(uSpread, 0.02);",
"    float glow = smoothstep(-sp, sp, dot(luv, uLight));",
"    vec3 field = mix(uBg, uAccent, clamp(glow + nd * 0.5, 0.0, 1.0));",
"    vec3 col = mix(field, uBase, ink);",
"    float core = pow(1.0 - smoothstep(0.0, uCoreR * 1.6, r), 1.5);",
"    col = mix(col, uAccent, core * 0.85);",
"    col += (hash21(fc + 0.5) - 0.5) * " + GRAIN + ";",
"    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);",
"}"
  ].join("\n");

  function compile(gl, type, src){
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      console.error("CycloneInk shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function parseColor(input, fb){
    if (!input) return fb;
    var str = String(input).trim();
    if (str.charAt(0) === "#"){
      var hex = str.slice(1);
      if (hex.length === 3 || hex.length === 4){ hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; }
      if (hex.length >= 6){
        var r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r/255, g/255, b/255];
      }
      return fb;
    }
    var mm = str.match(/[\d.]+/g);
    if (mm && mm.length >= 3){
      return [Math.min(255,parseFloat(mm[0]))/255, Math.min(255,parseFloat(mm[1]))/255, Math.min(255,parseFloat(mm[2]))/255];
    }
    return fb;
  }

  function wrap(x, m){ return ((x % m) + m) % m; }

  window.__initCycloneInk = function(canvas, reduceMotion){
    var gl = canvas.getContext("webgl", { antialias:false, alpha:false, depth:false });
    if (!gl){ console.error("CycloneInk: WebGL unavailable"); return; }

    var vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)){
      console.error("CycloneInk link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var u = {
      res: gl.getUniformLocation(prog, "uRes"),
      px: gl.getUniformLocation(prog, "uPx"),
      spin: gl.getUniformLocation(prog, "uSpin"),
      drift: gl.getUniformLocation(prog, "uDrift"),
      b: gl.getUniformLocation(prog, "uB"),
      arms: gl.getUniformLocation(prog, "uArms"),
      cells: gl.getUniformLocation(prog, "uCells"),
      cellsW: gl.getUniformLocation(prog, "uCellsW"),
      per: gl.getUniformLocation(prog, "uPer"),
      perW: gl.getUniformLocation(prog, "uPerW"),
      turb: gl.getUniformLocation(prog, "uTurb"),
      blur: gl.getUniformLocation(prog, "uBlur"),
      coreR: gl.getUniformLocation(prog, "uCoreR"),
      hard: gl.getUniformLocation(prog, "uHard"),
      lightDir: gl.getUniformLocation(prog, "uLight"),
      spread: gl.getUniformLocation(prog, "uSpread"),
      bg: gl.getUniformLocation(prog, "uBg"),
      base: gl.getUniformLocation(prog, "uBase"),
      accent: gl.getUniformLocation(prog, "uAccent")
    };

    // -------- preset: deep-indigo ink vortex tuned to the site palette --------
    var density = 200, streak = 100, turbulence = 100, blurAmt = 100;
    var dens = Math.max(0.1, density/100);
    var streak01 = Math.max(0.25, streak/100);
    var cellsA = Math.max(1, Math.round(CELLS_PER_TURN * dens));
    var cellsR = Math.max(1, Math.round((CELLS_PER_EFOLD * dens) / streak01));
    var cellsAW = Math.max(1, Math.round(cellsA / 4));
    var cellsRW = Math.max(1, Math.round(cellsR / 2));
    var twistDeg = Math.min(85, Math.max(5, 30));
    var lightAngle = 79 * Math.PI / 180;

    var v = {
      bg: parseColor("#171432", [0.09,0.08,0.2]),
      base: parseColor("#0A0910", [0.04,0.04,0.06]),
      accent: parseColor("#EDE7FF", [0.93,0.91,1]),
      spin: (reduceMotion ? 12 : 55) / 50,
      drift: 25/50,
      b: Math.tan(twistDeg * Math.PI/180),
      arms: 2,
      cells: [cellsA, cellsR],
      cellsW: [cellsAW, cellsRW],
      turb: Math.max(0, turbulence/100),
      blur: Math.max(0, blurAmt/100),
      coreR: 0.02 + (30/100)*0.12,
      hard: 0.62,
      lightDir: [Math.cos(lightAngle), Math.sin(lightAngle)],
      spread: Math.max(0.02, (200/100)*0.45),
      hoverBoost: reduceMotion ? 0 : 1.3
    };

    var interaction = { hoverTarget: reduceMotion ? 0 : 1, pulse: 0 };
    window.addEventListener("pointermove", function(){ interaction.hoverTarget = reduceMotion ? 0 : 1; });
    window.addEventListener("pointerdown", function(){ if (!reduceMotion) interaction.pulse = 1; });

    var raf = 0, last = performance.now(), spinT = 0, driftT = 0, hoverAmt = 0;

    function render(now){
      var dt = Math.min(MAX_DT, Math.max(0, (now - last) / 1000));
      last = now;

      hoverAmt += (interaction.hoverTarget - hoverAmt) * Math.min(1, dt * 5);
      interaction.pulse = Math.max(0, interaction.pulse - dt / PULSE_DECAY);
      var pulse = interaction.pulse;

      spinT = wrap(spinT + dt * v.spin * SPIN_RATE * (1 + hoverAmt * v.hoverBoost + pulse * 2.5), Math.PI * 2);
      driftT = wrap(driftT + dt * v.drift * DRIFT_RATE, RADIAL_LOOP);

      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var cw = canvas.clientWidth || window.innerWidth || 1200, ch = canvas.clientHeight || window.innerHeight || 800;
      var bw = Math.max(1, Math.round(cw * dpr)), bh = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== bw || canvas.height !== bh){
        canvas.width = bw;
        canvas.height = bh;
        gl.viewport(0, 0, bw, bh);
      }

      gl.uniform2f(u.res, bw, bh);
      gl.uniform1f(u.px, 1 / Math.min(bw, bh));
      gl.uniform1f(u.spin, spinT);
      gl.uniform1f(u.drift, driftT);
      gl.uniform1f(u.b, v.b);
      gl.uniform1f(u.arms, v.arms);
      gl.uniform2f(u.cells, v.cells[0], v.cells[1]);
      gl.uniform2f(u.cellsW, v.cellsW[0], v.cellsW[1]);
      gl.uniform2f(u.per, v.cells[0], v.cells[1] * RADIAL_LOOP);
      gl.uniform2f(u.perW, v.cellsW[0], v.cellsW[1] * RADIAL_LOOP);
      gl.uniform1f(u.turb, v.turb * (1 + pulse * 1.2));
      gl.uniform1f(u.blur, v.blur * (1 + pulse * 1.8));
      gl.uniform1f(u.coreR, v.coreR * (1 + pulse * 0.5));
      gl.uniform1f(u.hard, v.hard);
      gl.uniform2f(u.lightDir, v.lightDir[0], v.lightDir[1]);
      gl.uniform1f(u.spread, v.spread * (1 + pulse * 0.4));
      gl.uniform3f(u.bg, v.bg[0], v.bg[1], v.bg[2]);
      gl.uniform3f(u.base, v.base[0], v.base[1], v.base[2]);
      gl.uniform3f(u.accent, v.accent[0], v.accent[1], v.accent[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    }

    raf = requestAnimationFrame(render);
  };
})();

/* =========================================================================
   Boot shaders + crossfade + navbar + parallax + motes
   ========================================================================= */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var sky = document.getElementById('sky');
  var ink = document.getElementById('ink');
  if (sky) window.__initCloudSky(sky, reduceMotion);
  if (ink) window.__initCycloneInk(ink, reduceMotion);

  // ---- crossfade sky -> ink across the transition zone ----
  var zone = document.getElementById('sky-to-ink');
  var scrim = document.getElementById('fade-scrim');
  var line = document.getElementById('transition-line');

  // ---- navbar ----
  var navbar = document.getElementById('navbar');
  var navLinks = document.querySelectorAll('.nav-link[data-nav]');
  var hero = document.getElementById('hero');
  var pointerX = window.innerWidth / 2, pointerY = 0;

  function updateFade(){
    if (!zone) return;
    var rect = zone.getBoundingClientRect();
    var vh = window.innerHeight;
    var progress = (vh - rect.top) / (vh + rect.height);
    progress = Math.max(0, Math.min(1, progress));
    if (ink) ink.style.opacity = String(progress);
    if (scrim) scrim.style.opacity = String(4 * progress * (1 - progress));
    if (line) line.style.opacity = String(Math.max(0, Math.min(1, 4 * progress * (1 - progress) * 1.4)));

    // switch navbar to dark theme once past the sky
    if (navbar) navbar.classList.toggle('on-dark', progress > 0.35);
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ updateFade(); updateActiveSection(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
  updateFade();

  // proximity grow + shine border (capped to one layout pass per frame)
  var NEAR = 260;
  var navPending = false, navEvt = null;
  function updateNavProximity(e){
    if (!navbar) return;
    var rect = navbar.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = e.clientX - cx;
    var dy = e.clientY - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > NEAR + 160) {
      // pointer far away: clear highlights without measuring every link
      navLinks.forEach(function(link){
        if (link._near) {
          link._near = false;
          link.classList.remove('is-near');
          link.style.transform = '';
        }
      });
      navbar.style.setProperty('--nav-shine', '0');
      return;
    }

    navLinks.forEach(function(link){
      var r = link.getBoundingClientRect();
      var lx = r.left + r.width / 2;
      var ly = r.top + r.height / 2;
      var d = Math.sqrt((e.clientX - lx) * (e.clientX - lx) + (e.clientY - ly) * (e.clientY - ly));
      if (d < NEAR) {
        if (!link._near) { link._near = true; link.classList.add('is-near'); }
        link.style.transform = 'scale(' + (1 + (1 - d / NEAR) * 0.28).toFixed(3) + ')';
      } else if (link._near) {
        link._near = false;
        link.classList.remove('is-near');
        link.style.transform = '';
      }
    });

    navbar.style.setProperty('--nav-shine-angle', Math.atan2(dy, dx) + 'rad');
    navbar.style.setProperty('--nav-shine', dist < 300 ? (1 - dist / 300).toFixed(3) : '0');
  }

  document.addEventListener('pointermove', function(e){
    pointerX = e.clientX;
    pointerY = e.clientY;
    navEvt = e;
    if (!navPending) {
      navPending = true;
      requestAnimationFrame(function(){
        navPending = false;
        if (navEvt) updateNavProximity(navEvt);
      });
    }
    updateParallax();
  });

  document.addEventListener('pointerleave', function(){
    navEvt = null;
    navLinks.forEach(function(link){
      link._near = false;
      link.classList.remove('is-near');
      link.style.transform = '';
    });
    if (navbar) navbar.style.setProperty('--nav-shine', '0');
  });

  // active section tracking
  var sections = document.querySelectorAll('section[id], header[id]');
  function updateActiveSection(){
    var scrollY = window.scrollY + window.innerHeight * 0.35;
    var active = null;
    sections.forEach(function(s){
      if (s.offsetTop <= scrollY) active = s.id;
    });
    navLinks.forEach(function(link){
      var href = link.getAttribute('href');
      link.classList.toggle('is-active', !!(href && href.slice(1) === active));
    });
  }
  window.addEventListener('scroll', updateActiveSection, { passive:true });
  updateActiveSection();

  // ---- pointer parallax ----
  function updateParallax(){
    if (!hero || reduceMotion) return;
    var w = window.innerWidth, h = window.innerHeight;
    var px = (pointerX / w * 2 - 1).toFixed(4);
    var py = (pointerY / h * 2 - 1).toFixed(4);
    hero.style.setProperty('--px', px);
    hero.style.setProperty('--py', py);
  }

  // ---- scroll reveal ----
  if (!reduceMotion) {
    var els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
      els.forEach(function(el){ io.observe(el); });
    } else {
      els.forEach(function(el){ el.classList.add('is-visible'); });
    }
  }

  // ---- entrance: add is-ready after load ----
  setTimeout(function(){
    document.body.classList.add('is-ready');
    setTimeout(function(){ document.body.classList.add('intro-done'); }, 2200);
  }, reduceMotion ? 0 : 120);

  // ---- init motes (ambient particles) ----
  var motesCanvas = document.getElementById('motes');
  if (motesCanvas && !reduceMotion) initMotes(motesCanvas);
})();
}
