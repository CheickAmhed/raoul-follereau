'use strict';

/**
 * assets/js/formation-card.js
 * ============================================================================
 * Composant partagé « carte formation » (.course-card — structure identique aux
 * cartes de index.html) et règles de disponibilité d'une formation.
 *
 * Utilisé par :
 *  - pages/formations.js        (catalogue filtrable) ;
 *  - pages/formation-detail.js  (badges, sessions, « formations similaires ») ;
 *  - pages/preinscription.js    (à venir : applyUrl / prochaineSession).
 *
 * Dépend de assets/data/formations.js (RF_ETABLISSEMENTS, RF_NIVEAUX) et de
 * utils.js (RF_UTILS) : à charger après eux. Un seul global : RF_FORMATION_CARD.
 * ============================================================================
 */

const RF_FORMATION_CARD = (function () {

  const U = RF_UTILS;

  /* libellés des 3 états de disponibilité (filtres du catalogue, statut des sessions) */
  const LABELS = {
    ouvert:    'Inscriptions ouvertes',
    'a-venir': 'Ouverture prochaine',
    complet:   'Complet'
  };

  /* badge court qui remplace « Postuler » sur la carte quand on ne peut pas candidater */
  const BADGES = { 'a-venir': 'Bientôt', complet: 'Complet' };

  /** ouvert dès qu'une session l'est ; complet si une session l'est sans autre
   *  session ouverte ; sinon ouverture prochaine. */
  function disponibilite(formation) {
    const statuts = (formation.sessions || []).map(function (s) { return s.statut; });
    if (statuts.indexOf('ouvert') !== -1) return 'ouvert';
    if (statuts.indexOf('complet') !== -1) return 'complet';
    return 'a-venir';
  }

  /** Session mise en avant : la première ouverte, sinon la première à venir,
   *  sinon la dernière connue (null si aucune). */
  function prochaineSession(formation) {
    const sessions = formation.sessions || [];
    return sessions.find(function (s) { return s.statut === 'ouvert'; }) ||
           sessions.find(function (s) { return s.statut === 'a-venir'; }) ||
           sessions[sessions.length - 1] || null;
  }

  function detailUrl(formation) {
    return 'formation-detail.html?id=' + encodeURIComponent(formation.id);
  }

  function applyUrl(formation, sessionId) {
    return 'preinscription.html?formation=' + encodeURIComponent(formation.id) +
      (sessionId ? '&session=' + encodeURIComponent(sessionId) : '');
  }

  /* --- carte (même structure que les .course-card de index.html) --------- */

  function markup(f) {
    const etab  = RF_ETABLISSEMENTS[f.etablissement] || {};
    const dispo = disponibilite(f);

    const applyBadge = dispo === 'ouvert'
      ? '<a href="' + applyUrl(f) + '" class="badge-tag blue">Postuler</a>'
      : '<span class="badge-tag gray">' + BADGES[dispo] + '</span>';

    const period = f.prixPeriode
      ? '<span class="course-price-period">/ ' + U.escapeHtml(f.prixPeriode) + '</span>'
      : '';

    return (
      '<div class="course-banner">' +
        '<img src="' + U.escapeHtml(f.image) + '" alt="' + U.escapeHtml(f.imageAlt) + '" loading="lazy">' +
        '<div class="course-tag-box">' +
          '<a href="' + detailUrl(f) + '" class="badge-tag orange">Détails</a>' +
          applyBadge +
        '</div>' +
      '</div>' +

      '<div class="course-content">' +
        '<h3 class="card-title"><a href="' + detailUrl(f) + '">' + U.escapeHtml(f.titre) + '</a></h3>' +
        '<ul class="course-meta">' +
          '<li><ion-icon name="business-outline"></ion-icon><span class="estab">' + U.escapeHtml(etab.sigle || '') + '</span></li>' +
          '<li><ion-icon name="time-outline"></ion-icon><span>' + U.escapeHtml(f.duree) + '</span></li>' +
          '<li><ion-icon name="ribbon-outline"></ion-icon><span>' + U.escapeHtml(RF_NIVEAUX[f.niveau] || '') + '</span></li>' +
        '</ul>' +
        '<div class="wrapper border-bottom"></div>' +
        '<div class="wrapper">' +
          '<div class="course-price">' + U.formatPrice(f.prix) + period + '</div>' +
          '<div class="enrolled">' +
            '<div class="icon-user"><img src="./assets/images/student-icon.png" alt=""></div>' +
            '<p>' + U.formatNumber(f.apprenants) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /** <article class="course-card"> prêt à insérer dans une .course-grid. */
  function create(f) {
    const card = document.createElement('article');
    card.className = 'course-card';
    card.innerHTML = markup(f);
    return card;
  }

  return { LABELS, BADGES, disponibilite, prochaineSession, detailUrl, applyUrl, markup, create };

})();
