'use strict';

/**
 * assets/js/pages/contact.js
 * ============================================================================
 * Formulaire de contact (contact.html) :
 *
 *  - « Objet de la demande » obligatoire (contact général / information sur
 *    une formation / suivi d'une préinscription / partenariat). Selon l'objet,
 *    un bloc conditionnel [data-objet-panel] est affiché : ses champs sont
 *    désactivés tant qu'il est masqué (ils ne bloquent donc pas la validation) ;
 *  - objet « formation » : liste des formations (RF_FORMATIONS, groupées par
 *    établissement), aperçu de la formation choisie et message proposé selon
 *    sa disponibilité (inscriptions ouvertes / à venir / complet). Le message
 *    proposé n'écrase jamais un texte saisi par l'utilisateur ;
 *  - pré-remplissage depuis l'URL : ?objet=…&formation={id} (liens « Être
 *    informé(e) de l'ouverture » de la fiche formation et du wizard) ;
 *  - validation HTML5 (required, type, pattern, minlength) + contrôle JS au
 *    submit : messages inline sous chaque champ, focus sur le premier champ
 *    invalide, jamais d'alert() — mêmes conventions que preinscription.js ;
 *  - soumission simulée : aucun envoi réseau, message de succès inline puis
 *    possibilité d'envoyer un autre message.
 *    // TODO: brancher sur l'API Laravel /contact lors de l'intégration backend
 *  - bonus : le bouton WhatsApp de la colonne coordonnées reçoit un texte
 *    pré-rempli cohérent avec la formation sélectionnée.
 *
 * Dépend de utils.js (RF_UTILS) ; formations.js + formation-card.js sont
 * facultatifs (sans eux, la liste des formations reste vide et n'est plus
 * obligatoire). À charger AVANT premium-animations.js et hero-intro.js.
 * Vanilla JS, IIFE 'use strict', aucun global.
 * ============================================================================
 */

(function () {

  const form = document.querySelector('.contact-form');
  if (!form || typeof RF_UTILS === 'undefined') return;

  const U        = RF_UTILS;
  const HAS_DATA = typeof RF_FORMATIONS !== 'undefined' && typeof RF_ETABLISSEMENTS !== 'undefined' &&
                   typeof RF_FORMATION_CARD !== 'undefined';
  const CARD     = HAS_DATA ? RF_FORMATION_CARD : null;

  const box        = form.closest('.contact-box') || form;
  const selObjet   = form.elements.namedItem('objet');
  const selForm    = form.elements.namedItem('formation');
  const message    = form.elements.namedItem('message');
  const panels     = form.querySelectorAll('[data-objet-panel]');
  const selection  = form.querySelector('.contact-selection');
  const formError  = form.querySelector('.form-error');
  const success    = box.querySelector('.contact-success');
  const whatsapp   = document.querySelector('[data-whatsapp]');

  if (!selObjet || !message) return;

  const WHATSAPP_DEFAULT = 'Bonjour, je souhaite obtenir des informations sur vos formations.';

  /** Dernier message proposé automatiquement : on ne remplace le contenu du
   *  textarea que s'il est vide ou encore égal à cette proposition. */
  let lastSuggested = '';


  /* --- Helpers ------------------------------------------------------------- */

  function findFormation(id) {
    if (!HAS_DATA || !id) return null;
    return RF_FORMATIONS.find(function (f) { return f.id === id; }) || null;
  }

  function setInputs(panel, enabled) {
    panel.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.disabled = !enabled;
      if (!enabled) clearError(input);
    });
  }

  function scrollToBox() {
    const top = box.getBoundingClientRect().top + window.pageYOffset - 100;   // navbar fixe
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }


  /* --- Objet de la demande : blocs conditionnels --------------------------- */

  function applyObjet() {
    const objet = selObjet.value;
    panels.forEach(function (panel) {
      const on = panel.dataset.objetPanel === objet;
      panel.hidden = !on;
      setInputs(panel, on);
    });
    if (objet !== 'formation' && selForm) selForm.value = '';
    updateSelection();   // aperçu, message proposé et lien WhatsApp recalculés
  }


  /* --- Objet « formation » : liste, aperçu, message proposé ---------------- */

  function fillFormations() {
    if (!selForm) return;
    if (!HAS_DATA) { selForm.required = false; return; }   // données absentes : ne pas bloquer l'envoi
    Object.keys(RF_ETABLISSEMENTS).forEach(function (key) {
      const etab  = RF_ETABLISSEMENTS[key];
      const group = document.createElement('optgroup');
      group.label = etab.sigle + ' — ' + etab.nom;
      RF_FORMATIONS.filter(function (f) { return f.etablissement === key; }).forEach(function (f) {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.titre;
        group.appendChild(opt);
      });
      if (group.children.length) selForm.appendChild(group);
    });
  }

  function statusText(f) {
    const dispo = CARD.disponibilite(f);
    const next  = CARD.prochaineSession(f);
    if (dispo === 'ouvert' && next) {
      return next.dateLimite
        ? 'Inscriptions ouvertes jusqu\'au ' + U.formatDate(next.dateLimite)
        : 'Inscriptions ouvertes';
    }
    if (dispo === 'complet') return 'Session en cours complète';
    if (next && next.ouvertureInscriptions) {
      return 'Ouverture des inscriptions le ' + U.formatDate(next.ouvertureInscriptions);
    }
    return 'Ouverture prochaine des inscriptions';
  }

  /** Corps de la demande proposé selon la disponibilité de la formation. */
  function suggestedBody(f) {
    const etab  = RF_ETABLISSEMENTS[f.etablissement] || {};
    const dispo = CARD.disponibilite(f);
    const next  = CARD.prochaineSession(f);
    const ref   = '« ' + f.titre + ' » (' + (etab.sigle || '') + ')';
    let body;

    if (dispo === 'ouvert' && next) {
      body = 'Je souhaite obtenir des informations sur la formation ' + ref +
             ' : conditions d\'admission, pièces à fournir et modalités d\'inscription pour la session « ' +
             next.libelle + ' ».';
    } else if (dispo === 'complet') {
      body = 'La session en cours de la formation ' + ref +
             ' étant complète, je souhaite être prévenu(e) dès l\'ouverture de la prochaine session.';
    } else {
      body = 'Je souhaite être informé(e) de l\'ouverture des inscriptions pour la formation ' + ref +
             (next && next.ouvertureInscriptions ? ' (prévue le ' + U.formatDate(next.ouvertureInscriptions) + ')' : '') +
             '.';
    }
    return body;
  }

  function suggestedMessage(f) { return 'Bonjour,\n' + suggestedBody(f) + '\nMerci d\'avance.'; }

  /** Texte pré-rempli du lien WhatsApp (wa.me/…?text=) : une seule ligne. */
  function whatsappText(f) {
    if (!f) return WHATSAPP_DEFAULT;
    const body = suggestedBody(f);
    return 'Bonjour, ' + body.charAt(0).toLowerCase() + body.slice(1);
  }

  function updateSelection() {
    const f = selForm ? findFormation(selForm.value) : null;

    if (selection) {
      if (f) {
        const etab = RF_ETABLISSEMENTS[f.etablissement] || {};
        selection.querySelector('[data-sel="titre"]').textContent  = f.titre;
        selection.querySelector('[data-sel="meta"]').textContent   =
          (etab.sigle || '') + ' · ' + f.duree + ' · ' + (RF_NIVEAUX[f.niveau] || '');
        selection.querySelector('[data-sel="statut"]').textContent = statusText(f);
        selection.querySelector('[data-sel="lien"]').href          = CARD.detailUrl(f);
      }
      selection.hidden = !f;
    }

    // message proposé : uniquement si l'utilisateur n'a rien écrit de lui-même
    const untouched = message.value.trim() === '' || message.value === lastSuggested;
    if (untouched) {
      const text = f ? suggestedMessage(f) : '';
      message.value = text;
      lastSuggested = text;
      clearError(message);
    }

    if (whatsapp) {
      whatsapp.href = whatsapp.href.split('?')[0] + '?text=' + encodeURIComponent(whatsappText(f));
    }
  }

  fillFormations();
  selObjet.addEventListener('change', applyObjet);
  if (selForm) selForm.addEventListener('change', updateSelection);


  /* --- Pré-remplissage depuis l'URL : ?objet=…&formation=… ----------------- */

  (function preselect() {
    const wantedObjet = U.getParam('objet');
    const f = findFormation(U.getParam('formation'));

    if (f) {
      selObjet.value = 'formation';
    } else if (wantedObjet && selObjet.querySelector('option[value="' + wantedObjet + '"]')) {
      selObjet.value = wantedObjet;
    }
    applyObjet();
    if (f && selForm) {
      selForm.value = f.id;
      updateSelection();
    }
  })();


  /* --- Validation (mêmes règles que le wizard) ----------------------------- */

  function fieldOf(input) { return input.closest('.form-field'); }

  function messageFor(input) {
    const v = input.validity;
    if (v.valueMissing)    return input.dataset.errorRequired || 'Ce champ est obligatoire.';
    if (v.typeMismatch)    return input.type === 'email' ? 'Adresse email invalide (ex. : nom@exemple.com).' : 'Format invalide.';
    if (v.patternMismatch) return input.dataset.error || 'Format invalide.';
    if (v.tooShort)        return 'Saisissez au moins ' + input.minLength + ' caractères.';
    if (v.badInput)        return 'Valeur invalide.';
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

  function validate() {
    let firstBad = null;
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(clearError);
    inputs.forEach(function (input) {
      if (input.disabled) return;                       // champs des blocs masqués
      if (!input.checkValidity()) {
        showError(input, messageFor(input));
        if (!firstBad) firstBad = input;
      }
    });

    if (formError) {
      formError.hidden = !firstBad;
      if (firstBad) formError.textContent = 'Veuillez corriger les champs signalés avant d\'envoyer votre message.';
    }
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  form.addEventListener('input',  function (e) { clearError(e.target); });
  form.addEventListener('change', function (e) { clearError(e.target); });


  /* --- Soumission simulée -------------------------------------------------- */

  function collect() {
    const data = {};
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      if (!input.name || input.disabled) return;
      if (input.type === 'checkbox') {
        data[input.name] = input.checked;
      } else {
        data[input.name] = input.value.trim();
        if (input.tagName === 'SELECT') {
          const opt = input.options[input.selectedIndex];
          data[input.name + 'Label'] = opt ? opt.textContent : '';
        }
      }
    });
    data.envoyeLe = new Date().toISOString();
    return data;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    const data = collect();
    // TODO: brancher sur l'API Laravel /contact lors de l'intégration backend
    //       (POST data en JSON, puis afficher la réponse du serveur à la place de ce succès simulé).

    form.hidden = true;
    if (success) {
      success.querySelector('[data-done="prenom"]').textContent = data.prenom || '';
      success.querySelector('[data-done="email"]').textContent  = data.email || '';
      success.querySelector('[data-done="objet"]').textContent  = (data.objetLabel || '').toLowerCase();
      success.hidden = false;
      const title = success.querySelector('.contact-success-title');
      if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
    }
    scrollToBox();
  });

  /* « Envoyer un autre message » : formulaire vierge, objet conservé */
  const again = success && success.querySelector('[data-contact-again]');
  if (again) {
    again.addEventListener('click', function () {
      const objet = selObjet.value;
      form.reset();
      selObjet.value = objet;
      lastSuggested = '';
      form.querySelectorAll('input, select, textarea').forEach(clearError);
      if (formError) formError.hidden = true;
      applyObjet();
      success.hidden = true;
      form.hidden = false;
      scrollToBox();
      selObjet.focus({ preventScroll: true });
    });
  }

})();
