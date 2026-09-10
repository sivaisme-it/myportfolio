
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MAX_PARTICLES = 30000;
const SCALE_FACTOR = 0.085;
const CAM_DISTANCE = 35;

const DEFAULTS = {
  text: "Dummy",
  bloom: "#FF4D0F",
  leaf: "#1F8A3B",
  hueSpread: 20,
  opacity: 20,
  bloomSize: 10,
  leafSize: 10,
  leafMix: 4,
  spread: 4,
  transition: { type: "tween", duration: 0.9, ease: "circOut" },
  hoverOn: true,
  hover: { radius: 9, boost: 12 },
};

const NAMED_EASES = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  circIn: [0.55, 0, 1, 0.45],
  circOut: [0, 0.55, 0.45, 1],
  circInOut: [0.85, 0, 0.15, 1],
  backIn: [0.36, 0, 0.66, -0.56],
  backOut: [0.34, 1.56, 0.64, 1],
  backInOut: [0.68, -0.6, 0.32, 1.6],
  anticipate: [0.36, 0, 0.66, -0.56],
};

function makeEaseFn(transition) {
  let pts = NAMED_EASES.circOut;
  const ease = transition && transition.ease;
  if (Array.isArray(ease) && ease.length === 4 && ease.every(Number.isFinite)) pts = ease;
  else if (typeof ease === "string" && NAMED_EASES[ease]) pts = NAMED_EASES[ease];
  const [x1, y1, x2, y2] = pts;
  if (x1 === y1 && x2 === y2) return function(t) { return t; };
  const bez = function(a, b, t) {
    var u = 1 - t;
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
  };
  return function(t) {
    var x = Math.max(0, Math.min(1, t));
    var s = x;
    for (var i = 0; i < 8; i++) {
      var cx = bez(x1, x2, s) - x;
      var u = 1 - s;
      var dx = 3 * u * u * x1 + 6 * u * s * (x2 - x1) + 3 * s * s * (1 - x2);
      if (Math.abs(dx) < 1e-6) break;
      s -= cx / dx;
      s = Math.max(0, Math.min(1, s));
    }
    return bez(y1, y2, s);
  };
}

function clamp(v, lo, hi, fallback) {
  var n = typeof v === "number" && isFinite(v) ? v : fallback;
  return Math.max(lo, Math.min(hi, n));
}

function toPx(v, fallback, emBasis) {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string") {
    var n = parseFloat(v);
    if (!isFinite(n)) return fallback;
    if (v.indexOf("em") >= 0) return n * emBasis;
    if (v.indexOf("%") >= 0) return (n / 100) * emBasis;
    return n;
  }
  return fallback;
}

function toRatio(v, size, fallback) {
  if (typeof v === "number" && isFinite(v)) return v > 4 ? v / size : v;
  if (typeof v === "string") {
    var n = parseFloat(v);
    if (!isFinite(n)) return fallback;
    if (v.indexOf("px") >= 0) return n / size;
    if (v.indexOf("%") >= 0) return n / 100;
    return n > 4 ? n / size : n;
  }
  return fallback;
}

function settingsFor(cfg) {
  var font = cfg.font || {};
  var fontSize = Math.max(8, toPx(font.fontSize, 100, 16));
  return {
    family: font.fontFamily || "Baskerville, Georgia, serif",
    fontSize: fontSize,
    weight: font.fontWeight || 100,
    fontStyle: font.fontStyle || "normal",
    tracking: toPx(font.letterSpacing, 0, fontSize),
    lineRatio: toRatio(font.lineHeight, fontSize, 0.9),
    hueSpread: clamp(cfg.hueSpread, 0, 20, DEFAULTS.hueSpread) * 0.01,
    bloomAlpha: 0.05 + clamp(cfg.opacity, 1, 20, DEFAULTS.opacity) * 0.045,
    leafAlpha: 0.08 + clamp(cfg.opacity, 1, 20, DEFAULTS.opacity) * 0.045,
    bloomSize: clamp(cfg.bloomSize, 1, 20, DEFAULTS.bloomSize) / 10,
    leafSize: clamp(cfg.leafSize, 1, 20, DEFAULTS.leafSize) / 10,
    leafMix: clamp(cfg.leafMix, 0, 20, DEFAULTS.leafMix) * 0.05,
    spread: clamp(cfg.spread, 0, 20, DEFAULTS.spread) * 0.05,
    duration: Math.max(0.05, (cfg.transition && cfg.transition.duration) || 0.9),
    delay: Math.max(0, (cfg.transition && cfg.transition.delay) || 0),
    hoverRadius: clamp(cfg.hover && cfg.hover.radius, 1, 20, 9) * 0.9,
    hoverBoost: clamp(cfg.hover && cfg.hover.boost, 1, 20, 12) * 0.25,
  };
}

function makeSpriteCanvas(size) {
  var canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  return { canvas: canvas, ctx: canvas.getContext("2d") };
}

function makeFlowerTexture() {
  var size = 128;
  var ref = makeSpriteCanvas(size);
  var canvas = ref.canvas, ctx = ref.ctx;
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  for (var i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.24, size * 0.15, size * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

function makeLeafTexture() {
  var size = 128;
  var ref = makeSpriteCanvas(size);
  var canvas = ref.canvas, ctx = ref.ctx;
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.42);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.05, 0, size * 0.42);
  ctx.quadraticCurveTo(-size * 0.3, -size * 0.05, 0, -size * 0.42);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

function makeBloom(x, y, S) {
  return {
    type: 0, x: x + S.spread * (Math.random() - 0.5),
    y: y + S.spread * (Math.random() - 0.5), z: 0,
    hue: Math.random() - 0.5, toDelete: false, t: 0,
    wait: S.delay * Math.random(), jitter: 0.6 + 0.8 * Math.random(),
    maxScale: 0.9 * Math.pow(Math.random(), 20) * S.bloomSize,
    baseRotation: 0.5 * Math.random() * Math.PI, hover: 0,
  };
}

function makeLeaf(x, y, S) {
  return {
    type: 1, x: x, y: y, z: 0,
    baseRotation: 0.6 * (Math.random() - 0.5) * Math.PI,
    hue: Math.random() - 0.5, toDelete: false, t: 0,
    wait: S.delay * Math.random(), jitter: 0.6 + 0.8 * Math.random(),
    maxScale: (0.1 + 0.7 * Math.pow(Math.random(), 7)) * S.leafSize,
    hover: 0,
  };
}

class FlowerTypeScene {
  constructor(container, cfg) {
    this.container = container;
    this.cfg = cfg;
    this.prev = JSON.parse(JSON.stringify(cfg));
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    var canvas = this.renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.textCanvas = document.createElement("canvas");
    this.textCanvas.width = this.textCanvas.height = 0;
    this.textCtx = this.textCanvas.getContext("2d", { willReadFrequently: true });
    this.input = document.createElement("div");
    this.input.contentEditable = "true";
    this.input.spellcheck = false;
    this.input.setAttribute("aria-label", "Type to reshape the text");
    Object.assign(this.input.style, {
      position: "absolute", top: "0", left: "0", opacity: "0",
      whiteSpace: "pre", pointerEvents: "none", outline: "none",
    });
    container.appendChild(this.input);
    this.geometry = new THREE.PlaneGeometry(1.2, 1.2);
    var S = settingsFor(cfg);
    this.textures = [makeFlowerTexture(), makeLeafTexture()];
    this.materials = [
      new THREE.MeshBasicMaterial({
        alphaMap: this.textures[0], opacity: S.bloomAlpha,
        depthTest: false, transparent: true,
      }),
      new THREE.MeshBasicMaterial({
        alphaMap: this.textures[1], opacity: S.leafAlpha,
        depthTest: false, transparent: true,
      }),
    ];
    this.meshes = [];
    this.dummy = new THREE.Object3D();
    this.coords = [];
    this.particles = [];
    this.stringBox = { wTexture: 0, wScene: 0, hTexture: 0, hScene: 0 };
    this.lastStep = 1;
    this.text = "";
    this.pointer = new THREE.Vector2();
    this.pointerOver = false;
    this.ease = makeEaseFn(cfg.transition);
    this.width = 1;
    this.height = 1;
    this.frameId = 0;
    this.lastT = 0;
    this.disposed = false;
    this.applyInputStyle();
    this.setText(cfg.text);
    this.bindEvents();
  }
  applyInputStyle() {
    var S = settingsFor(this.cfg);
    this.input.style.fontFamily = S.family;
    this.input.style.fontSize = S.fontSize + "px";
    this.input.style.fontWeight = String(S.weight);
    this.input.style.fontStyle = S.fontStyle;
    this.input.style.letterSpacing = S.tracking + "px";
    this.input.style.lineHeight = S.lineRatio * S.fontSize + "px";
  }
  setText(text) {
    var value = typeof text === "string" ? text : "";
    this.input.innerHTML = value.replace(/\n/g, "<div><br></div>");
    this.text = value;
    this.handleInput();
    this.refreshText();
  }
  bindEvents() {
    this.input.addEventListener("keyup", this.onEdit);
    this.input.addEventListener("input", this.onEdit);
    this.container.addEventListener("pointerdown", this.onPointerDown);
    this.container.addEventListener("pointermove", this.onPointerMove);
    this.container.addEventListener("pointerleave", this.onPointerLeave);
    this.container.addEventListener("pointercancel", this.onPointerLeave);
  }
  onEdit = () => {
    if (this.disposed) return;
    this.handleInput();
    this.refreshText();
  };
  onPointerDown = () => {
    if (this.disposed) return;
    this.focusInput();
  };
  onPointerMove = (e) => {
    if (this.disposed) return;
    var rect = this.container.getBoundingClientRect();
    this.pointer.set(
      (e.clientX - rect.left - rect.width / 2) * SCALE_FACTOR,
      -(e.clientY - rect.top - rect.height / 2) * SCALE_FACTOR,
    );
    this.pointerOver = true;
  };
  onPointerLeave = () => {
    if (this.disposed) return;
    this.pointerOver = false;
  };
  focusInput() {
    this.input.style.pointerEvents = "auto";
    this.input.focus({ preventScroll: true });
    this.input.style.pointerEvents = "none";
    var selection = window.getSelection();
    if (!selection) return;
    var range = document.createRange();
    range.selectNodeContents(this.input);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  handleInput() {
    var isNewLine = function(el) {
      var node = el;
      if (!node || !node.tagName) return false;
      var tag = node.tagName.toUpperCase();
      if (tag !== "DIV" && tag !== "P") return false;
      return node.innerHTML === "<br>" || node.innerHTML === "</br>";
    };
    if (isNewLine(this.input.firstChild)) this.input.firstChild && this.input.firstChild.remove();
    if (isNewLine(this.input.lastChild) && isNewLine(this.input.lastChild && this.input.lastChild.previousSibling)) {
      this.input.lastChild && this.input.lastChild.remove();
    }
    this.text = this.input.innerHTML
      .replaceAll("<p>", "\n").replaceAll("</p>", "")
      .replaceAll("<div>", "\n").replaceAll("</div>", "")
      .replaceAll("<br>", "").replaceAll("<br/>", "")
      .replaceAll("&nbsp;", " ");
    this.stringBox.wTexture = this.input.clientWidth;
    this.stringBox.wScene = this.stringBox.wTexture * SCALE_FACTOR;
    this.stringBox.hTexture = this.input.clientHeight;
    this.stringBox.hScene = this.stringBox.hTexture * SCALE_FACTOR;
  }
  refreshText() {
    this.sampleCoordinates();
    var S = settingsFor(this.cfg);
    this.particles = this.coords.map((c, i) => {
      var x = c.x * SCALE_FACTOR;
      var y = c.y * SCALE_FACTOR;
      var p = this.coords[i].old && this.particles[i] ? this.particles[i] : null;
      if (!p) p = Math.random() > S.leafMix ? makeBloom(x, y, S) : makeLeaf(x, y, S);
      if (c.toDelete) p.toDelete = true;
      return p;
    });
    this.recreateMeshes();
  }
  sampleCoordinates() {
    var S = settingsFor(this.cfg);
    var lines = this.text.split("\n");
    var lineCount = Math.max(1, lines.length);
    this.textCanvas.width = this.stringBox.wTexture;
    this.textCanvas.height = this.stringBox.hTexture;
    if (!(this.stringBox.wTexture > 0 && this.stringBox.hTexture > 0)) {
      this.coords = [];
      return;
    }
    this.textCtx.font = S.fontStyle + " " + S.weight + " " + S.fontSize + "px " + S.family;
    if ("letterSpacing" in this.textCtx) this.textCtx.letterSpacing = S.tracking + "px";
    this.textCtx.fillStyle = "#ffffff";
    this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    for (var i = 0; i < lineCount; i++) {
      this.textCtx.fillText(lines[i], 0, ((i + 0.8) * this.stringBox.hTexture) / lineCount);
    }
    var w = this.textCanvas.width;
    var h = this.textCanvas.height;
    var data = this.textCtx.getImageData(0, 0, w, h).data;
    var mask = Array.from(Array(h), function() { return new Array(w); });
    var lit = 0;
    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        mask[i][j] = data[(j + i * w) * 4] > 0;
        if (mask[i][j]) lit++;
      }
    }
    var step = Math.max(1, Math.ceil(Math.sqrt(lit / MAX_PARTICLES)));
    if (step !== this.lastStep) {
      this.lastStep = step;
      this.coords = [];
      this.particles = [];
    }
    if (this.coords.length !== 0) {
      var keptCoords = [];
      var keptParticles = [];
      this.coords.forEach((c, i) => {
        if (c.toDelete) return;
        keptCoords.push(c);
        if (this.particles[i]) keptParticles.push(this.particles[i]);
      });
      this.coords = keptCoords;
      this.particles = keptParticles;
      this.coords.forEach((c) => {
        if (mask[c.y] && mask[c.y][c.x]) {
          c.old = true;
          if (!c.toDelete) mask[c.y][c.x] = false;
        } else {
          c.toDelete = true;
        }
      });
    }
    for (var i = 0; i < h; i += step) {
      for (var j = 0; j < w; j += step) {
        if (mask[i][j] && this.coords.length < MAX_PARTICLES) {
          this.coords.push({ x: j, y: i, old: false, toDelete: false });
        }
      }
    }
  }
  recreateMeshes() {
    this.meshes.forEach((m) => { this.group.remove(m); m.dispose(); });
    this.meshes = [];
    var counts = [0, 1].map((type) => this.particles.filter((p) => p.type === type).length);
    var identity = new THREE.Matrix4();
    this.materials.forEach((material, type) => {
      var mesh = new THREE.InstancedMesh(this.geometry, material, counts[type]);
      for (var i = 0; i < counts[type]; i++) mesh.setMatrixAt(i, identity);
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
      mesh.position.x = -0.5 * this.stringBox.wScene;
      mesh.position.y = -0.6 * this.stringBox.hScene;
      this.meshes.push(mesh);
      this.group.add(mesh);
    });
    this.applyColors();
  }
  applyColors() {
    var S = settingsFor(this.cfg);
    var base = [
      new THREE.Color(this.cfg.bloom || DEFAULTS.bloom),
      new THREE.Color(this.cfg.leaf || DEFAULTS.leaf),
    ];
    var hsl = [{ h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 0 }];
    base[0].getHSL(hsl[0]);
    base[1].getHSL(hsl[1]);
    var idx = [0, 0];
    var color = new THREE.Color();
    this.particles.forEach((p) => {
      var mesh = this.meshes[p.type];
      if (!mesh) return;
      var b = hsl[p.type];
      color.setHSL((b.h + p.hue * S.hueSpread + 1) % 1, b.s, b.l);
      mesh.setColorAt(idx[p.type], color);
      idx[p.type]++;
    });
    this.meshes.forEach((m) => {
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }
  updateMatrices(dt) {
    if (this.meshes.length === 0) return;
    var S = settingsFor(this.cfg);
    var hoverOn = this.cfg.hoverOn !== false;
    var localX = this.pointer.x + 0.5 * this.stringBox.wScene;
    var localY = this.pointer.y + 0.6 * this.stringBox.hScene;
    var radius = Math.max(0.001, S.hoverRadius);
    var idx = [0, 0];
    this.particles.forEach((p) => {
      var mesh = this.meshes[p.type];
      if (!mesh) return;
      if (p.toDelete) {
        p.t -= (dt * 2) / (S.duration * p.jitter);
        if (p.t < 0) p.t = 0;
      } else if (p.wait > 0) {
        p.wait -= dt;
      } else if (p.t < 1) {
        p.t += dt / (S.duration * p.jitter);
        if (p.t > 1) p.t = 1;
      }
      var y = this.stringBox.hScene - p.y;
      var target = 0;
      if (hoverOn && this.pointerOver) {
        var dx = p.x - localX;
        var dy = y - localY;
        var d = Math.sqrt(dx * dx + dy * dy);
        var near = Math.max(0, 1 - d / radius);
        target = near * near;
      }
      p.hover += (target - p.hover) * (1 - Math.exp(-dt * 7));
      var scale = p.maxScale * this.ease(p.t) * (1 + S.hoverBoost * p.hover);
      this.dummy.rotation.set(0, 0, p.baseRotation);
      this.dummy.position.set(p.x, y, p.z);
      if (p.type === 1) this.dummy.position.y += 0.5 * scale;
      this.dummy.scale.setScalar(Math.max(0, scale));
      this.dummy.updateMatrix();
      mesh.setMatrixAt(idx[p.type], this.dummy.matrix);
      idx[p.type]++;
    });
    this.meshes.forEach((m) => { m.instanceMatrix.needsUpdate = true; });
  }
  updateCamera() {
    var aspect = Math.max(1, this.width) / Math.max(1, this.height);
    var spanH = this.height * SCALE_FACTOR;
    this.camera.aspect = aspect;
    this.camera.position.set(0, 0, CAM_DISTANCE);
    this.camera.lookAt(0, 0, 0);
    this.camera.fov = 2 * Math.atan(spanH / 2 / CAM_DISTANCE) * (180 / Math.PI);
    this.camera.near = 0.1;
    this.camera.far = CAM_DISTANCE + 100;
    this.camera.updateProjectionMatrix();
  }
  start() {
    this.lastT = performance.now();
    this.renderer.domElement.style.cursor = "text";
    var self = this;
    var loop = function() {
      self.frameId = requestAnimationFrame(loop);
      self.step();
    };
    this.frameId = requestAnimationFrame(loop);
  }
  step() {
    if (this.disposed) return;
    var now = performance.now();
    var dt = (now - this.lastT) / 1000;
    this.lastT = now;
    if (!isFinite(dt) || dt < 0) dt = 0;
    if (dt > 0.05) dt = 0.05;
    this.updateMatrices(dt);
    this.renderer.render(this.scene, this.camera);
  }
  setSize(width, height) {
    if (this.disposed) return;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.updateCamera();
  }
  updateConfig(cfg) {
    if (this.disposed) return;
    var prev = this.prev;
    this.cfg = cfg;
    this.prev = JSON.parse(JSON.stringify(cfg));
    var fontChanged = JSON.stringify(cfg.font) !== JSON.stringify(prev.font);
    var reseed =
      cfg.bloomSize !== prev.bloomSize || cfg.leafSize !== prev.leafSize ||
      cfg.leafMix !== prev.leafMix || cfg.spread !== prev.spread ||
      ((cfg.transition && cfg.transition.delay) || 0) !== ((prev.transition && prev.transition.delay) || 0);
    if (fontChanged || reseed) {
      if (fontChanged) this.applyInputStyle();
      if (reseed) { this.coords = []; this.particles = []; }
      this.handleInput();
      this.refreshText();
    } else if (cfg.text !== prev.text) {
      this.setText(cfg.text);
    }
    if (JSON.stringify(cfg.transition && cfg.transition.ease) !== JSON.stringify(prev.transition && prev.transition.ease)) {
      this.ease = makeEaseFn(cfg.transition);
    }
    var S = settingsFor(cfg);
    this.materials[0].opacity = S.bloomAlpha;
    this.materials[1].opacity = S.leafAlpha;
    if (cfg.bloom !== prev.bloom || cfg.leaf !== prev.leaf || cfg.hueSpread !== prev.hueSpread) {
      this.applyColors();
    }
  }
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.input.removeEventListener("keyup", this.onEdit);
    this.input.removeEventListener("input", this.onEdit);
    this.container.removeEventListener("pointerdown", this.onPointerDown);
    this.container.removeEventListener("pointermove", this.onPointerMove);
    this.container.removeEventListener("pointerleave", this.onPointerLeave);
    this.container.removeEventListener("pointercancel", this.onPointerLeave);
    this.meshes.forEach((m) => { this.group.remove(m); m.dispose(); });
    this.meshes = [];
    this.geometry.dispose();
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.input.remove();
  }
}

function FlowerType(props) {
  var text = props.text || DEFAULTS.text;
  var font = props.font || { fontFamily: "Baskerville", fontSize: 100, fontWeight: 100, lineHeight: 0.9 };
  var bloom = props.bloom || DEFAULTS.bloom;
  var leaf = props.leaf || DEFAULTS.leaf;
  var hueSpread = props.hueSpread != null ? props.hueSpread : DEFAULTS.hueSpread;
  var opacity = props.opacity != null ? props.opacity : DEFAULTS.opacity;
  var bloomSize = props.bloomSize != null ? props.bloomSize : DEFAULTS.bloomSize;
  var leafSize = props.leafSize != null ? props.leafSize : DEFAULTS.leafSize;
  var leafMix = props.leafMix != null ? props.leafMix : DEFAULTS.leafMix;
  var spread = props.spread != null ? props.spread : DEFAULTS.spread;
  var transition = props.transition || { type: "tween", duration: 0.9, ease: "circOut" };
  var hoverOn = props.hoverOn != null ? props.hoverOn : DEFAULTS.hoverOn;
  var hover = props.hover || { radius: 9, boost: 12 };
  var style = props.style;

  var containerRef = useRef(null);
  var sceneRef = useRef(null);
  var cfgRef = useRef(null);

  cfgRef.current = {
    text: text, font: font || {}, bloom: bloom, leaf: leaf,
    hueSpread: hueSpread, opacity: opacity, bloomSize: bloomSize,
    leafSize: leafSize, leafMix: leafMix, spread: spread,
    transition: transition, hoverOn: hoverOn, hover: hover || DEFAULTS.hover,
  };

  useEffect(function() {
    var container = containerRef.current;
    if (!container) return;
    var scene;
    try { scene = new FlowerTypeScene(container, cfgRef.current); }
    catch(e) { return; }
    sceneRef.current = scene;
    scene.setSize(container.clientWidth, container.clientHeight);
    scene.start();
    var ro = new ResizeObserver(function() {
      scene.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);
    return function() {
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(function() {
    sceneRef.current && sceneRef.current.updateConfig(cfgRef.current);
  }, [text, JSON.stringify(font), bloom, leaf, hueSpread, opacity, bloomSize, leafSize, leafMix, spread, JSON.stringify(transition), hoverOn, JSON.stringify(hover)]);

  return React.createElement("div", {
    ref: containerRef,
    role: "img",
    "aria-label": "Typed text grown as blossom and leaves. Click it and type; move across it to open the flowers.",
    style: Object.assign({
      position: "relative", width: "100%", height: "100%",
      minWidth: 120, minHeight: 120, overflow: "hidden",
    }, style || {}),
  });
}

export default function BotanicalText() {
  return React.createElement(FlowerType, {
    text: "Dummy",
    font: { fontFamily: "Fraunces, Georgia, serif", fontSize: 160, fontWeight: 300, lineHeight: 0.9 },
    bloom: "#FF4D0F",
    leaf: "#1F8A3B",
    hueSpread: 20,
    opacity: 20,
    bloomSize: 10,
    leafSize: 10,
    leafMix: 4,
    spread: 4,
    hoverOn: true,
  })
}
