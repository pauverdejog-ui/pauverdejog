/* Genera la página a partir de window.SITE (js/data.js). No hace falta editarlo. */
(function () {
  "use strict";

  const S = window.SITE;
  const page = document.body.dataset.page;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hasUser = S.githubUser && !/TU-USUARIO/i.test(S.githubUser);
  const github = hasUser ? `https://github.com/${S.githubUser}` : "";
  const NIVEL = ["", "Básico", "Elemental", "Intermedio", "Avanzado", "Experto"];
  const ext = (url) => (url ? `href="${esc(url)}" target="_blank" rel="noopener"` : "");
  const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
  const plus = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const db = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>';

  /* Imagen con respaldo: si el logo no carga, se ven las iniciales */
  const logoImg = (src, ini) =>
    src ? `<img src="${esc(src)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${esc(ini)}'}))">`
        : `<span>${esc(ini)}</span>`;

  const meter = (n) =>
    `<div class="meter" role="img" aria-label="Nivel ${n} de 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}" style="--i:${i}"></i>`).join("")}</div>`;

  /* ---------- Cabecera ---------- */
  function topbar() {
    const links = page === "inicio"
      ? `<a href="#formacion">Formación</a><a href="#experiencia">Experiencia</a><a href="#proyectos">Proyectos</a>
         <a href="#habilidades">Habilidades</a><a href="#contacto">Contacto</a>
         <a class="pill" href="fotos.html">Fotografía <span class="arrow">→</span></a>`
      : `<a class="pill" href="index.html"><span>←</span> Volver al CV</a>`;
    $("#topbar").innerHTML = `<div class="wrap"><a class="brand" href="index.html">${esc(S.perfil.nombre)}</a><nav class="nav">${links}</nav></div>`;
    const bar = $("#topbar");
    const onScroll = () => {
      bar.classList.toggle("is-scrolled", window.scrollY > 8);
      const h = document.getElementById("heroBg");
      bar.classList.toggle("on-hero", !!h && window.scrollY < h.offsetHeight - 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Bloques de la página principal ---------- */
  const section = (id, title, note, body) => `
    <section class="section" id="${id}">
      <div class="section__label"><h2>${title}</h2>${note ? `<p>${note}</p>` : ""}</div>
      <div class="section__body">${body}</div>
    </section>`;

  function hero() {
    const p = S.perfil;
    return `
      <header class="hero-bg" id="heroBg">
        <div class="wrap">
          <div class="hero">
            <h1>${esc(p.nombre)}</h1>
            <p class="hero__loc">${esc(p.ubicacion)}</p>
            <div class="hero__links">
              <a href="mailto:${esc(p.email)}">${esc(p.email)}</a>
              <a ${ext(p.linkedin)}>LinkedIn ${arrow}</a>
              ${github ? `<a ${ext(github)}>GitHub ${arrow}</a>` : ""}
              <a href="${esc(p.cvPdf)}" target="_blank" rel="noopener" class="cv-link" data-src="${esc(p.cvPdf)}" hidden>CV en PDF ↓</a>${p.cvPdfEn ? `<a href="${esc(p.cvPdfEn)}" target="_blank" rel="noopener" class="cv-link" data-src="${esc(p.cvPdfEn)}" hidden>CV in English ↓</a>` : ""}
            </div>
          </div>
        </div>
        ${S.fondo ? `<span class="hero-bg__credit">${esc(S.fondo.credito)}</span>` : ""}
      </header>`;
  }

  /* Carga la primera imagen de fondo disponible */
  function cargarFondo() {
    const el = $("#heroBg");
    if (!el || !S.fondo) return;
    let lista = S.fondo.candidatos.slice();
    // En pantallas pequeñas, primero la versión ligera
    if (window.innerWidth < 900) lista = [lista[0], ...lista.slice(1).sort((a, b) => (b.includes("/screen/") ? 1 : 0) - (a.includes("/screen/") ? 1 : 0))];
    const probar = () => {
      const src = lista.shift();
      if (!src) return;
      const img = new Image();
      let hecho = false;
      const fallo = () => { if (!hecho) { hecho = true; probar(); } };
      const t = setTimeout(fallo, 8000);
      img.onload = () => {
        if (hecho) return;
        hecho = true; clearTimeout(t);
        el.style.setProperty("--fondo", `url("${src}")`);
        el.classList.add("has-img");
      };
      img.onerror = () => { clearTimeout(t); fallo(); };
      img.src = src;
    };
    probar();
  }

  function formacion() {
    return S.formacion.map((f) => `
      <div class="entry reveal">
        <a class="logo" ${ext(f.url)} aria-label="${esc(f.centro)}">${logoImg(f.logo, f.iniciales)}</a>
        <div>
          <div class="entry__title"><a ${ext(f.url)}>${esc(f.titulo)}</a></div>
          <div class="entry__sub">${esc(f.centro)}</div>
          ${f.cursos ? `<ul class="courses">${f.cursos.map(([c, n, u]) => `<li><code>${esc(c)}</code><a ${ext(u)}>${esc(n)}</a></li>`).join("")}</ul>` : ""}
        </div>
        <div class="entry__date">${esc(f.periodo)}</div>
      </div>`).join("");
  }

  function experiencia() {
    return S.experiencia.map((e) => `
      <div class="entry entry--plain reveal">
        <div>
          <div class="entry__title">${esc(e.puesto)}</div>
          <div class="entry__sub">${esc(e.lugar)}</div>
          <div class="entry__text">${esc(e.detalle)}</div>
        </div>
        <div class="entry__date">${esc(e.periodo)}</div>
      </div>`).join("");
  }

  function proyectos() {
    return S.proyectos.map((p) => {
      const code = hasUser ? `${github}/${S.repo}/tree/main/proyectos/${p.carpeta}` : "";
      const report = `proyectos/${p.carpeta}/${p.informe}`;
      const links = `${code ? `<a ${ext(code)}>Código ${arrow}</a>` : ""}<a ${ext(report)}>Informe ${arrow}</a>`;
      return `
        <article class="project reveal">
          <div class="project__meta">${esc(p.anio)} · ${esc(p.contexto)} · ${esc(p.equipo)}</div>
          <div class="project__head"><h3 class="project__title">${esc(p.titulo)}</h3><div class="project__links">${links}</div></div>
          <p class="project__text">${esc(p.resumen)}</p>
          <div class="metrics">${p.metricas.map(([v, l]) => `<div class="metric"><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join("")}</div>
          <div class="stack">${p.stack.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        </article>`;
    }).join("");
  }

  function sideLogo(t) {
    if (t.logo === "sql") return db;
    if (t.logo) return logoImg(`assets/logos/${t.logo}.svg`, t.ini || t.nombre.slice(0, 2));
    return `<span>${esc(t.ini || t.nombre.slice(0, 2))}</span>`;
  }

  /* Columna lateral: tecnologías e idiomas con su nivel */
  function lateral() {
    const row = (logo, name, label, nivel, title, flag) => `
      <li class="skill-row" ${title ? `title="${esc(title)}"` : ""}>
        <span class="skill-row__logo${flag ? " skill-row__logo--flag" : ""}">${logo}</span>
        <span class="skill-row__name">${esc(name)}${label ? `<small>${esc(label)}</small>` : ""}</span>
        ${meter(nivel)}
      </li>`;
    const groups = S.tecnologias.map((g) => `
      <div class="side__group">
        <h3>${esc(g.grupo)}</h3>
        <ul>${g.items.map((t) => row(sideLogo(t), t.nombre, "", t.nivel, `${NIVEL[t.nivel]} · ${t.uso}`)).join("")}</ul>
      </div>`).join("");
    const idiomas = `
      <div class="side__group">
        <h3>Idiomas</h3>
        <ul>${S.idiomas.map((l) => row(`<img src="assets/flags/${esc(l.bandera)}.svg" alt="">`, l.nombre, l.etiqueta, l.nivel, "", true)).join("")}</ul>
      </div>`;
    return `
      <aside class="side reveal" aria-label="Habilidades técnicas e idiomas">
        <h2 class="side__title">Habilidades técnicas</h2>
        ${groups}
        ${idiomas}
        <p class="side__legend">${NIVEL.slice(1).map((n, i) => `${i + 1} ${n}`).join(" · ")}</p>
      </aside>`;
  }

  function habilidades() {
    return S.areas.map((a, i) => `
      <div class="area">
        <button class="area__head" aria-expanded="false" aria-controls="area${i}">
          <div><div class="area__name">${esc(a.nombre)}</div><div class="area__sum">${esc(a.resumen)}</div></div>
          <span class="area__icon">${plus}</span>
        </button>
        <div class="area__panel" id="area${i}"><div><div class="area__body">
          <p>${esc(a.detalle)}</p>
          <div class="chips">${a.metodos.map((m) => `<span class="chip">${esc(m)}</span>`).join("")}</div>
        </div></div></div>
      </div>`).join("");
  }

  function contacto() {
    const p = S.perfil;
    return `
      <a class="contact__mail" href="mailto:${esc(p.email)}">${esc(p.email)}</a>
      <div class="contact__links">
        <a ${ext(p.linkedin)}>LinkedIn ${arrow}</a>
        ${github ? `<a ${ext(github)}>GitHub ${arrow}</a>` : ""}
        <a href="${esc(p.cvPdf)}" target="_blank" rel="noopener" class="cv-link" data-src="${esc(p.cvPdf)}" hidden>CV en PDF ↓</a>${p.cvPdfEn ? `<a href="${esc(p.cvPdfEn)}" target="_blank" rel="noopener" class="cv-link" data-src="${esc(p.cvPdfEn)}" hidden>CV in English ↓</a>` : ""}
      </div>`;
  }

  const footer = () => `
    <footer class="footer">
      <span>© ${new Date().getFullYear()} ${esc(S.perfil.nombre)}</span>
      <a href="${page === "inicio" ? "fotos.html" : "index.html"}">${page === "inicio" ? "Fotografía →" : "← Volver al CV"}</a>
    </footer>`;

  function renderInicio() {
    $("#app").innerHTML = `
      ${hero()}
      <div class="wrap">
        <div class="layout">
          <div class="main">
            ${section("formacion", "Formación", "", formacion())}
            ${section("experiencia", "Experiencia", "", experiencia())}
            ${section("proyectos", "Proyectos", "Código e informe de cada uno en GitHub.", proyectos())}
            ${section("habilidades", "Conocimientos", "Haz clic en un área para ver el detalle.", habilidades())}
          </div>
          ${lateral()}
        </div>
        ${section("contacto", "Contacto", "", contacto())}
        ${footer()}
      </div>`;

    cargarFondo();

    $$(".area__head").forEach((b) => b.addEventListener("click", () => {
      const a = b.closest(".area");
      const open = !a.classList.contains("is-open");
      a.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", open);
    }));

    // Sección activa en la cabecera
    const links = $$(".nav a[href^='#']");
    const secs = $$(".section");
    const spy = () => {
      const y = window.scrollY + 140;
      let cur = "";
      secs.forEach((s) => { if (s.offsetTop <= y) cur = s.id; });
      links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${cur}`));
    };
    window.addEventListener("scroll", spy, { passive: true });
    spy();

    // Muestra "Descargar CV" solo si el PDF existe
    if (location.protocol.startsWith("http")) {
      $$(".cv-link").forEach((a) => fetch(a.dataset.src, { method: "HEAD" }).then((r) => { if (r.ok) a.hidden = false; }).catch(() => {}));
    }
  }

  /* ---------- Página de fotografía ---------- */
  function renderFotos() {
    const f = S.fotos;
    $("#app").innerHTML = `
      <div class="wrap">
        <div class="gallery-head"><h1>Fotografía</h1><p>Algunas fotos que he hecho.</p></div>
        ${f.length
          ? `<div class="gallery">${f.map((x, i) => `
              <figure class="shot" data-i="${i}">
                <img src="${esc(x.src)}" alt="${esc(x.titulo || "")}" loading="lazy">
                ${x.titulo || x.lugar ? `<figcaption>${esc(x.titulo)}${x.lugar ? ` · ${esc(x.lugar)}` : ""}</figcaption>` : ""}
              </figure>`).join("")}</div>`
          : `<p class="empty">Galería en preparación.</p>`}
        ${footer()}
      </div>`;

    const lb = document.createElement("div");
    lb.className = "lightbox"; lb.hidden = true;
    document.body.appendChild(lb);
    let idx = 0;
    const show = (i) => {
      idx = (i + f.length) % f.length;
      const x = f[idx];
      lb.innerHTML = `<figure style="margin:0"><img src="${esc(x.src)}" alt="${esc(x.titulo || "")}">${x.titulo || x.lugar ? `<p>${esc(x.titulo)}${x.lugar ? ` · ${esc(x.lugar)}` : ""}</p>` : ""}</figure>`;
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add("is-open"));
    };
    const hide = () => { lb.classList.remove("is-open"); setTimeout(() => (lb.hidden = true), 250); };
    document.addEventListener("click", (e) => {
      const s = e.target.closest(".shot");
      if (s) show(+s.dataset.i);
      else if (e.target.closest(".lightbox")) hide();
    });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }

  /* ---------- Arranque ---------- */
  topbar();
  page === "fotos" ? renderFotos() : renderInicio();
  window.dispatchEvent(new Event("scroll"));

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { threshold: 0.1 });
  $$(".reveal").forEach((el) => io.observe(el));
})();
