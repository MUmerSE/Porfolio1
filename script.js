/* ═══════════════════════════════════════════════════════
   Muhammad Umer — Portfolio Interactions
   Vanilla JS · Lightweight · No Dependencies
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── DOM Cache ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─────────────────────────────────────────────
     1. PLEXUS NETWORK CANVAS — Full-page live background
  ───────────────────────────────────────────── */
  function initParticles() {
    const canvas = $('#plexusCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let w, h;
    let mouse = { x: -9999, y: -9999, active: false };

    /* Config */
    const CONNECTION_DIST = 160;
    const MOUSE_DIST = 220;
    const NODE_DENSITY = 8000; /* lower = more particles */

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createNodes() {
      const count = Math.floor((w * h) / NODE_DENSITY);
      nodes = [];
      for (let i = 0; i < count; i++) {
        /* 3 depth layers for parallax feel */
        const layer = Math.random();
        const speed = layer < 0.3 ? 0.15 : layer < 0.7 ? 0.3 : 0.5;
        const size = layer < 0.3 ? 1.0 : layer < 0.7 ? 1.8 : 2.5;
        const alpha = layer < 0.3 ? 0.2 : layer < 0.7 ? 0.45 : 0.7;
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: size,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          alpha: alpha,
          baseAlpha: alpha,
          /* color variation: cyan → teal → blue */
          hue: 170 + Math.random() * 30,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      /* Update positions */
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        /* Wrap around edges */
        if (n.x < -10) n.x = w + 10;
        if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        if (n.y > h + 10) n.y = -10;

        /* Mouse repulsion / attraction glow */
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const force = (1 - dist / MOUSE_DIST) * 0.008;
            n.vx += dx * force;
            n.vy += dy * force;
            n.alpha = Math.min(1, n.baseAlpha + (1 - dist / MOUSE_DIST) * 0.5);
          } else {
            n.alpha += (n.baseAlpha - n.alpha) * 0.05;
          }
        }

        /* Speed dampening */
        n.vx *= 0.999;
        n.vy *= 0.999;
      });

      /* Draw connections between nearby nodes */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.35;
            const lineWidth = (1 - dist / CONNECTION_DIST) * 1.2 + 0.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        }
      }

      /* Draw mouse connection lines — bright burst effect */
      if (mouse.active) {
        nodes.forEach((n) => {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const opacity = (1 - dist / MOUSE_DIST) * 0.5;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 230, 255, ${opacity})`;
            ctx.lineWidth = (1 - dist / MOUSE_DIST) * 1.5;
            ctx.stroke();
          }
        });

        /* Mouse glow */
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
        grad.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
        grad.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(mouse.x - 80, mouse.y - 80, 160, 160);
      }

      /* Draw nodes (dots with glow) */
      nodes.forEach((n) => {
        /* Outer glow */
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue}, 100%, 60%, ${n.alpha * 0.12})`;
        ctx.fill();

        /* Core dot */
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue}, 100%, 70%, ${n.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    createNodes();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createNodes();
    });

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    document.addEventListener('mouseleave', () => {
      mouse.active = false;
    });
  }


  /* ─────────────────────────────────────────────
     2. SCROLL REVEAL — IntersectionObserver
  ───────────────────────────────────────────── */
  function initScrollReveal() {
    const reveals = $$('.reveal-up');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }


  /* ─────────────────────────────────────────────
     3. NAVBAR — Scroll behavior + active link
  ───────────────────────────────────────────── */
  function initNavbar() {
    const navbar = $('#navbar');
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');

    /* Scroll class */
    function onScroll() {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      /* Active link highlight */
      let current = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) {
          current = sec.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init state
  }


  /* ─────────────────────────────────────────────
     4. MOBILE NAV TOGGLE
  ───────────────────────────────────────────── */
  function initMobileNav() {
    const toggle = $('#navToggle');
    const links = $('#navLinks');

    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });

    /* Close on link click */
    $$('.nav-link', links).forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ─────────────────────────────────────────────
     5. STAT COUNTER ANIMATION
  ───────────────────────────────────────────── */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));

    function animateCounter(el) {
      const target = parseInt(el.dataset.count, 10);
      const duration = 2000;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        /* ease-out cubic */
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(step);
    }
  }


  /* ─────────────────────────────────────────────
     6. SMOOTH SCROLL (fallback + offset)
  ───────────────────────────────────────────── */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        const target = $(targetId);
        if (!target) return;
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }


  /* ─────────────────────────────────────────────
     7. CONTACT FORM — Backend Integration
  ───────────────────────────────────────────── */
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const API_URL = '/api/contact';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('.btn-primary');
      const originalHTML = btn.innerHTML;
      const name = form.querySelector('#contactName').value.trim();
      const email = form.querySelector('#contactEmail').value.trim();
      const message = form.querySelector('#contactMessage').value.trim();

      if (!name || !email || !message) return;

      /* Loading state */
      btn.innerHTML = `
        <span>Sending...</span>
        <svg class="btn-icon spinning" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
      `;
      btn.style.pointerEvents = 'none';

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });

        const data = await res.json();

        if (data.success) {
          btn.innerHTML = `
            <span>Message Sent!</span>
            <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          `;
          form.reset();
        } else {
          btn.innerHTML = `<span>${data.error || 'Something went wrong'}</span>`;
        }
      } catch (err) {
        btn.innerHTML = `<span>Connection error — try again</span>`;
      }

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.pointerEvents = '';
      }, 3000);
    });
  }


  /* ─────────────────────────────────────────────
     8. TILT EFFECT ON CARDS (subtle)
  ───────────────────────────────────────────── */
  function initTiltCards() {
    const cards = $$('.skill-card, .why-card, .stat-card');
    if (!cards.length || window.innerWidth < 768) return;

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -4;
        const rotY = ((x - cx) / cx) * 4;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }


  /* ─────────────────────────────────────────────
     INIT — Boot everything on DOM ready
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollReveal();
    initNavbar();
    initMobileNav();
    initCounters();
    initSmoothScroll();
    initContactForm();
    initTiltCards();
  });


})();
