'use strict';

/**
 * assets/js/pages/legal.js
 * ============================================================================
 * Pages légales (confidentialite.html, puis termes.html et mentions-legales.html) :
 * sommaire de la page (.legal-toc) dans un <details> (.legal-toc-details).
 *  - mobile : sommaire replié par défaut (une ligne « Sommaire ») ;
 *  - à partir de 992px : toujours déplié, colonne collante (media_queries.css) ;
 *  - lien de la section en cours de lecture mis en évidence (aria-current).
 * Sans JavaScript, le sommaire reste un <details> utilisable et les ancres fonctionnent.
 * Vanilla JS, IIFE 'use strict', aucun global.
 * ============================================================================
 */

(function () {

  const toc = document.querySelector('.legal-toc');
  if (!toc) return;

  const details = toc.closest('.legal-toc-details');
  const desktop = window.matchMedia('(min-width: 992px)');


  /* --- Sommaire déplié en desktop -------------------------------------------- */

  function syncDetails() {
    if (details && desktop.matches) details.open = true;
  }

  if (details) {
    details.addEventListener('toggle', function () {
      if (desktop.matches && !details.open) details.open = true;     // pas de repli en desktop
    });
    if (desktop.addEventListener) desktop.addEventListener('change', syncDetails);
    else if (desktop.addListener) desktop.addListener(syncDetails);
  }
  syncDetails();


  /* --- Section en cours de lecture ------------------------------------------- */

  const items = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'))
    .map(function (link) {
      return { link: link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) };
    })
    .filter(function (item) { return item.section; });

  let active  = null;
  let ticking = false;

  function update() {
    ticking = false;
    const line = 140;                                   // sous le header fixe, avec une marge
    let current = null;
    items.forEach(function (item) {
      if (item.section.getBoundingClientRect().top <= line) current = item;
    });
    if (current === active) return;
    if (active) {
      active.link.classList.remove('is-active');
      active.link.removeAttribute('aria-current');
    }
    active = current;
    if (active) {
      active.link.classList.add('is-active');
      active.link.setAttribute('aria-current', 'true');
    }
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();

})();
