'use strict';

/**
 * assets/js/pages/compte.js
 * ============================================================================
 * Espace candidat (compte.html), alimenté par le compte de démonstration
 * (RF_COMPTE_DEMO) et le catalogue (RF_FORMATIONS) ; session SIMULÉE (auth-demo.js).
 *  - pas de session : redirection vers connexion.html?retour=compte.html ; rien
 *    n'est affiché avant la vérification (le HTML ne contient que des conteneurs) ;
 *  - candidature : formation, session, référence, statut, étapes du suivi et
 *    prochaine étape (calculée selon les pièces manquantes) ;
 *  - pièces du dossier (documentsRequis de la formation) : reçues / manquantes /
 *    envoyées ; dépôt simulé avec les mêmes contrôles que le wizard (PDF, JPG,
 *    PNG, 5 Mo) ; mémorisé pour la session, le fichier n'est pas envoyé ;
 *  - messages : non lus mis en avant, marqués lus à l'ouverture (mémorisé) ;
 *  - informations personnelles, aide, déconnexion.
 *
 * À charger APRÈS compte.js, formations.js, utils.js et auth-demo.js.
 * Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : vue Blade protégée par le middleware auth ; dépôt réel
 * (FormData) ; messages et statuts lus depuis la base.
 * ============================================================================
 */

(function () {

  if (typeof RF_AUTH === 'undefined' || typeof RF_UTILS === 'undefined') return;

  const session = RF_AUTH.read();
  const DEMO = typeof RF_COMPTE_DEMO !== 'undefined' ? RF_COMPTE_DEMO : null;

  /* pas de session (ou session d'un autre compte) : page de connexion */
  if (!session || !DEMO || session.email !== DEMO.identifiant) {
    RF_AUTH.logout();
    window.location.replace('connexion.html?retour=compte.html');
    return;
  }

  const U     = RF_UTILS;
  const esc   = U.escapeHtml;
  const ETABS = typeof RF_ETABLISSEMENTS !== 'undefined' ? RF_ETABLISSEMENTS : {};
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  const who   = DEMO.candidat;
  const cand  = DEMO.candidature;
  const formation = (typeof RF_FORMATIONS !== 'undefined' ? RF_FORMATIONS : [])
    .find(function (f) { return f.id === cand.formation; }) || null;
  const sessionInfo = formation ? (formation.sessions || []).find(function (s) { return s.id === cand.session; }) : null;
  const etab = formation ? ETABS[formation.etablissement] || {} : {};


  /* --- Mémoire de la session (dépôts simulés, messages lus) ---------------- */

  function memory(key, fallback) {
    try { return JSON.parse(window.sessionStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; }
  }
  function remember(key, value) {
    try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* mémoire de la page seulement */ }
  }

  const deposited = memory('rf-espace-depots', []);      // index des pièces envoyées pendant la session
  const read      = memory('rf-espace-lus', []);         // ids des messages lus


  /* --- En-tête ---------------------------------------------------------------- */

  function setText(name, value) {
    document.querySelectorAll('[data-account="' + name + '"]').forEach(function (el) { el.textContent = value; });
  }

  setText('greeting', 'Bonjour ' + who.prenom);
  setText('intro', 'Suivez votre candidature' + (formation ? ' à la formation ' + formation.titre : '') +
    ', déposez vos pièces et lisez les messages du service des admissions.');
  setText('initiales', (who.prenom.charAt(0) + who.nom.charAt(0)).toUpperCase());
  setText('reference', cand.reference);


  /* --- Pièces : état de chaque document --------------------------------------- */

  const docs = (formation ? formation.documentsRequis || [] : []).map(function (label, index) {
    let state = 'manquante';
    if (cand.piecesRecues.indexOf(index) !== -1) state = 'recue';
    else if (deposited.indexOf(index) !== -1) state = 'envoyee';
    return { index: index, label: label, state: state };
  });

  function missing() { return docs.filter(function (d) { return d.state === 'manquante'; }); }

  const STATE = {
    recue:     { icon: 'checkmark-circle', text: 'Reçue' },
    envoyee:   { icon: 'time-outline', text: 'Envoyée, en cours de vérification' },
    manquante: { icon: 'alert-circle-outline', text: 'Manquante' }
  };


  /* --- Candidature, étapes, prochaine étape ------------------------------------- */

  const summary = document.querySelector('[data-account="candidature"]');
  const steps   = document.querySelector('[data-account="etapes"]');
  const next    = document.querySelector('[data-account="prochaine-etape"]');

  function renderCandidature() {
    if (!summary) return;
    const fiche = formation ? 'formation-detail.html?id=' + encodeURIComponent(formation.id) : 'formations.html';
    summary.innerHTML =
      '<div class="account-card-head">' +
        '<div>' +
          '<p class="account-kicker">' + esc(etab.sigle || '') + ' · Candidature ' + esc(cand.reference) + '</p>' +
          '<h2 class="account-card-title"><a href="' + fiche + '">' + esc(formation ? formation.titre : 'Formation') + '</a></h2>' +
        '</div>' +
        '<span class="account-status account-status--' + (missing().length ? 'attente' : 'ok') + '">' +
          (missing().length ? 'Dossier incomplet' : 'Dossier complet') + '</span>' +
      '</div>' +
      '<ul class="account-meta">' +
        '<li><ion-icon name="calendar-outline" aria-hidden="true"></ion-icon><span>' +
          esc(sessionInfo ? sessionInfo.libelle : '') + (sessionInfo ? ' · le ' + esc(U.formatDate(sessionInfo.debut)) : '') + '</span></li>' +
        '<li><ion-icon name="document-text-outline" aria-hidden="true"></ion-icon><span>Préinscription du ' + esc(U.formatDate(cand.date)) + '</span></li>' +
        '<li><ion-icon name="folder-open-outline" aria-hidden="true"></ion-icon><span>' +
          (docs.length - missing().length) + ' ' + U.pluralize(docs.length - missing().length, 'pièce') + ' sur ' + docs.length + '</span></li>' +
      '</ul>';
  }

  function renderSteps() {
    if (!steps) return;
    const left = missing().length;
    steps.innerHTML = cand.etapes.map(function (step, i) {
      let detail = step.detail || '';
      if (step.etat === 'en-cours' && i === 1) {
        detail = left ? 'En attente de ' + left + ' ' + U.pluralize(left, 'pièce') : 'Dossier complet, vérification en cours';
      }
      const icon = step.etat === 'fait' ? 'checkmark' : step.etat === 'en-cours' ? 'ellipsis-horizontal' : '';
      const label = step.etat === 'fait' ? 'étape terminée' : step.etat === 'en-cours' ? 'étape en cours' : 'étape à venir';
      return (
        '<li class="track-step track-step--' + step.etat + '"' + (step.etat === 'en-cours' ? ' aria-current="step"' : '') + '>' +
          '<span class="track-dot" aria-hidden="true">' + (icon ? '<ion-icon name="' + icon + '"></ion-icon>' : (i + 1)) + '</span>' +
          '<div class="track-text">' +
            '<p class="track-title">' + esc(step.titre) + '<span class="visually-hidden"> (' + label + ')</span></p>' +
            (step.date ? '<p class="track-date">' + esc(U.formatDate(step.date)) + '</p>' : '') +
            (detail ? '<p class="track-detail">' + esc(detail) + '</p>' : '') +
          '</div>' +
        '</li>'
      );
    }).join('');
  }

  function renderNext() {
    if (!next) return;
    const left = missing();
    const limit = sessionInfo && sessionInfo.dateLimite ? U.formatDate(sessionInfo.dateLimite) : '';
    if (left.length) {
      next.innerHTML =
        '<ion-icon name="flag-outline" aria-hidden="true"></ion-icon>' +
        '<div>' +
          '<p class="account-next-title">Prochaine étape\u00a0: compléter votre dossier</p>' +
          '<p>Déposez ' + (left.length > 1 ? 'les ' + left.length + ' pièces manquantes' : 'la pièce manquante') +
            (limit ? ' avant le ' + esc(limit) : '') + ', depuis votre espace ou à l\'accueil.</p>' +
          '<a href="#pieces" class="account-next-link">Déposer mes pièces<ion-icon name="arrow-down-outline" aria-hidden="true"></ion-icon></a>' +
        '</div>';
    } else {
      next.innerHTML =
        '<ion-icon name="checkmark-done-outline" aria-hidden="true"></ion-icon>' +
        '<div>' +
          '<p class="account-next-title">Votre dossier est complet</p>' +
          '<p>Prochaine étape\u00a0: ' + esc(cand.etapes[2].titre.toLowerCase()) +
            (cand.etapes[2].date ? ' le ' + esc(U.formatDate(cand.etapes[2].date)) : '') +
            '. Votre convocation sera disponible ici.</p>' +
        '</div>';
    }
    next.classList.toggle('account-next--ok', !left.length);
  }


  /* --- Pièces du dossier --------------------------------------------------------- */

  const piecesList = document.querySelector('[data-account="pieces"]');
  const piecesCount = document.querySelector('[data-account="pieces-count"]');

  function renderPieces() {
    if (!piecesList) return;
    piecesList.innerHTML = docs.map(function (d) {
      const st = STATE[d.state];
      return (
        '<li class="account-piece account-piece--' + d.state + '">' +
          '<ion-icon name="' + st.icon + '" aria-hidden="true"></ion-icon>' +
          '<div class="account-piece-text">' +
            '<p class="account-piece-label">' + esc(d.label) + '</p>' +
            '<p class="account-piece-state">' + st.text + '</p>' +
            '<p class="field-error" id="piece-err-' + d.index + '" hidden></p>' +
          '</div>' +
          (d.state === 'manquante'
            ? '<label class="account-upload" for="piece-' + d.index + '">' +
                '<input type="file" id="piece-' + d.index + '" class="visually-hidden" data-piece="' + d.index + '" ' +
                  'accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" aria-describedby="piece-err-' + d.index + '">' +
                '<ion-icon name="cloud-upload-outline" aria-hidden="true"></ion-icon>Déposer' +
                '<span class="visually-hidden"> : ' + esc(d.label) + '</span>' +
              '</label>'
            : '') +
        '</li>'
      );
    }).join('');
    if (piecesCount) {
      const left = missing().length;
      piecesCount.textContent = left ? left + ' ' + U.pluralize(left, 'pièce manquante', 'pièces manquantes') : 'Dossier complet';
      piecesCount.classList.toggle('account-count--alert', left > 0);
    }
  }

  function renderAll() {
    renderCandidature();
    renderSteps();
    renderNext();
    renderPieces();
  }

  if (piecesList) {
    piecesList.addEventListener('change', function (e) {
      const input = e.target.closest('[data-piece]');
      if (!input || !input.files || !input.files[0]) return;
      const file = input.files[0];
      const index = Number(input.dataset.piece);
      const err = document.getElementById('piece-err-' + index);
      let problem = '';
      if (FILE_TYPES.indexOf(file.type) === -1) problem = 'Format non accepté\u00a0: déposez un fichier PDF, JPG ou PNG.';
      else if (file.size > MAX_FILE_BYTES) problem = 'Fichier trop lourd\u00a0: 5\u00a0Mo maximum.';
      if (problem) {
        if (err) { err.textContent = problem; err.hidden = false; }
        input.value = '';
        return;
      }
      // TODO (phase Laravel) : envoi réel du fichier (FormData) ; ici seul l'état est mémorisé
      const doc = docs.find(function (d) { return d.index === index; });
      if (doc) doc.state = 'envoyee';
      if (deposited.indexOf(index) === -1) deposited.push(index);
      remember('rf-espace-depots', deposited);
      renderAll();
      const announce = document.querySelector('[data-account="pieces-status"]');
      if (announce) announce.textContent = '« ' + (doc ? doc.label : 'Pièce') + ' » envoyée : elle sera vérifiée par le service des admissions.';
    });
  }


  /* --- Messages --------------------------------------------------------------- */

  const inbox = document.querySelector('[data-account="messages"]');
  const unreadEl = document.querySelector('[data-account="messages-count"]');

  function isRead(m) { return m.lu || read.indexOf(m.id) !== -1; }

  function renderUnread() {
    if (!unreadEl) return;
    const n = DEMO.messages.filter(function (m) { return !isRead(m); }).length;
    unreadEl.textContent = n ? n + ' ' + U.pluralize(n, 'non lu', 'non lus') : 'Tout est lu';
    unreadEl.classList.toggle('account-count--alert', n > 0);
  }

  if (inbox) {
    inbox.innerHTML = DEMO.messages.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(function (m) {
      return (
        '<details class="account-message' + (isRead(m) ? '' : ' is-unread') + '" data-message="' + esc(m.id) + '">' +
          '<summary>' +
            '<span class="account-message-head">' +
              '<span class="account-message-title">' + esc(m.titre) + '</span>' +
              '<span class="account-message-date">' + esc(U.formatDate(m.date)) + '</span>' +
            '</span>' +
            (isRead(m) ? '' : '<span class="account-message-new">Nouveau</span>') +
            '<ion-icon name="chevron-down-outline" aria-hidden="true"></ion-icon>' +
          '</summary>' +
          '<div class="account-message-body">' +
            '<p>' + esc(m.texte) + '</p>' +
            (m.lien ? '<a href="' + esc(m.lien.href) + '">' + esc(m.lien.texte) + '<ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon></a>' : '') +
          '</div>' +
        '</details>'
      );
    }).join('');

    /* ouverture d'un message : marqué lu (« toggle » ne remonte pas : écoute en capture) */
    inbox.addEventListener('toggle', function (e) {
      const item = e.target;
      if (!item.open || !item.dataset || !item.dataset.message) return;
      const id = item.dataset.message;
      if (read.indexOf(id) === -1) {
        read.push(id);
        remember('rf-espace-lus', read);
      }
      item.classList.remove('is-unread');
      const badge = item.querySelector('.account-message-new');
      if (badge) badge.remove();
      renderUnread();
    }, true);
  }


  /* --- Informations personnelles ------------------------------------------------ */

  setText('nom', who.prenom + ' ' + who.nom);
  setText('naissance', U.formatDate(who.naissance));
  setText('email', who.email);
  setText('telephone', who.telephone);
  setText('adresse', who.adresse);
  /* liens vers le formulaire de contact : objet « suivi d'une préinscription » et numéro pré-remplis */
  document.querySelectorAll('[data-account-link="contact"]').forEach(function (a) {
    a.href = 'contact.html?objet=candidature&reference=' + encodeURIComponent(cand.reference);
  });


  /* --- Déconnexion ------------------------------------------------------------- */

  document.querySelectorAll('[data-logout]').forEach(function (button) {
    button.addEventListener('click', function () {
      RF_AUTH.logout();
      try {
        window.sessionStorage.removeItem('rf-espace-depots');
        window.sessionStorage.removeItem('rf-espace-lus');
      } catch (e) { /* rien à effacer */ }
      window.location.href = 'connexion.html?deconnecte=1';
    });
  });


  /* --- Affichage --------------------------------------------------------------- */

  renderAll();
  renderUnread();
  document.querySelectorAll('[data-account-ready]').forEach(function (el) { el.hidden = false; });

})();
