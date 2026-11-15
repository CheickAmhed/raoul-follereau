'use strict';

/**
 * assets/js/pages/institution.js
 * ============================================================================
 * Page Institution (institution.html) :
 *
 *  - chiffres et listes alimentés par assets/data/formations.js, pour rester
 *    cohérents avec le catalogue : nombre total de formations
 *    ([data-inst-count="formations"] : bannière, chiffres clés) et, pour
 *    chaque établissement ([data-etab="ips|eps|cpfp"]), le nombre de
 *    formations, le nombre de formations ouvertes aux inscriptions
 *    ([data-etab-stat]) et la liste des formations ([data-etab-list] : lien
 *    vers la fiche détaillée + statut des inscriptions) ;
 *  - sous-navigation collante (.inst-nav) : lien actif selon la section
 *    affichée (aria-current), lien actif recentré quand la barre défile
 *    horizontalement (mobile), fondu sur le bord qui cache des liens.
 *
 * À charger APRÈS formations.js, utils.js et formation-card.js, et AVANT
 * premium-animations.js : les compteurs .about-stat-num lisent data-count à
 * l'initialisation. Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : chiffres et listes rendus côté serveur (vue Blade).
 * ============================================================================
 */

(function () {

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* --- Chiffres et listes depuis les données -------------------------------- */

  const HAS_DATA = typeof RF_FORMATIONS !== 'undefined' && typeof RF_NIVEAUX !== 'undefined' &&
                   typeof RF_UTILS !== 'undefined' && typeof RF_FORMATION_CARD !== 'undefined';

  /** Libellés accordés au nombre (singulier, pluriel) des chiffres par établissement. */
  const STAT_LABELS = {
    formations: ['Formation au catalogue', 'Formations au catalogue'],
    ouvertes:   ['Formation ouverte aux inscriptions', 'Formations ouvertes aux inscriptions']
  };

  /** Écrit un nombre dans un compteur ; data-count est relu par premium-animations.js. */
  function setCount(el, value) {
    el.textContent = String(value);
    if (el.hasAttribute('data-count')) el.dataset.count = String(value);
  }

  function formationItem(f) {
    const U     = RF_UTILS;
    const CARD  = RF_FORMATION_CARD;
    const dispo = CARD.disponibilite(f);
    const meta  = (RF_NIVEAUX[f.niveau] || '') + ' · ' + f.duree;
    return (
      '<li>' +
        '<a class="etab-formation" href="' + CARD.detailUrl(f) + '">' +
          '<span class="etab-formation-text">' +
            '<span class="etab-formation-title">' + U.escapeHtml(f.titre) + '</span>' +
            '<span class="etab-formation-meta">' + U.escapeHtml(meta) + '</span>' +
            '<span class="etab-formation-status etab-formation-status--' + dispo + '">' + CARD.LABELS[dispo] + '</span>' +
          '</span>' +
          '<ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>' +
        '</a>' +
      '</li>'
    );
  }

  if (HAS_DATA) {
    document.querySelectorAll('[data-inst-count="formations"]').forEach(function (el) {
      setCount(el, RF_FORMATIONS.length);
    });

    document.querySelectorAll('[data-etab]').forEach(function (section) {
      const key  = section.dataset.etab;
      const list = RF_FORMATIONS.filter(function (f) { return f.etablissement === key; });
      const open = list.filter(function (f) { return RF_FORMATION_CARD.disponibilite(f) === 'ouvert'; });
      const counts = { formations: list.length, ouvertes: open.length };

      section.querySelectorAll('[data-etab-stat]').forEach(function (stat) {
        const name  = stat.dataset.etabStat;
        const num   = stat.querySelector('.about-stat-num');
        const label = stat.querySelector('.about-stat-label');
        if (!(name in counts)) return;
        if (num) setCount(num, counts[name]);
        if (label && STAT_LABELS[name]) {
          label.textContent = RF_UTILS.pluralize(counts[name], STAT_LABELS[name][0], STAT_LABELS[name][1]);
        }
      });

      const target = section.querySelector('[data-etab-list]');
      if (target && list.length) target.innerHTML = list.map(formationItem).join('');
    });
  }


  /* --- Sous-navigation collante -------------------------------------------- */

  const nav  = document.querySelector('.inst-nav');
  const list = nav && nav.querySelector('.inst-nav-list');
  if (!nav || !list) return;

  /* liens internes et sections ciblées, dans l'ordre du document */
  const items = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'))
    .map(function (link) {
      return { link: link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) };
    })
    .filter(function (item) { return item.section; });

  let active  = null;
  let ticking = false;

  /** Recentre le lien dans la barre (défilement horizontal de la liste seule). */
  function center(link) {
    if (list.scrollWidth <= list.clientWidth) return;
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  }

  function setActive(item) {
    if (item === active) return;
    if (active) {
      active.link.classList.remove('is-active');
      active.link.removeAttribute('aria-current');
    }
    active = item;
    if (item) {
      item.link.classList.add('is-active');
      item.link.setAttribute('aria-current', 'true');
      center(item.link);
    }
  }

  /* section courante : la dernière dont le haut est passé sous la barre collante */
  function update() {
    ticking = false;
    const line = nav.getBoundingClientRect().bottom + 40;
    let current = null;
    items.forEach(function (item) {
      if (item.section.getBoundingClientRect().top <= line) current = item;
    });
    setActive(current);
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  /* fondu sur le(s) bord(s) qui cachent encore des liens */
  function updateFades() {
    const max = list.scrollWidth - list.clientWidth;
    list.classList.toggle('fade-left',  max > 1 && list.scrollLeft > 1);
    list.classList.toggle('fade-right', max > 1 && list.scrollLeft < max - 1);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', function () { requestUpdate(); updateFades(); });
  window.addEventListener('load', function () { updateFades(); update(); });
  list.addEventListener('scroll', updateFades, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateFades);

  updateFades();
  update();

})();
