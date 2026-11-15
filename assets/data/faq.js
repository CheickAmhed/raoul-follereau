'use strict';

/**
 * assets/data/faq.js
 * ============================================================================
 * DONNÉES FACTICES (mock) de la foire aux questions : voir PROJECT_CONTEXT.md §5.
 *
 * Globaux : RF_FAQ_CATEGORIES (thèmes, dans l'ordre d'affichage) et RF_FAQ.
 * Lors de l'intégration Laravel, ce fichier sera remplacé par une requête
 * Eloquent / un endpoint JSON sans toucher au HTML ni au CSS.
 *
 * Conventions :
 *  - id        : slug stable, ancre de la question (faq.html#id) ;
 *  - categorie : clé de RF_FAQ_CATEGORIES ;
 *  - reponse   : blocs dans l'ordre : chaîne = paragraphe, { liste: [...] } = liste à puces ;
 *  - liens     : facultatif, [{ texte, href }] affichés sous la réponse.
 *
 * Les réponses reprennent les informations déjà publiées sur le site (fiches
 * formation, préinscription, contact, documents) pour rester cohérentes.
 * TODO: réponses à valider par le client, en particulier les frais, les
 *       modalités de paiement, les horaires et le délai de réponse.
 * ============================================================================
 */

const RF_FAQ_CATEGORIES = {
  admission:  { titre: 'Admission et préinscription', icone: 'clipboard-outline' },
  formations: { titre: 'Formations et diplômes', icone: 'school-outline' },
  frais:      { titre: 'Frais de formation', icone: 'wallet-outline' },
  pratique:   { titre: 'Vie pratique et contact', icone: 'information-circle-outline' }
};

const RF_FAQ = [

  /* ------------------------------------------------- admission et préinscription */

  {
    id: 'comment-se-preinscrire',
    categorie: 'admission',
    question: 'Comment me préinscrire à une formation ?',
    reponse: [
      "La préinscription se fait en ligne, en cinq étapes : choix de la formation et de la session, informations personnelles, parcours scolaire ou professionnel, pièces justificatives, puis vérification et envoi.",
      "Un numéro de candidature vous est attribué dès l'envoi. Vous pouvez aussi vous préinscrire à l'accueil des Établissements, aux heures d'ouverture."
    ],
    liens: [{ texte: 'Commencer ma préinscription', href: 'preinscription.html' }]
  },

  {
    id: 'preinscription-gratuite',
    categorie: 'admission',
    question: 'La préinscription est-elle payante ?',
    reponse: [
      "Non. La préinscription en ligne est gratuite et sans engagement. Les frais d'inscription et de scolarité sont réglés une fois votre admission confirmée."
    ]
  },

  {
    id: 'apres-la-preinscription',
    categorie: 'admission',
    question: "Que se passe-t-il après l'envoi de ma préinscription ?",
    reponse: [
      "Notre équipe vous contacte sous 72 heures ouvrées pour vérifier votre dossier et vous indiquer la suite : test de niveau, concours d'entrée ou entretien, selon la formation.",
      "Vous recevez ensuite la date de la rentrée ou des épreuves. Les pièces manquantes peuvent être déposées à l'accueil ou envoyées par email."
    ]
  },

  {
    id: 'niveau-requis',
    categorie: 'admission',
    question: 'Quel niveau faut-il pour entrer dans vos formations ?',
    reponse: [
      "Les conditions dépendent de l'établissement et de la formation :",
      { liste: [
        "CPFP-RF : à partir du niveau troisième, du BEPC ou d'une expérience professionnelle selon la formation, après un test de niveau.",
        "EPS-RF : sur concours d'entrée, avec le BEPC pour la formation d'agent itinérant de santé et le baccalauréat, séries D, C, A ou F8, pour les filières infirmier et sage-femme. Il faut avoir au moins 17 ans à la rentrée.",
        "IPS-RF : sur dossier et entretien, avec un baccalauréat scientifique ou équivalent, ou un diplôme d'État d'infirmier ou paramédical pour les professionnels de santé."
      ] },
      "Les conditions exactes figurent dans la rubrique « Conditions d'admission » de chaque fiche formation."
    ],
    liens: [{ texte: 'Voir le catalogue des formations', href: 'formations.html' }]
  },

  {
    id: 'concours-eps',
    categorie: 'admission',
    question: "Comment se déroule le concours d'entrée de l'EPS-RF ?",
    reponse: [
      "Le concours comprend des épreuves écrites le matin et un entretien de motivation l'après-midi. Les candidats se présentent munis de leur convocation et d'une pièce d'identité.",
      "Les dates de la session en cours, la clôture des inscriptions et les filières concernées sont détaillées dans l'annonce du concours."
    ],
    liens: [{ texte: "Lire l'annonce du concours", href: 'actualite-detail.html?id=concours-eps-2027' }]
  },

  {
    id: 'pieces-a-fournir',
    categorie: 'admission',
    question: 'Quelles pièces dois-je fournir ?',
    reponse: [
      "La liste dépend de la formation : elle figure dans la rubrique « Pièces à fournir » de chaque fiche formation. En ligne, les fichiers sont acceptés au format PDF, JPG ou PNG, jusqu'à 5 Mo chacun.",
      "Il vous manque une pièce ? Vous pourrez compléter votre dossier plus tard, à l'accueil ou par email."
    ]
  },

  {
    id: 'formation-complete',
    categorie: 'admission',
    question: "La formation qui m'intéresse est complète ou pas encore ouverte : que faire ?",
    reponse: [
      "Sur la fiche de la formation, les boutons « Être informé(e) de l'ouverture » ou « Me signaler pour la prochaine session » vous permettent de laisser vos coordonnées. Nous vous prévenons dès l'ouverture des inscriptions."
    ],
    liens: [{ texte: 'Voir les formations', href: 'formations.html' }]
  },

  /* ------------------------------------------------------ formations et diplômes */

  {
    id: 'formations-proposees',
    categorie: 'formations',
    question: 'Quelles formations proposez-vous ?',
    reponse: [
      'Les trois établissements couvrent la santé, la gestion, le numérique et les métiers techniques :',
      { liste: [
        'IPS-RF : licences professionnelles en sciences infirmières et en santé publique.',
        'EPS-RF : infirmier, sage-femme et agent itinérant de santé.',
        'CPFP-RF : gestion des entreprises, transport et logistique, bureautique et maintenance informatique.'
      ] }
    ],
    liens: [{ texte: 'Parcourir le catalogue', href: 'formations.html' }]
  },

  {
    id: 'diplomes',
    categorie: 'formations',
    question: 'Quel diplôme obtient-on à la fin de la formation ?',
    reponse: [
      "Selon la formation : certificat de qualification professionnelle ou brevet de technicien au CPFP-RF, diplôme d'État à l'EPS-RF, licence professionnelle du système LMD à l'IPS-RF.",
      'Le diplôme préparé est indiqué dans les informations clés de chaque fiche formation.'
    ]
  },

  {
    id: 'cours-du-soir',
    categorie: 'formations',
    question: 'Proposez-vous des cours du soir ou à distance ?',
    reponse: [
      'Oui, pour certaines formations. La formation Agent en bureautique se suit en journée ou en cours du soir, et la licence professionnelle en santé publique combine cours en présentiel et modules à distance.',
      'Le rythme de chaque formation est précisé sur sa fiche.'
    ]
  },

  {
    id: 'stages',
    categorie: 'formations',
    question: 'Les stages sont-ils inclus dans la formation ?',
    reponse: [
      "Oui. Les formations de santé comprennent des stages cliniques encadrés, notamment au CHRU de Fada N'Gourma. Au CPFP-RF, ateliers pratiques, visites de terrain et stage de fin de formation complètent les cours."
    ],
    liens: [{ texte: 'La convention de stages avec le CHRU', href: 'actualite-detail.html?id=convention-chru-fada-2026' }]
  },

  /* --------------------------------------------------------- frais de formation */

  {
    id: 'cout-formation',
    categorie: 'frais',
    question: 'Combien coûte une formation ?',
    reponse: [
      "Les frais varient selon la formation. Le montant est indiqué sur chaque fiche formation, par année ou pour la formation complète. Le détail des frais de l'année figure dans le document « Frais de formation »."
    ],
    liens: [{ texte: 'Consulter les frais de formation', href: 'documents.html?categorie=calendriers' }]
  },

  {
    id: 'paiement-echelonne',
    categorie: 'frais',
    question: 'Peut-on payer en plusieurs fois ?',
    reponse: [
      "Le document « Frais de formation » précise les échéances de paiement. Pour une situation particulière, prenez contact avec le service administratif avant la rentrée."
    ],
    liens: [{ texte: 'Contacter le service administratif', href: 'contact.html?objet=general' }]
  },

  /* ---------------------------------------------------- vie pratique et contact */

  {
    id: 'adresse-acces',
    categorie: 'pratique',
    question: 'Où se trouvent les établissements ?',
    reponse: [
      "Les trois établissements sont réunis sur un même site à Fada N'Gourma. L'adresse, le plan d'accès et un lien d'itinéraire figurent sur la page Contact."
    ],
    liens: [{ texte: "Voir le plan d'accès", href: 'contact.html' }]
  },

  {
    id: 'horaires-accueil',
    categorie: 'pratique',
    question: "Quels sont les horaires de l'accueil ?",
    reponse: [
      "L'accueil est ouvert du lundi au vendredi de 7 h 30 à 17 h 30, et le samedi de 8 h à 12 h."
    ]
  },

  {
    id: 'attestation-releve',
    categorie: 'pratique',
    question: 'Comment obtenir une attestation ou un relevé de notes ?',
    reponse: [
      "Téléchargez le formulaire de demande, remplissez-le puis déposez-le à l'accueil ou envoyez-le par email. Le délai de traitement vous est indiqué au dépôt."
    ],
    liens: [{ texte: 'Télécharger le formulaire de demande', href: 'documents.html?q=attestation' }]
  },

  {
    id: 'nous-contacter',
    categorie: 'pratique',
    question: 'Comment vous contacter ?',
    reponse: [
      'Par le formulaire de contact, par téléphone ou sur WhatsApp. Nous répondons sous 48 heures ouvrées.'
    ],
    liens: [{ texte: 'Nous écrire', href: 'contact.html?objet=general' }]
  }

];
