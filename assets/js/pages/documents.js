'use strict';

/**
 * assets/js/pages/documents.js
 * ============================================================================
 * Documents téléchargeables (documents.html) :
 *  - bannière : nombre de documents et de catégories ;
 *  - recherche plein texte (titre, description, établissement ; insensible aux
 *    accents et à la casse) + filtre par catégorie (boutons .news-filter) ;
 *    les deux se reflètent dans l'URL (?q=…&categorie=…) ;
 *  - documents regroupés par catégorie, ligne par document : icône du type de
 *    fichier, titre, description, type · taille · date de mise à jour, bouton ;
 *  - fichier non fourni (fichier: null) : lien « # » avec la mention
 *    « Téléchargement disponible après mise en production » ; au clic, un
 *    message s'affiche à côté du bouton au lieu de remonter en haut de page.
 *
 * À charger APRÈS documents.js, formations.js et utils.js, et AVANT
 * premium-animations.js. Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : liens vers les vrais fichiers (stockage Laravel).
 * ============================================================================
 */

(function () {

  if (typeof RF_DOCUMENTS === 'undefined' || typeof RF_CATEGORIES_DOCS === 'undefined' ||
      typeof RF_UTILS === 'undefined') return;

  const U     = RF_UTILS;
  const esc   = U.escapeHtml;
  const ETABS = typeof RF_ETABLISSEMENTS !== 'undefined' ? RF_ETABLISSEMENTS : {};
  const CATS  = RF_CATEGORIES_DOCS;
  const PENDING = 'Téléchargement disponible après mise en production';

  const TYPES = {
    pdf:  { label: 'PDF',   icon: 'document-text-outline' },
    docx: { label: 'Word',  icon: 'document-outline' },
    xlsx: { label: 'Excel', icon: 'grid-outline' }
  };

  const docs = RF_DOCUMENTS.slice();
  const catKeys = Object.keys(CATS).filter(function (key) {
    return docs.some(function (d) { return d.categorie === key; });
  });

  /** « 4200 » -> « 4,1 Mo » ; « 85 » -> « 85 Ko ». */
  function size(ko) {
    return ko >= 1024 ? (ko / 1024).toFixed(1).replace('.', ',') + ' Mo' : ko + ' Ko';
  }

  /** minuscules sans accents, pour la recherche */
  function fold(text) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }


  /* --- Bannière ------------------------------------------------------------ */

  document.querySelectorAll('[data-doc-badge="documents"]').forEach(function (el) {
    el.innerHTML = '<strong>' + docs.length + '</strong> ' + U.pluralize(docs.length, 'document', 'documents');
  });
  document.querySelectorAll('[data-doc-badge="categories"]').forEach(function (el) {
    el.innerHTML = '<strong>' + catKeys.length + '</strong> ' + U.pluralize(catKeys.length, 'catégorie', 'catégories');
  });


  /* --- Rendu par catégorie --------------------------------------------------- */

  const list    = document.querySelector('.doc-groups');
  const filters = document.querySelector('.doc-filters');
  const search  = document.querySelector('.doc-search-input');
  const counter = document.querySelector('.doc-count');
  const empty   = document.querySelector('.doc-empty');
  if (!list) return;

  if (filters) {
    filters.innerHTML =
      '<button type="button" class="news-filter" data-cat="" aria-pressed="true">Toutes<span class="news-filter-count">' + docs.length + '</span></button>' +
      catKeys.map(function (key) {
        const count = docs.filter(function (d) { return d.categorie === key; }).length;
        return '<button type="button" class="news-filter" data-cat="' + key + '" aria-pressed="false">' +
          '<ion-icon name="' + CATS[key].icone + '" aria-hidden="true"></ion-icon>' + esc(CATS[key].titre) +
          '<span class="news-filter-count">' + count + '</span></button>';
      }).join('');
  }

  function row(d) {
    const type = TYPES[d.type] || { label: d.type.toUpperCase(), icon: 'document-outline' };
    const etab = d.etablissement && ETABS[d.etablissement];
    const meta = type.label + ' · ' + size(d.taille) + ' · Mis à jour le ' + U.formatDate(d.date) +
                 (etab ? ' · ' + etab.sigle : '');
    const link = d.fichier
      ? '<a href="' + esc(d.fichier) + '" class="btn btn-primary doc-btn" download>'
      : '<a href="#" class="btn btn-primary doc-btn" title="' + PENDING + '" data-pending>';
    return (
      '<li class="doc-item" id="doc-' + esc(d.id) + '">' +
        '<span class="doc-icon doc-icon--' + esc(d.type) + '" aria-hidden="true">' +
          '<ion-icon name="' + type.icon + '"></ion-icon><span class="doc-ext">' + esc(d.type.toUpperCase()) + '</span>' +
        '</span>' +
        '<div class="doc-body">' +
          '<h3 class="doc-title">' + esc(d.titre) + '</h3>' +
          '<p class="doc-desc">' + esc(d.description) + '</p>' +
          '<p class="doc-meta">' + esc(meta) + '</p>' +
        '</div>' +
        '<div class="doc-action">' +
          link +
            '<p class="btn-text"><ion-icon name="download-outline" aria-hidden="true"></ion-icon>Télécharger' +
            '<span class="visually-hidden"> : ' + esc(d.titre) + ' (' + type.label + ', ' + size(d.taille) + ')</span></p>' +
            '<span class="square"></span>' +
          '</a>' +
          '<p class="doc-status" aria-live="polite"></p>' +
        '</div>' +
      '</li>'
    );
  }

  list.innerHTML = catKeys.map(function (key) {
    const items = docs.filter(function (d) { return d.categorie === key; });
    return (
      '<section class="doc-group" data-cat="' + key + '" aria-labelledby="doc-group-' + key + '">' +
        '<h2 class="doc-group-title" id="doc-group-' + key + '">' +
          '<ion-icon name="' + CATS[key].icone + '" aria-hidden="true"></ion-icon>' + esc(CATS[key].titre) +
        '</h2>' +
        '<ul class="doc-list">' + items.map(row).join('') + '</ul>' +
      '</section>'
    );
  }).join('');

  /* texte de recherche de chaque ligne */
  const rows = docs.map(function (d) {
    const etab = d.etablissement && ETABS[d.etablissement];
    return {
      el: document.getElementById('doc-' + d.id),
      cat: d.categorie,
      text: fold([d.titre, d.description, CATS[d.categorie].titre, etab ? etab.sigle + ' ' + etab.nom : '', (TYPES[d.type] || {}).label].join(' '))
    };
  });


  /* --- Filtres --------------------------------------------------------------- */

  const wantedCat = U.getParam('categorie');
  let current = catKeys.indexOf(wantedCat) !== -1 ? wantedCat : '';
  if (search && U.getParam('q')) search.value = U.getParam('q');

  function apply() {
    const words = fold(search ? search.value : '').split(/\s+/).filter(Boolean);
    let shown = 0;

    rows.forEach(function (r) {
      const on = (!current || r.cat === current) &&
                 words.every(function (w) { return r.text.indexOf(w) !== -1; });
      r.el.hidden = !on;
      if (on) shown++;
    });

    list.querySelectorAll('.doc-group').forEach(function (group) {
      group.hidden = !group.querySelector('.doc-item:not([hidden])');
    });

    if (filters) {
      filters.querySelectorAll('[data-cat]').forEach(function (button) {
        const on = button.dataset.cat === current;
        button.classList.toggle('is-active', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    if (empty) empty.hidden = shown > 0;
    if (counter) {
      counter.innerHTML = shown
        ? '<strong>' + shown + '</strong> ' + U.pluralize(shown, 'document', 'documents') + (shown === docs.length ? '' : ' sur ' + docs.length)
        : 'Aucun document ne correspond';
    }

    const params = new URLSearchParams(window.location.search);
    if (current) params.set('categorie', current); else params.delete('categorie');
    if (words.length) params.set('q', search.value.trim()); else params.delete('q');
    const query = params.toString();
    try {
      window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    } catch (e) { /* file:// : sans conséquence */ }
  }

  if (filters) {
    filters.addEventListener('click', function (e) {
      const button = e.target.closest('[data-cat]');
      if (!button) return;
      current = button.dataset.cat;
      apply();
    });
  }

  if (search) {
    search.addEventListener('input', apply);
    const form = search.closest('form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
  }

  document.querySelectorAll('[data-docs-reset]').forEach(function (button) {
    button.addEventListener('click', function () {
      current = '';
      if (search) search.value = '';
      apply();
      if (search) search.focus();
    });
  });

  apply();


  /* --- Fichier pas encore disponible ----------------------------------------- */

  list.addEventListener('click', function (e) {
    const link = e.target.closest('[data-pending]');
    if (!link) return;
    e.preventDefault();
    const status = link.parentNode.querySelector('.doc-status');
    if (status) status.textContent = PENDING + '. En attendant, demandez-le à l\'accueil ou via la page Contact.';
  });

})();
