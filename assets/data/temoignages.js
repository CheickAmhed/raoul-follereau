'use strict';

/**
 * assets/data/temoignages.js
 * ============================================================================
 * DONNÉES FACTICES (mock) des témoignages d'anciens apprenants : voir
 * PROJECT_CONTEXT.md §5 et §7.7.
 *
 * Global : RF_TEMOIGNAGES. Lors de l'intégration Laravel, ce fichier sera
 * remplacé par une requête Eloquent / un endpoint JSON sans toucher au HTML ni au CSS.
 *
 * Conventions :
 *  - valide     : seuls les témoignages valide: true sont publiés ; valide: false
 *                 simule un témoignage en attente de modération (futur back-office) ;
 *  - formation  : id de RF_FORMATIONS (formations.js) : établissement, titre et
 *                 lien vers la fiche en sont déduits ;
 *  - promotion  : année d'obtention du diplôme ; poste : situation actuelle ;
 *  - photo      : chemin de l'image, ou null : la carte affiche les initiales.
 *
 * TODO: témoignages réels, autorisations de publication et photos à fournir par
 *       le client. Les trois premiers reprennent ceux de l'accueil ; les autres
 *       sont des exemples à remplacer.
 * ============================================================================
 */

const RF_TEMOIGNAGES = [

  {
    id: 'christine-houessou',
    nom: 'Christine HOUESSOU',
    formation: 'sage-femme',
    promotion: 2024,
    poste: 'Sage-femme',
    photo: './assets/images/client.jpeg',
    valide: true,
    texte: "Diplômée de cette école, j'ai pu intégrer le milieu hospitalier en toute confiance. La qualité de la formation théorique et l'accent mis sur la pratique clinique m'ont permis d'être immédiatement opérationnelle et sereine auprès des patientes. Je recommande vivement cet établissement !"
  },

  {
    id: 'ismael-ouali',
    nom: 'Ismaël OUALI',
    formation: 'maintenance-informatique',
    promotion: 2025,
    poste: 'Technicien de maintenance, à son compte',
    photo: null,
    valide: true,
    texte: "Le CPFP-RF m'a donné bien plus qu'un diplôme : un réseau, des stages concrets et la confiance nécessaire pour lancer ma propre activité de maintenance informatique dès la fin de ma formation."
  },

  {
    id: 'fatimata-zongo',
    nom: 'Fatimata ZONGO',
    formation: 'licence-sciences-infirmieres',
    promotion: 2025,
    poste: "Infirmière diplômée d'État",
    photo: null,
    valide: true,
    texte: "Les formateurs de l'IPS-RF sont des professionnels en exercice. On apprend les gestes qui comptent, sur du matériel réel, et l'accompagnement vers l'emploi ne s'arrête pas à la remise du diplôme."
  },

  {
    id: 'moussa-lankoande',
    nom: 'Moussa LANKOANDÉ',
    formation: 'agent-itinerant-sante',
    promotion: 2024,
    poste: 'Agent itinérant de santé en centre de santé',
    photo: null,
    valide: true,
    texte: "Les stages en CSPS m'ont préparé à la réalité du terrain : vaccinations, causeries éducatives, suivi des familles. Aujourd'hui, je retrouve chaque jour ce que j'ai appris auprès de mes formateurs."
  },

  {
    id: 'rasmata-kabore',
    nom: 'Rasmata KABORÉ',
    formation: 'gestion-entreprises',
    promotion: 2025,
    poste: 'Assistante comptable',
    photo: null,
    valide: true,
    texte: "J'ai choisi le CPFP-RF pour sa proximité et je ne le regrette pas. Les cours de comptabilité sont très concrets et mon stage de fin de formation s'est transformé en premier contrat."
  },

  {
    id: 'daouda-yameogo',
    nom: 'Daouda YAMÉOGO',
    formation: 'transport-logistique',
    promotion: 2025,
    poste: 'Agent de transit',
    photo: null,
    valide: true,
    texte: "Les visites de plateformes logistiques et les cas pratiques m'ont donné une longueur d'avance en entretien. Je savais déjà lire un document de transport et organiser un chargement."
  },

  {
    id: 'awa-sawadogo',
    nom: 'Awa SAWADOGO',
    formation: 'agent-bureautique',
    promotion: 2026,
    poste: 'Secrétaire de direction',
    photo: null,
    valide: true,
    texte: "En neuf mois, j'ai appris à maîtriser les outils bureautiques et la gestion du courrier. Les cours du soir m'ont permis de me former tout en travaillant."
  },

  {
    id: 'ibrahim-compaore',
    nom: 'Ibrahim COMPAORÉ',
    formation: 'infirmier',
    promotion: 2023,
    poste: 'Infirmier en centre médical',
    photo: null,
    valide: true,
    texte: "Le concours d'entrée était exigeant, mais l'encadrement pendant les trois années l'est tout autant, dans le bon sens. Les stages cliniques au CHRU ont été décisifs pour mon premier poste."
  },

  {
    id: 'nafissatou-diallo',
    nom: 'Nafissatou DIALLO',
    formation: 'licence-sciences-infirmieres',
    promotion: 2025,
    poste: 'Infirmière coordinatrice',
    photo: null,
    valide: true,
    texte: "Déjà infirmière, j'ai repris mes études grâce à la passerelle de la licence. Les cours de gestion des soins m'ont ouvert les portes d'un poste de coordination."
  },

  {
    id: 'temoignage-en-attente',
    nom: 'Témoignage en attente',
    formation: 'sage-femme',
    promotion: 2026,
    poste: '',
    photo: null,
    valide: false,                     // en attente de modération : jamais affiché
    texte: 'Texte en cours de validation.'
  }

];
