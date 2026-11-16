# PROJECT_CONTEXT.md
## Site institutionnel — Les Établissements Raoul Follereau (Fada N'Gourma, Burkina Faso)
### Contexte complet pour agent de développement (Claude Code / Antigravity)

> **Ce document remplace le cahier des charges PDF.** Il a été rédigé pour donner à un agent de code tout le contexte métier, technique et de convention nécessaire pour travailler efficacement sur ce projet SANS poser de questions de clarification à chaque étape. Lis-le entièrement avant d'écrire la moindre ligne de code.

---

## 1. QUI EST LE CLIENT ET QUEL EST LE PROJET

**Les Établissements Raoul Follereau** sont un pôle de formation basé à Fada N'Gourma (Burkina Faso), regroupant **trois composantes** :

| Sigle | Nom complet | Domaine |
|---|---|---|
| **IPS-RF** | Institut Privé Supérieur de formation en Santé Raoul Follereau | Santé (niveau supérieur) |
| **EPS-RF** | École Privée de Santé Raoul Follereau | Santé (niveau école) |
| **CPFP-RF** | Centre Professionnel de Formation Professionnelle Raoul Follereau | Gestion, numérique, métiers techniques |

Les logos existent déjà : `assets/images/rf-ips.png`, `rf-eps.png`, `rf-cpfp.png`. Il faut leur donner une vraie visibilité (ils ne sont pas encore utilisés dans l'index actuel).

**Objectif final** (hors périmètre de cette mission) : plateforme complète avec back-office Laravel + PostgreSQL, permettant la gestion des formations, des préinscriptions, des actualités, etc.

**Objectif de LA MISSION ACTUELLE (celle que tu exécutes)** : uniquement le **front-end public**, en HTML/CSS/JS pur (**aucun framework, aucun build tool, pas de Node/npm, pas de Laravel pour l'instant**). Le projet Laravel sera créé dans une phase ultérieure séparée — ne l'anticipe pas en installant quoi que ce soit côté serveur.

---

## 2. RÈGLE D'OR : NE JAMAIS CASSER L'EXISTANT

Le projet a déjà une identité visuelle et un système de composants CSS cohérent, construit à partir d'un template (`codewithsadee`) puis adapté. Ta mission est d'**étendre**, jamais de **réécrire**.

Contraintes strictes :
1. **Ne modifie aucune règle CSS existante** dans `style.css`, `media_queries.css`, `animation.css`, `variable.css` — sauf bug avéré. Tu AJOUTES de nouvelles sections à la suite, en respectant exactement la même syntaxe.
2. **Ne renomme aucune classe existante.** Si une page a besoin d'un composant similaire à un existant (ex: une carte), réutilise la classe existante (`.course-card`, `.blog-card`, etc.) plutôt que d'en créer une nouvelle qui fait la même chose.
3. **Le fichier `script.js` actuel ne doit pas être cassé.** Tu peux l'étendre, mais le toggle navbar doit continuer à fonctionner sur 100% des pages.
4. Tout nouveau code doit être **indiscernable stylistiquement** de l'existant : un développeur qui regarde le CSS ne doit pas pouvoir dire "ça c'est la partie ajoutée par l'IA".

---

## 3. CONVENTIONS DE CODE EXISTANTES (À SUIVRE STRICTEMENT)

### 3.1 Design tokens — `assets/css/variable.css`
Toutes les couleurs, tailles de police et espacements DOIVENT passer par ces variables. **Ne jamais coder une couleur ou une taille de police en dur.**

```css
:root {
  /* Couleurs */
  --red-orange-color-wheel: hsl(0, 90%, 45%);   /* couleur d'accent primaire (CTA, hover) */
  --ultramarine-blue: hsl(115, 59%, 46%);       /* couleur secondaire */
  --lavender-blue: hsl(229, 96%, 91%);
  --oxford-blue: hsl(229, 84%, 12%);            /* texte foncé / titres */
  --light-gray: hsl(0, 0%, 80%);
  --sonic-silver: hsl(0, 0%, 47%);              /* texte secondaire */
  --blue-crayola: hsl(216, 98%, 52%);
  --cultured: hsl(228, 26%, 96%);               /* fond alterné des sections */
  --white: hsl(0, 0%, 100%);

  /* Typographie */
  --fs-1: 38px; --fs-2: 35px; --fs-3: 30px;
  --fs-4: 22px; --fs-5: 20px; --fs-6: 15px;
  --fw-5: 500; --fw-6: 600; --fw-7: 700; --fw-8: 800; --fw-9: 900;

  /* Espacement */
  --px: 15px;   /* padding horizontal des sections (mobile) */
  --py: 80px;   /* padding vertical des sections */
  --container-max: 1800px;   /* largeur maxi de .container / .navbar (était 1440px) */

  --default-transition: 0.25s ease;
}
```

⚠️ **Incohérence détectée dans le CDD original** : le PDF mentionne une palette rouge/bleu institutionnelle différente. Le code réel utilise déjà ce système HSL ci-dessus (rouge-orangé `--red-orange-color-wheel` en accent primaire, bleu ultramarine en secondaire). **On garde le système existant du code**, pas celui du PDF — c'est la base de travail actuelle et elle est déjà appliquée à tout le site.

Polices : `Jost` (titres, `font-family` par défaut sur `html`) + `Roboto` (texte courant, chargées via Google Fonts `<link>` dans le `<head>`).

### 3.2 Structure des fichiers CSS
- `variable.css` → tokens uniquement, importé en haut de `style.css` via `@import`.
- `style.css` → tout le style "desktop-first-écrit / mobile-first-appliqué" avec sections délimitées par des commentaires ASCII :
```css
/*-----------------------------------*\
  #NOM_DE_SECTION
\*-----------------------------------*/
```
- `media_queries.css` → **toutes** les surcharges responsive, organisées par breakpoints croissants (mobile-first, `min-width`) :
  `375px → 575px → 767px → 850px → 992px → 1200px`
  Chaque page/section a son bloc dans **chacun** des breakpoints pertinents. Ne mélange pas les media queries dans `style.css`.
- `animation.css` → uniquement les `@keyframes` et classes d'animation réutilisables (`.drop-anim`, `.smooth-zigzag-anim-1/2/3`, `.pulse-anim`). Ajoute tes nouvelles animations ici, avec la même nomenclature (`nom-anim` + `@keyframes nom`).

### 3.3 Conventions de nommage HTML/CSS (le pattern à répliquer)
- Sections principales : `<section class="nom-section" id="ancre">` avec un titre `.section-title`, parfois précédé de `.section-subtitle` (petit texte coloré en majuscule), et `.section-text` pour les paragraphes descriptifs.
- Grilles de cartes : `.xxx-grid` (conteneur `display:grid`) > `.xxx-card` (l'unité répétée).
- Boutons : **toujours** utiliser le composant existant :
```html
<button class="btn btn-primary">
  <p class="btn-text">Libellé</p>
  <span class="square"></span>
</button>
```
`.btn-primary` = fond rouge-orangé, `.btn-secondary` = fond bleu oxford (inversion des couleurs). Le `<span class="square">` gère l'effet de hover animé — ne jamais l'omettre.
- Icônes : Ionicons via `<ion-icon name="...">`, chargé en `type="module"` + fallback `nomodule` en fin de `<body>` (déjà en place, ne pas dupliquer le script sur les nouvelles pages — le remettre une seule fois par page HTML, comme sur `index.html`).
- Images avec double état (icône par défaut + icône colorée au survol) : pattern `.category-icon.default` / `.category-icon.hover`, à réutiliser si un composant similaire est nécessaire.
- Tout conteneur racine de page est un `<div class="container">` (max-width `var(--container-max)` = 1800px, centré, fond blanc, `overflow:hidden`).
- Formulaires : classes génériques de la section `#FORMS` de `style.css` (`.form-field`, `.form-label`, `.form-input`, `.form-control` + chevron pour les `<select>`, `.form-row`, `.form-choices`/`.form-choice` (radios), `.form-check`, `.form-file*`, `.form-hint`, `.field-error`, `.form-error` (message global sous les champs), état `.has-error`). Messages d'erreur inline remplis en JS (`data-error`, `data-error-required`), jamais d'`alert()`. Utilisées par `preinscription.html` et `contact.html` (mêmes helpers `messageFor` / `showError` / `clearError` dans chaque script de page). Un bloc conditionnel masqué (`[hidden]`) doit avoir ses champs `disabled` pour ne pas bloquer `checkValidity()` (voir `pages/contact.js`).
- Header (15/11/2026) : entrée « Galerie » ajoutée après « Institution » dans les 9 pages complètes, visible en tablette et desktop seulement (`primary-nav-item--header-only`), comme « Institution ».
- Pages rattachées à une entrée du menu sans en être une (ex. `formation-detail.html`) : poser `data-page="formations.html"` sur `<body>` ; `header-nav.js` s'en sert pour l'état actif de la navigation.
- `.container` est en `overflow: clip` (avec repli `hidden`) : les descendants peuvent être `position: sticky` (colonne « infos clés » de la fiche formation).
- Pages intérieures : l'en-tête de page est la section `.page-banner` (voir `formations.html`) : fil d'Ariane `.breadcrumb`, `.section-subtitle` + `h1.section-title` (avec `<span class="heading-line">`) + `.section-text` dans `.page-banner-text`, et un visuel `.page-banner-visual` (image détourée sur `.background-shape`, badges flottants `.banner-badge` animés par `smooth-zigzag-anim-1/2/3`, icône `.icon-4` en `drop-anim`). La séquence d'entrée est jouée par `hero-intro.js` (#PAGE BANNER INTRO dans `animation.css`) : charger ce script sur chaque page qui utilise la bannière. Réutiliser ce bloc tel quel sur les autres pages en changeant l'image et le texte des badges.
- Sous-navigation en ancre (sommaire collant, voir `institution.html`) : `<nav class="inst-nav">` placé directement dans `<main>` (hors `<section>` : jamais masqué par la révélation au défilement), `position: sticky; top: 56px` = hauteur du header compressé (`.navbar.is-scrolled`, dès 40px de défilement), `z-index: 100` (sous le header et le voile du menu secondaire). Les sections ciblées portent `.inst-anchor` : `scroll-margin-top: 105px` (header 56 + barre 49) et apparition en fondu seul (`premium-animations.js`), car un `translateY` en cours décale le point d'arrivée de l'ancre. Lien actif (`aria-current`), recentrage horizontal et fondus de bord gérés par `pages/institution.js`.
- Révélation en cascade (`premium-animations.js`, `GRID_SELECTORS`) : appliquée à **toutes** les grilles correspondant à chaque sélecteur (et plus seulement à la première). Ajouter le sélecteur d'une nouvelle grille à la liste pour en profiter. Une `<img>` qui porte `width`/`height` en HTML et un `aspect-ratio` en CSS doit aussi recevoir `height: auto`, sinon la hauteur de l'attribut l'emporte sur le ratio.
- Section visée par un lien avec ancre depuis une autre page (ex. `actualites.html#agenda`) : classe `.anchor-target` (`scroll-margin-top: 56px`, arrêt sous le header compressé, et apparition en fondu seul dans `premium-animations.js`, comme `.inst-anchor`).
- Attribut `hidden` : le reset met `span`, `a`, `img` et `ion-icon` en `display: block`, ce qui annule le `display: none` natif de `[hidden]` (de même pour tout composant dont le CSS fixe `display`). Tout élément masqué en JS doit donc avoir une règle `…[hidden] { display: none; }` ciblée (ex. `.news-card[hidden]`, `.article-facts [hidden]`).

### 3.4 JavaScript existant — `assets/js/script.js`
```js
'use strict';
const navbarNav = document.querySelector('.navbar-nav');
const navbarToggleBtn = document.querySelector('.nav-toggle-btn');
navbarToggleBtn.addEventListener('click', function () {
  navbarNav.classList.toggle('active');
  this.classList.toggle('active');
});
```
C'est TOUT le JS actuel. Pas de framework, pas de bundler, vanilla pur en `'use strict'`. Continue dans ce style : petit, lisible, sans dépendances externes (sauf éventuellement une lib légère type Swiper/GLightbox chargée en CDN si strictement nécessaire pour un slider/lightbox — à documenter si utilisé).

---

## 4. PROBLÈME STRUCTUREL À RÉSOUDRE EN PREMIER : LE HEADER/FOOTER DUPLIQUÉ

> **Décision du 14/11/2026 (maître d'ouvrage) : cette étape est abandonnée côté statique.** Le header, le footer et le bouton WhatsApp partagés seront des `@include` Blade lors de la phase Laravel. En attendant, chaque page statique embarque une copie du header/footer de `index.html` (voir `formations.html`). Ne pas créer `components.js`.

Le site va compter **9 à 12 pages HTML**. Header et footer identiques sur chaque page = un cauchemar de maintenance si dupliqués en dur (corriger un lien de menu = éditer 12 fichiers).

**Solution imposée** : créer un système d'injection de composants en JS pur (pas de framework, pas de fetch() qui casserait en ouverture locale `file://`).

Crée `assets/js/components.js` :
```js
'use strict';
// Injecte le header et le footer partagés sur toutes les pages.
// Utilisation : <div id="site-header"></div> ... <div id="site-footer"></div>
// avant la fermeture de </body>, charger ce script AVANT script.js.

document.addEventListener('DOMContentLoaded', function () {
  const headerMount = document.getElementById('site-header');
  const footerMount = document.getElementById('site-footer');
  if (headerMount) headerMount.innerHTML = HEADER_TEMPLATE;
  if (footerMount) footerMount.innerHTML = FOOTER_TEMPLATE;
});
```
Le `HEADER_TEMPLATE` et `FOOTER_TEMPLATE` sont des template strings JS contenant le HTML exact du header/footer actuels de `index.html`, avec une seule adaptation : les liens du menu doivent pointer vers de vraies pages (`index.html#home`, `institution.html`, `formations.html`, etc.) au lieu des ancres `#home/#about/#course` qui n'ont de sens que sur la page d'accueil, et la classe `active`/aria-current doit refléter la page courante (ajouter un attribut `data-page` sur `<body>` de chaque page pour piloter ça en JS).

⚠️ Le bouton "S'inscrire" du header doit devenir un lien vers `preinscription.html` (pas juste un `<button>` sans action).

Le script `components.js` est chargé en tout premier dans le `<body>` (ou en `defer` dans le `<head>`), **avant** `script.js`, sur **toutes les pages sauf** `index.html` si tu préfères garder son header en dur pour l'instant — mais idéalement migre aussi `index.html` vers ce système pour une seule source de vérité. **Recommandation forte : migre `index.html` aussi.**

---

## 5. STRATÉGIE DE DONNÉES FACTICES (MOCK DATA) — IMPORTANT POUR LA SUITE LARAVEL

Comme il n'y a pas encore de backend, tout contenu variable (formations, actualités, événements, témoignages, formateurs, documents) doit être défini comme **données JS structurées**, pas codé en dur dans le HTML. Objectif : quand le projet Laravel sera lancé, on remplacera juste la source de données par des appels API/Blade sans toucher au HTML/CSS.

Crée un dossier `assets/data/` avec un fichier par entité :
- `assets/data/formations.js` → tableau d'objets formation (id, etablissement, titre, domaine, niveau, duree, prix, image, description, objectifs[], modules[], diplome, debouches[], conditionsAdmission[], documentsRequis[], sessions[])
  - **Implémenté (14/11/2026)** : le fichier expose les globaux `RF_ETABLISSEMENTS`, `RF_DOMAINES`, `RF_NIVEAUX` et `RF_FORMATIONS` (9 formations : 2 IPS-RF, 3 EPS-RF, 4 CPFP-RF ; champs supplémentaires `sousTitre`, `dureeMois`, `prixPeriode`, `rythme`, `imageAlt`, `resume`, `apprenants`, `sessions[].statut` = `ouvert` | `complet` | `a-venir`). Les helpers partagés sont dans `assets/js/utils.js` (`RF_UTILS`: `getParam`, `formatPrice`, `formatNumber`, `formatDate`, `escapeHtml`, `pluralize`). `formations.html` + `assets/js/pages/formations.js`, `formation-detail.html` + `assets/js/pages/formation-detail.js`, `preinscription.html` + `assets/js/pages/preinscription.js` `contact.html` + `assets/js/pages/contact.js` (objet « formation ») et `institution.html` + `assets/js/pages/institution.js` (chiffres et listes de formations par établissement) consomment ces données. Le composant carte + règles de disponibilité sont partagés dans `assets/js/formation-card.js` (`RF_FORMATION_CARD`: `create`, `markup`, `disponibilite`, `prochaineSession`, `detailUrl`, `applyUrl`, `LABELS`).
- `assets/data/actualites.js` → tableau d'objets actu/événement (id, titre, categorie, date, image, extrait, contenu, estEvenement, lieu, heure)
  - **Implémenté (15/11/2026)** : globaux `RF_CATEGORIES_ACTU` (`actualite` | `annonce` | `evenement`) et `RF_ACTUALITES` (17 éléments dont 2 brouillons `publie: false`). Champs : `id`, `titre`, `categorie`, `date` (publication, tri décroissant), `publie`, `etablissement` (clé ou `null`), `image`, `imageAlt`, `extrait`, `contenu` (blocs : chaîne = paragraphe, `{ titre }`, `{ liste }`, `{ citation, auteur }`), `estEvenement` + `dateEvenement`, `heure`, `heureFin`, `lieu`, et `lien` facultatif (`{ texte, href }`). Composant partagé `assets/js/actu-card.js` (`RF_ACTU_CARD` : `published`, `upcoming`, `eventState`, `create` pour les cartes `.blog-card`, `createEventCard` pour les cartes `.event-card`, libellés d'horaires « 8 h 30 à 16 h »). `RF_UTILS.formatDate` écrit désormais « 1er » pour le premier du mois.
- `assets/data/formateurs.js`, `assets/data/temoignages.js`, `assets/data/galerie.js`, `assets/data/documents.js`
- `assets/data/compte.js` (ajouté le 16/11/2026) → compte de démonstration de l'espace candidat (`RF_COMPTE_DEMO`), **à supprimer avant la mise en ligne** (voir §7.7, `connexion.html` / `compte.html`).
- `assets/data/pages.js` (ajouté le 16/11/2026) → pages du site proposées par la recherche (`RF_PAGES_SITE` : `{ url, titre, description, motsCles }`), à compléter quand une page est ajoutée (voir §7.7, `recherche.html`).
- `assets/data/reseaux.js` (ajouté le 16/11/2026) → comptes officiels sur les réseaux sociaux (`RF_RESEAUX` : `{ cle: { nom, url|null } }`), lus par `assets/js/footer.js` pour les liens `[data-reseau]` du footer et de la page Contact. **TODO client** : adresses des comptes et liste des réseaux à confirmer.

Chaque page consommatrice (`formations.html`, `actualites.html`, etc.) charge son fichier de data en `<script src="assets/data/xxx.js">` puis un script de rendu (`assets/js/pages/formations.js` par exemple) génère dynamiquement les cartes HTML dans le conteneur (`.course-grid`, etc.) via `innerHTML`/`createElement`, en réutilisant EXACTEMENT les classes CSS déjà stylées.

Utilise au moins **6 à 8 formations réalistes** couvrant les trois établissements (reprends/étoffe celles déjà présentes dans `index.html` : Sage-femme, Infirmier, Gestion des entreprises, Agent en bureautique, Transport & Logistique, Maintenance Informatique — et ajoute-en 2-3 propres à l'EPS-RF et au CPFP-RF pour couvrir les trois structures).

---

## 6. ARBORESCENCE DE FICHIERS CIBLE

```
Site/
├── index.html                      (existant — à améliorer, voir §7.1)
├── institution.html                (nouveau)
├── formations.html                 (nouveau — catalogue filtrable)
├── formation-detail.html           (nouveau — fiche détaillée, template unique alimenté par query param ?id=)
├── preinscription.html             (nouveau — wizard multi-étapes)
├── contact.html                    (nouveau)
├── actualites.html                 (nouveau — liste)
├── actualite-detail.html           (nouveau — détail, ?id=)
├── evenements.html                 (nouveau, ou section filtrée dans actualites.html — voir §7.6)
├── galerie.html                    (nouveau)
├── formateurs.html                 (nouveau)
├── temoignages.html                (nouveau, ou section intégrée — voir §7.7)
├── documents.html                  (nouveau)
├── assets/
│   ├── css/
│   │   ├── variable.css            (existant, ne pas casser)
│   │   ├── style.css               (existant + nouvelles sections en fin de fichier)
│   │   ├── media_queries.css       (existant + nouveaux blocs par breakpoint)
│   │   └── animation.css           (existant + nouvelles animations)
│   ├── js/
│   │   ├── script.js               (existant, ne pas casser)
│   │   ├── components.js           (nouveau — header/footer partagés, §4)
│   │   ├── utils.js                (nouveau — helpers: lire query param, formater date, etc.)
│   │   └── pages/                  (nouveau — un fichier par page dynamique)
│   │       ├── formations.js
│   │       ├── formation-detail.js
│   │       ├── preinscription.js
│   │       ├── actualites.js
│   │       ├── galerie.js
│   │       └── ...
│   ├── data/                       (nouveau — voir §5)
│   └── images/                     (existant + nouvelles images à ajouter/générer si besoin)
```

---

## 7. SPÉCIFICATION DÉTAILLÉE PAR PAGE

### 7.1 Accueil (`index.html`) — AMÉLIORATION de l'existant
Déjà en place : hero, catégories de formations, "pourquoi nous choisir", grille de 6 formations, événements à venir, mission, équipe, témoignages, blog, CTA contact, footer.

À AJOUTER (sections manquantes du cahier des charges) :
- **Présentation des trois composantes** (IPS-RF / EPS-RF / CPFP-RF) : nouvelle section entre `.category` et `.about`, avec les logos déjà présents (`rf-ips.png`, `rf-eps.png`, `rf-cpfp.png`), réutilisant le pattern `.course-category-item` (3 cartes cliquables menant vers `institution.html#ips`, `#eps`, `#cpfp`).
- **Carte Google Maps + bouton WhatsApp flottant** : absents actuellement.
  - Google Maps : `<iframe>` d'intégration standard dans une nouvelle section `.map`, à placer avant le footer. Utilise un `src` d'embed Google Maps générique pointant sur "Fada N'Gourma, Burkina Faso" (coordonnées approx. 12.0356° N, 0.3556° E) tant que l'adresse exacte n'est pas fournie — mets un commentaire HTML `<!-- TODO: remplacer par l'adresse exacte des Établissements -->`.
  - WhatsApp : bouton flottant fixe en bas à droite (`position: fixed`), visible sur toutes les pages (donc à ajouter dans `components.js`, pas juste sur l'accueil), lien `https://wa.me/22600000000` (placeholder à documenter comme TODO), icône Ionicons `logo-whatsapp`, avec une légère animation `pulse-anim` déjà existante en CSS.
- Corriger la faute "Accueille" → "Accueil" dans la nav.
- Le lien "Voir tous" sous la grille de formations doit pointer vers `formations.html`.
- Les liens "Détails"/"Postuler" des `.course-card` doivent pointer vers `formation-detail.html?id=X` / `preinscription.html?formation=X`.

### 7.2 Présentation institutionnelle (`institution.html`)
Contenu : présentation générale + historique/mission/vision/valeurs, puis 3 sous-sections ancrées (`#ips`, `#eps`, `#cpfp`) détaillant chaque composante (logo, description, spécialités), puis infrastructures (galerie photo simple si images dispo, sinon placeholders avec TODO).
Réutilise le pattern `.about` (image + texte + liste à puces `ion-icon checkmark-circle`) pour la présentation générale, et le pattern `.instructor-card`/`.course-card` pour les 3 fiches établissements.
Prévoir une sous-navigation en ancre (tabs ou simple sommaire sticky) pour naviguer entre IPS/EPS/CPFP sur la même page.
- **Implémenté (15/11/2026)** : `institution.html` + `assets/js/pages/institution.js`. Bannière `.page-banner` en variante photo, sous-navigation collante (Présentation, Histoire, Mission & valeurs, IPS-RF, EPS-RF, CPFP-RF, Infrastructures, Équipe, Partenaires), présentation (`.about` + `.about-ul` + `.about-stats` animés, photo et devise « Nul n'a le droit d'être heureux tout seul »), frise historique (`.calendar-timeline` réutilisée), mission (bande `.features` de l'accueil), vision et valeurs, une section ancrée par composante (`#ips`, `#eps`, `#cpfp` : photo + logo, description, spécialités, chiffres et liste des formations calculés depuis `formations.js`, bouton vers le catalogue filtré), infrastructures (grille de photos + un emplacement « Photo à venir »), équipe de direction (`.instructor-card`) et partenaires (`.partner-card` en grille statique avec leur rôle). CSS : section `#INSTITUTION` (style.css / media_queries.css). Les boutons « Voir tous » équipe et partenaires de l'accueil pointent vers `#equipe` et `#partenaires`. **Contenus provisoires marqués TODO** : textes institutionnels, dates de la frise, « 15 ans » et « 87 % », rôles des partenaires, photos (banque d'images du site), logo de la Fondation Raoul Follereau.

### 7.3 Catalogue des formations (`formations.html` + `formation-detail.html`)
**Liste (`formations.html`)** :
- Barre de filtres au-dessus de la grille : select/boutons pour établissement (IPS/EPS/CPFP), domaine, niveau, durée, disponibilité (places ouvertes/complet). Filtrage **100% côté client** en JS (pas de rechargement de page), sur le tableau `formations.js`.
- Grille de résultats réutilisant `.course-card` existant.
- État "aucun résultat" à prévoir proprement (pas juste une grille vide).

**Détail (`formation-detail.html`)** :
- Page unique, template générique. Au chargement, lit `?id=` dans l'URL (`URLSearchParams`), trouve la formation correspondante dans `formations.js`, injecte son contenu.
- Sections : description, objectifs (liste à puces), modules (liste ou accordéon), infos clés (durée/niveau/diplôme/prix) en encart visuel, débouchés, conditions d'admission, documents requis (liste avec icônes), sessions disponibles avec dates, gros CTA `.btn-primary` "Je me préinscris" → `preinscription.html?formation={id}` (pré-remplit l'étape 1 du wizard).
- Si `id` absent ou invalide → message clair + lien retour vers le catalogue (pas de page blanche).

### 7.4 Préinscription en ligne (`preinscription.html`) — LE MORCEAU LE PLUS COMPLEXE
Formulaire **multi-étapes** (wizard) en JS pur, sans rechargement de page :
1. **Établissement / Formation / Session** — selects en cascade (choisir établissement filtre les formations, choisir formation filtre les sessions disponibles issues de `formations.js`). Si arrivé avec `?formation=id` en query param, pré-sélectionner.
2. **Informations personnelles** — nom, prénom, date de naissance, sexe, téléphone, email, adresse.
3. **Parcours scolaire/professionnel** — dernier diplôme obtenu, établissement d'origine, année d'obtention, expérience professionnelle (facultatif).
4. **Pièces justificatives** — `<input type="file">` stylé (multiple champs selon documents requis par la formation choisie, lus depuis `formations.js`), avec preview du nom de fichier sélectionné. **Comme il n'y a pas de backend**, ces fichiers ne seront pas réellement envoyés — stocke juste leur nom en mémoire JS pour l'affichage du récapitulatif, et documente clairement dans un commentaire que l'upload réel sera branché lors de l'intégration Laravel.
5. **Récapitulatif** — affichage en lecture seule de toutes les données saisies, avec bouton "Modifier" par section (retour à l'étape concernée) et checkbox d'acceptation des conditions avant soumission.
6. **Confirmation** — écran de succès avec un identifiant de candidature généré côté client à titre de simulation (ex: `RF-2026-XXXXX` avec un nombre aléatoire), message "Un email de confirmation vous sera envoyé", et rappel que le vrai suivi de statut se fera plus tard via compte candidat (fonctionnalité back-office, hors périmètre actuel).

Exigences techniques du wizard :
- Barre de progression visuelle (étape X/5) en haut, avec les étapes déjà validées cliquables pour y revenir.
- Validation HTML5 native (`required`, `pattern`, `type="email"`, `type="tel"`) **plus** validation JS avant de passer à l'étape suivante (bloquer si champs invalides, afficher messages d'erreur inline sous chaque champ, pas d'`alert()`).
- Les données de toutes les étapes doivent survivre à la navigation entre étapes (garder un objet JS `formState` en mémoire, pas de perte de saisie si l'utilisateur revient en arrière).
- Style des champs à créer proprement dans une nouvelle section `#FORMS` de `style.css`, cohérent avec les tokens (inputs avec bordure `--light-gray`, focus en `--red-orange-color-wheel` ou `--ultramarine-blue`, radius 8px comme le reste du site).

### 7.5 Contact et demandes d'informations (`contact.html`)
- Deux formulaires distincts (ou un formulaire avec un select "Objet de la demande" : Contact général / Demande d'information sur une formation) — au choix du dev, mais la catégorisation doit être visible dans le formulaire (champ select obligatoire).
- Colonne latérale avec coordonnées : téléphone, email, adresse, bouton WhatsApp direct, mini carte Google Maps (peut réutiliser l'embed de la home).
- Soumission simulée côté client (pas de backend) : au submit, afficher un message de succès inline (pas de vrai envoi), avec commentaire JS `// TODO: brancher sur l'API Laravel /contact lors de l'intégration backend`.
- **Implémenté (15/11/2026)** : un seul formulaire (`contact.html` + `assets/js/pages/contact.js`) avec le select obligatoire « Objet de la demande » (`general` / `formation` / `candidature` / `partenariat`). Blocs conditionnels `[data-objet-panel]` : formation concernée (select groupé par établissement depuis `formations.js`, aperçu `.contact-selection`, message proposé selon la disponibilité, jamais écrasé si l'utilisateur a écrit) et numéro de candidature (`RF-AAAA-NNNNN`, facultatif). Pré-remplissage par `?objet=…&formation={id}` (liens de la fiche et du wizard) et, depuis le 16/11/2026, `?objet=candidature&reference=RF-AAAA-NNNNN` (liens de l'espace candidat ; référence ignorée si son format est invalide). Colonne latérale : carte `.map-text` + `.map-contact` + `.map-social` (déjà stylées dans `#MAP`), bouton WhatsApp `[data-whatsapp]` (texte pré-rempli selon la formation), embed Google Maps de l'accueil + lien itinéraire. Coordonnées (adresse, téléphone, email, horaires) provisoires marquées TODO. CSS : `#CONTACT PAGE` (style.css / media_queries.css / animation.css). La carte flottante `.contact-card` de bas de page renvoie ici vers la préinscription.

### 7.6 Actualités, annonces et événements (`actualites.html` + `actualite-detail.html`)
- Liste filtrable par catégorie (Actualité / Annonce / Événement), triée par date décroissante, réutilisant le pattern `.blog-card`.
- Mise en avant visuelle des événements **à venir** (badge "À venir" + date, comme dans `.event-card` déjà existant sur la home — réutilise ce composant en haut de la page en carrousel/liste).
- Page détail (`actualite-detail.html?id=`) : image bannière, titre, date, catégorie, contenu complet, et si c'est un événement : encart lieu/heure/date mis en avant.
- Le statut "publié/archivé" n'a de sens que côté back-office (gestion), donc côté public affiche uniquement les items marqués `publie: true` dans `actualites.js` — les items `publie: false` simulent le futur brouillon et ne doivent PAS apparaître publiquement (bon réflexe à garder pour la cohérence avec le futur back-office).
- **Implémenté (15/11/2026)** : `actualites.html` + `assets/js/pages/actualites.js` (bannière, « Prochain rendez-vous » : bande `.countdown` de l'accueil dont `script.js` gère la minuterie, agenda des 4 prochains événements en `.event-card` avec badge « À venir », liste en `.blog-card` filtrable par catégorie avec `?categorie=` et affichage par 6) et `actualite-detail.html` + `assets/js/pages/actualite-detail.js` (mise en page `.detail-layout` de la fiche formation : article, encart « Informations pratiques » d'un événement avec état à venir / terminé et bouton « Ajouter à l'agenda » qui génère un `.ics`, partage WhatsApp / Facebook / copie du lien, « À lire aussi »). Un brouillon ou un id inconnu affiche « Publication introuvable ». CSS : sections `#ACTUALITES` et `#ACTUALITE DETAIL`. Les cartes « Évènements à venir » et « Blog » de l'accueil pointent vers leurs fiches, leurs « Voir tous » vers `#agenda` et `#publications`. Contenus, dates et images provisoires (TODO).

### 7.7 Galerie, formateurs, témoignages, documents
Peuvent être des pages séparées ou regroupées intelligemment — recommandation :
- `galerie.html` : albums photo (grille avec lightbox JS au clic — implémente un lightbox simple en vanilla JS, pas de lib lourde si évitable ; sinon CDN GLightbox est acceptable et léger).
  - **Implémenté (15/11/2026)** : `galerie.html` + `assets/js/pages/galerie.js`, données `assets/data/galerie.js` (global `RF_GALERIE` : albums `{ id, titre, date, etablissement, description, photos: [{ src, alt, legende }] }`). Filtre par album (boutons `.news-filter`, `?album=` dans l'URL) avec présentation de l'album, grille de vignettes `<button>`, visionneuse maison sans bibliothèque : flèches, clavier, glissement au doigt, Échap, clic sur le fond, focus piégé puis rendu à la vignette, page figée (`html.lightbox-open`). Page rattachée à l'entrée « Institution » du menu (`data-page`), lien « Voir la galerie photo » sous les infrastructures de `institution.html`. CSS : sections `#GALERIE`. Photos provisoires (TODO).
- `formateurs.html` : grille de fiches, réutilise entièrement `.instructor-card` (déjà stylé et animé au hover).
  - **Implémenté (15/11/2026)** : `formateurs.html` + `assets/js/pages/formateurs.js`, données `assets/data/formateurs.js` (global `RF_FORMATEURS` : `{ id, nom, fonction, specialite, etablissement, experience, photo|null, bio, formations: [ids] }`). Cartes `.instructor-card` (2 par ligne sur mobile, initiales sur fond dégradé quand `photo` est null), filtre par établissement (`.news-filter`, `?etablissement=`), fiche dans un `<dialog>` natif avec formations enseignées. Page rattachée à « Institution » (`data-page`). Liens : footer « Nos enseignants » de toutes les pages, « Voir tous » de « Notre équipe » sur l'accueil, bouton sous l'équipe de direction d'`institution.html`. CSS : sections `#FORMATEURS`. Noms et photos provisoires (TODO).
- `temoignages.html` : liste complète de témoignages validés (au-delà du seul témoignage affiché sur la home), réutilise `.testimonials-card` en grille/carrousel.
  - **Implémenté (15/11/2026)** : `temoignages.html` + `assets/js/pages/temoignages.js`, données `assets/data/temoignages.js` (global `RF_TEMOIGNAGES` : `{ id, nom, formation, promotion, poste, photo|null, valide, texte }` ; seuls `valide: true` sont publiés, établissement déduit de la formation). Grille de cartes `.testimonials-card` au texte complet (troncature de l'accueil neutralisée), formation suivie liée à sa fiche, initiales si pas de photo, filtre par établissement (`?etablissement=`). Le « Voir tous » des témoignages de l'accueil y mène. CSS : sections `#TEMOIGNAGES`. Les 3 premiers témoignages reprennent l'accueil, les autres sont des exemples (TODO).
- `documents.html` : liste de documents téléchargeables classés par catégorie (brochures, formulaires, règlements...), avec icône de type de fichier, taille indicative, bouton téléchargement. Comme il n'y a pas de vrais fichiers, pointe vers des ancres `#` avec un `title="Téléchargement disponible après mise en production"` en attendant les vrais PDFs.
  - **Implémenté (15/11/2026)** : `documents.html` + `assets/js/pages/documents.js`, données `assets/data/documents.js` (globaux `RF_CATEGORIES_DOCS` et `RF_DOCUMENTS` : `{ id, titre, categorie, type: pdf|docx|xlsx, taille (Ko), date, etablissement, description, fichier|null }`). Recherche insensible aux accents (`?q=`), filtre par catégorie (`?categorie=`), documents regroupés par catégorie avec pastille du type de fichier, taille et date de mise à jour. `fichier: null` : bouton vers `#` avec `title="Téléchargement disponible après mise en production"` et message au clic ; renseigner `fichier` suffit à activer le vrai téléchargement. Entrée « Documents à télécharger » dans le menu secondaire « Informations » de toutes les pages complètes. CSS : sections `#DOCUMENTS`. Documents et tailles provisoires (TODO).
- `faq.html` (hors spec initiale, page liée depuis le menu secondaire et le footer) — **Implémenté (15/11/2026)** : `assets/js/pages/faq.js`, données `assets/data/faq.js` (globaux `RF_FAQ_CATEGORIES` et `RF_FAQ` : `{ id, categorie, question, reponse: [paragraphe | { liste }], liens?: [{ texte, href }] }`). Accordéon natif `<details>/<summary>` par thème, recherche insensible aux accents avec surlignage (`<mark>`) et dépliage des résultats (`?q=`), filtre par thème (`?theme=`), « Tout déplier / Tout replier », lien direct vers une question (`faq.html#id` : ouverte à l'arrivée, l'adresse suit la question ouverte), balisage FAQPage (JSON-LD) généré depuis les données. Recherche, filtres et titres de groupe partagent les règles CSS de `#DOCUMENTS`. Réponses reprises des informations déjà publiées sur le site, à valider (TODO).
- `confidentialite.html` — **Implémenté (15/11/2026, projet de texte)** : contenu statique (texte éditorial, pas de fichier de données), rédigé d'après le fonctionnement réel du site : données du wizard et du formulaire de contact, aucun cookie de mesure d'audience ou de publicité (mise à jour du 16/11/2026 : seul le témoin de connexion de l'espace candidat est enregistré dans le navigateur), services tiers chargés (Google Fonts, unpkg/Ionicons, carte Google Maps de l'accueil et du contact ; WhatsApp et Facebook au clic seulement). Mise en page commune aux pages légales : `.detail-layout` + sommaire `.legal-toc` dans un `<details>` (replié sur mobile, déplié et collant dès 992px, section courante en évidence) piloté par `assets/js/pages/legal.js`, encadré « L'essentiel », tableaux empilés sur mobile (`data-label`), CSS `#LEGAL`, bannière `.page-banner--legal` (logo sur carte blanche). **À faire valider par un juriste** : responsable légal, hébergeur, durées de conservation, délai de réponse, référence de la loi n° 001-2021/AN et autorité (CIL) ; TODO dans le HTML.
- `termes.html` — **Implémenté (16/11/2026, projet de texte)** : conditions d'utilisation du site (titre « Conditions d'utilisation », libellé de menu « Termes & Conditions »), même mise en page légale que `confidentialite.html` (`#LEGAL`, `pages/legal.js`). Reprend les règles déjà affichées par le site : préinscription gratuite et sans engagement, préinscription ne valant pas admission, rappel sous 72 h ouvrées, pièces PDF/JPG/PNG de 5 Mo, informations publiées indicatives. **À faire valider par un juriste** : règles de préinscription, juridiction compétente, droits sur les photographies (TODO dans le HTML).
- `mentions-legales.html` — **Implémenté (16/11/2026, à compléter)** : même mise en page légale ; éditeur, directeur de la publication, hébergement, réalisation, crédits, propriété intellectuelle, données personnelles, signalement. Fiches « libellé / valeur » (`.legal-facts`, `<dl>`). Aucune donnée officielle n'est inventée : forme juridique, IFU, immatriculation, autorisations d'ouverture, directeur de la publication, hébergeur, réalisation et crédits photos sont des repères visibles `.legal-todo` « À compléter » (10 au total), à remplacer avant toute mise en ligne. Sigles entre parenthèses protégés de la césure (`.nowrap`).
- `connexion.html` + `compte.html` (espace candidat ; la spec §7.4 renvoyait le suivi à plus tard) — **Implémenté (16/11/2026), connexion SIMULÉE** :
  - Session simulée `assets/js/auth-demo.js` (global `RF_AUTH` : `available`, `read`, `check`, `login`, `logout`, `safeReturn`). Les identifiants sont comparés au compte de démonstration `assets/data/compte.js` (`RF_COMPTE_DEMO` : `identifiant`, `motDePasse`, `candidat`, `candidature { reference, formation, session, date, piecesRecues: [index dans documentsRequis], etapes: [{ titre, date?, etat: fait | en-cours | a-venir, detail? }] }`, `messages: [{ id, date, titre, texte, lien?, lu }]`). Témoin `rf-espace-candidat` (`{ email, expires }`) en sessionStorage pour 12 h, ou en localStorage pour 30 jours si « Rester connecté(e) » est coché. **Ce n'est pas une sécurité** : le compte `candidat@exemple.com` / `Demo-2026` et l'encadré de démonstration de `connexion.html` sont **à supprimer avant la mise en ligne**.
  - `connexion.html` + `assets/js/pages/connexion.js` : trois panneaux (connexion ; mot de passe oublié, demande simulée ; confirmation identique que l'adresse soit connue ou non). Validation inline, erreur d'identifiants générique, afficher / masquer le mot de passe, alerte Verr. Maj. `?retour=page.html` limité aux pages du site, `?deconnecte=1`. Colonne « Votre espace candidat » avec lien vers la préinscription. `body[data-page="compte.html"]` (onglet « Compte » actif sur mobile), `noindex`.
  - `compte.html` + `assets/js/pages/compte.js` : sans session valide, redirection vers `connexion.html?retour=compte.html` ; le HTML ne contient que des conteneurs. Bannière `.page-banner--app` (salutation, carte d'identité, déconnexion), synthèse de la candidature (formation liée à sa fiche, session, statut du dossier), prochaine étape calculée, frise de suivi, pièces du dossier tirées de `documentsRequis` (reçue / manquante / envoyée ; dépôt simulé PDF, JPG ou PNG de 5 Mo au plus, mémorisé pour la session dans `rf-espace-depots`), messages en `<details>` (lecture mémorisée dans `rf-espace-lus`), « Mes informations » et « Signaler une correction » (`contact.html?objet=candidature&reference=…`). `noindex`.
  - Intégrations : pastille verte « connecté » sur l'accès au compte du header et de la bottom bar (`header-nav.js` lit le même témoin) ; note de fin du wizard et question FAQ `suivre-mon-dossier` (message commun : l'espace candidat est créé avec la préinscription, un lien reçu par email permet de choisir le mot de passe) ; politique de confidentialité (sous-section « Espace candidat », finalité, durée de conservation, témoin de connexion) et conditions d'utilisation (§9, identifiants) mises à jour. CSS : sections `#AUTH` et `#COMPTE` (style.css, media_queries.css), `#ESPACE CANDIDAT` (animation.css).
  - TODO (phase Laravel) : authentification serveur (Fortify ou Breeze, mot de passe haché, cookie de session HttpOnly, CSRF, limitation des tentatives), vue Blade protégée par le middleware `auth`, dépôt réel des fichiers, statuts et messages lus en base ; supprimer alors `auth-demo.js`, `assets/data/compte.js` et la lecture du témoin dans `header-nav.js`.
- `recherche.html` (recherche du site, hors spec initiale) — **Implémenté (16/11/2026)** :
  - Le formulaire de recherche du header de toutes les pages envoie en GET vers `recherche.html?q=…` (`action="recherche.html"`, fonctionne sans JavaScript) ; `header-nav.js` bloque seulement l'envoi d'un champ vide. Correctif : le panneau du header devient visible dès l'ouverture (`.site-search.is-open`, `visibility 0s`), sinon son champ ne recevait pas le focus.
  - `assets/js/pages/recherche.js` cherche dans les données déjà chargées : formations, actualités publiées, FAQ, documents, enseignants, albums photo et pages du site (`assets/data/pages.js`). Insensible aux accents et à la casse, mots vides ignorés, pluriel en -s toléré ; tous les mots requis, sinon résultats approchants signalés. Score : titre > mots-clés > texte, bonus au début du titre, avantage aux pages du site (requêtes de navigation). Résultats groupés par type (groupe le plus pertinent en premier, 4 par type puis « Voir les N résultats »), mot entier surligné (`<mark>`) dans le titre et l'extrait, filtres `.news-filter` (`?q=…&type=…`), recherche en direct, recherches fréquentes et accès rapides quand le champ est vide, état « aucun résultat » avec FAQ et contact. `noindex`.
  - Destinations : fiche formation, fiche actualité, `faq.html#id` (question ouverte), `documents.html?q=titre` (document filtré), `formateurs.html#id` (fiche ouverte à l'arrivée, ajout dans `formateurs.js`), `galerie.html?album=id`, pages du site.
  - Données : le modèle de certificat médical de `documents.js` s'intitule désormais « Modèle de certificat médical d'aptitude », comme la pièce demandée dans `RF_DOCUMENTS_BASE`.
  - CSS : sections `#RECHERCHE` (style.css, media_queries.css, animation.css). TODO (phase Laravel) : recherche côté serveur (Laravel Scout ou plein texte PostgreSQL) rendue dans la même page.
- Footer commun (toutes les pages, futur partial Blade) — **Implémenté (16/11/2026)** :
  - Balisage identique sur les 19 pages, accueil compris (son footer pointait encore vers des ancres de l'accueil et vers « # »). Titres de colonnes en `<h2 class="item-heading">` suivis d'un `<ul>` (les `<h4>` étaient placés directement dans les `<ul>`, balisage invalide) ; même rendu, styles par classe.
  - Liens : « À propos » → `institution.html`, « Actualités » (ancien « Blog ») → `actualites.html`, « Événements » → `actualites.html#agenda`, ajout de « Mentions légales ». Copyright : « Les Établissements Raoul Follereau. Tous droits réservés. », lien vers l'accueil ; police Roboto rétablie (virgule manquante dans la règle d'origine).
  - Newsletter (`assets/js/footer.js`) : vrai `<form>` avec libellé, `type="email"` et motif à domaine pointé comme le formulaire de contact, messages sous le champ, anneau de focus, confirmation « plus qu'une étape » à la place du formulaire (double confirmation par email prévue), « Inscrire une autre adresse ». Inscription SIMULÉE : rien n'est envoyé ni stocké. TODO (phase Laravel) : POST /newsletter, CSRF, double confirmation, lien de désinscription, protection contre les robots, service d'emailing à citer dans la politique de confidentialité.
  - Réseaux sociaux : liens `[data-reseau]` avec nom accessible ; sans adresse dans `assets/data/reseaux.js`, un clic affiche « bientôt disponible » sous les icônes au lieu de remonter en haut de page ; avec une adresse, lien réel dans un nouvel onglet. Même traitement pour le bloc des coordonnées de `contact.html`.
  - Textes légaux : la politique de confidentialité décrit la newsletter (données, finalité, base, durée « jusqu'à votre désinscription ») ; les conditions d'utilisation (§6) indiquent la désinscription possible à tout moment. CSS : section `#FOOTER (SUITE)` de style.css.

---

## 8. ANIMATIONS — CONSIGNE EXPLICITE DU CLIENT

Le client veut des **animations fluides et modernes en plus de l'existant**, sans toucher aux animations déjà en place (`drop-anim`, `smooth-zigzag-anim-1/2/3`, `pulse-anim`, `menuPopup`).

Ajoute dans `animation.css` (à la suite, sans rien supprimer) :
- **Scroll-reveal générique** : classes `.reveal-up`, `.reveal-fade`, `.reveal-left`, `.reveal-right` (opacité 0 + translation légère par défaut, transition vers état final). Pilotées en JS via **`IntersectionObserver`** (pas de lib externe — vanilla, performant, pas de dépendance à ajouter). Crée `assets/js/scroll-reveal.js` : observe tous les éléments `[data-reveal]`, ajoute une classe `.is-visible` au premier passage dans le viewport (respecte `prefers-reduced-motion` pour l'accessibilité — désactive l'animation si l'utilisateur l'a demandé).
- Applique ces attributs `data-reveal` sur les nouvelles sections créées (cartes de formations, timeline institutionnelle, étapes du wizard, etc.) de façon mesurée — pas sur absolument tout, pour ne pas surcharger visuellement.
- Micro-interactions cohérentes avec l'existant : les nouveaux boutons/cartes doivent avoir les mêmes types de transitions que celles déjà en place (`var(--default-transition)`, hover avec `transform`/`box-shadow`, jamais de `transition: all` non maîtrisé).

---

## 9. RESPONSIVE, ACCESSIBILITÉ, SEO — RAPPELS TRANSVERSAUX

- **Mobile-first obligatoire** : écris le CSS de base pour mobile dans `style.css`, puis les ajustements desktop dans `media_queries.css` aux breakpoints existants (375/575/767/850/992/1200) — ne crée pas de nouveaux breakpoints sans raison.
- Chaque page a son propre `<title>` et sa propre `<meta name="description">` pertinents (le cahier des charges §7.5 demande du SEO — commence bien dès le HTML statique).
- Utilise des balises sémantiques (`<nav>`, `<main>`, `<section>`, `<article>` pour les cartes actu/formation, `<footer>`) — l'existant utilise déjà `<header>`/`<main>`/`<footer>`, continue ainsi.
- `alt` descriptif sur toutes les images (l'existant est inégal sur ce point — corrige au passage sur les images que tu touches).
- Formulaires : `<label>` explicite pour chaque champ (pas juste des `placeholder`), attributs `aria-*` de base sur le wizard de préinscription (announce l'étape courante).

---

## 10. CE QUE TU NE DOIS PAS FAIRE

- N'installe aucune dépendance npm, aucun bundler (Webpack/Vite), aucun framework CSS (Bootstrap/Tailwind) — tout doit rester compatible avec une ouverture directe des fichiers `.html` sans serveur de build.
- Ne crée pas de backend, ne simule pas d'API réelle avec fetch vers un serveur — tout reste en mémoire JS côté client à ce stade.
- Ne touche pas aux fichiers `.git/` ni à l'historique.
- Ne remplace pas les images existantes ; si une image manque pour un nouveau contenu (ex: photo infrastructure), utilise un placeholder visuellement propre (fond `--cultured` + icône) plutôt qu'un lien d'image cassé, et documente-le en commentaire `<!-- TODO: image réelle à fournir par le client -->`.

---

## 11. LIVRABLES ATTENDUS DE CETTE MISSION

1. Toutes les pages listées en §6, fonctionnelles et reliées entre elles par une navigation cohérente (header/footer partagés via `components.js`).
2. `index.html` amélioré avec les sections manquantes (§7.1).
3. Fichiers de mock data complets et réalistes dans `assets/data/`.
4. Extensions CSS propres et rangées en fin des fichiers existants, suivant strictement les conventions du §3.
5. JS de rendu dynamique par page dans `assets/js/pages/`.
6. Système d'animations au scroll (`scroll-reveal.js`) appliqué avec mesure.
7. Site testé visuellement sur mobile (375px) et desktop (1440px) au minimum.

## 12. PROCHAINE ÉTAPE (APRÈS cette mission — ne pas commencer maintenant)
Une fois le frontend validé, une mission séparée créera le projet **Laravel + PostgreSQL + Redis**, avec Livewire/Filament recommandé pour accélérer le back-office (voir §périmètre technique discuté avec le maître d'ouvrage). Le découpage en `assets/data/*.js` fait maintenant est précisément pensé pour rendre cette migration rapide : chaque fichier de mock deviendra un endpoint ou une requête Eloquent, et le HTML/CSS ne devrait quasiment pas bouger.
