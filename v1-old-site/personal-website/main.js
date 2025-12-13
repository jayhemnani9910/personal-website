/* ===== DOM ready / page enter ===== */
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('ready');
});

/* ===== Year ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Mobile nav ===== */
const toggle = document.querySelector('.nav-toggle');
const list = document.getElementById('nav-list');
if (toggle && list) {
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ===== Theme persistence ===== */
const THEME_KEY = 'jh-theme';
const applyTheme = t => document.documentElement.setAttribute('data-theme', t);
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
document.getElementById('themeBtn')?.addEventListener('click', () => {
  const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
  applyTheme(next); localStorage.setItem(THEME_KEY, next);
});

/* ===== Active nav ===== */
(() => {
  const path = location.pathname.replace(/index\.html$/, "/");
  document.querySelectorAll('.nav-list a').forEach(a => {
    const href = a.getAttribute('href');
    if ((href === "/" && path === "/") || (href !== "/" && path.endsWith(href))) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();

/* ===== Mouse spotlight + hero tilt ===== */
(() => {
  const hero = document.querySelector('.hero');
  const tiltTargets = [document.querySelector('.hero-inner'), ...document.querySelectorAll('.project'), ...document.querySelectorAll('.card')];

  // spotlight
  const updateSpot = (x, y) => {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const mx = ((x - rect.left) / rect.width) * 100;
    const my = ((y - rect.top) / rect.height) * 100;
    hero.style.setProperty('--mx', `${mx}%`);
    hero.style.setProperty('--my', `${my}%`);
  };
  window.addEventListener('pointermove', e => updateSpot(e.clientX, e.clientY));

  // subtle tilt
  tiltTargets.forEach(el => {
    if (!el) return;
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateY(${px*6}deg) rotateX(${ -py*6 }deg) translateZ(0)`;
      });
    };
    const reset = () => { el.style.transform = 'perspective(900px) translateZ(0)'; };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
  });
})();

/* ===== Typewriter (robust) ===== */
(() => {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const roles = [
    'Data Engineer',
    'Analytics Engineer',
    'Real-time Pipeline Builder',
    'Warehouse & OLAP Nerd',
    'Dash/Streamlit Craftsman'
  ];
  let idx = 0, pos = 0, dir = 1, current = roles[0];
  let timer;

  const step = () => {
    el.textContent = current.slice(0, pos);
    pos += dir;
    if (dir > 0 && pos > current.length + 6){ dir = -1; }
    else if (dir < 0 && pos <= 0){ dir = 1; idx = (idx + 1) % roles.length; current = roles[idx]; }
    timer = setTimeout(step, dir > 0 ? 60 : 30);
  };
  const start = () => { if (!timer) step(); };
  const stop  = () => { clearTimeout(timer); timer = null; };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  start();
})();

/* ===== Scroll reveal (works without HTML changes) ===== */
(() => {
  const candidates = [
    '.hero .name', '.hero .tagline', '.hero .sub', '.hero .typing', '.hero .cta',
    '.quick-pills span', '.card', '.project', '.skill-columns > *', '.edu-item', '.xp'
  ];
  const targets = [];
  candidates.forEach(sel => document.querySelectorAll(sel).forEach(n => targets.push(n)));

  targets.forEach(n => n.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.15});
  targets.forEach(t => io.observe(t));
})();

/* ===== Back to top ===== */
(() => {
  const btn = document.createElement('button');
  btn.className = 'scrolltop';
  btn.innerHTML = '↑';
  btn.title = 'Back to top';
  btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  document.body.appendChild(btn);
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle('show', y > 400);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
