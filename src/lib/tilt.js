
export function initTilt() {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  if (reduceMotion || !canHover) return;
  var pad = document.getElementById('cine');
  if (!pad) return;
  var MAX = 8;
  pad.addEventListener('pointermove', function(e){
    var r = pad.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width - 0.5;
    var py = (e.clientY - r.top) / r.height - 0.5;
    pad.style.transition = 'transform .08s ease-out';
    pad.style.transform = 'perspective(1100px) rotateX(' + (-py * MAX).toFixed(2) +
      'deg) rotateY(' + (px * MAX).toFixed(2) + 'deg)';
  });
  pad.addEventListener('pointerleave', function(){
    pad.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
    pad.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
  });
}
