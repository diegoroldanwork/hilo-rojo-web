/* =========================================================
   Hilo Rojo — configuración central y animación del hilo
   ========================================================= */

const CONFIG = {
  // Tagline del hero (definitivo)
  tagline: 'Una pasión que no se rompe ni se corta.',

  // Firma de la historia
  ownerName: 'Yanina Hourcade',

  // Enlaces de los botones (número de WhatsApp: 5492246486699)
  links: {
    catalogo: 'https://wa.me/c/5492246486699',
    stock: 'https://wa.me/5492246486699?text=Hola!%20Quisiera%20consultar%20el%20stock%20actualizado',
    souvenirs: 'https://wa.me/5492246486699?text=Hola!%20Quisiera%20consultar%20por%20souvenirs',
    instagram: 'https://www.instagram.com/artesaniashilorojo/',
  },
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Contenido desde CONFIG ---------- */
function applyConfig() {
  document.querySelectorAll('[data-link]').forEach((el) => {
    const url = CONFIG.links[el.dataset.link];
    if (url) el.href = url;
  });

  document.querySelectorAll('[data-tagline]').forEach((el) => {
    el.textContent = CONFIG.tagline;
  });

  const signature = document.querySelector('[data-owner-name]');
  if (signature && CONFIG.ownerName.trim()) {
    signature.textContent = CONFIG.ownerName;
  }

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------- Header: sombra + hilo de progreso ---------- */
function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const progressThread = header.querySelector('[data-scroll-thread]');
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (progressThread) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      progressThread.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    }
    ticking = false;
  };
  update();
  const request = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
}

/* ---------- El hilo que se cose ----------
   El trazo visible es punteado, así que no se puede "dibujar" con su propio dashoffset.
   Se le aplica una máscara con una copia sólida del mismo recorrido, y lo que se anima
   es la máscara. Una "aguja" (punto bordó) encabeza el hilo mientras avanza.
   Sin JS o con movimiento reducido, el hilo queda completo y estático. */
let maskId = 0;

// Medidas de cada hilo, leídas todas juntas antes de tocar el DOM (evita recalcular el diseño varias veces).
function measure(svgs) {
  return svgs.map((svg) => ({
    svg,
    vb: svg.viewBox.baseVal,
    paths: [...svg.querySelectorAll('.thread__path')].map((path) => ({
      path,
      length: path.getTotalLength(),
      width: parseFloat(getComputedStyle(path).strokeWidth) || 3,
    })),
  }));
}

function sewable({ svg, vb, paths }) {
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.prepend(defs);
  }

  return paths.map(({ path, length, width }) => {
    const id = `hilo-mask-${++maskId}`;

    const mask = document.createElementNS(SVG_NS, 'mask');
    mask.id = id;
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', vb.x - 50);
    mask.setAttribute('y', vb.y - 50);
    mask.setAttribute('width', vb.width + 100);
    mask.setAttribute('height', vb.height + 100);

    const reveal = document.createElementNS(SVG_NS, 'path');
    reveal.setAttribute('d', path.getAttribute('d'));
    reveal.setAttribute('fill', 'none');
    reveal.setAttribute('stroke', '#fff');
    reveal.setAttribute('stroke-width', width * 3);
    reveal.setAttribute('stroke-linecap', 'round');
    reveal.style.strokeDasharray = `${length} ${length}`;
    reveal.style.strokeDashoffset = length;
    mask.append(reveal);
    defs.append(mask);
    path.setAttribute('mask', `url(#${id})`);

    const needle = document.createElementNS(SVG_NS, 'circle');
    needle.setAttribute('class', 'thread__needle');
    needle.setAttribute('r', width * 1.15);
    path.after(needle);

    let last = -1;
    return {
      set(progress) {
        const p = Math.round(Math.min(1, Math.max(0, progress)) * 1000) / 1000;
        if (p === last) return; // sin cambios: no tocar el DOM
        last = p;
        reveal.style.strokeDashoffset = length * (1 - p);
        const pt = path.getPointAtLength(length * p);
        needle.setAttribute('cx', pt.x);
        needle.setAttribute('cy', pt.y);
        needle.classList.toggle('is-sewing', p > 0.005 && p < 0.995);
      },
    };
  });
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Hilo del hero: se cose una vez al cargar.
function initLoadThreads(measured) {
  measured.forEach((m) => {
    const parts = sewable(m);
    parts.forEach((part) => part.set(0));
    const duration = 3400;
    const delay = 400;
    let start;
    const step = (now) => {
      start ??= now;
      const t = Math.min(1, Math.max(0, (now - start - delay) / duration));
      parts.forEach((part) => part.set(ease(t)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// Progreso según la posición del propio elemento en la pantalla.
function elementProgress(rect, vh, start, end) {
  return (vh * start - rect.top) / (vh * (start - end) + rect.height);
}

// Si el laberinto queda fijo (sticky, escritorio), el progreso lo marca toda la sección.
function sectionProgress(rect, vh) {
  return (vh * 0.6 - rect.top) / (rect.height - vh * 0.35);
}

// Mismo corte que en CSS (.story__maze-wrap pasa a sticky)
const mazeSticky = window.matchMedia('(min-width: 960px)');

function initScrollThreads(measured) {
  const items = measured.map((m) => {
    const isMaze = m.svg.dataset.thread === 'maze';
    return { svg: m.svg, isMaze, section: m.svg.closest('section'), parts: sewable(m) };
  });
  if (!items.length) return;

  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    // Primero se leen todas las posiciones, después se escribe.
    const progress = items.map(({ svg, isMaze, section }) => (
      isMaze && mazeSticky.matches
        ? sectionProgress(section.getBoundingClientRect(), vh)
        : elementProgress(svg.getBoundingClientRect(), vh, 0.92, isMaze ? 0.3 : 0.5)
    ));
    items.forEach((item, i) => item.parts.forEach((part) => part.set(progress[i])));
    ticking = false;
  };
  const request = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  update();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
}

// Fotos, firma y puntadas de las citas aparecen al entrar en pantalla.
function initReveals() {
  const targets = document.querySelectorAll('[data-reveal], [data-stitch], .highlight');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  targets.forEach((el) => io.observe(el));
}

/* ---------- Menú en celular y tablet ---------- */
function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!toggle || !menu) return;
  toggle.hidden = false;
  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ---------- Botón flotante: aparece después del hero, se oculta en Contacto ---------- */
function initWaFloat() {
  const btn = document.querySelector('[data-wa-float]');
  const hero = document.querySelector('.hero__actions');
  const contact = document.querySelector('#contacto');
  if (!btn || !hero) return;
  let heroVisible = true;
  let contactVisible = false;
  const update = () => btn.classList.toggle('is-hidden', heroVisible || contactVisible);
  update();
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; update(); }).observe(hero);
  if (contact) {
    new IntersectionObserver(([entry]) => { contactVisible = entry.isIntersecting; update(); }, { threshold: 0.35 }).observe(contact);
  }
}

applyConfig();
initHeader();
initMenu();
initWaFloat();
if (!reducedMotion.matches) {
  document.documentElement.classList.add('js-motion');
  initReveals();

  // Los hilos se preparan después del primer pintado: medirlos obliga a calcular
  // el diseño de toda la página y eso demoraba la aparición del contenido.
  const startThreads = () => requestAnimationFrame(() => setTimeout(() => {
    const loadThreads = measure([...document.querySelectorAll('[data-thread="load"]')]);
    const scrollThreads = measure([...document.querySelectorAll('[data-thread="scroll"], [data-thread="maze"]')]);
    initLoadThreads(loadThreads);
    initScrollThreads(scrollThreads);
    [...loadThreads, ...scrollThreads].forEach(({ svg }) => svg.classList.add('is-ready'));
  }));
  startThreads();
}
