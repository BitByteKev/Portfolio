// ============================================
// PORTFOLIO — ADVANCED 3D ANIMATIONS & EFFECTS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  initMobileMenu();
  initHeroBackground();
  initTypewriter();
  initSkillBars();

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

  let texts;
  try { texts = JSON.parse(el.dataset.texts || '[]'); } catch { texts = []; }
  if (!texts.length) texts = [el.textContent.trim()];
  el.textContent = '';

  let ti = 0, ci = 0, deleting = false;

  function tick() {
    const cur = texts[ti];
    if (!deleting) {
      el.textContent = cur.slice(0, ++ci);
      if (ci === cur.length) { deleting = true; setTimeout(tick, 2200); return; }
    } else {
      el.textContent = cur.slice(0, --ci);
      if (ci === 0) { deleting = false; ti = (ti + 1) % texts.length; }
    }
    setTimeout(tick, deleting ? 45 : 75);
  }
  setTimeout(tick, 800);
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
