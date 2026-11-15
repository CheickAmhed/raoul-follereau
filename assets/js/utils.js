'use strict';

/**
 * assets/js/utils.js
 * ============================================================================
 * Helpers partagés par les scripts de page (assets/js/pages/*.js).
 * Vanilla JS, aucune dépendance ; un seul objet global en lecture : RF_UTILS.
 * À charger APRÈS les fichiers de données (assets/data/*.js) et AVANT les
 * scripts de page.
 * ============================================================================
 */

const RF_UTILS = (function () {

  /** Valeur d'un paramètre de l'URL courante (?id=xxx), ou null. */
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /** 1240 -> "1 240" (séparateur de milliers français). */
  function formatNumber(value) {
    return Number(value || 0).toLocaleString('fr-FR');
  }

  /** 350000 -> "350 000 FCFA". */
  function formatPrice(amount) {
    return formatNumber(amount) + ' FCFA';
  }

  /**
   * "2027-04-01" -> "1er avril 2027" (usage français : le premier du mois prend l'ordinal).
   * La date ISO est découpée à la main pour rester en heure locale : new Date('AAAA-MM-JJ')
   * serait interprétée en UTC et pourrait reculer d'un jour selon le fuseau.
   */
  function formatDate(iso, options) {
    const parts = String(iso || '').split('-').map(Number);
    if (parts.length < 3 || parts.some(isNaN)) return '';
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const opts = options || { day: 'numeric', month: 'long', year: 'numeric' };
    const text = date.toLocaleDateString('fr-FR', opts);
    return opts.day && date.getDate() === 1 ? text.replace(/(^|\s)1(?=\s)/, '$11er') : text;
  }

  /** Échappe une valeur avant injection dans innerHTML. */
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** pluralize(3, 'formation') -> "formations" ; pluralize(1, 'formation') -> "formation". */
  function pluralize(count, singular, plural) {
    return count > 1 ? (plural || singular + 's') : singular;
  }

  return { getParam, formatNumber, formatPrice, formatDate, escapeHtml, pluralize };

})();
