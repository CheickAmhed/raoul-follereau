'use strict';

/**
 * header-nav.js
 * ============================================================================
 * Logique de la refonte header / navigation (voir la section #HEADER (REFONTE)
 * de style.css et media_queries.css).
 *
 * Chargé après components.js (à venir) et AVANT script.js.
 * Reprend le rôle de l'ancien toggle .navbar-nav de script.js (retiré là-bas) :
 *  - .nav-toggle-btn ouvre désormais le MENU SECONDAIRE (.navbar-nav repurposé),
 *    avec effet sandwich -> X (transitions CSS, cf. animation.css) ;
 *  - dropdown sur desktop/tablette, drawer + voile sur mobile ;
 *  - bouton recherche : ouverture animée d'un panneau (UI seule, pas de moteur) ;
 *  - état actif de la nav principale (header + bottom bar) via aria-current ;
 *  - pastille « connecté » sur l'accès au compte quand une session (simulée)
 *    de l'espace candidat est ouverte.
 *
 * Vanilla JS, IIFE 'use strict', aucune dépendance, aucune variable globale.
 * ============================================================================
 */

(function () {

  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const toggleBtn    = navbar.querySelector('.nav-toggle-btn');
  const secondary    = navbar.querySelector('.navbar-nav');            // rôle repurposé : menu secondaire
  const secondaryX   = secondary && secondary.querySelector('.secondary-menu-close');
  const overlay      = document.querySelector('.secondary-menu-overlay');
  const searchBtn    = navbar.querySelector('.nav-search-toggle');
  const searchPanel  = navbar.querySelector('.site-search');
  const searchInput  = searchPanel && searchPanel.querySelector('.site-search-input');
  const searchForm   = searchPanel && searchPanel.querySelector('form');
  const primaryNav   = navbar.querySelector('.primary-nav');

  // Progressive enhancement : sans JS, l'attribut [hidden] garde les panneaux repliés.
  // Avec JS, on le retire et l'état est piloté par les classes .is-open.
  [secondary, overlay, searchPanel].forEach(function (el) { if (el) el.hidden = false; });


  /* --- Menu secondaire (nav-toggle-btn) --------------------------------- */

  function openSecondary() {
    if (!secondary) return;
    secondary.classList.add('is-open');
    navbar.classList.add('secondary-open');       // masque la bottom bar mobile pendant l'ouverture
    if (overlay) overlay.classList.add('is-open');
    if (toggleBtn) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
    document.addEventListener('keydown', onKeydown);
  }

  function closeSecondary() {
    if (!secondary || !secondary.classList.contains('is-open')) return;
    secondary.classList.remove('is-open');
    navbar.classList.remove('secondary-open');
    if (overlay) overlay.classList.remove('is-open');
    if (toggleBtn) {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (toggleBtn && secondary) {
    toggleBtn.addEventListener('click', function () {
      if (secondary.classList.contains('is-open')) {
        closeSecondary();
      } else {
        closeSearch();
        openSecondary();
      }
    });
    if (overlay) overlay.addEventListener('click', closeSecondary);
    secondary.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeSecondary();
    });
    if (secondaryX) {
      secondaryX.addEventListener('click', function () {
        closeSecondary();
        toggleBtn.focus();
      });
    }
  }


  /* --- Recherche ------------------------------------------------------- */

  function openSearch() {
    if (!searchPanel) return;
    searchPanel.classList.add('is-open');
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'true');
    if (searchInput) searchInput.focus();
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onDocClickSearch);
  }

  function closeSearch() {
    if (!searchPanel || !searchPanel.classList.contains('is-open')) return;
    searchPanel.classList.remove('is-open');
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClickSearch);
  }

  function onDocClickSearch(e) {
    if (!searchPanel.contains(e.target) && !(searchBtn && searchBtn.contains(e.target))) {
      closeSearch();
    }
  }

  if (searchBtn && searchPanel) {
    searchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (searchPanel.classList.contains('is-open')) {
        closeSearch();
      } else {
        closeSecondary();
        openSearch();
      }
    });
  }

  if (searchForm) {
    // TODO: brancher la recherche réelle (assets/data/*.js ou API Laravel plus tard)
    searchForm.addEventListener('submit', function (e) { e.preventDefault(); });
  }


  /* --- Touche Échap : ferme tout et rend le focus au toggle ---------- */

  function onKeydown(e) {
    if (e.key !== 'Escape') return;
    const wasOpen = (secondary && secondary.classList.contains('is-open')) ||
                    (searchPanel && searchPanel.classList.contains('is-open'));
    closeSecondary();
    closeSearch();
    if (wasOpen && toggleBtn) toggleBtn.focus();
    document.removeEventListener('keydown', onKeydown);
  }


  /* --- État actif de la navigation principale ------------------------ */

  if (primaryNav) {
    // page courante : data-page sur <body> pour les pages rattachées à une entrée du
    // menu (ex. fiche formation -> formations.html), sinon le nom du fichier
    const here = (document.body.dataset.page || location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const links = primaryNav.querySelectorAll('a[href]');

    links.forEach(function (a) {
      const item = a.closest('.primary-nav-item');
      const target = (a.getAttribute('href').split('/').pop().split('#')[0] || 'index.html').toLowerCase();
      const active = (target === here);

      if (item) item.classList.toggle('is-active', active);
      if (active) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }


  /* --- Espace candidat : pastille « connecté » ------------------------ */
  // Lit le témoin de session SIMULÉ posé par auth-demo.js (même clé ; ce fichier n'est
  // chargé que sur connexion.html et compte.html, d'où la lecture directe ici).
  // TODO (phase Laravel) : état fourni par la vue Blade (@auth), lecture à supprimer.

  (function markAccount() {
    let connected = false;
    ['sessionStorage', 'localStorage'].forEach(function (name) {
      try {
        const data = JSON.parse(window[name].getItem('rf-espace-candidat') || 'null');
        if (data && data.email && data.expires > Date.now()) connected = true;
      } catch (e) { /* stockage indisponible : on reste « déconnecté » */ }
    });
    if (!connected) return;

    const account = navbar.querySelector('.nav-account');
    if (account) {
      account.classList.add('is-connected');
      account.setAttribute('aria-label', 'Mon espace candidat (connecté)');
    }
    // bottom bar : le libellé « Compte » reste visible, l'état est ajouté pour les lecteurs d'écran
    navbar.querySelectorAll('.primary-nav a[href="compte.html"]').forEach(function (a) {
      a.classList.add('is-connected');
      const label = a.querySelector('.primary-nav-label');
      if (label && !label.querySelector('.visually-hidden')) {
        label.insertAdjacentHTML('beforeend', '<span class="visually-hidden"> (connecté)</span>');
      }
    });
  })();

})();
