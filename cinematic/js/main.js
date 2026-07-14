/* ═══════════════════════════════════════════════════
   KEVIN CROMLEY — cinematic scroll engine
   Lenis smooth scroll · GSAP ScrollTrigger · canvas orbit scrub
   ═══════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Always open at the top — the intro is scroll-driven */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ── Split display words into letters ── */
  document.querySelectorAll(".name-line").forEach(function (line) {
    var word = line.getAttribute("data-word") || "";
    line.textContent = "";
    word.split("").forEach(function (ch) {
      var s = document.createElement("span");
      s.className = "ltr";
      s.textContent = ch;
      line.appendChild(s);
    });
  });

  /* ── Orbit frame sequence ── */
  var cfg = window.__ORBIT__ || { count: 0, path: "frames/orbit_", ext: ".jpg", pad: 4 };
  var canvas = document.getElementById("orbitCanvas");
  var ctx = canvas.getContext("2d");
  var frames = new Array(cfg.count);
  var loadedCount = 0;
  var currentFrame = -1;
  var frameState = { f: 0 };

  var loaderEl = document.getElementById("loader");
  var loaderPct = document.getElementById("loaderPct");
  var loaderFill = document.getElementById("loaderFill");

  function frameSrc(i) {
    var n = String(i + 1);
    while (n.length < cfg.pad) n = "0" + n;
    return cfg.path + n + cfg.ext;
  }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    currentFrame = -1;
    render(frameState.f, true);
  }

  function render(f, force) {
    var idx = Math.max(0, Math.min(cfg.count - 1, Math.round(f)));
    if (!force && idx === currentFrame) return;
    var img = frames[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    currentFrame = idx;
    var cw = canvas.width, ch = canvas.height;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale, dh = ih * scale;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  function preloadFrames(onDone) {
    if (!cfg.count) { onDone(); return; }
    var settled = 0;
    function tick() {
      settled++;
      var pct = Math.round((settled / cfg.count) * 100);
      loaderPct.textContent = pct + "%";
      loaderFill.style.width = pct + "%";
      if (settled === cfg.count) onDone();
    }
    for (var i = 0; i < cfg.count; i++) {
      (function (i) {
        var img = new Image();
        img.onload = function () {
          loadedCount++;
          if (i === 0) render(0, true);
          tick();
        };
        img.onerror = tick;
        img.src = frameSrc(i);
        frames[i] = img;
      })(i);
    }
  }

  /* ── WhatsApp button: draggable, click opens chat ── */
  (function () {
    var fab = document.getElementById("waFab");
    if (!fab) return;
    var startX = 0, startY = 0, baseX = 0, baseY = 0, dx = 0, dy = 0;
    var dragging = false, moved = false;

    function clamp() {
      var r = fab.getBoundingClientRect();
      if (r.left < 8) dx += 8 - r.left;
      if (r.top < 8) dy += 8 - r.top;
      if (r.right > innerWidth - 8) dx -= r.right - (innerWidth - 8);
      if (r.bottom > innerHeight - 8) dy -= r.bottom - (innerHeight - 8);
      fab.style.transform = "translate(" + dx + "px," + dy + "px)";
    }

    fab.addEventListener("pointerdown", function (e) {
      dragging = true; moved = false;
      startX = e.clientX; startY = e.clientY;
      baseX = dx; baseY = dy;
      fab.setPointerCapture(e.pointerId);
    });
    fab.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var mx = e.clientX - startX, my = e.clientY - startY;
      if (Math.abs(mx) > 6 || Math.abs(my) > 6) moved = true;
      dx = baseX + mx; dy = baseY + my;
      clamp();
    });
    fab.addEventListener("pointerup", function (e) {
      dragging = false;
      fab.releasePointerCapture(e.pointerId);
    });
    fab.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); moved = false; }
    });
    window.addEventListener("resize", clamp);
  })();

  /* ── Reduced motion: static page, no scrub ── */
  if (reduceMotion) {
    preloadFrames(function () {
      loaderEl.classList.add("done");
      render(0, true);
    });
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);
    document.querySelectorAll(".pillar").forEach(function (p) {
      p.style.position = "relative";
      p.style.opacity = "1";
      p.style.visibility = "visible";
      p.style.left = "0";
    });
    document.querySelectorAll(".stat-num").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var pad = parseInt(el.getAttribute("data-pad") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var t = String(target);
      while (t.length < pad) t = "0" + t;
      el.textContent = t + suffix;
    });
    document.querySelectorAll(".name-line .ltr").forEach(function (l) {
      l.style.transform = "none";
    });
    document.querySelectorAll("video.bg-video").forEach(function (v) { v.removeAttribute("autoplay"); });
    return;
  }

  /* ── Lenis smooth scroll + GSAP ── */
  gsap.registerPlugin(ScrollTrigger);

  // Mobile: don't re-layout pins when the address bar shows/hides,
  // and normalize touch scroll so pinned sections don't jitter on iOS.
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (ScrollTrigger.isTouch === 1) ScrollTrigger.normalizeScroll(true);

  var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  /* ── HERO · orbit scrub + kinetic name ── */
  var heroLetters1 = document.querySelectorAll(".hero-name .name-line:first-child .ltr");
  var heroLetters2 = document.querySelectorAll(".hero-name .accent-line .ltr");

  gsap.set([heroLetters1, heroLetters2], { yPercent: 130 });

  var heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=300%",
      scrub: 0.6,
      pin: true,
      anticipatePin: 1
    }
  });

  // orbit frames run the full scrub, linear — buttery
  heroTl.to(frameState, {
    f: cfg.count - 1,
    ease: "none",
    duration: 1,
    onUpdate: function () { render(frameState.f); }
  }, 0);

  // "KEVIN" tracks in letter-by-letter
  heroTl.to(heroLetters1, {
    yPercent: 0,
    ease: "power3.out",
    stagger: 0.016,
    duration: 0.14
  }, 0.02);

  // "CROMLEY" follows
  heroTl.to(heroLetters2, {
    yPercent: 0,
    ease: "power3.out",
    stagger: 0.014,
    duration: 0.14
  }, 0.1);

  // tracking: letters land wide, then settle tight (narrower start on phones)
  var wideTracking = window.innerWidth < 600 ? "0.08em" : "0.22em";
  gsap.set(".hero-name .name-line", { letterSpacing: wideTracking });
  heroTl.to(".hero-name .name-line", {
    letterSpacing: "0em",
    ease: "power2.inOut",
    duration: 0.3
  }, 0.16);

  // subtitle
  gsap.set(".hero-sub", { autoAlpha: 0, y: 26 });
  heroTl.to(".hero-sub", { autoAlpha: 1, y: 0, duration: 0.12, ease: "power2.out" }, 0.34);

  // release: type drifts up as orbit completes, ready for handoff
  heroTl.to(".hero-type", { yPercent: -14, autoAlpha: 0, duration: 0.14, ease: "power2.in" }, 0.86);
  heroTl.to(".scroll-cue", { autoAlpha: 0, duration: 0.06 }, 0.1);

  /* ── STATS · count up once ── */
  document.querySelectorAll(".stat-num").forEach(function (el, i) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var pad = parseInt(el.getAttribute("data-pad") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var state = { v: 0 };
    function put() {
      var t = String(Math.round(state.v));
      while (t.length < pad) t = "0" + t;
      el.textContent = t + suffix;
    }
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: function () {
        gsap.to(state, {
          v: target,
          duration: 1.8,
          delay: i * 0.12,
          ease: "power3.out",
          onUpdate: put
        });
      }
    });
  });

  gsap.utils.toArray(".stat").forEach(function (el, i) {
    gsap.from(el, {
      y: 44, autoAlpha: 0, duration: 0.9, delay: i * 0.08, ease: "power3.out",
      scrollTrigger: { trigger: "#stats", start: "top 85%", once: true }
    });
  });

  /* ── PILLARS · pinned, one at a time, over THE BUILDER ── */
  var pillars = gsap.utils.toArray(".pillar");
  var ppSteps = document.querySelectorAll(".pp-step");
  gsap.set(pillars, { autoAlpha: 0, y: 70 });

  var pillarTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#pillars",
      start: "top top",
      end: "+=260%",
      scrub: 0.6,
      pin: true,
      anticipatePin: 1,
      onUpdate: function (self) {
        var active = Math.min(2, Math.floor(self.progress * 3));
        ppSteps.forEach(function (s, i) {
          s.classList.toggle("active", i === active);
        });
      }
    }
  });

  pillars.forEach(function (p, i) {
    var at = i * 1.0;
    pillarTl.to(p, { autoAlpha: 1, y: 0, duration: 0.34, ease: "power3.out" }, at + 0.08);
    if (i < pillars.length - 1) {
      pillarTl.to(p, { autoAlpha: 0, y: -70, duration: 0.3, ease: "power2.in" }, at + 0.74);
    }
  });

  /* ── WORK · cards rise over THE CLOSER ── */
  gsap.from(".work-heading", {
    y: 90, autoAlpha: 0, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: "#work", start: "top 70%", once: true }
  });
  gsap.utils.toArray(".card").forEach(function (card, i) {
    gsap.from(card, {
      y: 80, autoAlpha: 0, duration: 0.9, delay: i * 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".work-cards", start: "top 85%", once: true }
    });
  });

  /* ── WORK INDEX + CREDENTIALS · staggered reveals ── */
  gsap.utils.toArray(".index-row").forEach(function (row, i) {
    gsap.from(row, {
      y: 40, autoAlpha: 0, duration: 0.7, delay: i * 0.08, ease: "power3.out",
      scrollTrigger: { trigger: ".work-index", start: "top 88%", once: true }
    });
  });
  gsap.utils.toArray(".cred").forEach(function (el, i) {
    gsap.from(el, {
      y: 40, autoAlpha: 0, duration: 0.8, delay: i * 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".creds", start: "top 85%", once: true }
    });
  });

  /* ── FINALE · letters rise on entry ── */
  var finaleLetters = document.querySelectorAll(".finale-name .ltr");
  gsap.set(finaleLetters, { yPercent: 130 });
  ScrollTrigger.create({
    trigger: "#contact",
    start: "top 65%",
    once: true,
    onEnter: function () {
      gsap.to(finaleLetters, {
        yPercent: 0, duration: 0.9, stagger: 0.045, ease: "power4.out"
      });
      gsap.from(".finale-actions .btn", {
        y: 30, autoAlpha: 0, duration: 0.7, stagger: 0.1, delay: 0.5, ease: "power3.out"
      });
    }
  });

  /* ── Background videos: play only while on screen ── */
  document.querySelectorAll("video.bg-video").forEach(function (video) {
    ScrollTrigger.create({
      trigger: video.closest("section"),
      start: "top bottom",
      end: "bottom top",
      onToggle: function (self) {
        if (self.isActive) {
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          video.pause();
        }
      }
    });
  });

  /* ── Boot ── */
  preloadFrames(function () {
    loaderEl.classList.add("done");
    render(0, true);
    ScrollTrigger.refresh();
    gsap.from(".hero-eyebrow", { autoAlpha: 0, y: 18, duration: 1, delay: 0.2, ease: "power2.out" });
  });

  // Safety: never trap the visitor behind the loader
  setTimeout(function () { loaderEl.classList.add("done"); }, 12000);
})();
