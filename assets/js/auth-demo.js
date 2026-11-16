'use strict';

/**
 * assets/js/auth-demo.js
 * ============================================================================
 * Session SIMULÉE de l'espace candidat (prototype sans backend).
 *
 * La « connexion » compare les identifiants saisis au compte de démonstration
 * (RF_COMPTE_DEMO, assets/data/compte.js) puis enregistre un témoin de session
 * dans le navigateur : sessionStorage par défaut, localStorage (30 jours) si
 * « Rester connecté » est coché. Ce témoin ne contient que l'email et une date
 * d'expiration. header-nav.js lit la même clé pour signaler « connecté ».
 *
 * ⚠ Ce n'est PAS une sécurité : tout est visible côté client.
 * TODO (phase Laravel) : authentification serveur (mot de passe haché, cookie de
 * session HttpOnly, protection CSRF, limitation des tentatives), puis suppression
 * de ce fichier et du compte de démonstration.
 *
 * Utilisé par pages/connexion.js et pages/compte.js. Un seul global : RF_AUTH.
 * ============================================================================
 */

const RF_AUTH = (function () {

  const KEY = 'rf-espace-candidat';           // même clé dans header-nav.js
  const HOUR = 3600000;

  /** stockage utilisable, ou null (navigation privée stricte, stockage bloqué…) */
  function storage(name) {
    try {
      const store = window[name];
      store.setItem('__rf_test', '1');
      store.removeItem('__rf_test');
      return store;
    } catch (e) {
      return null;
    }
  }

  function available() { return !!(storage('sessionStorage') || storage('localStorage')); }

  /** session valide ({ email, expires }) ou null ; une session expirée est effacée */
  function read() {
    let found = null;
    ['sessionStorage', 'localStorage'].forEach(function (name) {
      const store = storage(name);
      if (!store || found) return;
      try {
        const data = JSON.parse(store.getItem(KEY) || 'null');
        if (data && data.email && data.expires > Date.now()) found = data;
        else store.removeItem(KEY);
      } catch (e) {
        store.removeItem(KEY);
      }
    });
    return found;
  }

  /** compare aux identifiants du compte de démonstration (email insensible à la casse) */
  function check(email, password) {
    return typeof RF_COMPTE_DEMO !== 'undefined' &&
      String(email || '').trim().toLowerCase() === RF_COMPTE_DEMO.identifiant &&
      password === RF_COMPTE_DEMO.motDePasse;
  }

  /** ouvre la session ; false si le navigateur bloque le stockage */
  function login(email, remember) {
    const store = remember ? storage('localStorage') : storage('sessionStorage');
    if (!store) return false;
    logout();
    store.setItem(KEY, JSON.stringify({
      email: String(email).trim().toLowerCase(),
      expires: Date.now() + (remember ? 30 * 24 * HOUR : 12 * HOUR)
    }));
    return true;
  }

  function logout() {
    ['sessionStorage', 'localStorage'].forEach(function (name) {
      const store = storage(name);
      if (store) store.removeItem(KEY);
    });
  }

  /** page de retour après connexion : seulement une page .html du site (pas de redirection externe) */
  function safeReturn(value) {
    return /^[a-z0-9-]+\.html(#[a-z0-9-]+)?$/i.test(value || '') ? value : 'compte.html';
  }

  return { KEY, available, read, check, login, logout, safeReturn };

})();
