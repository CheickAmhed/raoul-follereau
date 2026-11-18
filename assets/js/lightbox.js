'use strict';

/**
 * assets/js/lightbox.js
 * ============================================================================
 * Visionneuse de photos partagée (galerie.html, actualite-detail.html) : photo
 * en grand, légende, compteur, précédente / suivante (boutons, flèches du
 * clavier, glissement du doigt), fermeture par Échap, bouton ou clic sur le
 * fond ; le focus reste dans la visionneuse et revient sur l'élément d'origine à
 * la fermeture ; défilement de la page bloqué pendant l'ouverture ; photos
 * voisines préchargées.
 *
 * Global : RF_LIGHTBOX.
 *   const viewer = RF_LIGHTBOX.create(document.querySelector('.lightbox'));
 *   viewer.open(photos, indexDeDepart, boutonOrigine);
 *   photos[] : { src, alt, legende, surtitre } (legende et surtitre facultatifs).
 *
 * Le balisage .lightbox est présent dans chaque page qui l'utilise.
 * À charger AVANT le script de page. Vanilla JS, aucune dépendance.
 * ============================================================================
 */

const RF_LIGHTBOX = (function () {

  function create(box) {
    if (!box) return null;

    const img      = box.querySelector('.lightbox-img');
    const caption  = box.querySelector('.lightbox-caption');
    const surtitle = box.querySelector('.lightbox-album');
    const count    = box.querySelector('.lightbox-count');
    const prevBtn  = box.querySelector('.lightbox-prev');
    const nextBtn  = box.querySelector('.lightbox-next');
    const closeBtn = box.querySelector('.lightbox-close');

    let photos = [];      // photos parcourues
    let pos    = 0;       // position courante dans photos
    let opener = null;    // élément à refocaliser à la fermeture

    function preload(index) {
      const photo = photos[index];
      if (photo) { const image = new Image(); image.src = photo.src; }
    }

    function show(newPos) {
      pos = (newPos + photos.length) % photos.length;     // boucle aux extrémités
      const photo = photos[pos];
      // rejoue l'animation d'apparition (animation.css #GALERIE) à chaque photo
      img.style.animation = 'none';
      void img.offsetWidth;
      img.style.animation = '';
      img.src = photo.src;
      img.alt = photo.alt || '';
      caption.textContent = photo.legende || '';
      surtitle.textContent = photo.surtitre || '';
      count.textContent = (pos + 1) + ' / ' + photos.length;
      const single = photos.length < 2;
      prevBtn.hidden = single;
      nextBtn.hidden = single;
      if (!single) {
        preload((pos + 1) % photos.length);
        preload((pos - 1 + photos.length) % photos.length);
      }
    }

    function open(list, start, trigger) {
      if (!list || !list[start]) return;
      photos = list;
      opener = trigger || null;
      box.hidden = false;
      document.documentElement.classList.add('lightbox-open');
      show(start);
      closeBtn.focus();
      document.addEventListener('keydown', onKey);
    }

    function close() {
      if (box.hidden) return;
      box.hidden = true;
      document.documentElement.classList.remove('lightbox-open');
      document.removeEventListener('keydown', onKey);
      img.removeAttribute('src');
      if (opener) opener.focus();
    }

    /* focus piégé dans la visionneuse (boutons visibles uniquement) */
    function trapTab(e) {
      const focusables = Array.prototype.filter.call(box.querySelectorAll('button'), function (b) { return !b.hidden; });
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight' && photos.length > 1) { e.preventDefault(); show(pos + 1); }
      else if (e.key === 'ArrowLeft' && photos.length > 1) { e.preventDefault(); show(pos - 1); }
      else if (e.key === 'Tab') { trapTab(e); }
    }

    prevBtn.addEventListener('click', function () { show(pos - 1); });
    nextBtn.addEventListener('click', function () { show(pos + 1); });
    closeBtn.addEventListener('click', close);

    /* clic sur le fond (hors photo et boutons) : fermeture */
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox-stage')) close();
    });

    /* glissement horizontal (doigt ou stylet) : photo précédente / suivante */
    let startX = null;
    let startY = null;
    box.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      startX = e.clientX;
      startY = e.clientY;
    });
    box.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = null;
      if (photos.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(pos + (dx < 0 ? 1 : -1));
    });

    return { open: open, close: close };
  }

  return { create: create };

})();
