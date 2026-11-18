'use strict';

/**
 * assets/js/pages/actualite-detail.js
 * ============================================================================
 * Fiche d'une actualité, d'une annonce ou d'un événement (actualite-detail.html),
 * page-gabarit unique alimentée par ?id= depuis RF_ACTUALITES :
 *  - bannière (variante photo) : catégorie, titre, date, extrait, image, badges ;
 *  - contenu : paragraphes, intertitres, listes et citations (blocs de « contenu ») ;
 *  - encart : informations pratiques d'un événement (date, horaires, lieu,
 *    état « à venir » / « terminé », ajout à l'agenda en .ics) ou informations
 *    de publication ; partage (WhatsApp, Facebook, copie du lien) ;
 *  - photos sous le texte (champ « photos », facultatif), ouvertes dans la
 *    visionneuse partagée ; sans photo et avec un texte court, l'encart reste à
 *    droite avec ses informations sur deux colonnes (desktop), pour réduire le vide ;
 *  - « À lire aussi » : 3 autres publications, même catégorie en priorité ;
 *  - id absent, inconnu ou brouillon (publie: false) : message clair + retour à
 *    la liste, jamais de page blanche.
 *
 * À charger APRÈS actualites.js, formations.js (sigles et logos des
 * établissements), utils.js, actu-card.js et lightbox.js, et AVANT premium-animations.js et
 * hero-intro.js. Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : route rendue côté serveur (/actualites/{slug}).
 * ============================================================================
 */

(function () {

  const page = document.querySelector('.detail');
  if (!page || typeof RF_ACTUALITES === 'undefined' || typeof RF_UTILS === 'undefined' ||
      typeof RF_ACTU_CARD === 'undefined') return;

  const U    = RF_UTILS;
  const CARD = RF_ACTU_CARD;
  const esc  = U.escapeHtml;

  const layout   = page.querySelector('.detail-layout');
  const notFound = page.querySelector('.detail-notfound');
  const related  = document.querySelector('.detail-related');
  const banner   = document.querySelector('.page-banner');

  const list = CARD.published(RF_ACTUALITES);
  const id   = U.getParam('id');
  const item = list.find(function (entry) { return entry.id === id; }) || null;   // brouillon = introuvable


  /* --- Helpers de remplissage --------------------------------------------- */

  function fields(name) { return document.querySelectorAll('[data-field="' + name + '"]'); }

  function setText(name, value) { fields(name).forEach(function (el) { el.textContent = value; }); }

  function setHtml(name, html) { fields(name).forEach(function (el) { el.innerHTML = html; }); }

  function setAttr(name, attr, value) { fields(name).forEach(function (el) { el.setAttribute(attr, value); }); }

  function show(name, visible) { fields(name).forEach(function (el) { el.hidden = !visible; }); }


  /* --- id absent, inconnu ou non publié -------------------------------------- */

  if (!item) {
    if (layout)   layout.hidden = true;
    if (related)  related.hidden = true;
    if (notFound) notFound.hidden = false;
    page.classList.add('detail--last');

    const visual = banner && banner.querySelector('.page-banner-visual');
    if (visual) visual.hidden = true;

    setText('surtitre', 'Actualités');
    setText('crumb', 'Introuvable');
    setText('titre', 'Publication introuvable');
    setText('extrait', "Le lien suivi ne correspond à aucune publication en ligne. Retrouvez toutes les actualités, annonces et événements depuis la page Actualités.");
    show('meta', false);
    document.title = 'Publication introuvable — Les Établissements Raoul Follereau';
    return;
  }


  /* --- Données dérivées ------------------------------------------------------ */

  const label = CARD.LABELS[item.categorie] || 'Actualité';
  const etab  = CARD.etablissement(item);
  const state = CARD.eventState(item);
  const isEvent = !!state;


  /* --- <head> ---------------------------------------------------------------- */

  document.title = item.titre + ' — Actualités — Les Établissements Raoul Follereau';
  const meta = document.querySelector('meta[name="description"]');
  if (meta && item.extrait) meta.setAttribute('content', item.extrait);


  /* --- Bannière ------------------------------------------------------------- */

  setText('surtitre', label);
  setText('crumb', label);
  setText('titre', item.titre);
  setText('extrait', item.extrait || '');
  setText('meta', 'Publié le ' + U.formatDate(item.date) + ' · ' + (etab ? etab.sigle : 'Les trois établissements'));

  fields('image').forEach(function (img) {
    img.src = item.image;
    img.alt = item.imageAlt || '';
  });

  setAttr('badge-icon', 'name', CARD.ICONS[item.categorie] || 'newspaper-outline');
  setHtml('badge-categorie', '<strong>' + esc(label) + '</strong>');

  if (isEvent) {
    setHtml('badge-date', 'Le <strong>' + esc(U.formatDate(item.dateEvenement)) + '</strong>');
    setAttr('badge-3-icon', 'name', 'time-outline');
    setHtml('badge-3', '<strong>' + esc(CARD.scheduleLabel(item)) + '</strong>');
  } else {
    setHtml('badge-date', 'Publié le <strong>' + esc(U.formatDate(item.date, { day: 'numeric', month: 'long' })) + '</strong>');
    setAttr('badge-3-icon', 'name', 'business-outline');
    setHtml('badge-3', etab ? '<strong>' + esc(etab.sigle) + '</strong>' : '<strong>3</strong> établissements');
  }


  /* --- Contenu ---------------------------------------------------------------- */

  function block(entry) {
    if (typeof entry === 'string') return '<p class="article-text">' + esc(entry) + '</p>';
    if (!entry) return '';
    if (entry.titre) return '<h2 class="detail-block-title article-subtitle">' + esc(entry.titre) + '</h2>';
    if (entry.liste) {
      return '<ul class="detail-list article-list">' + entry.liste.map(function (text) {
        return '<li><ion-icon name="checkmark-circle" aria-hidden="true"></ion-icon><p>' + esc(text) + '</p></li>';
      }).join('') + '</ul>';
    }
    if (entry.citation) {
      return '<figure class="article-quote">' +
        '<blockquote><p>« ' + esc(entry.citation) + ' »</p></blockquote>' +
        (entry.auteur ? '<figcaption>' + esc(entry.auteur) + '</figcaption>' : '') +
      '</figure>';
    }
    return '';
  }

  setHtml('contenu', (item.contenu || []).map(block).join(''));

  if (item.lien && item.lien.href) {
    fields('lien').forEach(function (link) {
      link.href = item.lien.href;
      const text = link.querySelector('.btn-text');
      if (text) text.textContent = item.lien.texte || 'En savoir plus';
    });
    show('lien-box', true);
  } else {
    show('lien-box', false);
  }


  /* --- Encart : informations pratiques / à propos ---------------------------- */

  setText('facts-title', isEvent ? 'Informations pratiques' : 'À propos');

  document.querySelectorAll('[data-only="evenement"]').forEach(function (el) { el.hidden = !isEvent; });

  if (isEvent) {
    setText('event-date', CARD.capitalize(CARD.longDate(item.dateEvenement)));
    setText('event-time', CARD.scheduleLabel(item));
    setText('event-place', item.lieu || '');

    let stateHtml;
    if (state === 'termine') {
      stateHtml = '<span class="article-state-badge article-state-badge--termine">Événement terminé</span>';
    } else if (state === 'aujourdhui') {
      stateHtml = '<span class="article-state-badge article-state-badge--today">' + CARD.STATES.aujourdhui + '</span>';
    } else {
      stateHtml = '<span class="article-state-badge">' + CARD.STATES['a-venir'] + '</span>' +
                  '<span class="article-state-when">' + esc(CARD.relativeLabel(item)) + '</span>';
    }
    setHtml('state', stateHtml);
    show('state', true);
  } else {
    show('state', false);
  }

  setText('categorie', label);
  fields('date').forEach(function (el) {
    el.textContent = U.formatDate(item.date);
    el.setAttribute('datetime', item.date);
  });

  if (etab) {
    setAttr('etab-link', 'href', etab.lien || 'institution.html');
    setText('etab-sigle', etab.sigle);
    fields('etab-logo').forEach(function (img) { img.src = etab.logo || ''; img.alt = ''; });
    show('etab-link', true);
    show('etab-all', false);
  } else {
    show('etab-link', false);
    show('etab-all', true);
  }


  /* --- Ajout à l'agenda (.ics, événements à venir) ----------------------------- */

  /** Longueur UTF-8 d'un caractère : les lignes .ics sont limitées à 75 octets. */
  function utf8Length(ch) {
    const code = ch.codePointAt(0);
    return code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }

  /** Repli des lignes longues (RFC 5545 : CRLF + espace, 75 octets maximum). */
  function fold(line) {
    const parts = [];
    let current = '';
    let bytes = 0;
    Array.from(line).forEach(function (ch) {
      const size  = utf8Length(ch);
      const limit = parts.length ? 74 : 75;           // la suite commence par une espace
      if (bytes + size > limit) {
        parts.push(current);
        current = '';
        bytes = 0;
      }
      current += ch;
      bytes += size;
    });
    parts.push(current);
    return parts.join('\r\n ');
  }

  function icsText(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  /* Le Burkina Faso vit à l'heure UTC toute l'année (Africa/Ouagadougou) : les
     horaires des données sont donc écrits en UTC (suffixe Z), sans fuseau à définir. */
  function icsTime(dateIso, hhmm) {
    return dateIso.replace(/-/g, '') + 'T' + String(hhmm).replace(':', '') + '00Z';
  }

  function buildIcs(entry) {
    const url = /^https?:/.test(window.location.href) ? window.location.href : '';
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Etablissements Raoul Follereau//Site public//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + entry.id + '@etablissements-raoul-follereau',
      'DTSTAMP:' + stamp,
      'DTSTART:' + icsTime(entry.dateEvenement, entry.heure),
      entry.heureFin ? 'DTEND:' + icsTime(entry.dateEvenement, entry.heureFin) : 'DURATION:PT2H',
      'SUMMARY:' + icsText(entry.titre),
      'LOCATION:' + icsText(entry.lieu),
      'DESCRIPTION:' + icsText(entry.extrait),
      url ? 'URL:' + url : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean);
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  const canAddToCalendar = isEvent && state !== 'termine' && item.heure;
  fields('ics').forEach(function (link) {
    if (!canAddToCalendar) { link.hidden = true; return; }
    link.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(buildIcs(item));
    link.setAttribute('download', item.id + '.ics');
    link.hidden = false;
  });


  /* --- Partage ------------------------------------------------------------------- */

  const shareUrl = window.location.href;

  document.querySelectorAll('[data-share="whatsapp"]').forEach(function (link) {
    link.href = 'https://wa.me/?text=' + encodeURIComponent(item.titre + ' ' + shareUrl);
  });
  document.querySelectorAll('[data-share="facebook"]').forEach(function (link) {
    link.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl);
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(area);
      if (ok) resolve(); else reject(new Error('copy'));
    });
  }

  const shareStatus = document.querySelector('.article-share-status');
  let statusTimer = null;

  function announce(message) {
    if (!shareStatus) return;
    shareStatus.textContent = message;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function () { shareStatus.textContent = ''; }, 4000);
  }

  document.querySelectorAll('[data-share="copy"]').forEach(function (button) {
    button.addEventListener('click', function () {
      copyText(shareUrl).then(
        function () { announce('Lien copié dans le presse-papiers.'); },
        function () { announce("Copie impossible : copiez l'adresse depuis la barre du navigateur."); }
      );
    });
  });


  /* --- Photos ou encart compact ------------------------------------------------ */

  const PHOTOS_VISIBLES = 4;      // sur une ligne (desktop) ; les suivantes : « +N » sur la dernière
  const PHOTO_H_MIN     = 150;    // hauteur (px) en dessous de laquelle les photos ne rétrécissent pas
  const PHOTO_PLATE     = 3.2;    // largeur / hauteur maximale d'une photo réduite : au-delà, les visages sont coupés
  const PHOTO_ETROITE   = 1.9;    // hauteur / largeur au-delà de laquelle 3 ou 4 photos passent sur 2 rangées
  const ECART_COMPACT   = 120;    // vide (px) à partir duquel l'encart passe sur deux colonnes

  const photos  = (item.photos || []).filter(function (photo) { return photo && photo.src; });
  const article = page.querySelector('.article');
  const aside   = page.querySelector('.detail-aside');
  const desktop = window.matchMedia('(min-width: 992px)');

  /** Mise en page mesurée : au départ, puis dès que le texte ou l'encart changent de
      taille (polices et icônes chargées après coup) ou que la fenêtre change. */
  function keepMeasured(measure) {
    let frame = 0;
    const schedule = function () {
      if (frame) return;
      frame = window.requestAnimationFrame(function () { frame = 0; measure(); });
    };
    measure();
    window.addEventListener('load', schedule);
    window.addEventListener('resize', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(schedule);
      observer.observe(article);
      observer.observe(aside);
    }
  }

  if (photos.length) {
    const visibles = Math.min(photos.length, PHOTOS_VISIBLES);
    const autres   = photos.length - visibles;

    fields('photos').forEach(function (list) {
      list.dataset.count = String(photos.length);
      list.style.setProperty('--photos', String(visibles));
      list.innerHTML = photos.map(function (photo, index) {
        const more = autres > 0 && index === visibles - 1;
        const name = 'Agrandir : ' + (photo.legende || photo.alt || 'photo') +
          (more ? ' (' + autres + ' ' + U.pluralize(autres, 'autre photo', 'autres photos') + ' à voir)' : '');
        return '<li class="article-photo">' +
          '<button type="button" class="gallery-thumb article-photo-btn" data-index="' + index + '" aria-label="' + esc(name) + '">' +
            '<img src="' + esc(photo.src) + '" alt="' + esc(photo.alt || '') + '" loading="lazy" width="800" height="600">' +
            '<span class="gallery-thumb-overlay" aria-hidden="true"><ion-icon name="expand-outline"></ion-icon></span>' +
            (more ? '<span class="article-photo-more" aria-hidden="true">+' + autres + '</span>' : '') +
          '</button>' +
        '</li>';
      }).join('');
    });
    show('photos-box', true);
    layout.classList.add('detail-layout--photos');

    /* Desktop : le CSS étire les photos jusqu'au bas de l'encart quand il reste de la
       place. Ici : les réduire si elles le dépassent, tant que le cadrage reste correct
       (sinon elles gardent leur hauteur et l'encart collant les rejoint au défilement),
       et passer sur 2 rangées si elles deviennent trop étroites. L'encart étant collant,
       son bas se calcule depuis le haut de la rangée, pas depuis sa position. */
    const list = page.querySelector('.article-photos-list');

    keepMeasured(function () {
      list.style.minHeight = '';
      list.classList.remove('article-photos-list--rows');
      if (!desktop.matches) return;

      const width = list.querySelector('.article-photo').getBoundingClientRect().width;
      const box   = list.getBoundingClientRect();
      const free  = layout.getBoundingClientRect().top + aside.getBoundingClientRect().height - box.top;

      if (free < box.height && free >= Math.max(PHOTO_H_MIN, width / PHOTO_PLATE)) list.style.minHeight = free + 'px';
      if (visibles > 2 && list.getBoundingClientRect().height / width > PHOTO_ETROITE) {
        list.classList.add('article-photos-list--rows');
      }
    });

    const viewer = typeof RF_LIGHTBOX !== 'undefined' ? RF_LIGHTBOX.create(document.querySelector('.lightbox')) : null;
    if (viewer) {
      const slides = photos.map(function (photo) {
        return { src: photo.src, alt: photo.alt, legende: photo.legende, surtitre: item.titre };
      });
      page.addEventListener('click', function (e) {
        const button = e.target.closest('.article-photo-btn');
        if (button) viewer.open(slides, Number(button.dataset.index), button);
      });
    }

  } else {
    /* sans photo : informations de l'encart sur deux colonnes seulement s'il dépasse
       nettement du texte. Mesuré dans la disposition normale, à chaque changement. */
    keepMeasured(function () {
      layout.classList.remove('detail-layout--compact');
      if (!desktop.matches) return;
      const vide = aside.getBoundingClientRect().height - article.getBoundingClientRect().height;
      layout.classList.toggle('detail-layout--compact', vide > ECART_COMPACT);
    });
  }


  /* --- À lire aussi ---------------------------------------------------------- */

  if (related) {
    const grid = related.querySelector('.blog-grid');
    const others = list.filter(function (entry) { return entry.id !== item.id; });
    const picks = others.filter(function (entry) { return entry.categorie === item.categorie; })
      .concat(others.filter(function (entry) { return entry.categorie !== item.categorie; }))
      .slice(0, 3);

    if (!grid || !picks.length) {
      related.hidden = true;
      page.classList.add('detail--last');
    } else {
      const fragment = document.createDocumentFragment();
      picks.forEach(function (entry) { fragment.appendChild(CARD.create(entry)); });
      grid.appendChild(fragment);
    }
  }

})();
