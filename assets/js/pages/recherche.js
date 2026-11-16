'use strict';

/**
 * assets/js/pages/recherche.js
 * ============================================================================
 * Recherche du site (recherche.html?q=…), faite dans le navigateur à partir des
 * fichiers de données : formations, actualités publiées, questions fréquentes,
 * documents, enseignants, albums photo et pages du site (assets/data/pages.js).
 *  - le formulaire du header (toutes les pages) envoie ici avec ?q= ;
 *  - insensible aux accents et à la casse ; mots vides ignorés (« de »,
 *    « pour », « comment »…) ; pluriel en -s toléré (« formations ») ;
 *  - tous les mots doivent être trouvés ; à défaut, résultats approchants
 *    (au moins un mot), signalés comme tels ;
 *  - résultats groupés par type, le groupe le plus pertinent en premier ; un mot
 *    trouvé dans le titre compte plus que dans le texte, surtout en début de titre ;
 *    à score égal, une page du site passe devant (« contact », « préinscription ») ;
 *    mots surlignés (<mark>) dans le titre et dans un extrait centré sur le premier
 *    mot trouvé ;
 *  - filtre par type (boutons .news-filter) ; ?q=…&type=… dans l'URL ;
 *  - recherche en direct pendant la saisie ; suggestions quand le champ est vide.
 *
 * À charger APRÈS les données (formations, actualites, faq, documents,
 * formateurs, galerie, pages), utils.js, formation-card.js et actu-card.js, et
 * AVANT premium-animations.js. Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : recherche côté serveur (Laravel Scout ou recherche plein
 * texte PostgreSQL) rendue dans la même page.
 * ============================================================================
 */

(function () {

  if (typeof RF_UTILS === 'undefined') return;

  const U   = RF_UTILS;
  const esc = U.escapeHtml;

  const ETABS    = typeof RF_ETABLISSEMENTS !== 'undefined' ? RF_ETABLISSEMENTS : {};
  const NIVEAUX  = typeof RF_NIVEAUX !== 'undefined' ? RF_NIVEAUX : {};
  const DOMAINES = typeof RF_DOMAINES !== 'undefined' ? RF_DOMAINES : {};
  const CARD     = typeof RF_FORMATION_CARD !== 'undefined' ? RF_FORMATION_CARD : null;
  const ACTU     = typeof RF_ACTU_CARD !== 'undefined' ? RF_ACTU_CARD : null;

  const PER_GROUP = 4;          // résultats par type dans la vue « Tout »


  /* --- Texte : repli des accents, mots de la requête -------------------------- */

  /** caractère sans accent, en minuscule (apostrophe typographique ramenée à « ' ») ;
   *  la longueur est conservée : les positions trouvées servent au surlignage */
  function foldChar(ch) {
    if (ch === '’') return "'";
    const base  = String.fromCodePoint(ch.normalize('NFD').codePointAt(0));
    const lower = base.toLowerCase();
    return lower.length === ch.length ? lower : (base.length === ch.length ? base : ch);
  }

  function fold(text) { return Array.from(String(text || '')).map(foldChar).join(''); }

  /* mots trop courants pour départager les résultats (comparés sans accents) */
  const STOP = ('au aux avec ce ces cet cette dans de des du elle en est et il ils je la le les leur ' +
    'lui ma mais me mes mon ne nos notre nous on ou par pas pour qu que qui sa se ses son sur ta te ' +
    'tes ton tu un une vos votre vous comment quel quelle quels quelles quand pourquoi faut peut puis').split(' ');

  /** « Les frais de formations ? » -> ['frai', 'formation'] */
  function parse(query) {
    return fold(query).split(/[\s'.,;:!?()«»"/]+/)
      .map(function (w) { return w.replace(/^-+|-+$/g, ''); })
      .filter(function (w) { return w.length > 1 && STOP.indexOf(w) === -1; })
      .map(function (w) { return w.length > 4 ? w.replace(/s$/, '') : w; })
      .filter(function (w, i, all) { return all.indexOf(w) === i; });
  }

  const LETTER = /[\p{L}\p{N}]/u;

  /** texte échappé, mots trouvés entourés de <mark> ; le mot entier est surligné
   *  (« infirmier » trouvé dans « Infirmières » surligne « Infirmières ») */
  function highlight(text, words) {
    text = String(text || '');
    if (!words.length) return esc(text);
    const folded = fold(text);
    const marks = [];
    words.forEach(function (word) {
      let index = folded.indexOf(word);
      while (index !== -1) {
        let from = index;
        let to = index + word.length;
        while (from > 0 && LETTER.test(text.charAt(from - 1))) from--;
        while (to < text.length && LETTER.test(text.charAt(to))) to++;
        for (let k = from; k < to; k++) marks[k] = true;
        index = folded.indexOf(word, to);
      }
    });
    let html = '';
    let open = false;
    for (let i = 0; i < text.length; i++) {
      if (marks[i] && !open) { html += '<mark>'; open = true; }
      if (!marks[i] && open) { html += '</mark>'; open = false; }
      html += esc(text.charAt(i));
    }
    return html + (open ? '</mark>' : '');
  }

  /** extrait d'environ `size` caractères autour du premier mot trouvé, coupé entre deux mots */
  function excerpt(text, words, size) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    size = size || 190;
    if (text.length <= size) return highlight(text, words);
    const folded = fold(text);
    let pos = -1;
    words.forEach(function (w) {
      const i = folded.indexOf(w);
      if (i !== -1 && (pos === -1 || i < pos)) pos = i;
    });
    let start = pos > 70 ? pos - 70 : 0;
    if (start > 0) {
      const space = text.indexOf(' ', start);
      start = space !== -1 && space < pos ? space + 1 : start;
    }
    let end = Math.min(text.length, start + size);
    if (end < text.length) {
      const space = text.lastIndexOf(' ', end);
      if (space > start) end = space;
    }
    return (start > 0 ? '… ' : '') + highlight(text.slice(start, end), words) + (end < text.length ? ' …' : '');
  }


  /* --- Index : une entrée par élément trouvable ------------------------------ */

  function sigle(key) { return key && ETABS[key] ? ETABS[key].sigle : ''; }

  function etabText(key) { return key && ETABS[key] ? ETABS[key].sigle + ' ' + ETABS[key].nom : ''; }

  function join(parts, sep) { return parts.filter(Boolean).join(sep || ' · '); }

  /** blocs de contenu d'une actualité (chaînes, { titre }, { liste }, { citation }) en texte */
  function plainBlocks(blocks) {
    return (blocks || []).map(function (b) {
      if (typeof b === 'string') return b;
      if (!b) return '';
      if (b.liste) return b.liste.join('. ');
      if (b.citation) return b.citation + (b.auteur ? ' ' + b.auteur : '');
      return b.titre || '';
    }).join(' ');
  }

  const TYPES = [];
  function source(key, titre, icone, items) {
    if (items && items.length) TYPES.push({ key: key, titre: titre, icone: icone, items: items });
  }

  if (typeof RF_FORMATIONS !== 'undefined') {
    source('formations', 'Formations', 'school-outline', RF_FORMATIONS.map(function (f) {
      const dispo = CARD ? CARD.LABELS[CARD.disponibilite(f)] : '';
      return {
        title: f.titre,
        url: CARD ? CARD.detailUrl(f) : 'formation-detail.html?id=' + encodeURIComponent(f.id),
        meta: join([sigle(f.etablissement), NIVEAUX[f.niveau], f.duree, dispo]),
        text: join([f.resume, f.description,
          (f.debouches || []).length ? 'Débouchés : ' + f.debouches.join(', ') + '.' : '',
          (f.modules || []).length ? 'Programme : ' + f.modules.join(', ') + '.' : '',
          f.diplome], ' '),
        extra: join([f.sousTitre, DOMAINES[f.domaine], etabText(f.etablissement),
          (f.objectifs || []).join(' '), (f.conditionsAdmission || []).join(' '), f.rythme], ' ')
      };
    }));
  }

  if (typeof RF_ACTUALITES !== 'undefined') {
    const news = ACTU ? ACTU.published(RF_ACTUALITES) : RF_ACTUALITES.filter(function (a) { return a.publie === true; });
    const labels = typeof RF_CATEGORIES_ACTU !== 'undefined' ? RF_CATEGORIES_ACTU : {};
    source('actualites', 'Actualités et événements', 'newspaper-outline', news.map(function (a) {
      const when = a.estEvenement && a.dateEvenement
        ? 'le ' + U.formatDate(a.dateEvenement)
        : 'publié le ' + U.formatDate(a.date);
      return {
        title: a.titre,
        url: ACTU ? ACTU.detailUrl(a) : 'actualite-detail.html?id=' + encodeURIComponent(a.id),
        meta: join([labels[a.categorie], when, sigle(a.etablissement)]),
        text: join([a.extrait, plainBlocks(a.contenu)], ' '),
        extra: join([a.lieu, etabText(a.etablissement)], ' ')
      };
    }));
  }

  if (typeof RF_FAQ !== 'undefined') {
    const themes = typeof RF_FAQ_CATEGORIES !== 'undefined' ? RF_FAQ_CATEGORIES : {};
    source('faq', 'Questions fréquentes', 'help-circle-outline', RF_FAQ.map(function (q) {
      return {
        title: q.question,
        url: 'faq.html#' + encodeURIComponent(q.id),
        meta: themes[q.categorie] ? themes[q.categorie].titre : '',
        text: plainBlocks(q.reponse),
        extra: ''
      };
    }));
  }

  if (typeof RF_DOCUMENTS !== 'undefined') {
    const cats = typeof RF_CATEGORIES_DOCS !== 'undefined' ? RF_CATEGORIES_DOCS : {};
    const kinds = { pdf: 'PDF', docx: 'Word', xlsx: 'Excel' };
    source('documents', 'Documents', 'document-text-outline', RF_DOCUMENTS.map(function (d) {
      const taille = d.taille >= 1024 ? (d.taille / 1024).toFixed(1).replace('.', ',') + ' Mo' : d.taille + ' Ko';
      return {
        title: d.titre,
        // la page Documents filtre sur ?q= : le document y apparaît avec son bouton
        url: 'documents.html?q=' + encodeURIComponent(d.titre),
        meta: join([cats[d.categorie] ? cats[d.categorie].titre : '', kinds[d.type] || String(d.type).toUpperCase(), taille, sigle(d.etablissement)]),
        text: d.description,
        extra: etabText(d.etablissement)
      };
    }));
  }

  if (typeof RF_FORMATEURS !== 'undefined') {
    source('enseignants', 'Enseignants', 'people-outline', RF_FORMATEURS.map(function (p) {
      return {
        title: p.nom,
        url: 'formateurs.html#' + encodeURIComponent(p.id),          // la fiche s'ouvre à l'arrivée
        meta: join([p.fonction, sigle(p.etablissement)]),
        text: join([p.specialite + '.', p.bio], ' '),
        extra: etabText(p.etablissement)
      };
    }));
  }

  if (typeof RF_GALERIE !== 'undefined') {
    source('galerie', 'Albums photo', 'images-outline', RF_GALERIE.map(function (album) {
      const photos = album.photos || [];
      return {
        title: album.titre,
        url: 'galerie.html?album=' + encodeURIComponent(album.id),
        meta: join([photos.length + ' ' + U.pluralize(photos.length, 'photo', 'photos'), sigle(album.etablissement)]),
        text: join([album.description, photos.map(function (ph) { return ph.legende; }).join('. ')], ' '),
        extra: etabText(album.etablissement)
      };
    }));
  }

  if (typeof RF_PAGES_SITE !== 'undefined') {
    source('pages', 'Pages du site', 'compass-outline', RF_PAGES_SITE.map(function (pg) {
      return { title: pg.titre, url: pg.url, meta: '', text: pg.description, extra: '', keys: pg.motsCles, page: true };
    }));
  }

  /* texte de recherche de chaque entrée, calculé une fois */
  TYPES.forEach(function (type) {
    type.items.forEach(function (item) {
      item.titleF = fold(item.title);
      item.keysF  = fold(item.keys || '');
      item.bodyF  = fold([item.title, item.meta, item.text, item.extra, item.keys].join(' '));
    });
  });


  /* --- Recherche et score ------------------------------------------------------ */

  function startsWord(folded, word) {
    let i = folded.indexOf(word);
    while (i !== -1) {
      if (i === 0 || /[^a-z0-9]/.test(folded.charAt(i - 1))) return true;
      i = folded.indexOf(word, i + 1);
    }
    return false;
  }

  /** score d'une entrée pour un mot (0 : absent) ; le titre pèse plus que le texte, son début
   *  encore plus ; une page du site dont le titre contient le mot est une requête de navigation */
  function wordScore(item, word) {
    if (item.titleF.indexOf(word) !== -1) {
      return 10 + (startsWord(item.titleF, word) ? 5 : 0) +
        (item.titleF.indexOf(word) === 0 ? 3 : 0) + (item.page ? 3 : 0);
    }
    if (item.keysF.indexOf(word) !== -1) return 6;
    if (item.bodyF.indexOf(word) !== -1) return startsWord(item.bodyF, word) ? 2 : 1;
    return 0;
  }

  /** { groups: [{ type, results }], total, approx } ; approx : aucun résultat avec tous les mots */
  function search(words) {
    function run(all) {
      const groups = [];
      TYPES.forEach(function (type, order) {
        const results = [];
        type.items.forEach(function (item) {
          let score = 0;
          let found = 0;
          words.forEach(function (w) {
            const s = wordScore(item, w);
            if (s) { score += s; found++; }
          });
          if (all ? found === words.length : found > 0) results.push({ item: item, score: score * found });
        });
        if (results.length) {
          results.sort(function (a, b) { return b.score - a.score; });       // tri stable : ordre des données à score égal
          groups.push({ type: type, order: order, results: results, best: results[0].score });
        }
      });
      groups.sort(function (a, b) { return b.best - a.best || a.order - b.order; });
      return groups;
    }
    if (!words.length) return { groups: [], total: 0, approx: false };
    let groups = run(true);
    let approx = false;
    if (!groups.length && words.length > 1) { groups = run(false); approx = groups.length > 0; }
    const total = groups.reduce(function (sum, g) { return sum + g.results.length; }, 0);
    return { groups: groups, total: total, approx: approx };
  }


  /* --- Affichage ---------------------------------------------------------------- */

  const form     = document.querySelector('.search-page-form');
  const input    = document.querySelector('.search-page-input');
  const toolbar  = document.querySelector('.search-toolbar');
  const filters  = document.querySelector('.search-filters');
  const counter  = document.querySelector('.search-count');
  const notice   = document.querySelector('.search-notice');
  const list     = document.querySelector('.search-groups');
  const empty    = document.querySelector('.search-empty');
  const start    = document.querySelector('.search-start');
  if (!input || !list) return;

  /* l'état « aucun résultat » propose les mêmes recherches fréquentes que l'accueil de la page */
  const suggestions = start && start.querySelector('.search-suggestions');
  document.querySelectorAll('[data-suggestions-copy]').forEach(function (ul) {
    if (suggestions) ul.innerHTML = suggestions.innerHTML;
  });

  const BASE_TITLE = document.title;
  let current = '';
  const wantedType = U.getParam('type');
  input.value = U.getParam('q') || '';

  function resultHtml(item, words) {
    return (
      '<li class="search-result">' +
        '<h3 class="search-result-title"><a href="' + esc(item.url) + '">' + highlight(item.title, words) + '</a></h3>' +
        (item.meta ? '<p class="search-result-meta">' + esc(item.meta) + '</p>' : '') +
        (item.text ? '<p class="search-result-excerpt">' + excerpt(item.text, words) + '</p>' : '') +
      '</li>'
    );
  }

  function groupHtml(group, words, all) {
    const type = group.type;
    const shown = all ? group.results : group.results.slice(0, PER_GROUP);
    const more = group.results.length - shown.length;
    return (
      '<section class="search-group" aria-labelledby="search-group-' + type.key + '">' +
        '<h2 class="search-group-title" id="search-group-' + type.key + '" tabindex="-1">' +
          '<ion-icon name="' + type.icone + '" aria-hidden="true"></ion-icon>' +
          '<span class="search-group-name">' + esc(type.titre) + '</span>' +
          '<span class="search-group-count">' + group.results.length +
            '<span class="visually-hidden"> ' + U.pluralize(group.results.length, 'résultat', 'résultats') + '</span></span>' +
        '</h2>' +
        '<ol class="search-list">' +
          shown.map(function (r) { return resultHtml(r.item, words); }).join('') +
        '</ol>' +
        (more > 0
          ? '<button type="button" class="search-more" data-type="' + type.key + '">' +
              'Voir les ' + group.results.length + ' résultats<span class="visually-hidden"> : ' + esc(type.titre) + '</span>' +
              '<ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon>' +
            '</button>'
          : '') +
      '</section>'
    );
  }

  function syncUrl(query) {
    const params = new URLSearchParams(window.location.search);
    if (query) params.set('q', query); else params.delete('q');
    if (current) params.set('type', current); else params.delete('type');
    const qs = params.toString();
    try {
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    } catch (e) { /* file:// : sans conséquence */ }
  }

  let typeChecked = false;

  function render() {
    const query = input.value.trim();
    const words = parse(query);
    const res = search(words);

    /* filtre demandé dans l'URL : appliqué une fois, s'il a des résultats */
    if (!typeChecked) {
      typeChecked = true;
      if (res.groups.some(function (g) { return g.type.key === wantedType; })) current = wantedType;
    }
    if (current && !res.groups.some(function (g) { return g.type.key === current; })) current = '';

    const groups = current ? res.groups.filter(function (g) { return g.type.key === current; }) : res.groups;

    if (start) start.hidden = query !== '';
    if (toolbar) toolbar.hidden = res.total === 0;
    if (empty) {
      empty.hidden = query === '' || res.total > 0;
      const title = empty.querySelector('[data-search-empty-title]');
      if (title) title.textContent = 'Aucun résultat pour « ' + query + ' »';
    }
    if (notice) {
      notice.hidden = !res.approx;
      notice.innerHTML = res.approx
        ? '<ion-icon name="information-circle-outline" aria-hidden="true"></ion-icon>' +
          '<span>Aucun contenu ne contient tous ces mots. Voici ceux qui en contiennent au moins un.</span>'
        : '';
    }

    if (filters) {
      filters.innerHTML = res.total
        ? '<button type="button" class="news-filter' + (current ? '' : ' is-active') + '" data-type="" aria-pressed="' + (current ? 'false' : 'true') + '">' +
            'Tout<span class="news-filter-count">' + res.total + '</span></button>' +
          res.groups.map(function (g) {
            const on = g.type.key === current;
            return '<button type="button" class="news-filter' + (on ? ' is-active' : '') + '" data-type="' + g.type.key + '" aria-pressed="' + on + '">' +
              '<ion-icon name="' + g.type.icone + '" aria-hidden="true"></ion-icon>' + esc(g.type.titre) +
              '<span class="news-filter-count">' + g.results.length + '</span></button>';
          }).join('')
        : '';
    }

    if (counter) {
      counter.innerHTML = res.total
        ? '<strong>' + res.total + '</strong> ' + U.pluralize(res.total, 'résultat', 'résultats') +
          ' pour « ' + esc(query) + ' »'
        : '';
    }

    list.innerHTML = groups.map(function (g) { return groupHtml(g, words, !!current); }).join('');

    document.title = query ? 'Recherche « ' + query + ' » — ' + BASE_TITLE.replace(/^Recherche — /, '') : BASE_TITLE;
    syncUrl(query);
  }


  /* --- Interactions -------------------------------------------------------------- */

  input.addEventListener('input', render);

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      render();
      if (input.value.trim()) input.blur();          // mobile : referme le clavier sur les résultats
      else input.focus();
    });
  }

  if (filters) {
    filters.addEventListener('click', function (e) {
      const button = e.target.closest('[data-type]');
      if (!button) return;
      current = button.dataset.type;
      render();
    });
  }

  /* « Voir les N résultats » : filtre sur le type, focus sur son titre */
  list.addEventListener('click', function (e) {
    const button = e.target.closest('.search-more');
    if (!button) return;
    current = button.dataset.type;
    render();
    const heading = document.getElementById('search-group-' + current);
    if (heading) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start' });
    }
  });

  /* recherches fréquentes : relance sur place, sans recharger la page */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('[data-suggest]');
    if (!link) return;
    e.preventDefault();
    input.value = link.dataset.suggest;
    current = '';
    render();
    if (counter) counter.focus({ preventScroll: true });
    const results = document.querySelector('.search');
    if (results) results.scrollIntoView({ block: 'start' });
  });

  render();
  if (!input.value.trim()) input.focus({ preventScroll: true });

})();
