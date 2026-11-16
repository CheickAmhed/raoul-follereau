'use strict';

/**
 * assets/js/pages/formateurs.js
 * ============================================================================
 * Équipe pédagogique (formateurs.html) :
 *  - bannière : nombre de formateurs et années d'expérience cumulées ;
 *  - filtre par établissement (boutons .news-filter + ?etablissement= dans l'URL) ;
 *  - grille de cartes .instructor-card (structure de l'accueil) : photo ou
 *    initiales, nom, spécialité, établissement, expérience ;
 *  - « Voir le profil » : fiche dans un <dialog> natif (focus piégé, Échap,
 *    retour du focus gérés par le navigateur) avec parcours et formations
 *    enseignées (liens vers les fiches formation) ;
 *  - lien direct vers un profil (formateurs.html#id, résultats de la recherche
 *    du site) : la fiche s'ouvre à l'arrivée.
 *
 * À charger APRÈS formateurs.js, formations.js et utils.js, et AVANT
 * premium-animations.js (cascade d'apparition et inclinaison des cartes).
 * Vanilla JS, IIFE 'use strict', aucun global.
 * ============================================================================
 */

(function () {

  if (typeof RF_FORMATEURS === 'undefined' || typeof RF_UTILS === 'undefined') return;

  const U         = RF_UTILS;
  const esc       = U.escapeHtml;
  const ETABS     = typeof RF_ETABLISSEMENTS !== 'undefined' ? RF_ETABLISSEMENTS : {};
  const FORMATIONS = typeof RF_FORMATIONS !== 'undefined' ? RF_FORMATIONS : [];

  const people = RF_FORMATEURS.slice();

  function initials(name) {
    return name.replace(/^Dr\.?\s+/i, '').split(/\s+/).map(function (part) { return part.charAt(0); })
      .join('').slice(0, 2).toUpperCase();
  }

  function portrait(person, cls) {
    return person.photo
      ? '<img src="' + esc(person.photo) + '" alt="Portrait de ' + esc(person.nom) + '" loading="lazy">'
      : '<span class="' + cls + '" aria-hidden="true">' + esc(initials(person.nom)) + '</span>';
  }

  function years(n) { return n + ' ' + U.pluralize(n, 'an', 'ans') + " d'expérience"; }


  /* --- Bannière ------------------------------------------------------------ */

  const total = people.reduce(function (sum, p) { return sum + (p.experience || 0); }, 0);
  document.querySelectorAll('[data-team-badge="formateurs"]').forEach(function (el) {
    el.innerHTML = '<strong>' + people.length + '</strong> ' + U.pluralize(people.length, 'formateur', 'formateurs');
  });
  document.querySelectorAll('[data-team-badge="experience"]').forEach(function (el) {
    el.innerHTML = '<strong>' + total + ' ans</strong> d\'expérience cumulée';
  });


  /* --- Filtres et cartes ------------------------------------------------------ */

  const grid    = document.querySelector('.trainer-grid');
  const filters = document.querySelector('.trainer-filters');
  const counter = document.querySelector('.trainer-count');
  if (!grid) return;

  const keys = Object.keys(ETABS).filter(function (key) {
    return people.some(function (p) { return p.etablissement === key; });
  });

  if (filters) {
    filters.innerHTML =
      '<button type="button" class="news-filter" data-etab="" aria-pressed="true">Tous<span class="news-filter-count">' + people.length + '</span></button>' +
      keys.map(function (key) {
        const count = people.filter(function (p) { return p.etablissement === key; }).length;
        return '<button type="button" class="news-filter" data-etab="' + key + '" aria-pressed="false">' + esc(ETABS[key].sigle) +
          '<span class="news-filter-count">' + count + '</span></button>';
      }).join('');
  }

  const cards = people.map(function (person, index) {
    const etab = ETABS[person.etablissement] || {};
    const card = document.createElement('li');
    card.className = 'instructor-card trainer-card';
    card.id = person.id;
    card.dataset.etab = person.etablissement;
    card.innerHTML =
      '<div class="instructor-img-box">' +
        portrait(person, 'trainer-initials') +
        '<span class="trainer-etab">' + esc(etab.sigle || '') + '</span>' +
      '</div>' +
      '<h3 class="instructor-name">' + esc(person.nom) + '</h3>' +
      '<p class="instructor-title">' + esc(person.specialite) + '</p>' +
      '<p class="trainer-meta">' + esc(person.fonction) + '<br>' + esc(years(person.experience)) + '</p>' +
      '<button type="button" class="trainer-more" data-index="' + index + '" aria-haspopup="dialog">' +
        'Voir le profil<span class="visually-hidden"> de ' + esc(person.nom) + '</span>' +
        '<ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon>' +
      '</button>';
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
      counter.innerHTML = '<strong>' + shown + '</strong> ' + U.pluralize(shown, 'formateur', 'formateurs') +
        (current ? ' ' + (/^[AEIOU]/.test(ETABS[current].sigle) ? "à l'" : 'au ') + esc(ETABS[current].sigle) : ' dans les trois établissements');
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


  /* --- Fiche détaillée (<dialog>) ------------------------------------------- */

  const dialog = document.querySelector('.trainer-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const body = dialog.querySelector('.trainer-dialog-body');

  function open(person) {
    const etab = ETABS[person.etablissement] || {};
    const taught = person.formations.map(function (id) {
      return FORMATIONS.find(function (f) { return f.id === id; });
    }).filter(Boolean);

    body.innerHTML =
      '<div class="trainer-dialog-head">' +
        '<div class="trainer-dialog-photo">' + portrait(person, 'trainer-initials trainer-initials--small') + '</div>' +
        '<div>' +
          '<h2 class="trainer-dialog-name" id="trainer-dialog-title">' + esc(person.nom) + '</h2>' +
          '<p class="trainer-dialog-role">' + esc(person.fonction) + '</p>' +
          '<p class="trainer-dialog-meta">' + esc(person.specialite) + ' · ' + esc(etab.sigle || '') + ' · ' + esc(years(person.experience)) + '</p>' +
        '</div>' +
      '</div>' +
      '<p class="trainer-dialog-bio">' + esc(person.bio) + '</p>' +
      (taught.length
        ? '<h3 class="trainer-dialog-subtitle">' + U.pluralize(taught.length, 'Formation enseignée', 'Formations enseignées') + '</h3>' +
          '<ul class="trainer-dialog-list">' + taught.map(function (f) {
            return '<li><a href="formation-detail.html?id=' + encodeURIComponent(f.id) + '">' +
              '<ion-icon name="school-outline" aria-hidden="true"></ion-icon>' + esc(f.titre) + '</a></li>';
          }).join('') + '</ul>'
        : '') +
      (etab.lien ? '<a class="trainer-dialog-etab" href="' + esc(etab.lien) + '">Découvrir ' + (/^[AEIOU]/.test(etab.sigle) ? "l'" : 'le ') + esc(etab.sigle) +
        '<ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon></a>' : '');

    dialog.showModal();
    document.documentElement.classList.add('lightbox-open');     // page figée (même règle que la galerie)
  }

  grid.addEventListener('click', function (e) {
    const button = e.target.closest('.trainer-more');
    if (button) open(people[Number(button.dataset.index)]);
  });

  dialog.querySelector('.trainer-dialog-close').addEventListener('click', function () { dialog.close(); });

  /* clic sur le voile (hors du cadre) : fermeture */
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  dialog.addEventListener('close', function () { document.documentElement.classList.remove('lightbox-open'); });


  /* --- Lien direct vers un profil (formateurs.html#id) ---------------------- */

  function openFromHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const index = people.findIndex(function (p) { return p.id === id; });
    if (index === -1 || dialog.open) return;
    if (cards[index].hidden) { current = ''; apply(); }          // masqué par le filtre : on l'affiche
    cards[index].scrollIntoView({ block: 'center' });
    open(people[index]);
    // à la fermeture, le focus revient sur le bouton « Voir le profil » de la carte
    dialog.addEventListener('close', function () {
      const button = cards[index].querySelector('.trainer-more');
      if (button) button.focus({ preventScroll: true });
    }, { once: true });
  }

  openFromHash();
  window.addEventListener('hashchange', openFromHash);

})();
