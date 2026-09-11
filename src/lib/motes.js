import * as THREE from 'three';

/* =========================================================================
   Motes — ambient floating pollen particles (Three.js)
   ========================================================================= */
export function initMotes(canvas){
  var MAX_DPR = 1.25;
  var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  var cw = canvas.clientWidth || window.innerWidth;
  var ch = canvas.clientHeight || window.innerHeight;
  canvas.width = Math.max(1, Math.round(cw * dpr));
  canvas.height = Math.max(1, Math.round(ch * dpr));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, cw / ch, 0.1, 2000);
  camera.position.z = 400;

  var COUNT = 280;
  var positions = new Float32Array(COUNT * 3);
  var seeds = new Float32Array(COUNT * 4);
  for (var i = 0; i < COUNT; i++){
    positions[i*3]   = (Math.random() - 0.5) * 900;
    positions[i*3+1] = (Math.random() - 0.5) * 700;
    positions[i*3+2] = (Math.random() - 0.5) * 400;
    seeds[i*4]   = Math.random() * Math.PI * 2;
    seeds[i*4+1] = 0.15 + Math.random() * 0.4;
    seeds[i*4+2] = 0.3 + Math.random() * 0.7;
    seeds[i*4+3] = 0.4 + Math.random() * 0.6;
  }

  var geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));

  var texCanvas = document.createElement('canvas');
  texCanvas.width = 64; texCanvas.height = 64;
  var ctx = texCanvas.getContext('2d');
  var grad = ctx.createRadialGradient(32,32,0,32,32,32);
  grad.addColorStop(0, 'rgba(243,239,228,0.9)');
  grad.addColorStop(0.4, 'rgba(180,230,200,0.4)');
  grad.addColorStop(1, 'rgba(180,230,200,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,64,64);
  var tex = new THREE.CanvasTexture(texCanvas);

  var mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMap: { value: tex },
      uSize: { value: 10 },
      uScale: { value: 440 }
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute vec4 seed;',
      'uniform float uTime, uSize, uScale;',
      'varying float vFade;',
      'void main(){',
      '  float ph = seed.x, sp = seed.y, am = seed.z;',
      '  vec3 p = position;',
      '  p.x += sin(uTime * sp * 0.35 + ph) * 34.0 * am;',
      '  float climb = mod(uTime * 11.0 * sp + ph * 60.0, 1500.0) - 750.0;',
      '  p.y += climb;',
      '  p.z += cos(uTime * sp * 0.28 + ph) * 24.0 * am;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_PointSize = uSize * seed.w * (uScale / max(-mv.z, 1.0));',
      '  float edge = 1.0 - abs(climb) / 750.0;',
      '  float twinkle = 0.55 + 0.45 * sin(uTime * (0.7 + sp * 1.6) + ph * 3.1);',
      '  vFade = clamp(edge * 3.0, 0.0, 1.0) * twinkle;',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'precision highp float;',
      'uniform sampler2D uMap;',
      'varying float vFade;',
      'void main(){',
      '  vec4 t = texture2D(uMap, gl_PointCoord);',
      '  gl_FragColor = vec4(t.rgb, t.a * vFade * 0.52);',
      '}'
    ].join('\n')
  });

  var points = new THREE.Points(geom, mat);
  scene.add(points);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(dpr);
  renderer.setSize(cw, ch, false);

  var raf = 0, visible = true;
  function render(now){
    var t = now * 0.001;
    mat.uniforms.uTime.value = t;
    renderer.render(scene, camera);
    if (visible) raf = requestAnimationFrame(render);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries){
      var v = entries[0].isIntersecting;
      if (v && !visible) { visible = true; raf = requestAnimationFrame(render); }
      else if (!v && visible) { visible = false; cancelAnimationFrame(raf); }
    }, { threshold: 0 }).observe(canvas);
  }
  raf = requestAnimationFrame(render);

  window.addEventListener('resize', function(){
    cw = canvas.clientWidth || window.innerWidth;
    ch = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.round(cw * dpr));
    canvas.height = Math.max(1, Math.round(ch * dpr));
    camera.aspect = cw / ch;
    camera.updateProjectionMatrix();
    renderer.setSize(cw, ch, false);
  });
}
