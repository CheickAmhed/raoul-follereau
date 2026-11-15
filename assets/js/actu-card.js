'use strict';

/**
 * assets/js/actu-card.js
 * ============================================================================
 * Composant partagé des actualités et règles communes :
 *  - carte de liste .blog-card (structure des cartes « Blog » de index.html),
 *    complétée d'un badge de catégorie, d'un extrait et, pour un événement, de
 *    sa date et de son lieu ;
 *  - carte d'agenda .event-card (structure des « Évènements à venir » de
 *    l'accueil), avec le badge « À venir » ;
 *  - publication (seuls les éléments publie: true sont visibles), tri par date,
 *    état d'un événement (à venir, aujourd'hui, terminé), libellés d'horaires.
 *
 * Utilisé par pages/actualites.js (agenda, liste filtrable, compte à rebours)
 * et pages/actualite-detail.js (fiche, « À lire aussi »).
 * Dépend de assets/data/actualites.js (RF_CATEGORIES_ACTU), de utils.js
 * (RF_UTILS) et, si chargé, de formations.js (RF_ETABLISSEMENTS : sigles).
 * Un seul global : RF_ACTU_CARD.
 * ============================================================================
 */

const RF_ACTU_CARD = (function () {

  const U = RF_UTILS;

  const LABELS = typeof RF_CATEGORIES_ACTU !== 'undefined' ? RF_CATEGORIES_ACTU : {};
  const ETABS  = typeof RF_ETABLISSEMENTS !== 'undefined' ? RF_ETABLISSEMENTS : {};

  const ICONS = {
    actualite: 'newspaper-outline',
    annonce:   'megaphone-outline',
    evenement: 'calendar-outline'
  };

  /* état d'un événement par rapport à la date du jour */
  const STATES = {
    'a-venir':  'À venir',
    aujourdhui: "Aujourd'hui",
    termine:    'Terminé'
  };


  /* --- Dates et horaires ---------------------------------------------------- */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /** Date du jour en ISO local (AAAA-MM-JJ), comparable aux dates des données. */
  function todayIso() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  /** « samedi 5 décembre 2026 ». */
  function longDate(iso) {
    return U.formatDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  /** « 08:30 » -> « 8 h 30 » ; « 08:00 » -> « 8 h » (usage français, espaces insécables :
   *  « 16 h » ne se coupe jamais en fin de ligne). */
  function formatTime(hhmm) {
    const parts = String(hhmm || '').split(':');
    if (parts.length < 2) return '';
    const hours = Number(parts[0]);
    return hours + '\u00a0h' + (parts[1] === '00' ? '' : '\u00a0' + parts[1]);
  }

  /** « 8 h 30 à 16 h » ou « À partir de 8 h ». */
  function scheduleLabel(item) {
    if (!item.heure) return '';
    return item.heureFin
      ? formatTime(item.heure) + ' à ' + formatTime(item.heureFin)
      : 'À partir de ' + formatTime(item.heure);
  }

  /** Début de l'événement, en heure locale, pour le compte à rebours : « AAAA-MM-JJTHH:MM:00 ». */
  function startIso(item) {
    return item.dateEvenement + 'T' + (item.heure || '00:00') + ':00';
  }


  /* --- Publication et événements -------------------------------------------- */

  /** Éléments publiés (publie: true), du plus récent au plus ancien (date de publication). */
  function published(list) {
    return (list || [])
      .filter(function (item) { return item.publie === true; })
      .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  }

  /** 'a-venir' | 'aujourdhui' | 'termine' pour un événement ; null sinon. */
  function eventState(item, today) {
    if (!item.estEvenement || !item.dateEvenement) return null;
    const ref = today || todayIso();
    if (item.dateEvenement === ref) return 'aujourdhui';
    return item.dateEvenement > ref ? 'a-venir' : 'termine';
  }

  function isUpcoming(item, today) {
    const state = eventState(item, today);
    return state === 'a-venir' || state === 'aujourdhui';
  }

  /** Événements publiés à venir (aujourd'hui compris), du plus proche au plus lointain. */
  function upcoming(list) {
    const today = todayIso();
    return published(list)
      .filter(function (item) { return isUpcoming(item, today); })
      .sort(function (a, b) { return startIso(a) < startIso(b) ? -1 : startIso(a) > startIso(b) ? 1 : 0; });
  }

  /** Jours restants avant l'événement (0 = aujourd'hui). */
  function daysUntil(item) {
    const p = String(item.dateEvenement).split('-').map(Number);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((new Date(p[0], p[1] - 1, p[2]) - today) / 86400000);
  }

  /** « Aujourd'hui », « Demain », « Dans 20 jours ». */
  function relativeLabel(item) {
    const days = daysUntil(item);
    if (days <= 0) return "Aujourd'hui";
    if (days === 1) return 'Demain';
    return 'Dans ' + days + ' jours';
  }

  function detailUrl(item) {
    return 'actualite-detail.html?id=' + encodeURIComponent(item.id);
  }

  function etablissement(item) {
    return (item.etablissement && ETABS[item.etablissement]) || null;
  }


  /* --- Carte de liste (.blog-card) ------------------------------------------ */

  function markup(item) {
    const esc   = U.escapeHtml;
    const state = eventState(item);

    const badges =
      '<div class="news-badges">' +
        '<span class="news-tag news-tag--' + item.categorie + '">' +
          '<ion-icon name="' + (ICONS[item.categorie] || 'newspaper-outline') + '" aria-hidden="true"></ion-icon>' +
          esc(LABELS[item.categorie] || '') +
        '</span>' +
        (state ? '<span class="news-status news-status--' + state + '">' + STATES[state] + '</span>' : '') +
      '</div>';

    const eventMeta = item.estEvenement
      ? '<ul class="news-event-meta">' +
          '<li><ion-icon name="calendar-clear-outline" aria-hidden="true"></ion-icon>' +
            '<span>' + esc(capitalize(longDate(item.dateEvenement))) + ' · ' + esc(scheduleLabel(item)) + '</span></li>' +
          '<li><ion-icon name="location-outline" aria-hidden="true"></ion-icon><span>' + esc(item.lieu) + '</span></li>' +
        '</ul>'
      : '';

    return (
      '<div class="blog-banner-box">' +
        '<img src="' + esc(item.image) + '" alt="' + esc(item.imageAlt) + '" loading="lazy">' +
        badges +
      '</div>' +
      '<div class="blog-content">' +
        eventMeta +
        '<h3 class="blog-title"><a href="' + detailUrl(item) + '">' + esc(item.titre) + '</a></h3>' +
        '<p class="news-excerpt">' + esc(item.extrait) + '</p>' +
        '<div class="wrapper">' +
          '<div class="blog-publish-date">' +
            '<img src="./assets/images/calendar.png" width="15" height="15" alt="">' +
            '<time datetime="' + esc(item.date) + '">' + esc(U.formatDate(item.date)) + '</time>' +
          '</div>' +
          '<span class="news-read" aria-hidden="true">Lire la suite' +
            '<ion-icon name="arrow-forward-outline"></ion-icon></span>' +
        '</div>' +
      '</div>'
    );
  }

  /** <article class="blog-card news-card"> ; toute la carte est cliquable (lien étiré du titre). */
  function create(item) {
    const card = document.createElement('article');
    card.className = 'blog-card news-card';
    card.dataset.categorie = item.categorie;
    card.innerHTML = markup(item);
    return card;
  }


  /* --- Carte d'agenda (.event-card) ----------------------------------------- */

  function eventCardMarkup(item) {
    const esc   = U.escapeHtml;
    const day   = String(item.dateEvenement).split('-')[2];
    const month = capitalize(U.formatDate(item.dateEvenement, { month: 'long', year: 'numeric' }));
    const today = eventState(item) === 'aujourdhui';

    return (
      '<div class="content-left">' +
        '<p class="day">' + esc(day) + '</p>' +
        '<p class="month">' + esc(month) + '</p>' +
      '</div>' +
      '<div class="content-right">' +
        '<p class="agenda-when">' +
          '<span class="agenda-badge' + (today ? ' agenda-badge--today' : '') + '">' + (today ? STATES.aujourdhui : STATES['a-venir']) + '</span>' +
          (today ? '' : '<span class="agenda-relative">' + esc(relativeLabel(item)) + '</span>') +
        '</p>' +
        '<div class="schedule">' +
          '<p class="time">' + esc(scheduleLabel(item)) + '</p>' +
          '<p class="place">' + esc(item.lieu) + '</p>' +
        '</div>' +
        '<a href="' + detailUrl(item) + '" class="event-name">' + esc(item.titre) + '</a>' +
      '</div>'
    );
  }

  function createEventCard(item) {
    const card = document.createElement('article');
    card.className = 'event-card agenda-card';
    card.innerHTML = eventCardMarkup(item);
    return card;
  }

  return {
    LABELS, ICONS, STATES,
    todayIso, capitalize, longDate, formatTime, scheduleLabel, startIso,
    published, eventState, isUpcoming, upcoming, daysUntil, relativeLabel,
    detailUrl, etablissement,
    markup, create, eventCardMarkup, createEventCard
  };

})();
