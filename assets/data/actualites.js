'use strict';

/**
 * assets/data/actualites.js
 * ============================================================================
 * DONNÉES FACTICES (mock) des actualités, annonces et événements : voir
 * PROJECT_CONTEXT.md §5 et §7.6.
 *
 * Source unique de vérité côté front tant qu'il n'y a pas de backend. Les
 * constantes ci-dessous sont globales (RF_CATEGORIES_ACTU, RF_ACTUALITES).
 * Lors de l'intégration Laravel, ce fichier sera remplacé par une requête
 * Eloquent / un endpoint JSON sans toucher au HTML ni au CSS.
 *
 * Conventions :
 *  - id            : slug stable utilisé dans l'URL de la fiche (?id=) ;
 *  - categorie     : clé de RF_CATEGORIES_ACTU (actualite | annonce | evenement) ;
 *  - date          : date de PUBLICATION (ISO) : la liste est triée de la plus
 *                    récente à la plus ancienne ;
 *  - publie        : seuls les éléments publie: true sont visibles côté public.
 *                    publie: false simule un brouillon du futur back-office :
 *                    jamais listé, et sa fiche répond « introuvable » ;
 *  - etablissement : clé de RF_ETABLISSEMENTS (formations.js), ou null quand la
 *                    publication concerne les trois établissements ;
 *  - extrait       : résumé de la carte et chapeau de la fiche ;
 *  - contenu       : blocs de la fiche, dans l'ordre. Chaîne = paragraphe ;
 *                    { titre } = intertitre ; { liste: [...] } = liste à puces ;
 *                    { citation, auteur } = citation ;
 *  - estEvenement  : true pour un événement, avec dateEvenement (ISO), heure
 *                    (« HH:MM »), heureFin (facultative) et lieu. L'événement est
 *                    « à venir » tant que dateEvenement n'est pas passée ;
 *  - lien          : facultatif, { texte, href } : bouton d'action de la fiche.
 *
 * TODO: textes, dates et images à fournir ou valider par le client (les images
 *       sont provisoirement reprises de la banque d'images du site).
 * ============================================================================
 */

const RF_CATEGORIES_ACTU = {
  actualite: 'Actualité',
  annonce:   'Annonce',
  evenement: 'Événement'
};

const RF_ACTUALITES = [

  /* ------------------------------------------------------------- annonces */

  {
    id: 'preinscriptions-en-ligne',
    titre: 'Les préinscriptions se font désormais en ligne',
    categorie: 'annonce',
    date: '2026-11-12',
    publie: true,
    etablissement: null,
    image: './assets/images/course-3.jpg',
    imageAlt: 'Candidate souriante devant un ordinateur, téléphone à la main',
    extrait: "Plus besoin de vous déplacer pour déposer un dossier : choisissez votre formation et préinscrivez-vous en quelques minutes depuis le site.",
    contenu: [
      "Les Établissements Raoul Follereau ouvrent un service de préinscription en ligne pour l'ensemble de leurs formations, à l'IPS-RF, à l'EPS-RF comme au CPFP-RF.",
      { titre: 'Comment ça marche ?' },
      { liste: [
        "Choisissez l'établissement, la formation et la session qui vous intéressent.",
        'Renseignez votre identité et votre parcours scolaire ou professionnel.',
        'Joignez vos pièces justificatives au format PDF, JPG ou PNG.',
        'Vérifiez votre dossier puis envoyez-le : un numéro de candidature vous est attribué immédiatement.'
      ] },
      "Notre équipe vous recontacte sous 72 heures ouvrées pour finaliser votre dossier. Les préinscriptions restent possibles à l'accueil des Établissements, aux heures d'ouverture."
    ],
    estEvenement: false,
    lien: { texte: 'Je me préinscris', href: 'preinscription.html' }
  },

  {
    id: 'fermeture-fin-annee-2026',
    titre: "Fermeture administrative pendant les fêtes de fin d'année",
    categorie: 'annonce',
    date: '2026-11-13',
    publie: true,
    etablissement: null,
    image: './assets/images/coure-features-img.png',
    imageAlt: 'Membres souriants d\'une équipe administrative',
    extrait: "Les services administratifs seront fermés du 24 décembre 2026 au 1er janvier 2027 inclus. Les préinscriptions en ligne restent ouvertes.",
    contenu: [
      "Les services administratifs des Établissements seront fermés du jeudi 24 décembre 2026 au vendredi 1er janvier 2027 inclus. Réouverture le lundi 4 janvier 2027 à 7 h 30.",
      "Pendant cette période, les préinscriptions en ligne restent ouvertes : les dossiers reçus seront traités dès la reprise.",
      "Les apprenants du CPFP-RF admis pour la session de janvier sont attendus le 4 janvier pour la rentrée."
    ],
    estEvenement: false,
    lien: { texte: 'Nous contacter', href: 'contact.html?objet=general' }
  },

  {
    id: 'session-janvier-cpfp-2027',
    titre: 'CPFP-RF : dernières places pour la session de janvier 2027',
    categorie: 'annonce',
    date: '2026-11-10',
    publie: true,
    etablissement: 'cpfp',
    image: './assets/images/course-6.jpeg',
    imageAlt: 'Apprenants du CPFP-RF en atelier de maintenance informatique',
    extrait: "Gestion des entreprises, transport et logistique, maintenance informatique : les candidatures pour la rentrée du 4 janvier 2027 sont ouvertes jusqu'au 15 décembre 2026.",
    contenu: [
      'Le Centre Professionnel de Formation Professionnelle ouvre une nouvelle session le lundi 4 janvier 2027. Trois formations sont concernées :',
      { liste: [
        'Gestion des entreprises : brevet de technicien en 2 ans',
        'Transport et logistique : brevet de technicien en 2 ans',
        'Maintenance informatique : brevet de technicien en 2 ans'
      ] },
      'La formation Agent en bureautique est complète pour cette session. Sa prochaine rentrée est prévue en septembre 2027.',
      { titre: "Conditions d'accès" },
      'Les formations sont accessibles à partir du BEPC ou du niveau seconde, après un test de niveau en français et en mathématiques. Clôture des candidatures : 15 décembre 2026.'
    ],
    estEvenement: false,
    lien: { texte: 'Formations du CPFP-RF', href: 'formations.html?etablissement=cpfp' }
  },

  {
    id: 'concours-eps-2027',
    titre: "Concours d'entrée EPS-RF 2027 : les inscriptions sont ouvertes",
    categorie: 'annonce',
    date: '2026-11-03',
    publie: true,
    etablissement: 'eps',
    image: './assets/images/course-1.jpg',
    imageAlt: "Élève sage-femme auprès d'une mère et de son nouveau-né",
    extrait: "Infirmier, sage-femme ou maïeuticien : préparez votre dossier pour le concours d'entrée du 1er avril 2027. Clôture des inscriptions le 10 mars 2027.",
    contenu: [
      "L'École Privée de Santé Raoul Follereau organise le concours d'entrée de sa session 2027 pour les filières de soins infirmiers et de soins obstétricaux, qui mènent au diplôme d'État.",
      { titre: 'Dates à retenir' },
      { liste: [
        'Clôture des inscriptions : 10 mars 2027',
        'Épreuves écrites et entretien : 1er avril 2027',
        'Rentrée des admis : octobre 2027'
      ] },
      { titre: 'Qui peut se présenter ?' },
      "Les candidats titulaires du baccalauréat, séries D, C, A ou F8, ou d'un diplôme équivalent, âgés d'au moins 17 ans à la rentrée."
    ],
    estEvenement: false,
    lien: { texte: "Formations de l'EPS-RF", href: 'formations.html?etablissement=eps' }
  },

  /* ----------------------------------------------------------- événements */

  {
    id: 'journee-lepre-2027',
    titre: 'Journée mondiale des malades de la lèpre : nos apprenants mobilisés',
    categorie: 'evenement',
    date: '2026-11-14',
    publie: true,
    etablissement: null,
    image: './assets/images/client.jpeg',
    imageAlt: 'Apprenante infirmière en tenue de soins',
    extrait: "Lancée en 1954 par Raoul Follereau, la Journée mondiale des malades de la lèpre sera l'occasion d'une matinée de sensibilisation animée par nos apprenants.",
    contenu: [
      "Chaque dernier dimanche de janvier, la Journée mondiale des malades de la lèpre rappelle que cette maladie se soigne et que les personnes qui en sont atteintes ne doivent pas être exclues. Elle a été lancée en 1954 par Raoul Follereau, dont nos établissements portent le nom.",
      "Fidèles à son héritage, les apprenants de l'EPS-RF et de l'IPS-RF animeront des stands d'information, encadrés par leurs enseignants.",
      { citation: "Nul n'a le droit d'être heureux tout seul.", auteur: 'Raoul Follereau' },
      { titre: 'Au programme' },
      { liste: [
        'Information sur les signes de la lèpre et sur son traitement',
        'Orientation vers les centres de santé pour un dépistage',
        'Sensibilisation contre la stigmatisation des malades'
      ] }
    ],
    estEvenement: true,
    dateEvenement: '2027-01-31',
    heure: '08:00',
    heureFin: '12:00',
    lieu: "Centre-ville de Fada N'Gourma"
  },

  {
    id: 'sortie-etude-gayeri-2026',
    titre: "Sortie d'étude au district sanitaire de Gayéri",
    categorie: 'evenement',
    date: '2026-11-08',
    publie: true,
    etablissement: 'eps',
    image: './assets/images/event-img.jpg',
    imageAlt: "Apprenant souriant, sac au dos, prêt pour une sortie d'étude",
    extrait: "Les élèves de deuxième année de l'EPS-RF découvrent l'organisation d'un district sanitaire et les activités de santé communautaire sur le terrain.",
    contenu: [
      'Cette sortie permet aux élèves de confronter leurs enseignements à la réalité du terrain : organisation des soins de premier niveau, vaccination, suivi des femmes enceintes et sensibilisation des communautés.',
      'Encadrés par leurs enseignants, les élèves rédigeront un rapport de visite, présenté en classe à leur retour.',
      'Départ en car depuis le campus à 8 h 30, retour prévu vers 17 h.'
    ],
    estEvenement: true,
    dateEvenement: '2026-12-20',
    heure: '08:30',
    heureFin: '17:00',
    lieu: 'District sanitaire de Gayéri'
  },

  {
    id: 'journee-portes-ouvertes-2026',
    titre: 'Journée portes ouvertes',
    categorie: 'evenement',
    date: '2026-11-05',
    publie: true,
    etablissement: null,
    image: './assets/images/banner-img.png',
    imageAlt: "Trois apprenants des Établissements, dont une infirmière et un étudiant en blouse",
    extrait: 'Visitez nos salles, rencontrez enseignants et apprenants, et faites le point sur votre projet de formation avec nos conseillers.',
    contenu: [
      'Le samedi 5 décembre, les Établissements Raoul Follereau ouvrent leurs portes aux futurs apprenants, à leurs familles et à toutes les personnes intéressées par nos formations.',
      { titre: 'Au programme' },
      { liste: [
        "Visite guidée du laboratoire, de la salle de soins et de l'atelier de maintenance",
        "Présentation des formations de l'IPS-RF, de l'EPS-RF et du CPFP-RF",
        "Entretiens individuels d'orientation",
        'Aide à la préinscription en ligne sur place'
      ] },
      "L'entrée est libre, sans inscription préalable. Apportez vos derniers bulletins ou diplômes si vous souhaitez un conseil personnalisé."
    ],
    estEvenement: true,
    dateEvenement: '2026-12-05',
    heure: '08:30',
    heureFin: '16:00',
    lieu: "Campus des Établissements, Fada N'Gourma",
    lien: { texte: "Découvrir l'institution", href: 'institution.html' }
  },

  {
    id: 'rentree-cpfp-janvier-2027',
    titre: 'Rentrée de la session de janvier au CPFP-RF',
    categorie: 'evenement',
    date: '2026-10-20',
    publie: true,
    etablissement: 'cpfp',
    image: './assets/images/course-2.png',
    imageAlt: "Salle de cours équipée d'un grand écran",
    extrait: 'Accueil des nouveaux apprenants en gestion des entreprises, en transport et logistique et en maintenance informatique.',
    contenu: [
      "Les apprenants admis pour la session de janvier sont attendus le lundi 4 janvier à 8 h pour la séance d'accueil : présentation de l'équipe pédagogique, du règlement intérieur et de l'emploi du temps.",
      { titre: 'À apporter' },
      { liste: [
        "Une pièce d'identité",
        "Le reçu de paiement des frais d'inscription",
        "Deux photos d'identité"
      ] }
    ],
    estEvenement: true,
    dateEvenement: '2027-01-04',
    heure: '08:00',
    lieu: "CPFP-RF, Fada N'Gourma",
    lien: { texte: 'Formations du CPFP-RF', href: 'formations.html?etablissement=cpfp' }
  },

  {
    id: 'concours-eps-epreuves-2027',
    titre: "Concours d'entrée EPS-RF : épreuves écrites et entretiens",
    categorie: 'evenement',
    date: '2026-11-04',
    publie: true,
    etablissement: 'eps',
    image: './assets/images/course-5.png',
    imageAlt: "Élève infirmière prenant la tension artérielle d'une patiente",
    extrait: "Les candidats inscrits passent les épreuves écrites le matin et l'entretien de motivation l'après-midi.",
    contenu: [
      "Les candidats sont attendus à 7 h 30, munis de leur convocation et d'une pièce d'identité. Les épreuves écrites se déroulent le matin, les entretiens de motivation l'après-midi.",
      "Les résultats seront publiés sur ce site et affichés à l'École."
    ],
    estEvenement: true,
    dateEvenement: '2027-04-01',
    heure: '07:30',
    heureFin: '17:00',
    lieu: "EPS-RF, Fada N'Gourma",
    lien: { texte: "Lire l'annonce", href: 'actualite-detail.html?id=concours-eps-2027' }
  },

  {
    id: 'journee-integration-2026',
    titre: "Journée d'intégration des nouveaux apprenants",
    categorie: 'evenement',
    date: '2026-09-25',
    publie: true,
    etablissement: null,
    image: './assets/images/course-6.jpg',
    imageAlt: 'Étudiants souriants travaillant ensemble autour de leurs ordinateurs',
    extrait: "Jeux, ateliers et soirée culturelle : une journée pour faire connaissance entre apprenants des trois établissements.",
    contenu: [
      "Organisée par les délégués des apprenants, la journée d'intégration réunit les nouveaux venus de l'IPS-RF, de l'EPS-RF et du CPFP-RF autour d'activités sportives, d'ateliers et d'une soirée culturelle.",
      "C'est aussi l'occasion de rencontrer les équipes pédagogiques et les associations d'apprenants."
    ],
    estEvenement: true,
    dateEvenement: '2026-10-15',
    heure: '10:30',
    heureFin: '22:30',
    lieu: "Campus des Établissements, Fada N'Gourma"
  },

  {
    id: 'rentree-academique-2026',
    titre: 'Rentrée académique 2026-2027',
    categorie: 'evenement',
    date: '2026-09-10',
    publie: true,
    etablissement: null,
    image: './assets/images/images.png',
    imageAlt: 'Trois personnes en tenue professionnelle, souriantes',
    extrait: "Accueil des nouveaux étudiants et élèves de l'IPS-RF, de l'EPS-RF et du CPFP-RF pour la rentrée 2026-2027.",
    contenu: [
      "La rentrée académique 2026-2027 a lieu le jeudi 1er octobre à partir de 8 h. Après une séance d'accueil commune, chaque établissement réunit ses nouveaux apprenants pour présenter le programme de l'année.",
      'Les emplois du temps et les listes de classes sont affichés à l\'accueil et remis lors de la séance.'
    ],
    estEvenement: true,
    dateEvenement: '2026-10-01',
    heure: '08:00',
    lieu: "Campus des Établissements, Fada N'Gourma"
  },

  /* ----------------------------------------------------------- actualités */

  {
    id: 'convention-chru-fada-2026',
    titre: "Stages cliniques : la convention avec le CHRU de Fada N'Gourma est renouvelée",
    categorie: 'actualite',
    date: '2026-09-18',
    publie: true,
    etablissement: null,
    image: './assets/images/course-5.png',
    imageAlt: "Élève infirmière prenant la tension artérielle d'une patiente",
    extrait: "Les élèves de l'EPS-RF et les étudiants de l'IPS-RF continueront d'effectuer leurs stages cliniques dans les services du CHRU.",
    contenu: [
      "Les Établissements Raoul Follereau et le CHRU de Fada N'Gourma ont renouvelé leur convention de stages pour trois ans. Elle garantit aux apprenants des filières de santé un terrain de stage encadré tout au long de leur formation.",
      { titre: 'Ce que prévoit la convention' },
      { liste: [
        'Des stages dans les services de médecine, de chirurgie, de pédiatrie et de maternité',
        'Un tuteur désigné dans chaque service accueillant',
        'Des évaluations de stage partagées entre le CHRU et les enseignants'
      ] },
      'Ce partenariat contribue directement à la qualité de la formation pratique et à l\'insertion de nos diplômés.'
    ],
    estEvenement: false,
    lien: { texte: 'Nos partenaires', href: 'institution.html#partenaires' }
  },

  {
    id: 'sortie-promotion-ips-2026',
    titre: 'IPS-RF : sortie de la promotion 2026',
    categorie: 'actualite',
    date: '2026-08-07',
    publie: true,
    etablissement: 'ips',
    image: './assets/images/blog-1.jpg',
    imageAlt: 'Lancer de toques lors de la cérémonie de sortie de promotion',
    extrait: "Les diplômés de licence professionnelle de l'IPS-RF ont reçu leur diplôme lors d'une cérémonie en présence des familles et des partenaires.",
    contenu: [
      "La cérémonie de sortie de la promotion 2026 de l'Institut Privé Supérieur de formation en Santé s'est tenue en présence des familles, des enseignants et des partenaires des Établissements.",
      "Les lauréats rejoignent désormais les structures sanitaires de la région ou poursuivent leurs études. Félicitations à toutes et à tous !",
      { citation: "Nul n'a le droit d'être heureux tout seul.", auteur: 'Raoul Follereau' }
    ],
    estEvenement: false,
    lien: { texte: "Formations de l'IPS-RF", href: 'formations.html?etablissement=ips' }
  },

  {
    id: 'tp-laboratoire-ips-2026',
    titre: 'IPS-RF : travaux pratiques en laboratoire',
    categorie: 'actualite',
    date: '2026-06-23',
    publie: true,
    etablissement: 'ips',
    image: './assets/images/blog-2.jpg',
    imageAlt: "Étudiants en blouse blanche lors d'une séance de travaux pratiques",
    extrait: 'Manipulations, analyses et protocoles : les étudiants de première année ont découvert le laboratoire de travaux pratiques.',
    contenu: [
      "Encadrés par leurs enseignants, les étudiants de première année ont réalisé leurs premières manipulations : préparation d'échantillons, lecture de résultats et respect des règles d'hygiène et de sécurité.",
      'Ces séances préparent directement aux stages hospitaliers de fin de semestre.'
    ],
    estEvenement: false
  },

  {
    id: 'sortie-terrain-cpfp-2026',
    titre: 'CPFP-RF : sortie de terrain au centre de contrôle des marchandises',
    categorie: 'actualite',
    date: '2026-04-03',
    publie: true,
    etablissement: 'cpfp',
    image: './assets/images/blog-3.jpeg',
    imageAlt: "Apprenants en uniforme réunis devant des conteneurs lors d'une sortie de terrain",
    extrait: 'Les apprenants en transport et logistique ont découvert le traitement des conteneurs et le contrôle des marchandises sur une plateforme logistique.',
    contenu: [
      'Accompagnés de leurs formateurs, les apprenants ont suivi le parcours d\'un conteneur, de son arrivée à sa livraison : contrôle documentaire, inspection des marchandises et organisation du stockage.',
      'Cette sortie illustre la place donnée à la pratique dans les formations du CPFP-RF.'
    ],
    estEvenement: false,
    lien: { texte: 'Voir la formation', href: 'formation-detail.html?id=transport-logistique' }
  },

  /* -------------------------------------------- brouillons (non publiés) */

  {
    id: 'resultats-concours-eps-2027',
    titre: "Résultats du concours d'entrée EPS-RF 2027",
    categorie: 'annonce',
    date: '2027-04-20',
    publie: false,                     // brouillon : ne doit jamais apparaître côté public
    etablissement: 'eps',
    image: './assets/images/course-1.jpg',
    imageAlt: '',
    extrait: 'Liste des candidats admis au concours d\'entrée 2027.',
    contenu: ['Brouillon en cours de rédaction.'],
    estEvenement: false
  },

  {
    id: 'partenariat-entreprises-brouillon',
    titre: 'Nouveau partenariat pour les stages en entreprise',
    categorie: 'actualite',
    date: '2026-11-15',
    publie: false,                     // brouillon : ne doit jamais apparaître côté public
    etablissement: 'cpfp',
    image: './assets/images/course-2.png',
    imageAlt: '',
    extrait: 'Brouillon.',
    contenu: ['Brouillon en cours de rédaction.'],
    estEvenement: false
  }

];
