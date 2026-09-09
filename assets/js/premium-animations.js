'use strict';

/**
 * premium-animations.js
 * ============================================================================
 * Jeu d'animations « premium » SPÉCIFIQUE À LA PAGE D'ACCUEIL (index.html).
 *
 * Ce set est volontairement plus riche que le scroll-reveal générique prévu au
 * §8 de PROJECT_CONTEXT.md (simple fade / translate, destiné à être appliqué
 * plus tard à toutes les pages via un scroll-reveal.js dédié). Il ne concerne
 * QUE la home tant que les autres pages n'existent pas.
 *
 * Respect de PROJECT_CONTEXT.md §2 / §3 / §8 :
 *  - vanilla JS, zéro dépendance externe, IIFE en 'use strict' : aucune variable
 *    globale, aucun conflit possible avec script.js (toggle navbar intact) ;
 *  - IntersectionObserver pour tous les déclencheurs au scroll ; seul le
 *    rétrécissement de la navbar utilise un listener scroll (throttlé en rAF) ;
 *  - prefers-reduced-motion : tilt 3D, boutons magnétiques et compteurs animés
 *    sont désactivés (valeur finale affichée directement), seul un fondu simple
 *    est conservé pour le reveal ;
 *  - couleurs / tailles / durées passent par les tokens de variable.css
 *    (voir les règles ajoutées dans animation.css, ex. --default-transition) ;
 *  - n'altère aucune animation existante (drop-anim, smooth-zigzag-anim,
 *    pulse-anim, menuPopup).
 *
 * NB : les compteurs de la section .stats restent gérés par script.js ; ceux de
 * la section « pourquoi nous choisir » (.about-stat-num) sont gérés ici.
 * ============================================================================
 */

(function () {

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HAS_IO = 'IntersectionObserver' in window;


  /* -------------------------------------------------------------------------
   * 1. Reveal en cascade (stagger) sur les enfants de grilles
   * ---------------------------------------------------------------------- */

  function setupStaggerReveal() {

    const GRID_SELECTORS = [
      '.category .course-item-group',
      '.composantes-grid',
      '.course-grid',
      '.calendar-timeline',
      '.instructor-grid',
      '.stats-grid',
      '.blog-grid',
      '.about-stats'
    ];

    document.documentElement.classList.add('premium-anim');

    const items = [];

    GRID_SELECTORS.forEach(function (selector) {
      const grid = document.querySelector(selector);
      if (!grid) return;

      Array.from(grid.children).forEach(function (child, index) {
        // on retire le reveal générique de l'étape 1 pour éviter un double traitement
        child.classList.remove('reveal-up', 'reveal-fade', 'reveal-left', 'reveal-right');
        child.classList.add('reveal-rise');
        child.style.setProperty('--reveal-delay', (Math.min(index, 8) * 70) + 'ms');
        items.push(child);
      });
    });

    if (!items.length) return;

    function markDone(e) {
      e.currentTarget.classList.add('reveal-done');
    }

    function reveal(el) {
      el.addEventListener('animationend', markDone, { once: true });
      el.classList.add('is-visible');
    }

    if (REDUCED_MOTION || !HAS_IO) {
      items.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }


  /* -------------------------------------------------------------------------
   * 2. Tilt 3D léger — .course-card et .instructor-card
   * ---------------------------------------------------------------------- */

  function setupTilt() {

    const MAX_DEG = 6;
    const cards = document.querySelectorAll('.course-card, .instructor-card');

    cards.forEach(function (card) {

      card.classList.add('tilt-card');
      let frame = null;
      let evt = null;

      card.addEventListener('mouseenter', function () {
        card.style.willChange = 'transform';
      });

      card.addEventListener('mousemove', function (e) {
        evt = e;
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          const r = card.getBoundingClientRect();
          const px = (evt.clientX - r.left) / r.width;
          const py = (evt.clientY - r.top) / r.height;
          const rotY = (px - 0.5) * 2 * MAX_DEG;
          const rotX = (0.5 - py) * 2 * MAX_DEG;
          card.style.transform =
            'perspective(800px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' +
            rotY.toFixed(2) + 'deg) translateY(-6px)';
        });
      });

      card.addEventListener('mouseleave', function () {
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        card.style.transform = '';
        card.style.willChange = '';
      });
    });
  }


  /* -------------------------------------------------------------------------
   * 3. Boutons magnétiques — CTA du hero uniquement
   * ---------------------------------------------------------------------- */

  function setupMagneticButtons() {

    const PULL = 0.28;      // fraction du déplacement curseur -> bouton
    const MAX_SHIFT = 10;   // px

    const buttons = document.querySelectorAll('.home-btn-group .btn');

    buttons.forEach(function (btn) {

      btn.classList.add('magnetic-btn');
      let frame = null;
      let evt = null;

      btn.addEventListener('mousemove', function (e) {
        evt = e;
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          const r = btn.getBoundingClientRect();
          const dx = evt.clientX - (r.left + r.width / 2);
          const dy = evt.clientY - (r.top + r.height / 2);
          const x = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dx * PULL));
          const y = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dy * PULL));
          btn.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
        });
      });

      btn.addEventListener('mouseleave', function () {
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        btn.style.transform = '';
      });
    });
  }


  /* -------------------------------------------------------------------------
   * 4. Compteurs animés — chiffres clés « pourquoi nous choisir »
   *    Déclenchés à l'entrée de la section dans le viewport.
   * ---------------------------------------------------------------------- */

  function setupCounters() {

    const nums = document.querySelectorAll('.about-stat-num[data-count]');
    if (!nums.length) return;

    function finalText(el) {
      const target = parseInt(el.dataset.count, 10) || 0;
      return target.toLocaleString('fr-FR') + (el.dataset.suffix || '');
    }

    if (REDUCED_MOTION || !HAS_IO) {
      nums.forEach(function (el) { el.textContent = finalText(el); });
      return;
    }

    function run(el) {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('fr-FR') + suffix;
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = target.toLocaleString('fr-FR') + suffix;
          el.classList.add('count-pop-anim');
        }
      }
      requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { observer.observe(el); });
  }


  /* -------------------------------------------------------------------------
   * 5. Navbar compressée au défilement
   * ---------------------------------------------------------------------- */

  function setupNavbarShrink() {

    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let ticking = false;

    function update() {
      navbar.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }


  /* -------------------------------------------------------------------------
   * 6. Reveal bidirectionnel de chaque section au scroll (montant ET descendant)
   *    L'observer n'est jamais déconnecté : .is-visible est ajouté à l'entrée
   *    dans le viewport et retiré à la sortie, donc l'animation se rejoue.
   * ---------------------------------------------------------------------- */

  function setupSectionReveal() {

    const blocks = document.querySelectorAll('main > section, footer');
    if (!blocks.length) return;

    document.documentElement.classList.add('section-anim');

    blocks.forEach(function (el) {
      el.classList.add('section-reveal');
      // hero / contact (carte flottante) / footer : opacité seule, pas de translate
      if (el.matches('.home, .contact') || el.tagName === 'FOOTER') {
        el.classList.add('section-reveal--fade');
      }
    });

    if (REDUCED_MOTION || !HAS_IO) {
      blocks.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    blocks.forEach(function (el) { observer.observe(el); });
  }


  /* ---------------------------------------------------------------------- */

  function init() {
    setupSectionReveal();
    setupStaggerReveal();
    setupCounters();
    setupNavbarShrink();

    if (!REDUCED_MOTION) {
      setupTilt();
      setupMagneticButtons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
