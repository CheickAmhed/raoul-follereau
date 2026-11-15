'use strict';

/**
 * assets/js/pages/faq.js
 * ============================================================================
 * Foire aux questions (faq.html) :
 *  - bannière : nombre de questions et de thèmes ;
 *  - questions regroupées par thème, en accordéon natif <details>/<summary>
 *    (clavier et lecteurs d'écran gérés par le navigateur) ;
 *  - recherche insensible aux accents et à la casse, mots trouvés surlignés
 *    (<mark>), questions correspondantes dépliées ; filtre par thème
 *    (boutons .news-filter) ; ?q=…&theme=… dans l'URL ;
 *  - « Tout déplier / Tout replier » sur les questions affichées ;
 *  - lien direct vers une question (faq.html#id) : elle s'ouvre à l'arrivée,
 *    et l'adresse suit la question ouverte, pour la partager ;
 *  - balisage FAQPage (schema.org, JSON-LD) généré depuis les mêmes données.
 *
 * À charger APRÈS faq.js (données) et utils.js, et AVANT premium-animations.js.
 * Vanilla JS, IIFE 'use strict', aucun global.
 * TODO (phase Laravel) : questions et JSON-LD rendus côté serveur.
 * ============================================================================
 */

(function () {

  if (typeof RF_FAQ === 'undefined' || typeof RF_FAQ_CATEGORIES === 'undefined' ||
      typeof RF_UTILS === 'undefined') return;

  const U    = RF_UTILS;
  const esc  = U.escapeHtml;
  const CATS = RF_FAQ_CATEGORIES;

  const items   = RF_FAQ.slice();
  const catKeys = Object.keys(CATS).filter(function (key) {
    return items.some(function (q) { return q.categorie === key; });
  });


  /* --- Recherche : repli des accents et surlignage ---------------------------- */

  /** un caractère sans accent, en minuscule : la longueur du texte est conservée,
   *  ce qui permet de surligner aux mêmes positions que dans le texte d'origine */
  function foldChar(ch) { return ch.normalize('NFD').charAt(0).toLowerCase(); }

  function fold(text) { return Array.from(String(text || '')).map(foldChar).join(''); }

  /** texte échappé, occurrences des mots entourées de <mark> */
  function highlight(text, words) {
    if (!words.length) return esc(text);
    const folded = fold(text);
    const marks = [];
    words.forEach(function (word) {
      let index = folded.indexOf(word);
      while (index !== -1) {
        for (let k = index; k < index + word.length; k++) marks[k] = true;
        index = folded.indexOf(word, index + word.length);
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

  function answerHtml(q, words) {
    const blocks = (q.reponse || []).map(function (block) {
      if (typeof block === 'string') return '<p>' + highlight(block, words) + '</p>';
      if (block && block.liste) {
        return '<ul>' + block.liste.map(function (line) { return '<li>' + highlight(line, words) + '</li>'; }).join('') + '</ul>';
      }
      return '';
    }).join('');
    const links = (q.liens || []).length
      ? '<p class="faq-links">' + q.liens.map(function (link) {
          return '<a href="' + esc(link.href) + '">' + esc(link.texte) +
            '<ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon></a>';
        }).join('') + '</p>'
      : '';
    return blocks + links;
  }

  function plainAnswer(q) {
    return (q.reponse || []).map(function (block) {
      return typeof block === 'string' ? block : (block && block.liste ? block.liste.join(' ') : '');
    }).join(' ');
  }


  /* --- Bannière ------------------------------------------------------------ */

  document.querySelectorAll('[data-faq-badge="questions"]').forEach(function (el) {
    el.innerHTML = '<strong>' + items.length + '</strong> ' + U.pluralize(items.length, 'question', 'questions');
  });
  document.querySelectorAll('[data-faq-badge="themes"]').forEach(function (el) {
    el.innerHTML = '<strong>' + catKeys.length + '</strong> ' + U.pluralize(catKeys.length, 'thème', 'thèmes');
  });


  /* --- Rendu : un groupe par thème, une question par <details> -------------- */

  const groups  = document.querySelector('.faq-groups');
  const filters = document.querySelector('.faq-filters');
  const search  = document.querySelector('.faq-search-input');
  const counter = document.querySelector('.faq-count');
  const empty   = document.querySelector('.faq-empty');
  const expand  = document.querySelector('.faq-expand');
  if (!groups) return;

  if (filters) {
    filters.innerHTML =
      '<button type="button" class="news-filter" data-theme="" aria-pressed="true">Toutes<span class="news-filter-count">' + items.length + '</span></button>' +
      catKeys.map(function (key) {
        const count = items.filter(function (q) { return q.categorie === key; }).length;
        return '<button type="button" class="news-filter" data-theme="' + key + '" aria-pressed="false">' +
          '<ion-icon name="' + CATS[key].icone + '" aria-hidden="true"></ion-icon>' + esc(CATS[key].titre) +
          '<span class="news-filter-count">' + count + '</span></button>';
      }).join('');
  }

  groups.innerHTML = catKeys.map(function (key) {
    return (
      '<section class="faq-group" data-theme="' + key + '" aria-labelledby="faq-group-' + key + '">' +
        '<h2 class="faq-group-title" id="faq-group-' + key + '">' +
          '<ion-icon name="' + CATS[key].icone + '" aria-hidden="true"></ion-icon>' + esc(CATS[key].titre) +
        '</h2>' +
        '<div class="faq-list">' +
          items.filter(function (q) { return q.categorie === key; }).map(function (q) {
            return (
              '<details class="faq-item" id="' + esc(q.id) + '">' +
                '<summary class="faq-question">' +
                  '<span class="faq-q-text"></span>' +
                  '<ion-icon name="chevron-down-outline" aria-hidden="true"></ion-icon>' +
                '</summary>' +
                '<div class="faq-answer"></div>' +
              '</details>'
            );
          }).join('') +
        '</div>' +
      '</section>'
    );
  }).join('');

  const rows = items.map(function (q) {
    const el = document.getElementById(q.id);
    return {
      q: q,
      el: el,
      question: el.querySelector('.faq-q-text'),
      answer: el.querySelector('.faq-answer'),
      text: fold(q.question + ' ' + plainAnswer(q) + ' ' + CATS[q.categorie].titre)
    };
  });


  /* --- Filtres --------------------------------------------------------------- */

  const wantedTheme = U.getParam('theme');
  let current = catKeys.indexOf(wantedTheme) !== -1 ? wantedTheme : '';
  if (search && U.getParam('q')) search.value = U.getParam('q');

  function words() {
    return fold(search ? search.value : '').split(/\s+/).filter(Boolean);
  }

  function visibleRows() { return rows.filter(function (r) { return !r.el.hidden; }); }

  /** ouverture / fermeture par le script : marquée pour que l'événement « toggle »
   *  (asynchrone) ne modifie pas l'adresse ; seulement si l'état change vraiment,
   *  sinon aucun événement ne viendrait consommer la marque */
  function setOpen(el, value) {
    if (el.open === value) return;
    el.dataset.silent = '1';
    el.open = value;
  }

  function syncExpand() {
    if (!expand) return;
    const shown = visibleRows();
    const allOpen = shown.length > 0 && shown.every(function (r) { return r.el.open; });
    expand.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
    const label = expand.querySelector('span');
    if (label) label.textContent = allOpen ? 'Tout replier' : 'Tout déplier';
    const icon = expand.querySelector('ion-icon');
    if (icon) icon.setAttribute('name', allOpen ? 'remove-circle-outline' : 'add-circle-outline');
    expand.hidden = shown.length === 0;
  }

  function syncUrl() {
    const params = new URLSearchParams(window.location.search);
    if (current) params.set('theme', current); else params.delete('theme');
    const query = search ? search.value.trim() : '';
    if (query) params.set('q', query); else params.delete('q');
    const qs = params.toString();
    try {
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    } catch (e) { /* file:// : sans conséquence */ }
  }

  /** searchChanged : la saisie a changé -> on déplie (recherche) ou replie (champ vidé) */
  function apply(searchChanged) {
    const list = words();
    let shown = 0;

    rows.forEach(function (r) {
      const on = (!current || r.q.categorie === current) &&
                 list.every(function (w) { return r.text.indexOf(w) !== -1; });
      r.el.hidden = !on;
      r.question.innerHTML = highlight(r.q.question, list);
      r.answer.innerHTML = answerHtml(r.q, list);
      if (on) shown++;
      if (searchChanged) setOpen(r.el, on && list.length > 0);
    });

    groups.querySelectorAll('.faq-group').forEach(function (group) {
      group.hidden = !group.querySelector('.faq-item:not([hidden])');
    });

    if (filters) {
      filters.querySelectorAll('[data-theme]').forEach(function (button) {
        const on = button.dataset.theme === current;
        button.classList.toggle('is-active', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    if (empty) empty.hidden = shown > 0;
    if (counter) {
      counter.innerHTML = shown
        ? '<strong>' + shown + '</strong> ' + U.pluralize(shown, 'question', 'questions') + (shown === items.length ? '' : ' sur ' + items.length)
        : 'Aucune question ne correspond';
    }
    syncExpand();
    syncUrl();
  }

  if (filters) {
    filters.addEventListener('click', function (e) {
      const button = e.target.closest('[data-theme]');
      if (!button) return;
      current = button.dataset.theme;
      apply(false);
    });
  }

  if (search) {
    search.addEventListener('input', function () { apply(true); });
    const form = search.closest('form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); apply(true); });
  }

  document.querySelectorAll('[data-faq-reset]').forEach(function (button) {
    button.addEventListener('click', function () {
      current = '';
      if (search) search.value = '';
      apply(true);
      if (search) search.focus();
    });
  });

  if (expand) {
    expand.addEventListener('click', function () {
      const shown = visibleRows();
      const openAll = !shown.every(function (r) { return r.el.open; });
      shown.forEach(function (r) { setOpen(r.el, openAll); });
      syncExpand();
    });
  }


  /* --- Lien direct vers une question ----------------------------------------- */

  /* l'adresse suit la question ouverte (partage) ; « toggle » ne remonte pas : écoute en capture */
  groups.addEventListener('toggle', function (e) {
    const item = e.target;
    if (!item.classList || !item.classList.contains('faq-item')) return;
    syncExpand();
    const hash = '#' + item.id;
    // changement fait par le script : l'adresse ne gagne pas d'ancre, mais elle perd
    // celle d'une question qui vient d'être repliée (« Tout replier », recherche)
    const silent = !!item.dataset.silent;
    delete item.dataset.silent;
    try {
      if (item.open && !silent && window.location.hash !== hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search + hash);
      } else if (!item.open && window.location.hash === hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (err) { /* file:// : sans conséquence */ }
  }, true);

  function openFromHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id && rows.find(function (r) { return r.q.id === id; });
    if (!target) return;
    if (target.el.hidden) {                          // masquée par un filtre : on l'affiche
      current = '';
      if (search) search.value = '';
      apply(false);
    }
    setOpen(target.el, true);
    requestAnimationFrame(function () { target.el.scrollIntoView({ block: 'start' }); });
    const summary = target.el.querySelector('summary');
    if (summary) summary.focus({ preventScroll: true });
  }

  apply(false);
  if (search && search.value.trim()) apply(true);
  openFromHash();
  window.addEventListener('hashchange', openFromHash);


  /* --- Balisage FAQPage (schema.org) ------------------------------------------ */

  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(function (q) {
      return { '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: plainAnswer(q) } };
    })
  });
  document.head.appendChild(ld);

})();
