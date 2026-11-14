'use strict';

/**
 * assets/js/pages/formation-detail.js
 * ============================================================================
 * Fiche détaillée d'une formation (formation-detail.html) : page-gabarit unique
 * alimentée par ?id= (URLSearchParams) depuis RF_FORMATIONS.
 *
 *  - remplit les cibles [data-field] (textes, liens, image) et [data-list]
 *    (objectifs, programme, débouchés, admission, pièces, sessions) ;
 *  - CTA « Je me préinscris » -> preinscription.html?formation={id}
 *    (&session={id} depuis une session précise) ; quand aucune session n'est
 *    ouverte, le CTA renvoie vers le formulaire de contact ;
 *  - id absent ou inconnu : message clair + retour au catalogue, jamais de page
 *    blanche ;
 *  - « Autres formations » : même établissement, complété par le même domaine.
 *
 * À charger AVANT premium-animations.js et hero-intro.js : les cartes similaires
 * et le contenu de la bannière existent quand les animations s'attachent.
 * Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : la fiche deviendra une route rendue côté serveur
 * (/formations/{slug}) ; ce script sera alors remplacé par la vue Blade.
 * ============================================================================
 */

(function () {

  const page = document.querySelector('.detail');
  if (!page || typeof RF_FORMATIONS === 'undefined' || typeof RF_UTILS === 'undefined' ||
      typeof RF_FORMATION_CARD === 'undefined') return;

  const U    = RF_UTILS;
  const CARD = RF_FORMATION_CARD;

  const layout   = page.querySelector('.detail-layout');
  const notFound = page.querySelector('.detail-notfound');
  const related  = document.querySelector('.detail-related');
  const banner   = document.querySelector('.page-banner');

  const id = U.getParam('id');
  const formation = RF_FORMATIONS.find(function (f) { return f.id === id; }) || null;


  /* --- Helpers de remplissage ------------------------------------------- */

  function fields(name) { return document.querySelectorAll('[data-field="' + name + '"]'); }

  function setText(name, value) { fields(name).forEach(function (el) { el.textContent = value; }); }

  function setHtml(name, html) { fields(name).forEach(function (el) { el.innerHTML = html; }); }

  function setAttr(name, attr, value) { fields(name).forEach(function (el) { el.setAttribute(attr, value); }); }

  function setList(name, items, render) {
    const list = page.querySelector('[data-list="' + name + '"]');
    if (list) list.innerHTML = (items || []).map(render).join('');
  }

  function iconItem(icon, text) {
    return '<li><ion-icon name="' + icon + '" aria-hidden="true"></ion-icon><p>' + U.escapeHtml(text) + '</p></li>';
  }

  function plural(n, word) { return n + ' ' + U.pluralize(n, word); }


  /* --- id absent ou inconnu --------------------------------------------- */

  if (!formation) {
    if (layout)   layout.hidden = true;
    if (related)  related.hidden = true;
    if (notFound) notFound.hidden = false;
    page.classList.add('detail--last');

    const visual = banner && banner.querySelector('.page-banner-visual');
    if (visual) visual.hidden = true;

    setText('surtitre', 'Catalogue');
    setText('titre', 'Formation introuvable');
    setText('resume', "Le lien suivi ne correspond à aucune formation du catalogue. Retrouvez l'ensemble des parcours proposés depuis la page Formations.");
    document.title = 'Formation introuvable — Les Établissements Raoul Follereau';
    return;
  }


  /* --- Données dérivées --------------------------------------------------- */

  const etab      = RF_ETABLISSEMENTS[formation.etablissement] || {};
  const dispo     = CARD.disponibilite(formation);
  const next      = CARD.prochaineSession(formation);
  const applyHref = CARD.applyUrl(formation);
  const askHref   = 'contact.html?objet=formation&formation=' + encodeURIComponent(formation.id);


  /* --- <head> ------------------------------------------------------------- */

  document.title = formation.titre + ' — ' + (etab.sigle || '') + ' — Les Établissements Raoul Follereau';
  const meta = document.querySelector('meta[name="description"]');
  if (meta && formation.resume) meta.setAttribute('content', formation.resume);


  /* --- Bannière ----------------------------------------------------------- */

  setText('titre', formation.titre);
  setText('surtitre', (etab.sigle || '') + ' · ' + (RF_DOMAINES[formation.domaine] || ''));
  setText('resume', formation.resume || '');

  fields('image').forEach(function (img) {
    img.src = formation.image;
    img.alt = formation.imageAlt || '';
  });

  setHtml('badge-duree',  '<strong>' + U.escapeHtml(formation.duree) + '</strong>');
  setHtml('badge-niveau', '<strong>' + U.escapeHtml(RF_NIVEAUX[formation.niveau] || '') + '</strong>');

  if (dispo === 'ouvert' && next) {
    setHtml('badge-places', '<strong>' + next.placesRestantes + '</strong> ' + U.pluralize(next.placesRestantes, 'place restante', 'places restantes'));
  } else if (dispo === 'complet') {
    setHtml('badge-places', '<strong>Complet</strong>');
  } else {
    setHtml('badge-places', 'Inscriptions <strong>bientôt</strong>');
  }


  /* --- Colonne « informations clés » ------------------------------------- */

  setText('etablissement-sigle', etab.sigle || '');
  setText('etablissement-nom', etab.nom || '');
  setAttr('etablissement-link', 'href', etab.lien || 'institution.html');
  fields('etablissement-logo').forEach(function (img) {
    img.src = etab.logo || '';
    img.alt = '';
  });

  setText('duree',   formation.duree);
  setText('niveau',  RF_NIVEAUX[formation.niveau] || '');
  setText('diplome', formation.diplome);
  setText('rythme',  formation.rythme || '');
  setText('prochaine-session', next
    ? next.libelle + ' · début le ' + U.formatDate(next.debut)
    : 'Aucune session programmée pour le moment');

  setText('prix', U.formatPrice(formation.prix));
  setText('prix-periode', formation.prixPeriode ? 'par ' + formation.prixPeriode : 'pour la formation complète');

  /* CTA principal (colonne + bandeau final) selon la disponibilité */
  const CTA = {
    ouvert:    { text: 'Je me préinscris',                       href: applyHref },
    'a-venir': { text: "Être informé(e) de l'ouverture",         href: askHref },
    complet:   { text: 'Me signaler pour la prochaine session',  href: askHref }
  }[dispo];

  fields('cta').forEach(function (link) {
    link.href = CTA.href;
    const label = link.querySelector('.btn-text');
    if (label) label.textContent = CTA.text;
  });

  setText('cta-status', dispo === 'ouvert' ? '' : CARD.LABELS[dispo]);
  setAttr('ask-link', 'href', askHref);


  /* --- Contenu ------------------------------------------------------------ */

  setText('sousTitre', formation.sousTitre || '');
  setText('description', formation.description || '');

  setList('objectifs', formation.objectifs, function (t) { return iconItem('checkmark-circle', t); });

  setList('modules', formation.modules, function (t, i) {
    return '<li><span class="module-index">' + (i + 1) + '</span>' +
           '<span class="module-name">' + U.escapeHtml(t) + '</span></li>';
  });

  setList('debouches', formation.debouches, function (t) {
    return '<li><ion-icon name="briefcase-outline" aria-hidden="true"></ion-icon><span>' + U.escapeHtml(t) + '</span></li>';
  });

  setList('conditionsAdmission', formation.conditionsAdmission, function (t) { return iconItem('school-outline', t); });

  setList('documentsRequis', formation.documentsRequis, function (t) { return iconItem('document-text-outline', t); });

  function sessionMarkup(s) {
    const statut = s.statut || 'a-venir';
    let places;
    if (statut === 'ouvert') {
      places = '<strong>' + s.placesRestantes + ' ' + U.pluralize(s.placesRestantes, 'place restante', 'places restantes') + '</strong> sur ' + s.places;
    } else if (statut === 'complet') {
      places = 'Session complète (' + plural(s.places, 'place') + ')';
    } else {
      places = plural(s.places, 'place') +
        (s.ouvertureInscriptions ? ' · ouverture des inscriptions le <strong>' + U.formatDate(s.ouvertureInscriptions) + '</strong>' : '');
    }

    const action = statut === 'ouvert'
      ? '<a href="' + CARD.applyUrl(formation, s.id) + '" class="btn btn-primary session-btn">' +
          '<p class="btn-text">Me préinscrire</p><span class="square"></span></a>'
      : '';

    return (
      '<li class="session-card session-card--' + statut + '">' +
        '<div class="session-main">' +
          '<div class="session-head">' +
            '<h3 class="session-title">' + U.escapeHtml(s.libelle) + '</h3>' +
            '<span class="session-status">' + CARD.LABELS[statut] + '</span>' +
          '</div>' +
          '<ul class="session-meta">' +
            '<li><ion-icon name="calendar-outline" aria-hidden="true"></ion-icon><span>Début : <strong>' + U.formatDate(s.debut) + '</strong></span></li>' +
            '<li><ion-icon name="alarm-outline" aria-hidden="true"></ion-icon><span>Clôture des candidatures : <strong>' + U.formatDate(s.dateLimite) + '</strong></span></li>' +
            '<li><ion-icon name="people-outline" aria-hidden="true"></ion-icon><span>' + places + '</span></li>' +
          '</ul>' +
        '</div>' +
        action +
      '</li>'
    );
  }

  if (formation.sessions && formation.sessions.length) {
    setList('sessions', formation.sessions, sessionMarkup);
  } else {
    setList('sessions', ['x'], function () {
      return '<li class="session-card session-card--a-venir"><div class="session-main"><p class="section-text">Aucune session programmée pour le moment. Contactez-nous pour connaître les prochaines dates.</p></div></li>';
    });
  }


  /* --- Autres formations --------------------------------------------------- */

  if (related) {
    const grid = related.querySelector('.course-grid');

    let others = RF_FORMATIONS.filter(function (f) {
      return f.id !== formation.id && f.etablissement === formation.etablissement;
    });
    if (others.length < 3) {
      others = others.concat(RF_FORMATIONS.filter(function (f) {
        return f.id !== formation.id && f.etablissement !== formation.etablissement && f.domaine === formation.domaine;
      }));
    }
    others = others.slice(0, 3);

    if (!grid || !others.length) {
      related.hidden = true;
      page.classList.add('detail--last');
    } else {
      const mixed = others.some(function (f) { return f.etablissement !== formation.etablissement; });
      const sigle = etab.sigle || '';
      const article = /^[AEIOUY]/i.test(sigle) ? "de l'" : 'du ';

      setText('related-title', mixed ? 'Formations similaires' : 'Autres formations ' + article + sigle);
      setAttr('related-link', 'href', mixed
        ? 'formations.html?domaine=' + encodeURIComponent(formation.domaine)
        : 'formations.html?etablissement=' + encodeURIComponent(formation.etablissement));

      const fragment = document.createDocumentFragment();
      others.forEach(function (f) { fragment.appendChild(CARD.create(f)); });
      grid.appendChild(fragment);
    }
  }

})();
