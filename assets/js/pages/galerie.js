'use strict';

/**
 * assets/js/pages/galerie.js
 * ============================================================================
 * Galerie photo (galerie.html) :
 *  - bannière : nombre de photos et d'albums ;
 *  - filtre par album (boutons + ?album= dans l'URL) et présentation de l'album choisi ;
 *  - grille de vignettes (boutons) générée depuis RF_GALERIE ;
 *  - ouverture des photos dans la visionneuse partagée (assets/js/lightbox.js).
 *
 * À charger APRÈS galerie.js (données), formations.js (sigles), utils.js,
 * lightbox.js, et AVANT premium-animations.js (cascade d'apparition des vignettes).
 * Vanilla JS, IIFE 'use strict', aucun global.
 * ============================================================================
 */

(function () {

  if (typeof RF_GALERIE === 'undefined' || typeof RF_UTILS === 'undefined') return;

  const U     = RF_UTILS;
  const esc   = U.escapeHtml;
  const ETABS = typeof RF_ETABLISSEMENTS !== 'undefined' ? RF_ETABLISSEMENTS : {};

  /* albums du plus récent au plus ancien ; liste à plat des photos avec leur album */
  const albums = RF_GALERIE.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  const photos = [];
  albums.forEach(function (album) {
    (album.photos || []).forEach(function (photo) { photos.push({ photo: photo, album: album }); });
  });


  /* --- Bannière ------------------------------------------------------------ */

  function setBadge(name, count, singular, plural) {
    document.querySelectorAll('[data-gallery-badge="' + name + '"]').forEach(function (el) {
      el.innerHTML = '<strong>' + count + '</strong> ' + U.pluralize(count, singular, plural);
    });
  }
  setBadge('photos', photos.length, 'photo', 'photos');
  setBadge('albums', albums.length, 'album', 'albums');


  /* --- Grille et filtres ------------------------------------------------------ */

  const grid    = document.querySelector('.gallery-grid');
  const filters = document.querySelector('.gallery-filters');
  const counter = document.querySelector('.gallery-count');
  const info    = document.querySelector('.gallery-album');
  if (!grid) return;

  function albumMeta(album) {
    const etab = album.etablissement && ETABS[album.etablissement];
    return U.formatDate(album.date, { month: 'long', year: 'numeric' }) + ' · ' + (etab ? etab.sigle : 'Les trois établissements');
  }

  /* boutons de filtre : « Tous » puis un bouton par album (styles .news-filter) */
  if (filters) {
    filters.innerHTML =
      '<button type="button" class="news-filter" data-album="" aria-pressed="true">Toutes<span class="news-filter-count">' + photos.length + '</span></button>' +
      albums.map(function (album) {
        return '<button type="button" class="news-filter" data-album="' + esc(album.id) + '" aria-pressed="false">' +
          esc(album.titre) + '<span class="news-filter-count">' + (album.photos || []).length + '</span></button>';
      }).join('');
  }

  const tiles = photos.map(function (entry, index) {
    const tile = document.createElement('li');
    tile.className = 'gallery-item';
    tile.dataset.album = entry.album.id;
    tile.innerHTML =
      '<button type="button" class="gallery-thumb" data-index="' + index + '" aria-label="Agrandir : ' + esc(entry.photo.legende || entry.photo.alt) + '">' +
        '<img src="' + esc(entry.photo.src) + '" alt="' + esc(entry.photo.alt) + '" loading="lazy" width="400" height="300">' +
        '<span class="gallery-thumb-overlay" aria-hidden="true">' +
          '<span class="gallery-thumb-album">' + esc(entry.album.titre) + '</span>' +
          '<ion-icon name="expand-outline"></ion-icon>' +
        '</span>' +
      '</button>';
    grid.appendChild(tile);
    return tile;
  });

  const wanted = U.getParam('album');
  let current = albums.some(function (album) { return album.id === wanted; }) ? wanted : '';

  /** photos visibles (ordre de la grille) : la visionneuse ne parcourt que celles-ci */
  function visible() {
    return photos.map(function (entry, index) { return index; })
      .filter(function (index) { return !current || photos[index].album.id === current; });
  }

  function syncUrl() {
    const params = new URLSearchParams(window.location.search);
    if (current) params.set('album', current); else params.delete('album');
    const query = params.toString();
    try {
      window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    } catch (e) { /* file:// : sans conséquence */ }
  }

  function apply() {
    const shown = visible();
    tiles.forEach(function (tile, index) { tile.hidden = shown.indexOf(index) === -1; });

    if (filters) {
      filters.querySelectorAll('[data-album]').forEach(function (button) {
        const on = button.dataset.album === current;
        button.classList.toggle('is-active', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    const album = albums.find(function (a) { return a.id === current; });
    if (info) {
      info.hidden = !album;
      if (album) {
        info.querySelector('[data-album-field="titre"]').textContent = album.titre;
        info.querySelector('[data-album-field="meta"]').textContent = albumMeta(album);
        info.querySelector('[data-album-field="description"]').textContent = album.description || '';
      }
    }

    if (counter) {
      counter.innerHTML = '<strong>' + shown.length + '</strong> ' + U.pluralize(shown.length, 'photo', 'photos') +
        (album ? '' : ' · ' + albums.length + ' ' + U.pluralize(albums.length, 'album', 'albums'));
    }
    syncUrl();
  }

  if (filters) {
    filters.addEventListener('click', function (e) {
      const button = e.target.closest('[data-album]');
      if (!button) return;
      current = button.dataset.album;
      apply();
    });
  }

  apply();


  /* --- Visionneuse (assets/js/lightbox.js) ------------------------------------ */

  if (typeof RF_LIGHTBOX === 'undefined') return;

  const viewer = RF_LIGHTBOX.create(document.querySelector('.lightbox'));
  if (!viewer) return;

  /* la visionneuse ne parcourt que les photos visibles (album filtré) */
  grid.addEventListener('click', function (e) {
    const thumb = e.target.closest('.gallery-thumb');
    if (!thumb) return;
    const order = visible();
    const start = order.indexOf(Number(thumb.dataset.index));
    if (start === -1) return;
    viewer.open(order.map(function (index) {
      const entry = photos[index];
      return { src: entry.photo.src, alt: entry.photo.alt, legende: entry.photo.legende, surtitre: entry.album.titre };
    }), start, thumb);
  });

})();
