'use strict';

/**
 * assets/data/documents.js
 * ============================================================================
 * DONNÉES FACTICES (mock) des documents téléchargeables : voir PROJECT_CONTEXT.md §5 et §7.7.
 *
 * Globaux : RF_CATEGORIES_DOCS (catégories, dans l'ordre d'affichage) et RF_DOCUMENTS.
 * Lors de l'intégration Laravel, ce fichier sera remplacé par une requête
 * Eloquent / un endpoint JSON sans toucher au HTML ni au CSS.
 *
 * Conventions :
 *  - categorie     : clé de RF_CATEGORIES_DOCS ;
 *  - type          : 'pdf' | 'docx' | 'xlsx' (icône et libellé) ; taille : en Ko (indicative) ;
 *  - date          : date de mise à jour (ISO) ;
 *  - etablissement : clé de RF_ETABLISSEMENTS (formations.js), ou null pour les trois ;
 *  - fichier       : chemin du fichier, ou null tant qu'il n'est pas fourni : le
 *                    bouton pointe alors vers « # » avec la mention
 *                    « Téléchargement disponible après mise en production ».
 *
 * TODO: fichiers réels, titres et tailles à fournir par le client.
 * ============================================================================
 */

const RF_CATEGORIES_DOCS = {
  brochures:   { titre: 'Brochures et plaquettes', icone: 'book-outline' },
  formulaires: { titre: 'Formulaires', icone: 'create-outline' },
  reglements:  { titre: 'Règlements et chartes', icone: 'shield-checkmark-outline' },
  calendriers: { titre: 'Calendriers et tarifs', icone: 'calendar-outline' }
};

const RF_DOCUMENTS = [

  /* brochures */
  { id: 'brochure-etablissements-2027', titre: 'Brochure générale 2026-2027', categorie: 'brochures', type: 'pdf', taille: 4200, date: '2026-09-01', etablissement: null, fichier: null,
    description: 'Présentation des trois établissements, de leurs formations et des conditions d\'admission.' },
  { id: 'plaquette-ips', titre: 'Plaquette de l\'IPS-RF', categorie: 'brochures', type: 'pdf', taille: 1850, date: '2026-09-01', etablissement: 'ips', fichier: null,
    description: 'Licences professionnelles en santé : programmes, stages et débouchés.' },
  { id: 'plaquette-eps', titre: 'Plaquette de l\'EPS-RF', categorie: 'brochures', type: 'pdf', taille: 1640, date: '2026-09-01', etablissement: 'eps', fichier: null,
    description: 'Formations d\'infirmier, de sage-femme et d\'agent itinérant de santé.' },
  { id: 'plaquette-cpfp', titre: 'Plaquette du CPFP-RF', categorie: 'brochures', type: 'pdf', taille: 1720, date: '2026-09-01', etablissement: 'cpfp', fichier: null,
    description: 'Formations courtes et certifiantes en gestion, numérique et métiers techniques.' },

  /* formulaires */
  { id: 'fiche-inscription', titre: 'Fiche d\'inscription (version papier)', categorie: 'formulaires', type: 'pdf', taille: 320, date: '2026-10-15', etablissement: null, fichier: null,
    description: 'À remplir et à déposer à l\'accueil si vous ne pouvez pas vous préinscrire en ligne.' },
  { id: 'demande-attestation', titre: 'Demande d\'attestation ou de relevé de notes', categorie: 'formulaires', type: 'docx', taille: 85, date: '2026-06-10', etablissement: null, fichier: null,
    description: 'Pour les apprenants et anciens apprenants : attestation d\'inscription, de réussite ou relevé de notes.' },
  { id: 'convention-stage', titre: 'Modèle de convention de stage', categorie: 'formulaires', type: 'docx', taille: 120, date: '2026-05-20', etablissement: null, fichier: null,
    description: 'Convention tripartite entre l\'apprenant, la structure d\'accueil et l\'établissement.' },
  { id: 'certificat-medical', titre: 'Modèle de certificat d\'aptitude physique', categorie: 'formulaires', type: 'pdf', taille: 140, date: '2026-08-01', etablissement: 'eps', fichier: null,
    description: 'Pièce demandée pour les formations de santé, à faire remplir par un médecin.' },

  /* règlements */
  { id: 'reglement-interieur', titre: 'Règlement intérieur', categorie: 'reglements', type: 'pdf', taille: 560, date: '2026-09-01', etablissement: null, fichier: null,
    description: 'Droits et devoirs des apprenants, assiduité, discipline et vie sur le campus.' },
  { id: 'charte-stages', titre: 'Charte des stages cliniques', categorie: 'reglements', type: 'pdf', taille: 380, date: '2026-09-01', etablissement: 'ips', fichier: null,
    description: 'Tenue, secret professionnel et évaluation pendant les stages en milieu hospitalier.' },
  { id: 'reglement-examens', titre: 'Règlement des examens et concours', categorie: 'reglements', type: 'pdf', taille: 410, date: '2026-10-01', etablissement: 'eps', fichier: null,
    description: 'Organisation du concours d\'entrée, des évaluations et des délibérations.' },

  /* calendriers et tarifs */
  { id: 'calendrier-academique', titre: 'Calendrier académique 2026-2027', categorie: 'calendriers', type: 'pdf', taille: 260, date: '2026-09-10', etablissement: null, fichier: null,
    description: 'Rentrées, périodes de stage, examens et vacances des trois établissements.' },
  { id: 'grille-tarifs', titre: 'Frais de formation 2026-2027', categorie: 'calendriers', type: 'xlsx', taille: 48, date: '2026-09-10', etablissement: null, fichier: null,
    description: 'Frais d\'inscription et de scolarité par formation, avec les échéances de paiement.' }

];
