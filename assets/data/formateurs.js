'use strict';

/**
 * assets/data/formateurs.js
 * ============================================================================
 * DONNÉES FACTICES (mock) de l'équipe pédagogique : voir PROJECT_CONTEXT.md §5 et §7.7.
 *
 * Global : RF_FORMATEURS. Lors de l'intégration Laravel, ce fichier sera remplacé
 * par une requête Eloquent / un endpoint JSON sans toucher au HTML ni au CSS.
 *
 * Conventions :
 *  - id            : slug stable (ancre et identifiant de la fiche) ;
 *  - etablissement : clé de RF_ETABLISSEMENTS (formations.js) ;
 *  - photo         : chemin de l'image, ou null : la carte affiche alors les initiales ;
 *  - experience    : années d'expérience professionnelle ;
 *  - formations    : ids de RF_FORMATIONS où la personne enseigne (liens vers les fiches).
 *
 * TODO: noms, fonctions, parcours et photos à fournir par le client. Seules les
 *       quatre personnes de l'accueil reprennent les noms et portraits existants ;
 *       les autres fiches sont des exemples à remplacer.
 * ============================================================================
 */

const RF_FORMATEURS = [

  {
    id: 'aminata-sanfo',
    nom: 'Aminata Sanfo',
    fonction: 'Directrice académique',
    specialite: 'Soins obstétricaux',
    etablissement: 'eps',
    experience: 15,
    photo: './assets/images/instructor-3.jpg',
    bio: "Sage-femme d'État, elle coordonne les programmes pédagogiques des trois établissements et encadre les stages en maternité des élèves sages-femmes.",
    formations: ['sage-femme']
  },

  {
    id: 'mariam-thiombiano',
    nom: 'Mariam Thiombiano',
    fonction: 'Formatrice en soins infirmiers',
    specialite: 'Soins infirmiers',
    etablissement: 'eps',
    experience: 10,
    photo: './assets/images/client.jpeg',
    bio: "Infirmière diplômée d'État, elle enseigne les soins de base et les gestes techniques en salle de simulation avant les stages hospitaliers.",
    formations: ['infirmier']
  },

  {
    id: 'adama-combary',
    nom: 'Adama Combary',
    fonction: 'Formateur en santé communautaire',
    specialite: 'Santé communautaire',
    etablissement: 'eps',
    experience: 12,
    photo: null,
    bio: "Ancien agent itinérant de santé, il forme les futurs AIS à la prévention, à la vaccination et à la sensibilisation des communautés.",
    formations: ['agent-itinerant-sante']
  },

  {
    id: 'issouf-lompo',
    nom: 'Dr Issouf Lompo',
    fonction: 'Responsable pédagogique de licence',
    specialite: 'Santé publique',
    etablissement: 'ips',
    experience: 18,
    photo: null,
    bio: "Médecin de santé publique, il dirige les enseignements d'épidémiologie et de gestion des programmes de santé de la licence professionnelle.",
    formations: ['licence-sante-publique', 'licence-sciences-infirmieres']
  },

  {
    id: 'salamata-yonli',
    nom: 'Salamata Yonli',
    fonction: 'Coordinatrice des stages',
    specialite: 'Sciences infirmières',
    etablissement: 'ips',
    experience: 14,
    photo: null,
    bio: "Infirmière spécialisée, elle organise les stages hospitaliers de chaque semestre avec les services partenaires et suit les étudiants sur le terrain.",
    formations: ['licence-sciences-infirmieres']
  },

  {
    id: 'hamadi-ouedraogo',
    nom: 'Hamadi OUEDRAOGO',
    fonction: 'Directeur général',
    specialite: 'Gestion des entreprises',
    etablissement: 'cpfp',
    experience: 20,
    photo: './assets/images/instructor-2.webp',
    bio: "Gestionnaire de formation, il intervient en gestion des entreprises et en management auprès des apprenants du CPFP-RF.",
    formations: ['gestion-entreprises']
  },

  {
    id: 'privat-nakulma',
    nom: 'Privat Nakulma',
    fonction: 'Chef du département informatique',
    specialite: 'Maintenance informatique',
    etablissement: 'cpfp',
    experience: 11,
    photo: './assets/images/instructor-4.jpg',
    bio: "Technicien supérieur en informatique, il anime l'atelier de maintenance et les cours de bureautique du CPFP-RF.",
    formations: ['maintenance-informatique', 'agent-bureautique']
  },

  {
    id: 'clarisse-ouoba',
    nom: 'Clarisse Ouoba',
    fonction: 'Formatrice en comptabilité',
    specialite: 'Comptabilité et gestion',
    etablissement: 'cpfp',
    experience: 9,
    photo: null,
    bio: "Comptable de formation, elle enseigne la comptabilité générale et la gestion administrative en lien avec les entreprises de la région.",
    formations: ['gestion-entreprises', 'agent-bureautique']
  },

  {
    id: 'boukary-tankoano',
    nom: 'Boukary Tankoano',
    fonction: 'Formateur en logistique',
    specialite: 'Transport et logistique',
    etablissement: 'cpfp',
    experience: 13,
    photo: null,
    bio: "Logisticien en entreprise de transport, il partage son expérience du terrain et organise les visites de plateformes logistiques.",
    formations: ['transport-logistique']
  }

];
