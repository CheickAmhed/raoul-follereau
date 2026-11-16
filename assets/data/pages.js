'use strict';

/**
 * assets/data/pages.js
 * ============================================================================
 * Pages du site proposées par la recherche (recherche.html), à côté des
 * formations, actualités, questions, documents, enseignants et albums déjà
 * décrits dans les autres fichiers de données. Global : RF_PAGES_SITE.
 *
 * Conventions :
 *  - url         : page (et ancre éventuelle) ouverte par le résultat ;
 *  - titre       : titre affiché ; description : extrait affiché sous le titre ;
 *  - motsCles    : termes que les visiteurs tapent pour trouver la page sans
 *                  qu'ils figurent dans le titre (« adresse », « horaires »…).
 *
 * À compléter quand une page est ajoutée au site.
 * TODO (phase Laravel) : remplacé par l'index de recherche côté serveur.
 * ============================================================================
 */

const RF_PAGES_SITE = [

  {
    url: 'index.html',
    titre: 'Accueil',
    description: "Les Établissements Raoul Follereau à Fada N'Gourma : formations, calendrier des rentrées, chiffres clés et actualités.",
    motsCles: "accueil établissements raoul follereau fada n'gourma burkina faso"
  },
  {
    url: 'formations.html',
    titre: 'Catalogue des formations',
    description: "Toutes les formations de l'IPS-RF, de l'EPS-RF et du CPFP-RF, à filtrer par établissement, domaine, niveau et durée.",
    motsCles: 'formations catalogue filières cursus études diplômes licence brevet certificat métiers'
  },
  {
    url: 'preinscription.html',
    titre: 'Préinscription en ligne',
    description: 'Déposez votre candidature en cinq étapes : formation, informations personnelles, parcours, pièces justificatives et récapitulatif.',
    motsCles: "préinscription inscription candidature postuler candidater dossier s'inscrire admission"
  },
  {
    url: 'institution.html',
    titre: "L'institution",
    description: "Histoire, mission, équipe de direction, infrastructures et partenaires des trois établissements.",
    motsCles: 'institution présentation à propos histoire mission valeurs direction infrastructures partenaires'
  },
  {
    url: 'institution.html#ips',
    titre: 'IPS-RF : Institut Privé Supérieur de formation en Santé',
    description: "Licences professionnelles en santé, dans le système LMD, à Fada N'Gourma.",
    motsCles: 'ips institut supérieur santé université lmd licence'
  },
  {
    url: 'institution.html#eps',
    titre: 'EPS-RF : École Privée de Santé',
    description: "Formations d'infirmier, de sage-femme et d'agent itinérant de santé, sur concours d'entrée.",
    motsCles: 'eps école santé paramédical infirmier sage-femme concours'
  },
  {
    url: 'institution.html#cpfp',
    titre: 'CPFP-RF : Centre Professionnel de Formation Professionnelle',
    description: 'Formations qualifiantes en gestion, transport et logistique, bureautique et maintenance informatique.',
    motsCles: 'cpfp centre professionnel métiers technique qualification apprentissage'
  },
  {
    url: 'actualites.html',
    titre: 'Actualités et événements',
    description: 'Annonces, concours, rentrées et événements à venir des trois établissements.',
    motsCles: 'actualités nouvelles annonces événements agenda blog'
  },
  {
    url: 'galerie.html',
    titre: 'Galerie photo',
    description: 'Albums photo de la vie du campus, des travaux pratiques et des ateliers.',
    motsCles: 'galerie photos images albums campus'
  },
  {
    url: 'formateurs.html',
    titre: 'Nos enseignants',
    description: "L'équipe pédagogique des trois établissements : spécialités, parcours et formations enseignées.",
    motsCles: 'enseignants formateurs professeurs équipe pédagogique'
  },
  {
    url: 'temoignages.html',
    titre: 'Témoignages',
    description: 'Anciens apprenants et diplômés racontent leur formation et leur insertion professionnelle.',
    motsCles: 'témoignages avis anciens apprenants diplômés étudiants'
  },
  {
    url: 'documents.html',
    titre: 'Documents à télécharger',
    description: 'Brochures, formulaires, règlements, calendrier académique et frais de formation.',
    motsCles: 'documents télécharger brochure formulaire règlement calendrier tarifs pdf'
  },
  {
    url: 'faq.html',
    titre: 'Questions fréquentes',
    description: "Admission, formations, frais et vie pratique : les réponses aux questions les plus posées.",
    motsCles: 'faq questions réponses aide renseignements'
  },
  {
    url: 'contact.html',
    titre: "Contact et plan d'accès",
    description: "Formulaire de contact, téléphone, WhatsApp, adresse, horaires d'ouverture et carte d'accès au campus.",
    motsCles: 'contact contacter écrire adresse téléphone email whatsapp plan accès itinéraire horaires localisation'
  },
  {
    url: 'connexion.html',
    titre: 'Espace candidat',
    description: 'Connectez-vous pour suivre votre candidature, déposer vos pièces et lire les messages du service des admissions.',
    motsCles: 'espace candidat compte connexion se connecter suivi dossier mot de passe'
  },
  {
    url: 'confidentialite.html',
    titre: 'Politique de confidentialité',
    description: 'Les données que nous recueillons, pourquoi, combien de temps nous les gardons et comment exercer vos droits.',
    motsCles: 'confidentialité données personnelles vie privée cookies'
  },
  {
    url: 'termes.html',
    titre: "Conditions d'utilisation",
    description: "Les règles d'utilisation du site et de la préinscription en ligne.",
    motsCles: 'conditions utilisation termes cgu règles'
  },
  {
    url: 'mentions-legales.html',
    titre: 'Mentions légales',
    description: 'Éditeur du site, directeur de la publication, hébergement, crédits et propriété intellectuelle.',
    motsCles: 'mentions légales éditeur hébergeur crédits'
  }

];
