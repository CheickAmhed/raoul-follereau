'use strict';

/**
 * assets/js/footer.js
 * ============================================================================
 * Footer de toutes les pages (header-nav.js joue ce rôle pour le header) :
 *  - newsletter : validation HTML5 et message sous le champ (mêmes règles que
 *    les autres formulaires, jamais d'alert()), inscription SIMULÉE (aucun
 *    envoi), confirmation affichée à la place du formulaire, puis « Inscrire
 *    une autre adresse » ;
 *  - réseaux sociaux (liens [data-reseau] du footer et de la page Contact) :
 *    l'URL vient de assets/data/reseaux.js ; sans URL, un clic affiche « bientôt
 *    disponible » sous les icônes au lieu de remonter en haut de page.
 *
 * À charger APRÈS assets/data/reseaux.js. Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : POST /newsletter (jeton CSRF, double confirmation par
 * email, lien de désinscription dans chaque envoi, protection contre les robots).
 * ============================================================================
 */

(function () {

  /* --- Newsletter -------------------------------------------------------------- */

  const form = document.querySelector('.newsletter-form');
  const done = document.querySelector('.newsletter-done');
  const input = form && form.querySelector('input[type="email"]');

  if (form && done && input) {
    const error  = form.querySelector('.newsletter-error');
    const note   = input.getAttribute('aria-describedby') || '';

    function showError(text) {
      form.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      if (error) {
        error.textContent = text;
        error.hidden = false;
        input.setAttribute('aria-describedby', (error.id + ' ' + note).trim());
      }
    }

    function clearError() {
      form.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      if (error) {
        error.textContent = '';
        error.hidden = true;
      }
      if (note) input.setAttribute('aria-describedby', note);
    }

    /** adresse affichée avec des points de coupure après « @ » et « . » : sur un écran
     *  étroit, elle passe à la ligne entre deux parties, jamais au milieu d'un mot */
    function setEmail(el, value) {
      el.textContent = '';
      let chunk = '';
      for (const ch of value) {
        chunk += ch;
        if (ch === '@' || ch === '.') {
          el.appendChild(document.createTextNode(chunk));
          el.appendChild(document.createElement('wbr'));
          chunk = '';
        }
      }
      if (chunk) el.appendChild(document.createTextNode(chunk));
    }

    input.addEventListener('input', clearError);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input.checkValidity()) {
        showError(input.validity.valueMissing
          ? input.dataset.errorRequired || 'Saisissez votre adresse email.'
          : input.dataset.error || 'Adresse email invalide.');
        input.focus();
        return;
      }
      clearError();
      // TODO (phase Laravel) : envoi au serveur ; ici, aucune donnée ne quitte le navigateur
      done.querySelectorAll('[data-newsletter-email]').forEach(function (el) { setEmail(el, input.value.trim()); });
      form.hidden = true;
      done.hidden = false;
      const title = done.querySelector('.newsletter-done-title');
      if (title) title.focus();
    });

    const again = done.querySelector('.newsletter-again');
    if (again) {
      again.addEventListener('click', function () {
        form.reset();
        clearError();
        done.hidden = true;
        form.hidden = false;
        input.focus();
      });
    }
  }


  /* --- Réseaux sociaux ------------------------------------------------------------ */

  const NETWORKS = typeof RF_RESEAUX !== 'undefined' ? RF_RESEAUX : {};
  const PENDING = 'Nos pages sur les réseaux sociaux arrivent bientôt. En attendant, suivez nos actualités sur le site.';
  const groups = [];

  document.querySelectorAll('[data-reseau]').forEach(function (link) {
    const network = NETWORKS[link.dataset.reseau];
    if (!network) return;
    if (network.url) {
      link.href = network.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', network.nom + ' (nouvel onglet)');
      return;
    }
    link.dataset.pending = '';
    link.title = 'Page ' + network.nom + ' bientôt disponible';
    link.setAttribute('aria-label', network.nom + ' : page bientôt disponible');
    if (groups.indexOf(link.parentElement) === -1) groups.push(link.parentElement);
  });

  /* zone de message créée dès le chargement, pour être annoncée au premier clic */
  groups.forEach(function (group) {
    const status = document.createElement('p');
    status.className = 'social-status';
    status.setAttribute('role', 'status');
    group.insertAdjacentElement('afterend', status);
  });

  document.addEventListener('click', function (e) {
    const link = e.target.closest('[data-reseau][data-pending]');
    if (!link) return;
    e.preventDefault();
    const status = link.parentElement.nextElementSibling;
    if (status && status.classList.contains('social-status')) status.textContent = PENDING;
  });

})();
