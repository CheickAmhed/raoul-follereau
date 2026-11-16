'use strict';

/**
 * assets/data/reseaux.js
 * ============================================================================
 * Comptes officiels des Établissements sur les réseaux sociaux, utilisés par
 * les liens [data-reseau] du footer (toutes les pages) et de la page Contact.
 * Global : RF_RESEAUX. Lu par assets/js/footer.js.
 *
 *  - url: null  -> lien affiché, mais un clic indique que la page arrive
 *                  bientôt (même principe que les documents sans fichier) ;
 *  - url: '…'   -> lien ouvert dans un nouvel onglet.
 *
 * TODO: URLs des comptes à fournir par le client, et liste des réseaux à
 * confirmer (retirer un réseau inutilisé ici ET dans le HTML du footer).
 * TODO (phase Laravel) : valeurs déplacées dans la configuration du site,
 * liens rendus par le partial Blade du footer.
 * ============================================================================
 */

const RF_RESEAUX = {
  facebook:  { nom: 'Facebook',    url: null },
  instagram: { nom: 'Instagram',   url: null },
  twitter:   { nom: 'X (Twitter)', url: null },
  youtube:   { nom: 'YouTube',     url: null }
};
