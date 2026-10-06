/* Demos interactivas de los márgenes: atractor de Lorenz, k-NN y gravedad.
   Se inicializan sobre los elementos .demo que crea app.js. */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const isDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  const pal = () => ({
    a: isDark() ? "41,151,255" : "0,113,227",     // azul
    b: isDark() ? "191,90,242" : "175,82,222",    // violeta
    ink: isDark() ? "245,245,247" : "29,29,31",
    bg: css("--bg") || "#fff"
  });

  function setupCanvas(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  /* Ejecuta el bucle solo mientras la demo es visible */
  function loop(el, step) {
    let visible = false, raf = 0;
    const tick = () => { step(); raf = visible ? requestAnimationFrame(tick) : 0; };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    }).observe(el);
    if (reduce) for (let i = 0; i < 400; i++) step(true);
    step();
  }

  /* ---------- 1. Atractor de Lorenz ---------- */
  function lorenz(el) {
    const cv = el.querySelector("canvas");
    let { ctx, w, h } = setupCanvas(cv);
    const s = 10, r = 28, b = 8 / 3, dt = 0.006;
    let p = [0.1, 0, 20];
    const trail = [];
    let ang = 0.6, drag = null, auto = 0.0025;
    const rk4 = ([x, y, z]) => {
      const f = (x, y, z) => [s * (y - x), x * (r - z) - y, x * y - b * z];
      const k1 = f(x, y, z);
      const k2 = f(x + dt / 2 * k1[0], y + dt / 2 * k1[1], z + dt / 2 * k1[2]);
      const k3 = f(x + dt / 2 * k2[0], y + dt / 2 * k2[1], z + dt / 2 * k2[2]);
      const k4 = f(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2]);
      return [0, 1, 2].map((i) => [x, y, z][i] + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    };
    cv.addEventListener("pointerdown", (e) => { drag = e.clientX; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (drag !== null) { ang += (e.clientX - drag) * 0.01; drag = e.clientX; } });
    cv.addEventListener("pointerup", () => { drag = null; });
    loop(el, (fast) => {
      for (let i = 0; i < 4; i++) { p = rk4(p); trail.push(p); }
      if (trail.length > 2600) trail.splice(0, trail.length - 2600);
      if (fast) return;
      if (drag === null) ang += auto;
      const c = pal();
      ctx.clearRect(0, 0, w, h);
      const ca = Math.cos(ang), sa = Math.sin(ang), sc = w / 58;
      const proj = ([x, y, z]) => [w / 2 + (x * ca - y * sa) * sc, h - 14 - z * sc * 0.92];
      const n = trail.length;
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const [x1, y1] = proj(trail[i - 1]), [x2, y2] = proj(trail[i]);
        ctx.strokeStyle = `rgba(${t > 0.5 ? c.b : c.a},${0.08 + 0.75 * t * t})`;
        ctx.lineWidth = 0.6 + t * 0.6;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      const [hx, hy] = proj(trail[n - 1]);
      ctx.fillStyle = `rgba(${c.b},1)`; ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, 7); ctx.fill();
    });
  }

  /* ---------- 2. Clasificador k-NN ---------- */
  function knn(el) {
    const cv = el.querySelector("canvas");
    let { ctx, w, h } = setupCanvas(cv);
    const kBtn = el.querySelector("[data-k]");
    let k = 5;
    const pts = [];
    const blob = (cx, cy, cls, n) => { for (let i = 0; i < n; i++) pts.push({ x: cx + (Math.random() - 0.5) * 90, y: cy + (Math.random() - 0.5) * 90, c: cls }); };
    blob(w * 0.32, h * 0.35, 0, 9); blob(w * 0.7, h * 0.66, 1, 9); blob(w * 0.72, h * 0.25, 0, 3); blob(w * 0.25, h * 0.75, 1, 3);
    // La frontera se calcula en una rejilla pequeña y se escala con suavizado
    const R = 5, gw = Math.ceil(w / R), gh = Math.ceil(h / R);
    const off = document.createElement("canvas"); off.width = gw; off.height = gh;
    const octx = off.getContext("2d");
    const rgb = (s) => s.split(",").map(Number);
    const draw = () => {
      const c = pal(), A = rgb(c.a), B = rgb(c.b);
      const img = octx.createImageData(gw, gh);
      for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
        const x = (gx + 0.5) * R, y = (gy + 0.5) * R;
        let vote = 0.5;
        if (pts.length) {
          const d = pts.map((p) => [(p.x - x) ** 2 + (p.y - y) ** 2, p.c]).sort((a, b) => a[0] - b[0]).slice(0, Math.min(k, pts.length));
          vote = d.reduce((s, q) => s + q[1], 0) / d.length;
        }
        const col = vote > 0.5 ? B : A, conf = Math.abs(vote - 0.5) * 2;
        const i = (gy * gw + gx) * 4;
        img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2];
        img.data[i + 3] = Math.round(255 * (0.05 + 0.2 * conf));
      }
      octx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(off, 0, 0, gw * R, gh * R);
      pts.forEach((p) => {
        ctx.fillStyle = `rgba(${p.c ? c.b : c.a},.95)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.6, 0, 7); ctx.fill();
        ctx.strokeStyle = c.bg; ctx.lineWidth = 1.2; ctx.stroke();
      });
    };
    cv.addEventListener("click", (e) => {
      const r = cv.getBoundingClientRect();
      pts.push({ x: e.clientX - r.left, y: e.clientY - r.top, c: e.shiftKey || e.altKey ? 1 : 0 });
      draw();
    });
    cv.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      pts.push({ x: e.clientX - r.left, y: e.clientY - r.top, c: 1 }); draw();
    });
    kBtn.addEventListener("click", () => { k = { 1: 3, 3: 5, 5: 9, 9: 1 }[k]; kBtn.textContent = `k = ${k}`; draw(); });
    el.querySelector("[data-reset]").addEventListener("click", () => { pts.length = 0; draw(); });
    draw();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
  }

  /* ---------- 3. Gravedad (órbitas) ---------- */
  function orbitas(el) {
    const cv = el.querySelector("canvas");
    let { ctx, w, h } = setupCanvas(cv);
    const GM = 2600, cx = w / 2, cy = h / 2;
    let bodies = [];
    const add = (x, y, vx, vy) => { bodies.push({ x, y, vx, vy, t: [] }); if (bodies.length > 6) bodies.shift(); };
    add(cx + 70, cy, 0, Math.sqrt(GM / 70)); add(cx - 105, cy, 0, -Math.sqrt(GM / 105) * 0.82);
    let drag = null;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener("pointerdown", (e) => { drag = { s: pos(e), c: pos(e) }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => { if (drag) drag.c = pos(e); });
    cv.addEventListener("pointerup", () => {
      if (!drag) return;
      const [x, y] = drag.s, [x2, y2] = drag.c;
      add(x, y, (x2 - x) * 0.05, (y2 - y) * 0.05); drag = null;
    });
    loop(el, (fast) => {
      const dt = 0.25;
      for (let s = 0; s < 4; s++) bodies.forEach((p) => {
        const ax = (cx - p.x), ay = (cy - p.y), d2 = ax * ax + ay * ay + 60, d = Math.sqrt(d2);
        const f = GM / (d2 * d);
        p.vx += ax * f * dt; p.vy += ay * f * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      });
      bodies.forEach((p) => { p.t.push([p.x, p.y]); if (p.t.length > 260) p.t.shift(); });
      bodies = bodies.filter((p) => Math.abs(p.x - cx) < 600 && Math.abs(p.y - cy) < 600 && (p.x - cx) ** 2 + (p.y - cy) ** 2 > 36);
      if (fast) return;
      const c = pal();
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
      g.addColorStop(0, `rgba(${c.b},.9)`); g.addColorStop(1, `rgba(${c.b},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(${c.b},1)`; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.fill();
      bodies.forEach((p, j) => {
        const col = j % 2 ? c.b : c.a;
        for (let i = 1; i < p.t.length; i++) {
          ctx.strokeStyle = `rgba(${col},${0.7 * i / p.t.length})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.t[i - 1][0], p.t[i - 1][1]); ctx.lineTo(p.t[i][0], p.t[i][1]); ctx.stroke();
        }
        ctx.fillStyle = `rgba(${col},1)`; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 7); ctx.fill();
      });
      if (drag) {
        ctx.strokeStyle = `rgba(${c.ink},.5)`; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(drag.s[0], drag.s[1]); ctx.lineTo(drag.c[0], drag.c[1]); ctx.stroke(); ctx.setLineDash([]);
      }
    });
  }

  window.initDemos = function () {
    if (!window.matchMedia("(min-width: 1320px)").matches) return;
    const map = { lorenz, knn, orbitas };
    document.querySelectorAll(".demo[data-demo]").forEach((el) => {
      const fn = map[el.dataset.demo];
      if (fn && !el.dataset.ready) { el.dataset.ready = "1"; fn(el); }
    });
  };
})();
