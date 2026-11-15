'use strict';

/**
 * assets/js/pages/temoignages.js
 * ============================================================================
 * Témoignages d'anciens apprenants (temoignages.html) :
 *  - seuls les témoignages validés (valide: true) sont affichés ;
 *  - bannière : nombre de témoignages et de formations représentées ;
 *  - filtre par établissement (boutons .news-filter + ?etablissement= dans l'URL),
 *    établissement déduit de la formation suivie ;
 *  - grille de cartes .testimonials-card (structure de l'accueil) au texte
 *    complet, avec la formation suivie (lien vers sa fiche) et la promotion.
 *
 * À charger APRÈS temoignages.js, formations.js et utils.js, et AVANT
 * premium-animations.js (cascade d'apparition des cartes).
 * Vanilla JS, IIFE 'use strict', aucun global.
 * ============================================================================
 */

(function () {

  if (typeof RF_TEMOIGNAGES === 'undefined' || typeof RF_UTILS === 'undefined') return;

  const U          = RF_UTILS;
  const esc        = U.escapeHtml;
  const ETABS      = typeof RF_ETABLISSEMENTS !== 'undefined' ? RF_ETABLISSEMENTS : {};
  const FORMATIONS = typeof RF_FORMATIONS !== 'undefined' ? RF_FORMATIONS : [];

  /* témoignages validés, enrichis de leur formation ; promotions les plus récentes d'abord */
  const items = RF_TEMOIGNAGES
    .filter(function (t) { return t.valide === true; })
    .map(function (t) {
      const formation = FORMATIONS.find(function (f) { return f.id === t.formation; }) || null;
      return { t: t, formation: formation, etab: formation ? formation.etablissement : '' };
    })
    .sort(function (a, b) { return (b.t.promotion || 0) - (a.t.promotion || 0); });

  function initials(name) {
    return name.split(/\s+/).map(function (part) { return part.charAt(0); }).join('').slice(0, 2).toUpperCase();
  }


  /* --- Bannière ------------------------------------------------------------ */

  const formationsCount = new Set(items.map(function (i) { return i.t.formation; })).size;
  document.querySelectorAll('[data-quote-badge="temoignages"]').forEach(function (el) {
    el.innerHTML = '<strong>' + items.length + '</strong> ' + U.pluralize(items.length, 'témoignage', 'témoignages');
  });
  document.querySelectorAll('[data-quote-badge="formations"]').forEach(function (el) {
    el.innerHTML = '<strong>' + formationsCount + '</strong> ' + U.pluralize(formationsCount, 'formation représentée', 'formations représentées');
  });


  /* --- Filtres et cartes ------------------------------------------------------ */

  const grid    = document.querySelector('.testimonial-grid');
  const filters = document.querySelector('.testimonial-filters');
  const counter = document.querySelector('.testimonial-count');
  if (!grid) return;

  const keys = Object.keys(ETABS).filter(function (key) {
    return items.some(function (i) { return i.etab === key; });
  });

  if (filters) {
    filters.innerHTML =
      '<button type="button" class="news-filter" data-etab="" aria-pressed="true">Tous<span class="news-filter-count">' + items.length + '</span></button>' +
      keys.map(function (key) {
        const count = items.filter(function (i) { return i.etab === key; }).length;
        return '<button type="button" class="news-filter" data-etab="' + key + '" aria-pressed="false">' + esc(ETABS[key].sigle) +
          '<span class="news-filter-count">' + count + '</span></button>';
      }).join('');
  }

  const cards = items.map(function (item) {
    const t    = item.t;
    const f    = item.formation;
    const etab = ETABS[item.etab] || {};
    const card = document.createElement('li');
    card.className = 'testimonials-card testimonial-item';
    card.id = t.id;
    card.dataset.etab = item.etab;
    card.innerHTML =
      '<img src="./assets/images/quote.png" alt="" class="quote-img">' +
      '<p class="testimonial-formation">' +
        (etab.sigle ? '<span class="trainer-etab testimonial-etab">' + esc(etab.sigle) + '</span>' : '') +
        (f ? '<a href="formation-detail.html?id=' + encodeURIComponent(f.id) + '">' + esc(f.titre) + '</a>' : '') +
        '<span class="testimonial-promo">Promotion ' + esc(t.promotion) + '</span>' +
      '</p>' +
      '<blockquote class="testimonials-text"><p>« ' + esc(t.texte) + ' »</p></blockquote>' +
      '<div class="testimonials-client">' +
        '<div class="client-img-box">' +
          (t.photo
            ? '<img src="' + esc(t.photo) + '" width="50" height="50" alt="Portrait de ' + esc(t.nom) + '" loading="lazy">'
            : '<span class="client-initials" aria-hidden="true">' + esc(initials(t.nom)) + '</span>') +
        '</div>' +
        '<div class="client-detail">' +
          '<h3 class="client-name">' + esc(t.nom) + '</h3>' +
          '<p class="client-title">' + esc(t.poste) + '</p>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
    return card;
  });

  const wanted = U.getParam('etablissement');
  let current = keys.indexOf(wanted) !== -1 ? wanted : '';

  function apply() {
    let shown = 0;
    cards.forEach(function (card) {
      const on = !current || card.dataset.etab === current;
      card.hidden = !on;
      if (on) shown++;
    });
    if (filters) {
      filters.querySelectorAll('[data-etab]').forEach(function (button) {
        const on = button.dataset.etab === current;
        button.classList.toggle('is-active', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    if (counter) {
      const sigle = current ? ETABS[current].sigle : '';
      counter.innerHTML = '<strong>' + shown + '</strong> ' + U.pluralize(shown, 'témoignage', 'témoignages') +
        (current ? ' d\'anciens apprenants ' + (/^[AEIOU]/.test(sigle) ? "de l'" : 'du ') + esc(sigle) : " d'anciens apprenants");
    }
    const params = new URLSearchParams(window.location.search);
    if (current) params.set('etablissement', current); else params.delete('etablissement');
    const query = params.toString();
    try {
      window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    } catch (e) { /* file:// : sans conséquence */ }
  }

  if (filters) {
    filters.addEventListener('click', function (e) {
      const button = e.target.closest('[data-etab]');
      if (!button) return;
      current = button.dataset.etab;
      apply();
    });
  }

  apply();

})();
