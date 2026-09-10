
import React, { useEffect, useId, useRef } from 'react';

const GOO_BLUR = 15;
const SHADOW_OFFSET = 0;
const EXIT_OVERSHOOT = 400;
const EXIT_MARGIN = 8;

const DEFAULT_SHADOW = { color: "rgba(0, 0, 0, 0.2)", blur: 50 };

function ramp(head, tail, i, count) {
  if (count <= 1) return head;
  return head + (tail - head) * (i / (count - 1));
}

function CircleCursor(props) {
  const {
    blobType = "circle",
    fillColor = "linear-gradient(135deg, #00FFFF, #FFFFFF)",
    count = 5,
    size = 40,
    tailSize = 24,
    leadSpeed = 8,
    trailLag = 12,
    useFilter = true,
    showShadow = true,
    label = false,
    labelText = "",
    labelColor = "#ffffff",
  } = props;

  const hostRef = useRef(null);
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const poolRef = useRef([]);
  const cursorRef = useRef({ x: -9999, y: -9999 });

  const shadow = { ...DEFAULT_SHADOW, ...(props.shadow || {}) };
  const filterId = "circle-cursor-goo-" + useId().replace(/:/g, "");

  const live = useRef({ count, leadSpeed, trailLag, size, tailSize });
  live.current = { count, leadSpeed, trailLag, size, tailSize };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const pool = poolRef.current;
    const n = Math.max(1, count);

    while (pool.length > n) { var b = pool.pop(); if (b && b.node) b.node.remove(); }
    while (pool.length < n) {
      const node = document.createElement("div");
      node.style.position = "absolute";
      node.style.left = "0px";
      node.style.top = "0px";
      node.style.willChange = "transform";
      host.appendChild(node);
      const ahead = pool[pool.length - 1];
      pool.push({
        node,
        x: ahead ? ahead.x : cursorRef.current.x,
        y: ahead ? ahead.y : cursorRef.current.y,
      });
    }

    return () => {
      for (const b of pool) { if (b.node) b.node.remove(); }
      poolRef.current = [];
    };
  }, [count]);

  useEffect(() => {
    const pool = poolRef.current;
    const radius = blobType === "circle" ? "50%" : "0";
    pool.forEach((b, i) => {
      const w = ramp(size, tailSize, i, pool.length);
      const s = b.node.style;
      s.width = w + "px";
      s.height = w + "px";
      s.marginLeft = (-w / 2) + "px";
      s.marginTop = (-w / 2) + "px";
      s.background = fillColor;
      s.borderRadius = radius;
      s.boxShadow = showShadow
        ? SHADOW_OFFSET + "px " + SHADOW_OFFSET + "px " + shadow.blur + "px " + shadow.color
        : "none";
    });
  }, [count, blobType, fillColor, size, tailSize, showShadow, shadow.color, shadow.blur]);

  useEffect(() => {
    const frameEl = frameRef.current;
    if (!frameEl) return;

    const localize = (clientX, clientY) => {
      const rect = frameEl.getBoundingClientRect();
      const sx = rect.width > 0 ? frameEl.clientWidth / rect.width : 1;
      const sy = rect.height > 0 ? frameEl.clientHeight / rect.height : 1;
      return {
        x: (clientX - rect.left) * sx,
        y: (clientY - rect.top) * sy,
        over: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom,
      };
    };

    const previousCursor = document.documentElement.style.cursor;
    let cursorHidden = false;
    const hideNativeCursor = (hide) => {
      if (hide === cursorHidden) return;
      cursorHidden = hide;
      document.documentElement.style.cursor = hide ? "none" : previousCursor;
    };

    let seeded = false;
    let inside = false;

    const seedAt = (x, y) => {
      seeded = true;
      cursorRef.current.x = x;
      cursorRef.current.y = y;
      const root = rootRef.current;
      if (root) root.style.opacity = "1";
      for (const b of poolRef.current) { b.x = x; b.y = y; }
    };

    let stepX = 0, stepY = 0;

    const exitTo = (x, y) => {
      if (seeded && inside) {
        let dx = x - cursorRef.current.x + stepX;
        let dy = y - cursorRef.current.y + stepY;
        const len = Math.hypot(dx, dy);
        if (len < 0.001) {
          dx = x - frameEl.clientWidth / 2;
          dy = y - frameEl.clientHeight / 2;
        }
        const n = Math.hypot(dx, dy) || 1;
        cursorRef.current.x = x + (dx / n) * EXIT_OVERSHOOT;
        cursorRef.current.y = y + (dy / n) * EXIT_OVERSHOOT;
      }
      inside = false;
      hideNativeCursor(false);
      const headNode = poolRef.current[0] && poolRef.current[0].node;
      if (headNode) headNode.style.opacity = "0";
    };

    const onMove = (e) => {
      const pt = localize(e.clientX, e.clientY);
      if (!pt.over) { if (inside) exitTo(pt.x, pt.y); return; }
      if (!seeded || !inside) {
        seedAt(pt.x, pt.y);
        stepX = 0; stepY = 0;
        const headNode = poolRef.current[0] && poolRef.current[0].node;
        if (headNode) headNode.style.opacity = "1";
      }
      stepX = pt.x - cursorRef.current.x;
      stepY = pt.y - cursorRef.current.y;
      cursorRef.current.x = pt.x;
      cursorRef.current.y = pt.y;
      inside = true;
      hideNativeCursor(true);
    };

    const onWindowLeave = () => { if (inside) exitTo(cursorRef.current.x, cursorRef.current.y); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onWindowLeave);

    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const p = live.current;
      const pool = poolRef.current;
      const cursor = cursorRef.current;

      const edge = Math.max(p.size, p.tailSize) / 2 + EXIT_MARGIN;
      const gone = !inside && pool.every((b) =>
        b.x < -edge || b.x > frameEl.clientWidth + edge ||
        b.y < -edge || b.y > frameEl.clientHeight + edge
      );
      const visible = seeded && !gone;
      const hostEl = hostRef.current;
      const want = visible ? "1" : "0";
      if (hostEl && hostEl.style.opacity !== want) hostEl.style.opacity = want;
      if (!visible) { raf = requestAnimationFrame(frame); return; }

      const lead = Math.max(0.02, 0.8 / Math.max(1, p.leadSpeed));
      const lag = Math.max(lead * 1.5, p.trailLag / 10);

      for (let i = 0; i < pool.length; i++) {
        const b = pool[i];
        const duration = ramp(lead, lag, i, pool.length);
        const a = 1 - Math.exp(-dt / (duration / 3));
        b.x += (cursor.x - b.x) * a;
        b.y += (cursor.y - b.y) * a;
        b.node.style.transform = "translate(" + b.x + "px, " + b.y + "px)";
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      hideNativeCursor(false);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onWindowLeave);
    };
  }, []);

  return React.createElement("div", {
    ref: frameRef,
    style: {
      position: "fixed", inset: 0, width: "100vw", height: "100vh",
      overflow: "hidden", pointerEvents: "none", zIndex: 9999,
    }
  },
    React.createElement("div", {
      ref: rootRef,
      style: { position: "absolute", inset: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }
    },
      useFilter && React.createElement("svg", {
        "aria-hidden": true,
        style: { position: "absolute", width: 0, height: 0 }
      },
        React.createElement("filter", { id: filterId },
          React.createElement("feGaussianBlur", { "in": "SourceGraphic", stdDeviation: GOO_BLUR, result: "blur" }),
          React.createElement("feColorMatrix", {
            "in": "blur",
            values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10"
          })
        )
      ),
      React.createElement("div", {
        ref: hostRef,
        style: {
          position: "absolute", inset: 0,
          filter: useFilter ? "url(#" + filterId + ")" : undefined,
        }
      })
    )
  );
}

export default function Cursor() {
  return React.createElement(CircleCursor, {
    blobType: "circle",
    fillColor: "linear-gradient(135deg, #00FFFF, #FFFFFF)",
    count: 5,
    size: 36,
    tailSize: 20,
    leadSpeed: 9,
    trailLag: 11,
    useFilter: true,
    showShadow: true,
    shadow: { color: "rgba(184, 166, 255, 0.3)", blur: 40 },
  })
}
