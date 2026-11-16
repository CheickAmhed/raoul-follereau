'use strict';

/**
 * assets/js/pages/connexion.js
 * ============================================================================
 * Connexion à l'espace candidat (connexion.html), SIMULÉE (voir auth-demo.js) :
 *  - déjà connecté : redirection immédiate vers la page de retour ;
 *  - ?deconnecte=1 : message « vous êtes déconnecté(e) » ; ?retour=page.html :
 *    page ouverte après connexion (pages du site uniquement) ;
 *  - validation HTML5 + messages inline (mêmes règles que les autres formulaires) ;
 *    erreur d'identifiants volontairement générique (ne révèle pas si l'email existe) ;
 *  - afficher / masquer le mot de passe, alerte « majuscules verrouillées » ;
 *  - « Mot de passe oublié » : demande simulée, réponse identique que l'adresse
 *    soit connue ou non ;
 *  - encadré de démonstration : remplit les identifiants du compte de test.
 *
 * À charger APRÈS compte.js (données), utils.js et auth-demo.js.
 * Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : POST /login et /forgot-password (Fortify / Breeze),
 * limitation des tentatives côté serveur ; supprimer l'encadré de démonstration.
 * ============================================================================
 */

(function () {

  if (typeof RF_AUTH === 'undefined' || typeof RF_UTILS === 'undefined') return;

  const U = RF_UTILS;
  const returnTo = RF_AUTH.safeReturn(U.getParam('retour'));

  /* déjà connecté : inutile de rester ici */
  if (RF_AUTH.read()) {
    window.location.replace(returnTo);
    return;
  }

  const box    = document.querySelector('.auth-box');
  const status = document.querySelector('.auth-status');
  if (!box) return;

  const panels = {
    login:  box.querySelector('[data-panel="login"]'),
    forgot: box.querySelector('[data-panel="forgot"]'),
    sent:   box.querySelector('[data-panel="sent"]')
  };

  function say(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
  }

  if (U.getParam('deconnecte') === '1') say('Vous êtes déconnecté(e). À bientôt\u00a0!');   // espace insécable : le « ! » ne passe pas seul à la ligne


  /* --- Validation (mêmes règles que preinscription.js / contact.js) ------- */

  function fieldOf(input) { return input.closest('.form-field'); }

  function messageFor(input) {
    const v = input.validity;
    if (v.valueMissing)    return input.dataset.errorRequired || 'Ce champ est obligatoire.';
    if (v.typeMismatch || v.patternMismatch) return input.dataset.error || 'Format invalide.';
    return input.validationMessage || 'Champ invalide.';
  }

  function showError(input, text) {
    const field = fieldOf(input);
    if (!field) return;
    field.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    const err = field.querySelector('.field-error');
    if (err) {
      err.textContent = text;
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

  function validate(form) {
    let firstBad = null;
    form.querySelectorAll('input').forEach(function (input) {
      clearError(input);
      if (input.type === 'checkbox') return;
      if (!input.checkValidity()) {
        showError(input, messageFor(input));
        if (!firstBad) firstBad = input;
      }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function formError(form, text) {
    const el = form.querySelector('.form-error');
    if (!el) return;
    el.textContent = text || '';
    el.hidden = !text;
  }

  Object.keys(panels).forEach(function (key) {
    const panel = panels[key];
    if (panel && panel.tagName === 'FORM') {
      panel.addEventListener('input', function (e) { clearError(e.target); formError(panel, ''); });
    }
  });


  /* --- Panneaux ------------------------------------------------------------- */

  function show(name, focusSelector) {
    Object.keys(panels).forEach(function (key) { if (panels[key]) panels[key].hidden = key !== name; });
    say('');
    const target = focusSelector && panels[name] && panels[name].querySelector(focusSelector);
    if (target) target.focus();
  }

  box.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-show]');
    if (!trigger) return;
    e.preventDefault();
    const name = trigger.dataset.show;
    if (name === 'forgot') {
      const from = panels.login.querySelector('#auth-email');
      const to = panels.forgot.querySelector('#forgot-email');
      if (from && to && !to.value) to.value = from.value;      // évite de ressaisir l'adresse
      show('forgot', '#forgot-email');
    } else {
      show('login', '#auth-email');
    }
  });


  /* --- Connexion ------------------------------------------------------------- */

  const login    = panels.login;
  const email    = login.querySelector('#auth-email');
  const password = login.querySelector('#auth-password');
  const remember = login.querySelector('#auth-remember');
  const submit   = login.querySelector('[type="submit"]');

  login.addEventListener('submit', function (e) {
    e.preventDefault();
    formError(login, '');
    say('');                                  // le message « déconnecté(e) » n'a plus lieu d'être
    if (!validate(login)) return;

    if (!RF_AUTH.available()) {
      formError(login, "Votre navigateur bloque l'enregistrement de la session. Autorisez le stockage local pour ce site, puis réessayez.");
      return;
    }

    if (!RF_AUTH.check(email.value, password.value)) {
      formError(login, 'Adresse email ou mot de passe incorrect.');
      password.value = '';
      password.focus();
      return;
    }

    if (!RF_AUTH.login(email.value, remember && remember.checked)) {
      formError(login, "Votre navigateur bloque l'enregistrement de la session. Décochez « Rester connecté(e) » ou autorisez le stockage local pour ce site.");
      return;
    }
    submit.disabled = true;
    const label = submit.querySelector('.btn-text');
    if (label) label.textContent = 'Connexion…';
    window.setTimeout(function () { window.location.href = returnTo; }, 400);
  });

  /* afficher / masquer le mot de passe */
  const toggle = login.querySelector('.auth-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      const visible = password.type === 'text';
      password.type = visible ? 'password' : 'text';
      toggle.setAttribute('aria-pressed', visible ? 'false' : 'true');   // libellé fixe, l'état est porté par aria-pressed
      const icon = toggle.querySelector('ion-icon');
      if (icon) icon.setAttribute('name', visible ? 'eye-outline' : 'eye-off-outline');
      password.focus();
    });
  }

  /* majuscules verrouillées pendant la saisie du mot de passe */
  const caps = login.querySelector('.auth-caps');
  function checkCaps(e) {
    if (caps && e.getModifierState) caps.hidden = !e.getModifierState('CapsLock');
  }
  password.addEventListener('keydown', checkCaps);
  password.addEventListener('keyup', checkCaps);
  password.addEventListener('blur', function () { if (caps) caps.hidden = true; });


  /* --- Mot de passe oublié (simulé) ------------------------------------------ */

  const forgot = panels.forgot;
  if (forgot) {
    forgot.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(forgot)) return;
      // TODO (phase Laravel) : POST /forgot-password ; réponse identique que l'adresse existe ou non
      const sentEmail = panels.sent && panels.sent.querySelector('[data-sent-email]');
      if (sentEmail) sentEmail.textContent = forgot.querySelector('#forgot-email').value.trim();
      show('sent');
      const title = panels.sent && panels.sent.querySelector('.auth-sent-title');
      if (title) { title.setAttribute('tabindex', '-1'); title.focus(); }
    });
  }


  /* --- Démonstration (TODO : à supprimer avec l'encadré avant la mise en ligne) --- */

  if (typeof RF_COMPTE_DEMO !== 'undefined') {
    document.querySelectorAll('[data-demo]').forEach(function (el) {
      el.textContent = RF_COMPTE_DEMO[el.dataset.demo] || '';
    });
  }

  document.querySelectorAll('[data-demo-fill]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (typeof RF_COMPTE_DEMO === 'undefined') return;
      show('login');
      email.value = RF_COMPTE_DEMO.identifiant;
      password.value = RF_COMPTE_DEMO.motDePasse;
      clearError(email);
      clearError(password);
      submit.focus();
    });
  });

})();
