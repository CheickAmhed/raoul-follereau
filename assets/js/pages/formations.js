'use strict';

/**
 * assets/js/pages/formations.js
 * ============================================================================
 * Catalogue filtrable des formations (formations.html).
 *
 *  - lit RF_FORMATIONS & co (assets/data/formations.js), RF_UTILS (utils.js) et
 *    RF_FORMATION_CARD (formation-card.js : carte + règles de disponibilité) ;
 *  - remplit les <select> de filtres à partir des référentiels : ajouter une
 *    formation dans le fichier de données suffit, les filtres suivent ;
 *  - génère les cartes UNE SEULE FOIS avec les classes existantes (.course-card)
 *    puis filtre en masquant/affichant ([hidden]) : les comportements posés par
 *    premium-animations.js (tilt 3D, reveal en cascade) restent attachés ;
 *  - filtrage 100 % côté client, pré-sélection depuis l'URL
 *    (?etablissement=eps&domaine=sante…) et URL tenue à jour (replaceState)
 *    pour pouvoir partager un filtre ;
 *  - état « aucun résultat » + compteur annoncé aux lecteurs d'écran (aria-live) ;
 *  - chiffres des badges de la bannière (.page-banner) recalculés depuis les données.
 *
 * Doit être chargé AVANT premium-animations.js (qui observe les enfants de
 * .course-grid au chargement). Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : remplacer RF_FORMATIONS par la réponse de l'API.
 * ============================================================================
 */

(function () {

  const section = document.querySelector('.catalog');
  if (!section || typeof RF_FORMATIONS === 'undefined' || typeof RF_UTILS === 'undefined' ||
      typeof RF_FORMATION_CARD === 'undefined') return;

  const grid    = section.querySelector('.course-grid');
  const form    = section.querySelector('.filters');
  const counter = section.querySelector('.catalog-count');
  const empty   = section.querySelector('.catalog-empty');
  if (!grid || !form) return;

  const U    = RF_UTILS;
  const CARD = RF_FORMATION_CARD;


  /* --- Référentiels propres aux filtres --------------------------------- */

  const DUREES = [
    { id: 'courte',  label: 'Courte (1 an ou moins)', match: function (mois) { return mois <= 12; } },
    { id: 'moyenne', label: 'Moyenne (2 ans)',          match: function (mois) { return mois > 12 && mois <= 24; } },
    { id: 'longue',  label: 'Longue (3 ans et plus)',   match: function (mois) { return mois > 24; } }
  ];

  const DISPONIBILITES = Object.keys(CARD.LABELS).map(function (key) {
    return { id: key, label: CARD.LABELS[key] };
  });

  function dureeId(formation) {
    const found = DUREES.find(function (d) { return d.match(formation.dureeMois); });
    return found ? found.id : '';
  }


  /* --- Badges chiffrés de la bannière (.page-banner) --------------------- */

  const bannerCounts = {
    formations: RF_FORMATIONS.length,
    ouvertes:   RF_FORMATIONS.filter(function (f) { return CARD.disponibilite(f) === 'ouvert'; }).length
  };

  document.querySelectorAll('[data-banner-count]').forEach(function (el) {
    const value = bannerCounts[el.dataset.bannerCount];
    if (value !== undefined) el.textContent = value;
  });


  /* --- Remplissage des <select> ----------------------------------------- */

  const selects = {
    etablissement: form.elements.namedItem('etablissement'),
    domaine:       form.elements.namedItem('domaine'),
    niveau:        form.elements.namedItem('niveau'),
    duree:         form.elements.namedItem('duree'),
    disponibilite: form.elements.namedItem('disponibilite')
  };
  const KEYS = Object.keys(selects);

  function fillSelect(select, items) {
    if (!select) return;
    items.forEach(function (item) {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  function fromMap(map, labelOf) {
    return Object.keys(map).map(function (key) { return { id: key, label: labelOf(map[key]) }; });
  }

  fillSelect(selects.etablissement, fromMap(RF_ETABLISSEMENTS, function (e) { return e.sigle; }));
  fillSelect(selects.domaine,       fromMap(RF_DOMAINES,       function (label) { return label; }));
  fillSelect(selects.niveau,        fromMap(RF_NIVEAUX,        function (label) { return label; }));
  fillSelect(selects.duree,         DUREES);
  fillSelect(selects.disponibilite, DISPONIBILITES);


  /* --- Cartes (composant partagé) + attributs de filtrage ---------------- */

  const cards = RF_FORMATIONS.map(function (f) {
    const card = CARD.create(f);
    card.dataset.etablissement = f.etablissement;
    card.dataset.domaine       = f.domaine;
    card.dataset.niveau        = f.niveau;
    card.dataset.duree         = dureeId(f);
    card.dataset.disponibilite = CARD.disponibilite(f);
    return card;
  });

  const fragment = document.createDocumentFragment();
  cards.forEach(function (card) { fragment.appendChild(card); });
  grid.appendChild(fragment);


  /* --- Filtrage ----------------------------------------------------------- */

  function currentValues() {
    const values = {};
    KEYS.forEach(function (key) { values[key] = selects[key] ? selects[key].value : ''; });
    return values;
  }

  function syncUrl(values) {
    const params = new URLSearchParams();
    KEYS.forEach(function (key) { if (values[key]) params.set(key, values[key]); });
    const query = params.toString();
    try {
      window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    } catch (e) {
      /* ouverture en file:// : certains navigateurs refusent, sans conséquence */
    }
  }

  function applyFilters() {
    const values = currentValues();
    let visible = 0;

    cards.forEach(function (card) {
      const show = KEYS.every(function (key) {
        return !values[key] || card.dataset[key] === values[key];
      });
      card.hidden = !show;
      if (show) visible++;
    });

    grid.hidden = visible === 0;
    if (empty) empty.hidden = visible > 0;

    if (counter) {
      counter.innerHTML = visible === 0
        ? 'Aucune formation ne correspond à ces critères'
        : '<strong>' + visible + '</strong> ' + U.pluralize(visible, 'formation') + ' sur ' + cards.length;
    }

    syncUrl(values);
  }

  /* pré-sélection depuis l'URL (valeurs inconnues ignorées) */
  KEYS.forEach(function (key) {
    const wanted = U.getParam(key);
    const select = selects[key];
    if (!wanted || !select) return;
    const known = Array.prototype.some.call(select.options, function (o) { return o.value === wanted; });
    if (known) select.value = wanted;
  });

  form.addEventListener('change', applyFilters);
  form.addEventListener('submit', function (e) { e.preventDefault(); applyFilters(); });
  form.addEventListener('reset', function () { window.setTimeout(applyFilters, 0); });

  section.querySelectorAll('[data-filters-reset]').forEach(function (button) {
    button.addEventListener('click', function () { form.reset(); });
  });

  applyFilters();

})();
