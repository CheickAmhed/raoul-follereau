'use strict';

/**
 * hero-intro.js
 * ============================================================================
 * Séquence d'animations AU CHARGEMENT de la section .home (index.html uniquement).
 *
 * Rôle de ce fichier :
 *  - armer la séquence : pose .hero-intro sur <html> -> chaque élément du hero
 *    passe à son état initial masqué (règles dans animation.css) ;
 *  - lancer la séquence après le premier paint : pose .hero-intro-go ;
 *  - animer le compteur du 3e badge (0 -> 1500).
 *
 * Tout le séquençage (délais staggés, durées, courbes, handoff des icônes vers
 * smooth-zigzag-anim-1/2/3 et drop-anim) est porté par le CSS (#HERO INTRO dans
 * animation.css). Ici : aucune valeur de timing en dur hormis celle du compteur
 * (1600 ms) et le point d'entrée du comptage (calé sur l'apparition du badge).
 *
 * Respect de PROJECT_CONTEXT.md §2 / §3 / §8 :
 *  - vanilla JS, zéro dépendance, IIFE en 'use strict' : aucune variable globale ;
 *  - prefers-reduced-motion : on n'arme rien du tout (la classe .hero-intro n'est
 *    pas posée, donc rien n'est masqué), on se contente d'afficher le compteur à
 *    sa valeur finale. Les boucles smooth-zigzag-anim-1/2/3 et drop-anim ne sont
 *    pas touchées ;
 *  - sans JS : .hero-intro n'est jamais posée -> le hero s'affiche normalement.
 * ============================================================================
 */

(function () {

  const root = document.documentElement;
  const home = document.querySelector('.home');
  if (!home) return;

  const counterEl = home.querySelector('.badge-number[data-target]');
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function counterTarget() {
    return parseInt(counterEl && counterEl.dataset.target, 10) || 0;
  }

  function setCounterFinal() {
    if (counterEl) counterEl.textContent = counterTarget().toLocaleString('fr-FR');
  }

  /* prefers-reduced-motion : pas de séquence d'entrée, état final direct. */
  if (REDUCED_MOTION) {
    setCounterFinal();
    return;
  }

  /* Arme : les éléments du hero passent à leur état initial masqué (CSS). */
  root.classList.add('hero-intro');

  function runCounter() {
    if (!counterEl) return;

    const target = counterTarget();
    const duration = 1600;                 // ms — durée propre au compte-à-rebours
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);   // easeOutCubic
      counterEl.textContent = Math.floor(eased * target).toLocaleString('fr-FR');

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        counterEl.textContent = target.toLocaleString('fr-FR');
      }
    }

    requestAnimationFrame(frame);
  }

  function play() {
    // double rAF : on s'assure que l'état initial (masqué) est bien peint
    // avant de basculer en .hero-intro-go, sinon la transition/anim est sautée.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add('hero-intro-go');

        // Le 3e badge finit d'apparaître vers ~1160 ms (delay 1120 + durée 0.4 s,
        // cf. animation.css). On cale le début du comptage à ce moment-là.
        setTimeout(runCounter, 1160);
      });
    });
  }

  /* Une seule exécution, au chargement. On ne bloque pas sur window.load :
     les reveals par clip-path des images du .img-box restent corrects même si
     l'image finit de charger pendant l'animation. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', play, { once: true });
  } else {
    play();
  }

})();
