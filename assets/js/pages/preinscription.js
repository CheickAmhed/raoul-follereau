'use strict';

/**
 * assets/js/pages/preinscription.js
 * ============================================================================
 * Wizard de préinscription en 5 étapes (preinscription.html), 100 % côté client.
 *
 *  1. Établissement / formation / session : selects en cascade alimentés par
 *     RF_FORMATIONS, pré-sélection via ?formation={id}&session={id} ;
 *  2. Informations personnelles ;  3. Parcours scolaire / professionnel ;
 *  4. Pièces justificatives (champs générés d'après documentsRequis de la
 *     formation choisie ; seuls les noms de fichiers sont gardés en mémoire) ;
 *  5. Récapitulatif (bouton « Modifier » par section) + acceptation ;
 *  puis écran de confirmation avec un numéro de candidature simulé RF-AAAA-XXXXX.
 *
 *  - validation HTML5 native (required, type, pattern, min/max, minlength) +
 *    contrôle JS avant chaque passage à l'étape suivante : messages inline sous
 *    les champs, jamais d'alert() ; le premier champ invalide reçoit le focus ;
 *  - formState (objet `state`) conserve toutes les saisies validées : revenir en
 *    arrière ou avancer ne perd rien, le DOM garde aussi les valeurs ;
 *  - barre de progression : étapes déjà atteintes cliquables, étape courante
 *    annoncée aux lecteurs d'écran (aria-live) ;
 *  - aucun envoi réseau. TODO (phase Laravel) : POST /preinscriptions avec
 *    `state` + les fichiers dans un FormData ; la référence viendra du serveur.
 *
 * Vanilla JS, IIFE 'use strict', aucun global. À charger après formations.js
 * (données), utils.js et formation-card.js.
 * ============================================================================
 */

(function () {

  const root = document.querySelector('.wizard');
  if (!root || typeof RF_FORMATIONS === 'undefined' || typeof RF_UTILS === 'undefined' ||
      typeof RF_FORMATION_CARD === 'undefined') return;

  const U    = RF_UTILS;
  const CARD = RF_FORMATION_CARD;

  const form      = root.querySelector('.wizard-form');
  const panels    = Array.prototype.slice.call(form.querySelectorAll('.wizard-step'));
  const TOTAL     = panels.length;
  const stepItems = root.querySelectorAll('[data-step-item]');
  const progress  = root.querySelector('.wizard-progress');
  const barFill   = root.querySelector('.wizard-bar-fill');
  const status    = root.querySelector('.wizard-status');
  const context   = root.querySelector('.wizard-context');
  const selection = root.querySelector('.wizard-selection');
  const prevBtn   = form.querySelector('.wizard-prev');
  const nextBtn   = form.querySelector('.wizard-next');
  const stepError = form.querySelector('.wizard-error');
  const done      = root.querySelector('.wizard-done');
  if (!form || !panels.length || !prevBtn || !nextBtn) return;

  const STEP_NAMES     = ['Formation', 'Identité', 'Parcours', 'Pièces', 'Récapitulatif'];
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const FILE_TYPES     = ['application/pdf', 'image/jpeg', 'image/png'];

  /* formState : saisies validées, étape par étape (+ noms des pièces) */
  const state = { pieces: {} };
  let current = 1;
  let maxReached = 1;        // étape la plus avancée atteinte (les précédentes sont cliquables)
  let piecesBuiltFor = null; // id de la formation pour laquelle les champs fichiers ont été générés

  function findFormation(id) {
    return RF_FORMATIONS.find(function (f) { return f.id === id; }) || null;
  }

  function findSession(f, id) {
    return f ? (f.sessions || []).find(function (s) { return s.id === id; }) || null : null;
  }


  /* --- Étape 1 : selects en cascade ------------------------------------- */

  const selEtab = form.elements.namedItem('etablissement');
  const selForm = form.elements.namedItem('formation');
  const selSess = form.elements.namedItem('session');
  const sessHint = form.querySelector('[data-session-hint]');
  const sessHintLink = sessHint && sessHint.querySelector('a');

  function option(value, label, disabled) {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    if (disabled) o.disabled = true;
    return o;
  }

  function resetSelect(select, placeholder) {
    select.innerHTML = '';
    select.appendChild(option('', placeholder));
  }

  Object.keys(RF_ETABLISSEMENTS).forEach(function (key) {
    const e = RF_ETABLISSEMENTS[key];
    selEtab.appendChild(option(key, e.sigle + ' — ' + e.nom));
  });

  function fillFormations(etabId) {
    resetSelect(selForm, etabId ? 'Sélectionnez une formation' : "Choisissez d'abord un établissement");
    RF_FORMATIONS.filter(function (f) { return f.etablissement === etabId; })
      .forEach(function (f) { selForm.appendChild(option(f.id, f.titre)); });
    selForm.disabled = !etabId;
  }

  function sessionLabel(s) {
    let label = s.libelle + ' — début le ' + U.formatDate(s.debut);
    if (s.statut === 'complet') {
      label += ' (complet)';
    } else if (s.statut !== 'ouvert') {
      label += s.ouvertureInscriptions
        ? ' (ouverture des inscriptions le ' + U.formatDate(s.ouvertureInscriptions) + ')'
        : ' (prochainement)';
    }
    return label;
  }

  function fillSessions(formationId) {
    const f = findFormation(formationId);
    resetSelect(selSess, f ? 'Sélectionnez une session' : "Choisissez d'abord une formation");
    let open = [];
    (f ? f.sessions || [] : []).forEach(function (s) {
      const ok = s.statut === 'ouvert';
      if (ok) open.push(s);
      selSess.appendChild(option(s.id, sessionLabel(s), !ok));   // sessions complètes / à venir non sélectionnables
    });
    selSess.disabled = !f;
    if (open.length === 1) selSess.value = open[0].id;
    if (sessHint) {
      sessHint.hidden = !(f && open.length === 0);
      if (sessHintLink && f) sessHintLink.href = 'contact.html?objet=formation&formation=' + encodeURIComponent(f.id);
    }
  }

  function updateSelection() {
    const f = findFormation(selForm.value);
    if (!selection) return;
    if (!f) { selection.hidden = true; return; }
    const etab = RF_ETABLISSEMENTS[f.etablissement] || {};
    selection.querySelector('[data-sel="titre"]').textContent = f.titre;
    selection.querySelector('[data-sel="meta"]').textContent =
      (etab.sigle || '') + ' · ' + f.duree + ' · ' + (RF_NIVEAUX[f.niveau] || '');
    selection.querySelector('[data-sel="prix"]').textContent =
      U.formatPrice(f.prix) + (f.prixPeriode ? ' / ' + f.prixPeriode : '');
    selection.querySelector('[data-sel="lien"]').href = CARD.detailUrl(f);
    selection.hidden = false;
  }

  selEtab.addEventListener('change', function () {
    fillFormations(selEtab.value);
    fillSessions('');
    updateSelection();
  });

  selForm.addEventListener('change', function () {
    fillSessions(selForm.value);
    updateSelection();
  });

  /* pré-sélection depuis l'URL : ?formation=…&session=… */
  (function preselect() {
    const wantedFormation = U.getParam('formation');
    const wantedSession   = U.getParam('session');
    const f = wantedFormation ? findFormation(wantedFormation) : null;
    fillFormations('');
    fillSessions('');
    if (!f) return;
    selEtab.value = f.etablissement;
    fillFormations(f.etablissement);
    selForm.value = f.id;
    fillSessions(f.id);
    const s = findSession(f, wantedSession);
    if (s && s.statut === 'ouvert') selSess.value = s.id;
    updateSelection();
  })();


  /* --- Bornes dynamiques des champs ------------------------------------- */

  const today = new Date();
  const dob = form.elements.namedItem('naissance');
  if (dob) {
    const max = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());   // 15 ans minimum
    dob.max = max.toISOString().slice(0, 10);
    dob.min = '1940-01-01';
  }
  const annee = form.elements.namedItem('annee');
  if (annee) annee.max = String(today.getFullYear());


  /* --- Validation ---------------------------------------------------------- */

  function fieldOf(input) { return input.closest('.form-field'); }

  function messageFor(input) {
    const v = input.validity;
    if (v.valueMissing)   return input.dataset.errorRequired || 'Ce champ est obligatoire.';
    if (v.typeMismatch)   return input.type === 'email' ? 'Adresse email invalide (ex. : nom@exemple.com).' : 'Format invalide.';
    if (v.patternMismatch) return input.dataset.error || 'Format invalide.';
    if (v.tooShort)       return 'Saisissez au moins ' + input.minLength + ' caractères.';
    if (v.rangeUnderflow || v.rangeOverflow) {
      return input.dataset.error || ('Valeur attendue entre ' + input.min + ' et ' + input.max + '.');
    }
    if (v.badInput)       return 'Valeur invalide.';
    return input.validationMessage || 'Champ invalide.';
  }

  function showError(input, message) {
    const field = fieldOf(input);
    if (!field) return;
    field.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    const err = field.querySelector('.field-error');
    if (err) {
      err.textContent = message;
      err.hidden = false;
      if (err.id) input.setAttribute('aria-describedby', err.id);
    }
  }

  function clearError(input) {
    const field = input && input.closest ? fieldOf(input) : null;
    if (!field) return;
    field.classList.remove('has-error');
    field.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    const err = field.querySelector('.field-error');
    if (err) { err.textContent = ''; err.hidden = true; }
  }

  function validatePanel(panel) {
    let firstBad = null;
    const inputs = panel.querySelectorAll('input, select, textarea');

    inputs.forEach(function (input) {
      if (input.type === 'file') return;            // pièces facultatives, contrôlées au choix du fichier
      clearError(input);
    });

    inputs.forEach(function (input) {
      if (input.type === 'file' || input.disabled) return;
      if (!input.checkValidity()) {
        showError(input, messageFor(input));
        if (!firstBad) firstBad = input;
      }
    });

    if (firstBad) {
      stepError.textContent = 'Veuillez corriger les champs signalés avant de continuer.';
      stepError.hidden = false;
      firstBad.focus();
      return false;
    }
    stepError.hidden = true;
    return true;
  }

  form.addEventListener('input', function (e) { clearError(e.target); });
  form.addEventListener('change', function (e) { clearError(e.target); });


  /* --- Collecte des saisies dans formState -------------------------------- */

  function collect(panel) {
    panel.querySelectorAll('input, select, textarea').forEach(function (input) {
      if (!input.name || input.type === 'file') return;
      if (input.type === 'radio') {
        if (input.checked) state[input.name] = input.value;
      } else if (input.type === 'checkbox') {
        state[input.name] = input.checked;
      } else {
        state[input.name] = input.value.trim();
        if (input.tagName === 'SELECT') {
          const opt = input.options[input.selectedIndex];
          state[input.name + 'Label'] = opt ? opt.textContent : '';
        }
      }
    });
  }


  /* --- Étape 4 : pièces justificatives ------------------------------------ */

  function formatSize(bytes) {
    return bytes >= 1024 * 1024
      ? (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' Mo'
      : Math.max(1, Math.round(bytes / 1024)) + ' Ko';
  }

  function buildPieces(f) {
    const box = form.querySelector('[data-files]');
    if (!box || !f || piecesBuiltFor === f.id) return;
    piecesBuiltFor = f.id;
    state.pieces = {};

    box.innerHTML = (f.documentsRequis || []).map(function (doc, i) {
      const id = 'f-piece-' + i;
      return (
        '<div class="form-field form-file" data-doc="' + U.escapeHtml(doc) + '">' +
          '<label class="form-label" for="' + id + '">' + U.escapeHtml(doc) + '</label>' +
          '<div class="form-file-control">' +
            '<input type="file" id="' + id + '" name="piece-' + i + '" class="form-file-input visually-hidden" accept=".pdf,.jpg,.jpeg,.png">' +
            '<label class="form-file-btn" for="' + id + '"><ion-icon name="cloud-upload-outline" aria-hidden="true"></ion-icon> Choisir un fichier</label>' +
            '<span class="form-file-name">Aucun fichier sélectionné</span>' +
          '</div>' +
          '<p class="field-error" id="err-' + id + '" hidden></p>' +
        '</div>'
      );
    }).join('');

    box.querySelectorAll('input[type="file"]').forEach(function (input) {
      input.addEventListener('change', onFileChange);
    });
  }

  function onFileChange(e) {
    const input  = e.target;
    const field  = input.closest('.form-file');
    const doc    = field.dataset.doc;
    const nameEl = field.querySelector('.form-file-name');
    const file   = input.files && input.files[0];

    clearError(input);
    delete state.pieces[doc];
    field.classList.remove('is-filled');

    if (!file) {
      nameEl.textContent = 'Aucun fichier sélectionné';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      input.value = '';
      nameEl.textContent = 'Aucun fichier sélectionné';
      showError(input, 'Fichier trop volumineux : 5 Mo maximum.');
      return;
    }
    if (file.type && FILE_TYPES.indexOf(file.type) === -1) {
      input.value = '';
      nameEl.textContent = 'Aucun fichier sélectionné';
      showError(input, 'Format non accepté : PDF, JPG ou PNG uniquement.');
      return;
    }

    // TODO (phase Laravel) : conserver l'objet File pour l'envoi réel (FormData).
    // Sans backend, seuls le nom et la taille sont gardés pour le récapitulatif.
    state.pieces[doc] = { name: file.name, size: file.size };
    nameEl.textContent = file.name + ' (' + formatSize(file.size) + ')';
    field.classList.add('is-filled');
  }


  /* --- Étape 5 : récapitulatif ------------------------------------------- */

  function buildRecap() {
    const box = form.querySelector('[data-recap]');
    if (!box) return;
    const f    = findFormation(state.formation);
    const etab = f ? RF_ETABLISSEMENTS[f.etablissement] || {} : {};
    const s    = findSession(f, state.session);

    const groups = [
      { title: 'Formation', step: 1, rows: [
        ['Établissement', etab.sigle ? etab.sigle + ' — ' + etab.nom : ''],
        ['Formation', f ? f.titre : ''],
        ['Session', s ? sessionLabel(s) : '']
      ] },
      { title: 'Identité', step: 2, rows: [
        ['Nom', state.nom], ['Prénom', state.prenom],
        ['Date de naissance', U.formatDate(state.naissance)],
        ['Sexe', state.sexe === 'F' ? 'Féminin' : state.sexe === 'M' ? 'Masculin' : ''],
        ['Téléphone', state.telephone], ['Email', state.email], ['Adresse', state.adresse]
      ] },
      { title: 'Parcours', step: 3, rows: [
        ['Dernier diplôme obtenu', state.diplomeLabel],
        ['Série / spécialité', state.serie],
        ["Établissement d'origine", state.etablissementOrigine],
        ["Année d'obtention", state.annee],
        ['Expérience professionnelle', state.experience]
      ] },
      { title: 'Pièces justificatives', step: 4, rows: (f ? f.documentsRequis || [] : []).map(function (doc) {
        return [doc, state.pieces[doc] ? state.pieces[doc].name : 'Non fournie — à compléter plus tard'];
      }) }
    ];

    box.innerHTML = groups.map(function (g) {
      return (
        '<div class="recap-group">' +
          '<div class="recap-head">' +
            '<h3>' + g.title + '</h3>' +
            '<button type="button" class="recap-edit" data-goto="' + g.step + '">' +
              '<ion-icon name="create-outline" aria-hidden="true"></ion-icon> Modifier' +
            '</button>' +
          '</div>' +
          '<dl class="recap-list">' +
            g.rows.map(function (r) {
              return '<div><dt>' + U.escapeHtml(r[0]) + '</dt><dd>' + U.escapeHtml(r[1] || '—') + '</dd></div>';
            }).join('') +
          '</dl>' +
        '</div>'
      );
    }).join('');
  }


  /* --- Navigation entre étapes --------------------------------------------- */

  function updateContext() {
    const f = findFormation(state.formation);
    if (!context || !f) return;
    const etab = RF_ETABLISSEMENTS[f.etablissement] || {};
    const s = findSession(f, state.session);
    context.querySelector('[data-context="formation"]').textContent = f.titre + ' (' + (etab.sigle || '') + ')';
    context.querySelector('[data-context="session"]').textContent = s ? '· ' + s.libelle : '';
  }

  function scrollToTop() {
    const top = root.getBoundingClientRect().top + window.scrollY - 100;   // sous la navbar fixe
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function goTo(step, scroll) {
    current = step;

    panels.forEach(function (p, i) { p.classList.toggle('is-active', i + 1 === step); });

    stepItems.forEach(function (item) {
      const n = Number(item.dataset.stepItem);
      const link = item.querySelector('[data-step-link]');
      item.classList.toggle('is-active', n === step);
      item.classList.toggle('is-done', n !== step && n < maxReached);
      if (link) {
        link.disabled = n > maxReached;
        if (n === step) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current');
      }
    });

    if (barFill) barFill.style.width = ((step - 1) / (TOTAL - 1) * 100) + '%';
    if (status)  status.textContent = 'Étape ' + step + ' sur ' + TOTAL + ' : ' + STEP_NAMES[step - 1];

    prevBtn.hidden = step === 1;
    nextBtn.querySelector('.btn-text').textContent = step === TOTAL ? 'Envoyer ma préinscription' : 'Continuer';
    if (context) context.hidden = step === 1 || !state.formation;
    stepError.hidden = true;

    if (step === 4) buildPieces(findFormation(state.formation));
    if (step === TOTAL) buildRecap();
    if (scroll) scrollToTop();
  }

  function next() {
    const panel = panels[current - 1];
    if (!validatePanel(panel)) return;
    collect(panel);
    if (current === 1) updateContext();

    if (current < TOTAL) {
      maxReached = Math.max(maxReached, current + 1);
      goTo(current + 1, true);
    } else {
      submit();
    }
  }

  function submit() {
    const f    = findFormation(state.formation);
    const etab = f ? RF_ETABLISSEMENTS[f.etablissement] || {} : {};
    const s    = findSession(f, state.session);

    // numéro de candidature simulé côté client ; en production il sera attribué par le serveur
    state.reference = 'RF-' + today.getFullYear() + '-' + String(Math.floor(10000 + Math.random() * 90000));
    state.soumisLe  = new Date().toISOString();
    // TODO (phase Laravel) : POST /preinscriptions (state + fichiers via FormData), puis afficher la réponse.

    form.hidden = true;
    if (context)  context.hidden = true;
    if (progress) progress.hidden = true;

    if (done) {
      done.querySelector('[data-done="ref"]').textContent = state.reference;
      done.querySelector('[data-done="email"]').textContent = state.email || '';
      done.querySelector('[data-done="formation"]').textContent = f ? f.titre + ' (' + (etab.sigle || '') + ')' : '';
      done.querySelector('[data-done="session"]').textContent = s ? sessionLabel(s) : '';
      done.hidden = false;
      const title = done.querySelector('.wizard-done-title');
      if (title) { title.setAttribute('tabindex', '-1'); title.focus(); }
    }
    scrollToTop();
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); next(); });

  prevBtn.addEventListener('click', function () { if (current > 1) goTo(current - 1, true); });

  root.addEventListener('click', function (e) {
    const link = e.target.closest('[data-step-link]');
    if (link && !link.disabled) {
      const n = Number(link.dataset.stepLink);
      if (n <= maxReached && n !== current) goTo(n, true);
      return;
    }
    const jump = e.target.closest('[data-goto]');
    if (jump) {
      const n = Number(jump.dataset.goto);
      if (n >= 1 && n <= maxReached) goTo(n, true);
    }
  });

  goTo(1, false);

})();
