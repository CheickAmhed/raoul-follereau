'use strict';

// navbar toggle functionality
// ─────────────────────────────────────────────────────────────────────────────
// REFONTE HEADER : le toggle du menu est désormais géré par assets/js/header-nav.js.
// .nav-toggle-btn n'ouvre plus la navigation principale (devenue .primary-nav) mais
// le MENU SECONDAIRE (.navbar-nav repurposé), avec effet sandwich -> X.
// L'ancien code (querySelector('.navbar-nav') + toggle de la classe .active) est
// retiré ici pour éviter un double binding sur .nav-toggle-btn. Aucune autre partie
// de ce fichier n'en dépendait.
// ─────────────────────────────────────────────────────────────────────────────





/*-----------------------------------*\
  #ACCUEIL — RÉVÉLATION AU SCROLL, COMPTEURS & COMPTE À REBOURS
\*-----------------------------------*/

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/**
 * Révélation progressive des éléments au scroll
 * (.reveal-up / .reveal-fade / .reveal-left / .reveal-right)
 */
const revealElements = document.querySelectorAll(
  '.reveal-up, .reveal-fade, .reveal-left, .reveal-right'
);

if (revealElements.length) {

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {

    revealElements.forEach(function (el) { el.classList.add('is-visible'); });

  } else {

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(function (el) { revealObserver.observe(el); });

  }

}


/**
 * Compteurs animés des chiffres clés (.stat-number[data-count])
 */
const statNumbers = document.querySelectorAll('.stat-number[data-count]');

function animateCount(el) {

  const target = parseInt(el.dataset.count, 10) || 0;
  const suffix = el.dataset.suffix || '';

  if (prefersReducedMotion) {
    el.textContent = target.toLocaleString('fr-FR') + suffix;
    return;
  }

  const duration = 1800;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('fr-FR') + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

if (statNumbers.length) {

  if (!('IntersectionObserver' in window)) {

    statNumbers.forEach(animateCount);

  } else {

    const countObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (el) { countObserver.observe(el); });

  }

}


/**
 * Compte à rebours du prochain événement (.countdown-timer[data-countdown])
 */
const countdownEl = document.querySelector('.countdown-timer[data-countdown]');

if (countdownEl) {

  const targetTime = new Date(countdownEl.dataset.countdown).getTime();

  const countUnits = {
    days:    countdownEl.querySelector('[data-unit="days"]'),
    hours:   countdownEl.querySelector('[data-unit="hours"]'),
    minutes: countdownEl.querySelector('[data-unit="minutes"]'),
    seconds: countdownEl.querySelector('[data-unit="seconds"]')
  };

  let countdownInterval = null;

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function refreshCountdown() {

    if (isNaN(targetTime)) return;

    const remaining = targetTime - Date.now();

    if (remaining <= 0) {
      countdownEl.classList.add('is-over');
      Object.keys(countUnits).forEach(function (key) {
        if (countUnits[key]) countUnits[key].textContent = '00';
      });
      if (countdownInterval) window.clearInterval(countdownInterval);
      return;
    }

    const days    = Math.floor(remaining / 86400000);
    const hours   = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    if (countUnits.days)    countUnits.days.textContent    = pad2(days);
    if (countUnits.hours)   countUnits.hours.textContent   = pad2(hours);
    if (countUnits.minutes) countUnits.minutes.textContent = pad2(minutes);
    if (countUnits.seconds) countUnits.seconds.textContent = pad2(seconds);
  }

  refreshCountdown();
  countdownInterval = window.setInterval(refreshCountdown, 1000);

}