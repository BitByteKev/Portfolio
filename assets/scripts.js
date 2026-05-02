// ============================================
// PORTFOLIO — ADVANCED 3D ANIMATIONS & EFFECTS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  initI18n();
  initMobileMenu();
  initHeroBackground();
  initTypewriter();
  initSkillBars();
  initWhatsAppFab();

  if (!prefersReduced) {
    initScrollAnimations();
    if (!isMobile) initCardTilt();
    initFloatingNav();
  } else {
    document.querySelectorAll('.anim-fade-up, .anim-scale-in').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
});

// ============================================
// I18N — Language Switcher (EN / ES)
// ============================================
const I18N_STORAGE_KEY = 'site-lang';

function getLang() {
  try {
    const saved = localStorage.getItem(I18N_STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch (e) {}
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return nav === 'es' ? 'es' : 'en';
}

function setLang(lang) {
  try { localStorage.setItem(I18N_STORAGE_KEY, lang); } catch (e) {}
  applyLang(lang);
}

function applyLang(lang) {
  const dict = (window.I18N && window.I18N[lang]) || {};
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] != null) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] != null) el.setAttribute('placeholder', dict[key]);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key] != null) el.setAttribute('aria-label', dict[key]);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] != null) el.setAttribute('title', dict[key]);
  });

  // Typewriter — rebuild per-lang texts
  const tw = document.getElementById('typewriter');
  if (tw && tw.dataset.textsKeys) {
    try {
      const keys = JSON.parse(tw.dataset.textsKeys);
      const texts = keys.map(k => dict[k]).filter(Boolean);
      if (texts.length) {
        tw.dataset.texts = JSON.stringify(texts);
        if (typeof window.__restartTypewriter === 'function') window.__restartTypewriter();
      }
    } catch (e) {}
  }

  // Sync flag button visual state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const isActive = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('lang-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function initI18n() {
  if (!window.I18N) return;
  const lang = getLang();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-lang');
      if (target) setLang(target);
    });
  });

  applyLang(lang);
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isHidden = menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    menu.style.animation = isHidden ? 'menuSlideDown 0.3s ease forwards' : '';
    toggle.setAttribute('aria-expanded', String(isHidden));
  });
}

// ============================================
// THREE.JS HERO PARTICLE BACKGROUND
// ============================================
function initHeroBackground() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const mobile = window.innerWidth < 768;
  const parent = canvas.parentElement;

  const setSize = () => ({ w: parent.clientWidth, h: parent.clientHeight });
  let { w, h } = setSize();

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
  camera.position.z = 6;

  // ── Particle cloud ──
  const count = mobile ? 70 : 220;
  const posArr = new Float32Array(count * 3);
  const colArr = new Float32Array(count * 3);
  const velArr = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    posArr[i*3]   = (Math.random() - 0.5) * 20;
    posArr[i*3+1] = (Math.random() - 0.5) * 14;
    posArr[i*3+2] = (Math.random() - 0.5) * 10;
    velArr[i*3]   = (Math.random() - 0.5) * 0.003;
    velArr[i*3+1] = (Math.random() - 0.5) * 0.003;
    velArr[i*3+2] = 0;
    colArr[i*3]   = 0.85 + Math.random() * 0.15;
    colArr[i*3+1] = 0.35 + Math.random() * 0.35;
    colArr[i*3+2] = Math.random() * 0.05;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colArr, 3));

  const mat = new THREE.PointsMaterial({
    size: mobile ? 0.07 : 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── Wireframe geometric shapes (desktop only) ──
  const shapes = [];
  if (!mobile) {
    const baseGeos = [
      new THREE.IcosahedronGeometry(0.35, 0),
      new THREE.OctahedronGeometry(0.30, 0),
      new THREE.TetrahedronGeometry(0.35, 0),
    ];
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(
        baseGeos[i % 3],
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xfb923c : 0xfed7aa,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        })
      );
      mesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4
      );
      mesh.userData = {
        rx: (Math.random() - 0.5) * 0.012,
        ry: (Math.random() - 0.5) * 0.018,
        fs: Math.random() * 0.004 + 0.002,
        fo: Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      shapes.push(mesh);
    }
  }

  // ── Mouse parallax ──
  let mx = 0, my = 0;
  if (!mobile) {
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i*3]   += velArr[i*3];
      pos[i*3+1] += velArr[i*3+1];
      if (Math.abs(pos[i*3])   > 10) velArr[i*3]   *= -1;
      if (Math.abs(pos[i*3+1]) > 7)  velArr[i*3+1] *= -1;
    }
    geo.attributes.position.needsUpdate = true;

    points.rotation.y += 0.0006;
    points.rotation.x += 0.0002;

    if (!mobile) {
      camera.position.x += (mx * 1.8 - camera.position.x) * 0.04;
      camera.position.y += (-my * 1.2 - camera.position.y) * 0.04;
      shapes.forEach(m => {
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
        m.position.y += Math.sin(t + m.userData.fo) * m.userData.fs;
      });
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const sz = setSize();
    camera.aspect = sz.w / sz.h;
    camera.updateProjectionMatrix();
    renderer.setSize(sz.w, sz.h);
  });
}

// ============================================
// GSAP SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;

  const st = typeof ScrollTrigger !== 'undefined' ? ScrollTrigger : null;
  if (st) gsap.registerPlugin(st);

  const mkTrigger = (el, start) =>
    st ? { scrollTrigger: { trigger: el, start: start || 'top 88%', toggleActions: 'play none none none' } } : {};

  document.querySelectorAll('.anim-fade-up').forEach(el => {
    gsap.from(el, { ...mkTrigger(el), y: 55, opacity: 0, duration: 0.85, ease: 'power3.out' });
  });

  document.querySelectorAll('.anim-scale-in').forEach(el => {
    gsap.from(el, { ...mkTrigger(el), scale: 0, opacity: 0, duration: 0.65, ease: 'back.out(2)' });
  });

  document.querySelectorAll('.anim-stagger').forEach(container => {
    gsap.from(Array.from(container.children), {
      ...mkTrigger(container, 'top 82%'),
      y: 70, opacity: 0, duration: 0.75, stagger: 0.14, ease: 'power3.out',
    });
  });

  // Hero entrance is handled by CSS animations in styles.css

  // Skill bar widths are handled by IntersectionObserver in initSkillBars()
}

// ============================================
// 3D CARD TILT
// ============================================
function initCardTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const rx = ((y - r.height / 2) / (r.height / 2)) * -13;
      const ry = ((x - r.width  / 2) / (r.width  / 2)) *  13;
      card.style.transition = 'transform 0.08s ease';
      card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.04,1.04,1.04)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
      card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
  });
}

// ============================================
// TYPEWRITER EFFECT
// ============================================
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  let texts = [];
  let ti = 0, ci = 0, deleting = false;
  let timer = null;
  let runId = 0;

  function loadTexts() {
    try { texts = JSON.parse(el.dataset.texts || '[]'); } catch { texts = []; }
    if (!texts.length) texts = [el.textContent.trim()];
  }

  function start() {
    if (timer) { clearTimeout(timer); timer = null; }
    runId++;
    const myRun = runId;
    loadTexts();
    el.textContent = '';
    ti = 0; ci = 0; deleting = false;

    function tick() {
      if (myRun !== runId) return;
      const cur = texts[ti] || '';
      if (!deleting) {
        el.textContent = cur.slice(0, ++ci);
        if (ci === cur.length) { deleting = true; timer = setTimeout(tick, 2200); return; }
      } else {
        el.textContent = cur.slice(0, --ci);
        if (ci === 0) { deleting = false; ti = (ti + 1) % texts.length; }
      }
      timer = setTimeout(tick, deleting ? 45 : 75);
    }
    timer = setTimeout(tick, 800);
  }

  window.__restartTypewriter = start;
  start();
}

// ============================================
// SKILL BARS — IntersectionObserver (always runs)
// ============================================
function initSkillBars() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target.querySelector('.skill-bar-fill');
      if (bar) {
        bar.style.transition = 'width 1.3s cubic-bezier(0.25,0.46,0.45,0.94)';
        bar.style.width      = bar.dataset.width || '0%';
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.skill-row').forEach(row => observer.observe(row));
}

// ============================================
// FLOATING / GLASS NAV ON SCROLL
// ============================================
function initFloatingNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav-scrolled', window.scrollY > 80);
  }, { passive: true });
}

// ============================================
// FLOATING WHATSAPP BUTTON (draggable, mobile + desktop)
// ============================================
function initWhatsAppFab() {
  if (document.getElementById('whatsapp-fab')) return;

  const PHONE = '16199448759';
  const MSG = encodeURIComponent("Hi Kevin, I saw your portfolio and wanted to reach out.");
  const STORAGE_KEY = 'wa-fab-pos';

  const fab = document.createElement('a');
  fab.id = 'whatsapp-fab';
  fab.href = `https://wa.me/${PHONE}?text=${MSG}`;
  fab.target = '_blank';
  fab.rel = 'noopener';
  fab.setAttribute('aria-label', 'Chat with Kevin on WhatsApp');
  fab.title = 'Chat on WhatsApp (drag to move)';
  fab.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>`;
  document.body.appendChild(fab);

  const SIZE_PAD = 8;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  function applyPos(left, top) {
    const r = fab.getBoundingClientRect();
    const maxL = window.innerWidth  - r.width  - SIZE_PAD;
    const maxT = window.innerHeight - r.height - SIZE_PAD;
    left = clamp(left, SIZE_PAD, maxL);
    top  = clamp(top,  SIZE_PAD, maxT);
    fab.style.left   = left + 'px';
    fab.style.top    = top  + 'px';
    fab.style.right  = 'auto';
    fab.style.bottom = 'auto';
    return { left, top };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
      requestAnimationFrame(() => applyPos(saved.left, saved.top));
    }
  } catch (e) {}

  let dragging = false;
  let moved = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  const DRAG_THRESHOLD = 5;

  fab.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    const r = fab.getBoundingClientRect();
    originLeft = r.left;
    originTop  = r.top;
    fab.setPointerCapture(e.pointerId);
  });

  fab.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      moved = true;
      fab.classList.add('is-dragging');
    }
    if (moved) {
      e.preventDefault();
      applyPos(originLeft + dx, originTop + dy);
    }
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    if (moved) {
      fab.classList.remove('is-dragging');
      const r = fab.getBoundingClientRect();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ left: r.left, top: r.top })); } catch (err) {}
    }
    try { fab.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  fab.addEventListener('pointerup', endDrag);
  fab.addEventListener('pointercancel', endDrag);

  fab.addEventListener('click', (e) => {
    if (moved) { e.preventDefault(); moved = false; }
  });

  fab.addEventListener('dragstart', (e) => e.preventDefault());

  window.addEventListener('resize', () => {
    if (fab.style.left && fab.style.top) {
      applyPos(parseFloat(fab.style.left), parseFloat(fab.style.top));
    }
  });
}
