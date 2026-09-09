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
- Tout conteneur racine de page est un `<div class="container">` (max-width 1440px, centré, fond blanc, `overflow:hidden`).

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
- `assets/data/actualites.js` → tableau d'objets actu/événement (id, titre, categorie, date, image, extrait, contenu, estEvenement, lieu, heure)
- `assets/data/formateurs.js`, `assets/data/temoignages.js`, `assets/data/galerie.js`, `assets/data/documents.js`

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

### 7.6 Actualités, annonces et événements (`actualites.html` + `actualite-detail.html`)
- Liste filtrable par catégorie (Actualité / Annonce / Événement), triée par date décroissante, réutilisant le pattern `.blog-card`.
- Mise en avant visuelle des événements **à venir** (badge "À venir" + date, comme dans `.event-card` déjà existant sur la home — réutilise ce composant en haut de la page en carrousel/liste).
- Page détail (`actualite-detail.html?id=`) : image bannière, titre, date, catégorie, contenu complet, et si c'est un événement : encart lieu/heure/date mis en avant.
- Le statut "publié/archivé" n'a de sens que côté back-office (gestion), donc côté public affiche uniquement les items marqués `publie: true` dans `actualites.js` — les items `publie: false` simulent le futur brouillon et ne doivent PAS apparaître publiquement (bon réflexe à garder pour la cohérence avec le futur back-office).

### 7.7 Galerie, formateurs, témoignages, documents
Peuvent être des pages séparées ou regroupées intelligemment — recommandation :
- `galerie.html` : albums photo (grille avec lightbox JS au clic — implémente un lightbox simple en vanilla JS, pas de lib lourde si évitable ; sinon CDN GLightbox est acceptable et léger).
- `formateurs.html` : grille de fiches, réutilise entièrement `.instructor-card` (déjà stylé et animé au hover).
- `temoignages.html` : liste complète de témoignages validés (au-delà du seul témoignage affiché sur la home), réutilise `.testimonials-card` en grille/carrousel.
- `documents.html` : liste de documents téléchargeables classés par catégorie (brochures, formulaires, règlements...), avec icône de type de fichier, taille indicative, bouton téléchargement. Comme il n'y a pas de vrais fichiers, pointe vers des ancres `#` avec un `title="Téléchargement disponible après mise en production"` en attendant les vrais PDFs.

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
