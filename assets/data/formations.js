'use strict';

/**
 * assets/data/formations.js
 * ============================================================================
 * DONNÉES FACTICES (mock) du catalogue de formations — voir PROJECT_CONTEXT.md §5.
 *
 * Source unique de vérité côté front tant qu'il n'y a pas de backend :
 *  - formations.html        -> grille filtrable (assets/js/pages/formations.js) ;
 *  - formation-detail.html  -> fiche détaillée (?id=)             [à venir] ;
 *  - preinscription.html    -> selects en cascade (?formation=)   [à venir].
 *
 * Chargé en <script> classique AVANT utils.js et les scripts de page : les
 * constantes ci-dessous sont donc visibles globalement (RF_ETABLISSEMENTS,
 * RF_DOMAINES, RF_NIVEAUX, RF_FORMATIONS). Lors de l'intégration Laravel, ce
 * fichier sera remplacé par une requête Eloquent / un endpoint JSON sans
 * toucher au HTML ni au CSS.
 *
 * Conventions :
 *  - id            : slug stable utilisé dans les URLs (?id= / ?formation=) ;
 *                    les 6 premiers slugs sont ceux déjà présents dans les
 *                    liens des cartes de index.html ;
 *  - etablissement : clé de RF_ETABLISSEMENTS ; domaine : clé de RF_DOMAINES ;
 *                    niveau : clé de RF_NIVEAUX ;
 *  - dureeMois     : durée numérique (filtre « durée ») ; duree : libellé affiché ;
 *  - prix          : en FCFA, par période prixPeriode ('an', ou null = forfait) ;
 *  - sessions[]    : statut 'ouvert' | 'complet' | 'a-venir' (dates ISO) ; une
 *                    formation est « inscriptions ouvertes » dès qu'une session
 *                    est 'ouvert', « complet » si une session l'est sans autre
 *                    session ouverte, sinon « ouverture prochaine ».
 *
 * TODO: prix, dates, places et programmes à valider par le client.
 * TODO: images réelles à fournir par le client pour les 3 dernières formations
 *       (elles réutilisent provisoirement des visuels existants du site).
 * ============================================================================
 */

const RF_ETABLISSEMENTS = {
  ips: {
    sigle: 'IPS-RF',
    nom: "Institut Privé Supérieur de formation en Santé Raoul Follereau",
    logo: './assets/images/rf-ips.png',
    lien: 'institution.html#ips'
  },
  eps: {
    sigle: 'EPS-RF',
    nom: "École Privée de Santé Raoul Follereau",
    logo: './assets/images/rf-eps.png',
    lien: 'institution.html#eps'
  },
  cpfp: {
    sigle: 'CPFP-RF',
    nom: "Centre Professionnel de Formation Professionnelle Raoul Follereau",
    logo: './assets/images/rf-cpfp.png',
    lien: 'institution.html#cpfp'
  }
};

const RF_DOMAINES = {
  sante:     'Santé',
  gestion:   'Gestion & Commerce',
  numerique: 'Numérique & Projets'
};

const RF_NIVEAUX = {
  licence:        'Licence professionnelle',
  'diplome-etat': "Diplôme d'État",
  brevet:         'Brevet de technicien',
  certificat:     'Certificat de qualification'
};

/* pièces communes à tous les dossiers de candidature */
const RF_DOCUMENTS_BASE = [
  "Demande manuscrite adressée à la Direction",
  "Extrait d'acte de naissance ou jugement supplétif",
  "Copie de la CNIB ou du passeport",
  "Certificat médical d'aptitude de moins de 3 mois",
  "4 photos d'identité récentes"
];

const RF_FORMATIONS = [

  /* ===================== IPS-RF — niveau supérieur (LMD) ===================== */

  {
    id: 'licence-sciences-infirmieres',
    etablissement: 'ips',
    titre: 'Licence professionnelle en Sciences Infirmières',
    sousTitre: "Bac+3 — infirmier(ère) de niveau licence, système LMD",
    domaine: 'sante',
    niveau: 'licence',
    dureeMois: 36,
    duree: '3 ans (6 semestres)',
    prix: 450000,
    prixPeriode: 'an',
    rythme: 'Présentiel, stages hospitaliers chaque semestre',
    image: './assets/images/blog-2.jpg',
    imageAlt: "Étudiants de l'IPS-RF en travaux pratiques de laboratoire",
    apprenants: 180,
    resume: "Une formation universitaire professionnalisante pour des infirmiers capables de raisonnement clinique, d'encadrement et de recherche.",
    description: "La licence en Sciences Infirmières de l'IPS-RF forme des professionnels de santé de niveau supérieur, aptes à prendre en charge des situations de soins complexes, à coordonner une équipe et à participer à l'amélioration continue de la qualité des soins. Le cursus suit le système LMD : cours magistraux, travaux dirigés, simulation en laboratoire et stages dans les structures sanitaires partenaires de la région de l'Est.",
    objectifs: [
      "Mobiliser un raisonnement clinique rigoureux dans des situations de soins complexes",
      "Organiser et coordonner les activités d'une unité de soins",
      "Conduire une démarche de recherche en soins infirmiers",
      "Encadrer les stagiaires et participer à la formation continue des équipes"
    ],
    modules: [
      "Sciences biomédicales fondamentales",
      "Soins infirmiers avancés et pratiques fondées sur les preuves",
      "Santé publique et épidémiologie",
      "Management des services de santé",
      "Méthodologie de la recherche et anglais médical",
      "Stages cliniques et mémoire de fin d'études"
    ],
    diplome: "Licence professionnelle en Sciences Infirmières (LMD)",
    debouches: [
      "Infirmier(ère) dans les hôpitaux publics et cliniques privées",
      "Responsable d'unité de soins, encadrement d'équipe",
      "Chargé(e) de programmes dans les ONG et organisations internationales",
      "Poursuite d'études en master (santé publique, management hospitalier)"
    ],
    conditionsAdmission: [
      "Baccalauréat séries D, C ou équivalent, ou diplôme d'État d'infirmier (passerelle professionnelle)",
      "Étude de dossier puis entretien de motivation",
      "Aptitude physique attestée par un certificat médical"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Copie légalisée du baccalauréat ou du diplôme d'État d'infirmier",
      "Relevés de notes des deux dernières années"
    ]),
    sessions: [
      {
        id: 'lsi-2027-rentree',
        libelle: 'Rentrée académique 2027–2028',
        debut: '2027-10-01',
        dateLimite: '2027-09-15',
        places: 50,
        placesRestantes: 37,
        statut: 'ouvert'
      }
    ]
  },

  {
    id: 'licence-sante-publique',
    etablissement: 'ips',
    titre: 'Licence professionnelle en Santé Publique',
    sousTitre: "Épidémiologie, promotion de la santé et gestion de programmes",
    domaine: 'sante',
    niveau: 'licence',
    dureeMois: 36,
    duree: '3 ans (6 semestres)',
    prix: 450000,
    prixPeriode: 'an',
    rythme: 'Hybride : cours en présentiel et modules à distance',
    image: './assets/images/course-6.jpg',
    imageAlt: "Étudiants travaillant en équipe sur un projet de santé communautaire",
    apprenants: 95,
    resume: "Analyser la situation sanitaire d'une population, concevoir et piloter des programmes de prévention et de promotion de la santé.",
    description: "Cette licence prépare des cadres intermédiaires de la santé publique capables d'appuyer les districts sanitaires, les collectivités et les ONG dans la planification, la mise en œuvre et le suivi-évaluation des interventions de santé. Elle associe épidémiologie, biostatistique, communication pour le changement de comportement et gestion de projet.",
    objectifs: [
      "Décrire et analyser l'état de santé d'une population",
      "Concevoir, budgétiser et suivre un programme de santé",
      "Mettre en place une surveillance épidémiologique de routine",
      "Animer des actions de promotion de la santé auprès des communautés"
    ],
    modules: [
      "Épidémiologie et biostatistique",
      "Systèmes et politiques de santé",
      "Promotion de la santé et communication",
      "Gestion de projets et suivi-évaluation",
      "Nutrition, eau, hygiène et santé environnementale",
      "Informatique appliquée, stage et mémoire"
    ],
    diplome: "Licence professionnelle en Santé Publique",
    debouches: [
      "Chargé(e) de suivi-évaluation dans un district sanitaire",
      "Assistant(e) de programme dans une ONG ou une agence de coopération",
      "Animateur(trice) de santé communautaire",
      "Poursuite d'études en master de santé publique"
    ],
    conditionsAdmission: [
      "Baccalauréat toutes séries scientifiques ou diplôme paramédical avec expérience",
      "Étude de dossier et entretien"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Copie légalisée du baccalauréat ou du diplôme paramédical",
      "Curriculum vitae et lettre de motivation"
    ]),
    sessions: [
      {
        id: 'lsp-2027-rentree',
        libelle: 'Rentrée académique 2027–2028',
        debut: '2027-10-01',
        ouvertureInscriptions: '2027-03-01',
        dateLimite: '2027-09-15',
        places: 40,
        placesRestantes: 40,
        statut: 'a-venir'
      }
    ]
  },

  /* ===================== EPS-RF — école de santé ===================== */

  {
    id: 'sage-femme',
    etablissement: 'eps',
    titre: 'SIO - Sage-femme',
    sousTitre: "Sage-femme / Maïeuticien d'État (SFE / ME)",
    domaine: 'sante',
    niveau: 'diplome-etat',
    dureeMois: 36,
    duree: '3 ans',
    prix: 350000,
    prixPeriode: 'an',
    rythme: 'Présentiel, stages cliniques inclus',
    image: './assets/images/course-1.jpg',
    imageAlt: "Apprenantes en soins obstétricaux",
    apprenants: 640,
    resume: "Accompagner la femme et le nouveau-né avant, pendant et après l'accouchement : une formation complète en santé maternelle et néonatale.",
    description: "Le cycle Sage-femme / Maïeuticien d'État forme des professionnels capables d'assurer le suivi de la grossesse, de pratiquer l'accouchement normal, de dépister les complications et d'orienter à temps les cas à risque. L'enseignement théorique dispensé à l'EPS-RF est complété par des stages encadrés dans les maternités et centres de santé partenaires de la région de l'Est.",
    objectifs: [
      "Assurer les consultations prénatales et le suivi de la grossesse",
      "Pratiquer l'accouchement eutocique et les soins immédiats au nouveau-né",
      "Dépister les grossesses à risque et référer sans délai",
      "Promouvoir la planification familiale et la santé de la reproduction"
    ],
    modules: [
      "Anatomie, physiologie et sémiologie",
      "Obstétrique et pathologies de la grossesse",
      "Néonatalogie et soins au nouveau-né",
      "Gynécologie et santé de la reproduction",
      "Pharmacologie et soins infirmiers de base",
      "Santé publique, éthique et déontologie",
      "Stages hospitaliers (maternités, CSPS, CHR de Fada N'Gourma)"
    ],
    diplome: "Diplôme d'État de Sage-femme / Maïeuticien",
    debouches: [
      "Maternités des hôpitaux publics et des cliniques privées",
      "Centres de santé et de promotion sociale (CSPS)",
      "Programmes de santé maternelle et infantile des ONG",
      "Poursuite d'études : licence professionnelle à l'IPS-RF"
    ],
    conditionsAdmission: [
      "Baccalauréat (séries D, C, A ou F8) ou diplôme équivalent",
      "Réussite au concours d'entrée (épreuves écrites et entretien)",
      "Être âgé(e) d'au moins 17 ans à la rentrée"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Copie légalisée du baccalauréat et relevé de notes"
    ]),
    sessions: [
      {
        id: 'sfe-2027-concours',
        libelle: "Concours d'entrée — session d'avril 2027",
        debut: '2027-04-01',
        dateLimite: '2027-03-10',
        places: 40,
        placesRestantes: 23,
        statut: 'ouvert'
      },
      {
        id: 'sfe-2027-rentree',
        libelle: 'Rentrée académique 2027–2028',
        debut: '2027-10-01',
        ouvertureInscriptions: '2027-05-03',
        dateLimite: '2027-09-20',
        places: 40,
        placesRestantes: 40,
        statut: 'a-venir'
      }
    ]
  },

  {
    id: 'infirmier',
    etablissement: 'eps',
    titre: 'SIO - Infirmier',
    sousTitre: "Infirmier(ère) diplômé(e) d'État (IDE)",
    domaine: 'sante',
    niveau: 'diplome-etat',
    dureeMois: 36,
    duree: '3 ans',
    prix: 350000,
    prixPeriode: 'an',
    rythme: 'Présentiel, stages cliniques inclus',
    image: './assets/images/course-5.png',
    imageAlt: "Apprenants en soins infirmiers",
    apprenants: 820,
    resume: "Devenir un professionnel des soins infirmiers polyvalent, présent dans tous les services hospitaliers et les structures de premier contact.",
    description: "La formation d'Infirmier diplômé d'État prépare à dispenser des soins préventifs, curatifs et palliatifs de qualité, à participer aux urgences et à éduquer les patients et leurs familles. Les apprenants alternent cours, travaux pratiques en salle de simulation et stages dans les services de médecine, de chirurgie, de pédiatrie et d'urgences des structures partenaires.",
    objectifs: [
      "Réaliser les soins infirmiers courants et techniques en toute sécurité",
      "Participer à la prise en charge des urgences et à la réanimation de base",
      "Mener des actions de prévention et d'éducation à la santé",
      "Travailler en équipe pluridisciplinaire dans le respect de l'éthique"
    ],
    modules: [
      "Anatomie, physiologie et microbiologie",
      "Soins infirmiers fondamentaux et techniques",
      "Pathologies médicales et chirurgicales",
      "Pharmacologie et calcul de doses",
      "Urgences, réanimation et hygiène hospitalière",
      "Santé communautaire, éthique et législation",
      "Stages hospitaliers et stage rural"
    ],
    diplome: "Diplôme d'État d'Infirmier",
    debouches: [
      "Services hospitaliers publics et privés",
      "Centres de santé et de promotion sociale (CSPS)",
      "Missions humanitaires et ONG de santé",
      "Poursuite d'études : licence en Sciences Infirmières à l'IPS-RF"
    ],
    conditionsAdmission: [
      "Baccalauréat (séries D, C, A ou F8) ou diplôme équivalent",
      "Réussite au concours d'entrée (épreuves écrites et entretien)",
      "Être âgé(e) d'au moins 17 ans à la rentrée"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Copie légalisée du baccalauréat et relevé de notes"
    ]),
    sessions: [
      {
        id: 'ide-2027-concours',
        libelle: "Concours d'entrée — session d'avril 2027",
        debut: '2027-04-01',
        dateLimite: '2027-03-10',
        places: 60,
        placesRestantes: 31,
        statut: 'ouvert'
      },
      {
        id: 'ide-2027-rentree',
        libelle: 'Rentrée académique 2027–2028',
        debut: '2027-10-01',
        ouvertureInscriptions: '2027-05-03',
        dateLimite: '2027-09-20',
        places: 60,
        placesRestantes: 60,
        statut: 'a-venir'
      }
    ]
  },

  {
    id: 'agent-itinerant-sante',
    etablissement: 'eps',
    titre: 'Agent Itinérant de Santé (AIS)',
    sousTitre: "Le premier maillon des soins de santé primaires",
    domaine: 'sante',
    niveau: 'diplome-etat',
    dureeMois: 24,
    duree: '2 ans',
    prix: 250000,
    prixPeriode: 'an',
    rythme: 'Présentiel, stages en CSPS',
    image: './assets/images/event-img.jpg',          // TODO: image réelle à fournir par le client
    imageAlt: "Apprenant de l'EPS-RF se rendant en stage",
    apprenants: 210,
    resume: "Former des agents de santé de proximité pour les CSPS et les zones rurales : soins de base, prévention et promotion de la santé.",
    description: "L'Agent Itinérant de Santé assure les soins courants, la vaccination, la surveillance des maladies prioritaires et l'éducation sanitaire au plus près des communautés. La formation, accessible dès le BEPC, privilégie la pratique : la moitié du cursus se déroule en stage dans les centres de santé et de promotion sociale de la région.",
    objectifs: [
      "Dispenser les soins de base et les premiers secours",
      "Conduire les activités de vaccination et de surveillance épidémiologique",
      "Dépister et orienter les cas de malnutrition et les maladies prioritaires",
      "Animer des séances d'éducation pour la santé dans les villages"
    ],
    modules: [
      "Hygiène, asepsie et soins de base",
      "Maladies prioritaires : paludisme, infections respiratoires, diarrhées",
      "Vaccination et programme élargi de vaccination",
      "Nutrition et santé de la mère et de l'enfant",
      "Santé communautaire et communication",
      "Stages pratiques en CSPS"
    ],
    diplome: "Diplôme d'Agent Itinérant de Santé",
    debouches: [
      "Centres de santé et de promotion sociale (CSPS)",
      "Dispensaires et infirmeries d'entreprise",
      "Programmes communautaires des ONG",
      "Passerelle vers la formation d'Infirmier diplômé d'État"
    ],
    conditionsAdmission: [
      "BEPC ou diplôme équivalent",
      "Réussite au concours d'entrée",
      "Être âgé(e) d'au moins 17 ans à la rentrée"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Copie légalisée du BEPC"
    ]),
    sessions: [
      {
        id: 'ais-2027-rentree',
        libelle: 'Rentrée académique 2027–2028',
        debut: '2027-10-01',
        dateLimite: '2027-09-20',
        places: 30,
        placesRestantes: 18,
        statut: 'ouvert'
      }
    ]
  },

  /* ===================== CPFP-RF — formation professionnelle ===================== */

  {
    id: 'gestion-entreprises',
    etablissement: 'cpfp',
    titre: 'Gestion des entreprises',
    sousTitre: "Brevet de technicien en gestion des PME",
    domaine: 'gestion',
    niveau: 'brevet',
    dureeMois: 24,
    duree: '2 ans',
    prix: 150000,
    prixPeriode: 'an',
    rythme: 'Présentiel, cours du jour',
    image: './assets/images/course-2.png',
    imageAlt: "Salle de cours en gestion des entreprises",
    apprenants: 430,
    resume: "Acquérir les bases de la comptabilité, de la gestion commerciale et de l'entrepreneuriat pour travailler en PME ou créer son activité.",
    description: "Pensée pour les besoins des petites et moyennes entreprises de la région, cette formation couvre la tenue des comptes, la gestion des stocks et des ventes, le droit des affaires et les outils bureautiques de gestion. Un module d'entrepreneuriat accompagne les apprenants qui souhaitent monter leur propre projet.",
    objectifs: [
      "Tenir la comptabilité courante d'une petite entreprise",
      "Gérer les achats, les stocks et la relation client",
      "Élaborer un plan d'affaires simple et le présenter à un financeur",
      "Utiliser les logiciels bureautiques et de gestion courants"
    ],
    modules: [
      "Comptabilité générale et analytique",
      "Droit des affaires et fiscalité des PME",
      "Marketing et techniques de vente",
      "Gestion des ressources humaines",
      "Entrepreneuriat et montage de projet",
      "Bureautique et logiciels de gestion",
      "Stage en entreprise"
    ],
    diplome: "Brevet de Technicien (BT) en Gestion des entreprises",
    debouches: [
      "Assistant(e) comptable ou administratif(ve)",
      "Gestionnaire de PME, de coopérative ou de boutique",
      "Agent commercial",
      "Création de sa propre activité"
    ],
    conditionsAdmission: [
      "BEPC ou niveau classe de seconde",
      "Test de niveau en français et en mathématiques"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Copie légalisée du dernier diplôme ou certificat de scolarité"
    ]),
    sessions: [
      {
        id: 'ge-2027-janvier',
        libelle: 'Session de janvier 2027',
        debut: '2027-01-04',
        dateLimite: '2026-12-15',
        places: 35,
        placesRestantes: 9,
        statut: 'ouvert'
      },
      {
        id: 'ge-2027-rentree',
        libelle: 'Rentrée 2027–2028',
        debut: '2027-10-01',
        ouvertureInscriptions: '2027-06-01',
        dateLimite: '2027-09-20',
        places: 35,
        placesRestantes: 35,
        statut: 'a-venir'
      }
    ]
  },

  {
    id: 'agent-bureautique',
    etablissement: 'cpfp',
    titre: 'Agent en bureautique',
    sousTitre: "Certificat de qualification professionnelle en 9 mois",
    domaine: 'numerique',
    niveau: 'certificat',
    dureeMois: 9,
    duree: '9 mois',
    prix: 200000,
    prixPeriode: null,
    rythme: 'Présentiel, cours du jour ou du soir',
    image: './assets/images/course-3.jpg',
    imageAlt: "Apprenants en atelier bureautique",
    apprenants: 317,
    resume: "Maîtriser les outils bureautiques et les techniques de secrétariat pour être rapidement opérationnel dans une administration ou une entreprise.",
    description: "Formation courte et intensive aux outils du poste de travail : traitement de texte, tableur, présentation, messagerie et navigation internet, complétée par les techniques de secrétariat, de classement et d'accueil. Chaque apprenant dispose d'un poste informatique en salle.",
    objectifs: [
      "Produire des documents professionnels avec un traitement de texte",
      "Construire des tableaux de suivi et des graphiques avec un tableur",
      "Gérer une messagerie, un agenda et le classement des documents",
      "Assurer l'accueil physique et téléphonique"
    ],
    modules: [
      "Environnement Windows et navigation internet",
      "Traitement de texte",
      "Tableur",
      "Présentation assistée par ordinateur",
      "Messagerie et outils collaboratifs",
      "Techniques de secrétariat et d'accueil",
      "Stage pratique"
    ],
    diplome: "Certificat de Qualification Professionnelle (CQP) d'Agent en bureautique",
    debouches: [
      "Secrétaire ou assistant(e) administratif(ve)",
      "Opérateur(trice) de saisie",
      "Gérant(e) de centre multimédia ou de cybercafé",
      "Poursuite vers le brevet de technicien en gestion"
    ],
    conditionsAdmission: [
      "Niveau classe de troisième ou expérience professionnelle",
      "Test de positionnement"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Certificat de scolarité ou attestation de travail"
    ]),
    sessions: [
      {
        id: 'ab-2027-janvier',
        libelle: 'Session de janvier 2027',
        debut: '2027-01-04',
        dateLimite: '2026-12-15',
        places: 25,
        placesRestantes: 0,
        statut: 'complet'
      },
      {
        id: 'ab-2027-septembre',
        libelle: 'Session de septembre 2027',
        debut: '2027-09-06',
        ouvertureInscriptions: '2027-05-03',
        dateLimite: '2027-08-20',
        places: 25,
        placesRestantes: 25,
        statut: 'a-venir'
      }
    ]
  },

  {
    id: 'transport-logistique',
    etablissement: 'cpfp',
    titre: 'Transport & Logistique',
    sousTitre: "Brevet de technicien en transport, transit et logistique",
    domaine: 'gestion',
    niveau: 'brevet',
    dureeMois: 24,
    duree: '2 ans',
    prix: 200000,
    prixPeriode: 'an',
    rythme: 'Présentiel, visites de terrain',
    image: './assets/images/course-4.jpg',
    imageAlt: "Formation en transport et logistique",
    apprenants: 260,
    resume: "Organiser les flux de marchandises, gérer les stocks et maîtriser les formalités de transport et de douane.",
    description: "Au carrefour des échanges entre le Burkina Faso, le Niger, le Bénin et le Togo, Fada N'Gourma offre de réels débouchés dans le transport et la logistique. La formation couvre la gestion d'entrepôt, la réglementation du transport routier, le transit et les documents douaniers, avec des visites de plateformes logistiques et de postes frontaliers.",
    objectifs: [
      "Gérer un stock et organiser un entrepôt",
      "Préparer et suivre une opération de transport routier",
      "Constituer un dossier de transit et de dédouanement",
      "Utiliser les outils informatiques de suivi logistique"
    ],
    modules: [
      "Gestion des stocks et entreposage",
      "Transport routier et réglementation",
      "Transit, douane et documents commerciaux",
      "Logistique internationale et chaîne d'approvisionnement",
      "Informatique appliquée à la logistique",
      "Hygiène, sécurité et environnement",
      "Stage en entreprise"
    ],
    diplome: "Brevet de Technicien (BT) en Transport & Logistique",
    debouches: [
      "Magasinier ou gestionnaire de stock",
      "Agent de transit ou déclarant en douane junior",
      "Assistant(e) logistique dans une ONG ou une entreprise de transport",
      "Exploitant(e) de flotte"
    ],
    conditionsAdmission: [
      "BEPC ou niveau classe de seconde",
      "Test de niveau en français et en mathématiques"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Copie légalisée du dernier diplôme ou certificat de scolarité"
    ]),
    sessions: [
      {
        id: 'tl-2027-janvier',
        libelle: 'Session de janvier 2027',
        debut: '2027-01-04',
        dateLimite: '2026-12-15',
        places: 30,
        placesRestantes: 14,
        statut: 'ouvert'
      },
      {
        id: 'tl-2027-rentree',
        libelle: 'Rentrée 2027–2028',
        debut: '2027-10-01',
        ouvertureInscriptions: '2027-06-01',
        dateLimite: '2027-09-20',
        places: 30,
        placesRestantes: 30,
        statut: 'a-venir'
      }
    ]
  },

  {
    id: 'maintenance-informatique',
    etablissement: 'cpfp',
    titre: 'Maintenance Informatique',
    sousTitre: "Brevet de technicien en maintenance des systèmes et réseaux",
    domaine: 'numerique',
    niveau: 'brevet',
    dureeMois: 24,
    duree: '2 ans',
    prix: 200000,
    prixPeriode: 'an',
    rythme: 'Présentiel, ateliers pratiques',
    image: './assets/images/course-6.jpeg',
    imageAlt: "Atelier de maintenance informatique",
    apprenants: 390,
    resume: "Diagnostiquer, réparer et sécuriser les postes de travail et les petits réseaux des entreprises et des administrations.",
    description: "Formation technique centrée sur l'atelier : montage et dépannage d'ordinateurs, installation des systèmes d'exploitation, mise en place de réseaux locaux et initiation à la sécurité informatique. Les apprenants interviennent sur des pannes réelles apportées par les partenaires du centre.",
    objectifs: [
      "Diagnostiquer et réparer les pannes matérielles et logicielles",
      "Installer et configurer systèmes, périphériques et réseaux locaux",
      "Assister les utilisateurs et assurer la maintenance préventive",
      "Appliquer les règles de base de la sécurité informatique"
    ],
    modules: [
      "Architecture des ordinateurs et composants",
      "Systèmes d'exploitation et logiciels",
      "Réseaux locaux et accès internet",
      "Maintenance préventive et curative",
      "Sécurité informatique et sauvegarde",
      "Initiation au développement web",
      "Stage en entreprise"
    ],
    diplome: "Brevet de Technicien (BT) en Maintenance Informatique",
    debouches: [
      "Technicien(ne) de maintenance informatique",
      "Administrateur(trice) réseau junior",
      "Service informatique d'une entreprise ou d'une administration",
      "Création d'un atelier de réparation"
    ],
    conditionsAdmission: [
      "BEPC ou niveau classe de seconde",
      "Test de niveau en mathématiques et logique"
    ],
    documentsRequis: RF_DOCUMENTS_BASE.concat([
      "Copie légalisée du dernier diplôme ou certificat de scolarité"
    ]),
    sessions: [
      {
        id: 'mi-2027-janvier',
        libelle: 'Session de janvier 2027',
        debut: '2027-01-04',
        dateLimite: '2026-12-15',
        places: 30,
        placesRestantes: 6,
        statut: 'ouvert'
      },
      {
        id: 'mi-2027-rentree',
        libelle: 'Rentrée 2027–2028',
        debut: '2027-10-01',
        ouvertureInscriptions: '2027-06-01',
        dateLimite: '2027-09-20',
        places: 30,
        placesRestantes: 30,
        statut: 'a-venir'
      }
    ]
  }

];
