'use strict';

/**
 * assets/js/pages/actualites.js
 * ============================================================================
 * Page Actualités (actualites.html) :
 *  - bannière : nombre de publications et d'événements à venir ;
 *  - « Prochain rendez-vous » : compte à rebours (.countdown de l'accueil, dont
 *    la minuterie est gérée par script.js) vers le prochain événement qui n'a
 *    pas encore commencé ; section masquée s'il n'y en a aucun ;
 *  - agenda : les prochains événements en cartes .event-card (badge « À venir ») ;
 *  - liste : publications publiées (publie: true) de la plus récente à la plus
 *    ancienne, en cartes .blog-card ; filtre par catégorie (boutons + ?categorie=
 *    dans l'URL), affichage par paquets (« Afficher plus »), état vide.
 *
 * À charger APRÈS actualites.js (données), utils.js et actu-card.js, et AVANT
 * premium-animations.js (cascade d'apparition des cartes) et script.js (qui lit
 * data-countdown au chargement). Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : liste paginée et filtrée côté serveur (/actualites?categorie=…).
 * ============================================================================
 */

(function () {

  if (typeof RF_ACTUALITES === 'undefined' || typeof RF_UTILS === 'undefined' ||
      typeof RF_ACTU_CARD === 'undefined') return;

  const U    = RF_UTILS;
  const CARD = RF_ACTU_CARD;

  const PAGE_SIZE   = 6;   // cartes affichées au départ, puis à chaque « Afficher plus »
  const AGENDA_SIZE = 4;   // événements mis en avant dans l'agenda

  const items    = CARD.published(RF_ACTUALITES);
  const upcoming = CARD.upcoming(RF_ACTUALITES);

  /* noms accordés au nombre, par catégorie ('' = toutes) : [singulier, pluriel] */
  const NOUNS = {
    '':        ['publication', 'publications'],
    actualite: ['actualité', 'actualités'],
    annonce:   ['annonce', 'annonces'],
    evenement: ['événement', 'événements']
  };

  /* genre grammatical, pour accorder « affichés » / « restants » */
  const FEMININE = { '': true, actualite: true, annonce: true, evenement: false };

  function noun(key, count) {
    const pair = NOUNS[key] || NOUNS[''];
    return U.pluralize(count, pair[0], pair[1]);
  }

  /** accord d'un participe : agree('evenement', 2, 'affiché') -> « affichés ». */
  function agree(key, count, word) {
    return word + (FEMININE[key] === false ? '' : 'e') + (count > 1 ? 's' : '');
  }


  /* --- Bannière ----------------------------------------------------------- */

  function setBadge(name, count, singular, plural) {
    document.querySelectorAll('[data-actu-badge="' + name + '"]').forEach(function (el) {
      el.innerHTML = '<strong>' + count + '</strong> ' + U.pluralize(count, singular, plural);
    });
  }

  setBadge('publications', items.length, 'publication', 'publications');
  setBadge('a-venir', upcoming.length, 'événement à venir', 'événements à venir');


  /* --- Prochain rendez-vous (compte à rebours) ----------------------------- */

  const nextBox = document.querySelector('[data-next-event]');

  if (nextBox) {
    const now  = Date.now();
    const next = upcoming.find(function (item) {
      return new Date(CARD.startIso(item)).getTime() > now;        // pas encore commencé
    });

    if (!next) {
      nextBox.hidden = true;
    } else {
      const title = nextBox.querySelector('[data-next="titre"]');
      const place = nextBox.querySelector('[data-next="lieu"]');
      const timer = nextBox.querySelector('.countdown-timer');

      if (title) {
        title.textContent = next.titre;
        title.href = CARD.detailUrl(next);
      }
      if (place) {
        place.textContent = next.lieu + ' · ' + CARD.longDate(next.dateEvenement) + ' à ' + CARD.formatTime(next.heure);
      }
      // lu une seule fois par script.js, chargé après ce fichier
      if (timer) timer.setAttribute('data-countdown', CARD.startIso(next));
    }
  }


  /* --- Agenda --------------------------------------------------------------- */

  const agendaGrid  = document.querySelector('.agenda-grid');
  const agendaEmpty = document.querySelector('.agenda-empty');

  if (agendaGrid) {
    const shown = upcoming.slice(0, AGENDA_SIZE);
    const fragment = document.createDocumentFragment();
    shown.forEach(function (item) { fragment.appendChild(CARD.createEventCard(item)); });
    agendaGrid.appendChild(fragment);
    agendaGrid.hidden = shown.length === 0;
    if (agendaEmpty) agendaEmpty.hidden = shown.length > 0;
  }


  /* --- Liste filtrable -------------------------------------------------------- */

  const section = document.getElementById('publications');
  const grid    = document.querySelector('.news-grid');
  if (!grid) return;

  const empty   = document.querySelector('.news-empty');
  const counter = document.querySelector('.news-count');
  const moreBox = document.querySelector('.news-more');
  const moreBtn = moreBox && moreBox.querySelector('button');
  const filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-categorie]'));

  /* cartes créées une seule fois, puis affichées / masquées (comme le catalogue) */
  const cards = items.map(function (item) {
    const card = CARD.create(item);
    grid.appendChild(card);
    return card;
  });

  filters.forEach(function (button) {
    const key   = button.dataset.filterCategorie;
    const count = key ? items.filter(function (item) { return item.categorie === key; }).length : items.length;
    const badge = button.querySelector('.news-filter-count');
    if (badge) badge.textContent = String(count);
  });

  const wanted = U.getParam('categorie');
  let current = wanted && wanted in NOUNS ? wanted : '';
  let limit   = PAGE_SIZE;

  function matching() {
    return cards.filter(function (card) { return !current || card.dataset.categorie === current; });
  }

  function syncUrl() {
    const params = new URLSearchParams(window.location.search);
    if (current) params.set('categorie', current); else params.delete('categorie');
    const query = params.toString();
    try {
      window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    } catch (e) {
      /* ouverture en file:// : certains navigateurs refusent, sans conséquence */
    }
  }

  function apply() {
    const matched = matching();
    const shown   = Math.min(limit, matched.length);

    cards.forEach(function (card) { card.hidden = true; });
    matched.forEach(function (card, index) { card.hidden = index >= limit; });

    grid.hidden = matched.length === 0;
    if (empty) empty.hidden = matched.length > 0;

    if (moreBox) moreBox.hidden = matched.length <= limit;
    if (moreBtn && matched.length > limit) {
      const label = moreBtn.querySelector('.btn-text');
      const left  = matched.length - shown;
      const next  = Math.min(PAGE_SIZE, left);
      if (label) label.textContent = 'Afficher plus (' + left + ')';
      moreBtn.setAttribute('aria-label', 'Afficher ' + next + ' ' + noun(current, next) + ' de plus, sur ' +
        left + ' ' + agree(current, left, 'restant'));
    }

    if (counter) {
      counter.innerHTML = matched.length === 0
        ? 'Aucune publication dans cette catégorie'
        : '<strong>' + matched.length + '</strong> ' + noun(current, matched.length) +
          (shown < matched.length ? ', dont ' + shown + ' ' + agree(current, shown, 'affiché') : '');
    }

    filters.forEach(function (button) {
      const on = button.dataset.filterCategorie === current;
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    syncUrl();
  }

  function setCategory(key) {
    current = key in NOUNS ? key : '';
    limit = PAGE_SIZE;
    apply();
  }

  filters.forEach(function (button) {
    button.addEventListener('click', function () { setCategory(button.dataset.filterCategorie); });
  });

  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      const before = Math.min(limit, matching().length);
      limit += PAGE_SIZE;
      apply();
      // clavier : le focus va sur la première carte ajoutée
      const first = matching()[before];
      const link  = first && first.querySelector('.blog-title a');
      if (link) link.focus();
    });
  }

  document.querySelectorAll('[data-news-reset]').forEach(function (button) {
    button.addEventListener('click', function () { setCategory(''); });
  });

  /* « Tous les événements » (agenda) : filtre la liste sans recharger la page */
  document.querySelectorAll('[data-show-events]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      setCategory('evenement');
      if (section) section.scrollIntoView();
    });
  });

  apply();

})();
