'use strict';

/**
 * assets/data/compte.js
 * ============================================================================
 * DONNÉES FACTICES (mock) de l'espace candidat : un compte de démonstration.
 *
 * Global : RF_COMPTE_DEMO. Il n'y a pas de backend : la connexion est simulée
 * (voir assets/js/auth-demo.js). Lors de l'intégration Laravel, l'authentification
 * se fera côté serveur (mot de passe haché, session sécurisée) et ce fichier
 * sera remplacé par les données du candidat connecté.
 *
 * Conventions :
 *  - candidature.formation / session : ids de RF_FORMATIONS (formations.js) ;
 *  - candidature.piecesRecues : index, dans documentsRequis de la formation, des
 *    pièces déjà reçues ; les autres pièces sont « manquantes » ;
 *  - etapes[].etat : 'fait' | 'en-cours' | 'a-venir' ;
 *  - messages[].lu : état initial (la lecture est ensuite mémorisée pour la session).
 *
 * TODO: compte de démonstration À SUPPRIMER avant la mise en ligne (identifiants
 *       publics, affichés sur la page de connexion pour les tests).
 * ============================================================================
 */

const RF_COMPTE_DEMO = {

  identifiant: 'candidat@exemple.com',
  motDePasse:  'Demo-2026',

  candidat: {
    prenom: 'Aminata',
    nom: 'OUEDRAOGO',
    naissance: '2004-05-12',
    email: 'candidat@exemple.com',
    telephone: '+226 70 12 34 56',
    adresse: "Secteur 4, Fada N'Gourma"
  },

  candidature: {
    reference: 'RF-2026-48213',
    formation: 'sage-femme',
    session: 'sfe-2027-concours',
    date: '2026-11-08',
    piecesRecues: [0, 1, 2, 4],
    etapes: [
      { titre: 'Préinscription reçue', date: '2026-11-08', etat: 'fait' },
      { titre: 'Vérification du dossier', etat: 'en-cours' },
      { titre: "Concours d'entrée", date: '2027-04-01', etat: 'a-venir' },
      { titre: 'Résultats', etat: 'a-venir', detail: 'Publiés après le concours' },
      { titre: 'Inscription définitive', date: '2027-10-01', etat: 'a-venir', detail: 'Rentrée académique 2027-2028' }
    ]
  },

  messages: [
    {
      id: 'preinscription-enregistree',
      date: '2026-11-08',
      titre: 'Votre préinscription est enregistrée',
      texte: "Votre préinscription RF-2026-48213 à la formation SIO - Sage-femme a bien été reçue. Notre équipe vérifie votre dossier et reviendra vers vous si une pièce manque.",
      lu: true
    },
    {
      id: 'pieces-manquantes',
      date: '2026-11-10',
      titre: 'Deux pièces manquent à votre dossier',
      texte: "Pour finaliser votre candidature au concours d'entrée, déposez le certificat médical d'aptitude de moins de 3 mois et la copie légalisée de votre baccalauréat avec le relevé de notes. Vous pouvez les déposer depuis votre espace ou à l'accueil, avant le 10 mars 2027.",
      lu: false
    },
    {
      id: 'portes-ouvertes',
      date: '2026-11-12',
      titre: 'Journée portes ouvertes le 5 décembre',
      texte: "Venez visiter le laboratoire et la salle de soins, et rencontrer les enseignants de l'EPS-RF, le samedi 5 décembre de 8 h 30 à 16 h.",
      lien: { texte: "Voir l'événement", href: 'actualite-detail.html?id=journee-portes-ouvertes-2026' },
      lu: false
    }
  ]

};
