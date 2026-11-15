'use strict';

/**
 * assets/data/galerie.js
 * ============================================================================
 * DONNÉES FACTICES (mock) de la galerie photo : voir PROJECT_CONTEXT.md §5 et §7.7.
 *
 * Global : RF_GALERIE (albums). Lors de l'intégration Laravel, ce fichier sera
 * remplacé par une requête Eloquent / un endpoint JSON sans toucher au HTML ni au CSS.
 *
 * Conventions :
 *  - id            : slug stable de l'album, utilisé dans l'URL (?album=) ;
 *  - date          : date de l'album (ISO) : les albums sont affichés du plus récent au plus ancien ;
 *  - etablissement : clé de RF_ETABLISSEMENTS (formations.js), ou null pour les trois ;
 *  - photos[]      : { src, alt, legende } ; alt décrit l'image, legende s'affiche
 *                    sous la photo dans la visionneuse.
 *
 * TODO: photos réelles des Établissements à fournir par le client (les images
 *       sont provisoirement reprises de la banque d'images du site).
 * ============================================================================
 */

const RF_GALERIE = [

  {
    id: 'vie-campus',
    titre: 'Vie du campus',
    date: '2026-10-15',
    etablissement: null,
    description: "Rentrée, journée d'intégration et moments partagés entre les apprenants des trois établissements.",
    photos: [
      { src: './assets/images/blog-3.jpeg', alt: 'Apprenants en uniforme réunis en plein air', legende: 'Sortie de terrain des apprenants en transport et logistique' },
      { src: './assets/images/event-img.jpg', alt: 'Étudiant souriant, sac au dos, devant un bâtiment', legende: 'Rentrée académique 2026-2027' },
      { src: './assets/images/course-6.jpg', alt: 'Étudiants souriants travaillant ensemble autour de leurs ordinateurs', legende: "Journée d'intégration des nouveaux apprenants" },
      { src: './assets/images/banner-img.png', alt: 'Trois apprenants, dont une infirmière et un étudiant en blouse', legende: 'Apprenants de l\'EPS-RF et de l\'IPS-RF' }
    ]
  },

  {
    id: 'travaux-pratiques',
    titre: 'Travaux pratiques en santé',
    date: '2026-06-23',
    etablissement: 'ips',
    description: "Laboratoire, salle de soins et stages : la pratique au cœur des formations de santé.",
    photos: [
      { src: './assets/images/blog-2.jpg', alt: "Étudiants en blouse blanche lors d'une séance de travaux pratiques", legende: 'Travaux pratiques au laboratoire' },
      { src: './assets/images/course-5.png', alt: "Élève infirmière prenant la tension artérielle d'une patiente", legende: 'Prise des constantes en salle de soins' },
      { src: './assets/images/course-1.jpg', alt: "Élève sage-femme auprès d'une mère et de son nouveau-né", legende: 'Stage en maternité' },
      { src: './assets/images/client.jpeg', alt: 'Apprenante infirmière en tenue de soins', legende: 'En tenue pour le stage hospitalier' }
    ]
  },

  {
    id: 'ateliers-cpfp',
    titre: 'Ateliers du CPFP-RF',
    date: '2026-04-03',
    etablissement: 'cpfp',
    description: 'Maintenance informatique, bureautique, gestion et logistique : les formations professionnelles en situation.',
    photos: [
      { src: './assets/images/course-6.jpeg', alt: "Apprenants réparant l'unité centrale d'un ordinateur", legende: 'Atelier de maintenance informatique' },
      { src: './assets/images/course-3.jpg', alt: 'Apprenante travaillant sur un poste informatique, téléphone à la main', legende: 'Mise en situation en bureautique' },
      { src: './assets/images/course-2.png', alt: "Salle de réunion équipée d'un grand écran", legende: 'Cours de gestion des entreprises' },
      { src: './assets/images/course-4.jpg', alt: 'Apprenant en gilet de sécurité contrôlant un chargement devant des camions', legende: 'Visite d\'une plateforme logistique' }
    ]
  },

  {
    id: 'ceremonies-2026',
    titre: 'Cérémonies 2026',
    date: '2026-08-07',
    etablissement: null,
    description: 'Sorties de promotion et temps forts officiels de l\'année.',
    photos: [
      { src: './assets/images/blog-1.jpg', alt: 'Lancer de toques lors de la cérémonie de sortie de promotion', legende: 'Sortie de la promotion 2026 de l\'IPS-RF' },
      { src: './assets/images/coure-features-img.png', alt: 'Membres souriants d\'une équipe en tenue professionnelle', legende: "L'équipe d'encadrement" },
      { src: './assets/images/images.png', alt: 'Trois personnes en tenue professionnelle, souriantes', legende: 'Accueil des partenaires' }
    ]
  }

];
