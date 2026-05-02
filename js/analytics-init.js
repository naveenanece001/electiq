"use strict";

/**
 * ElectIQ Analytics Initializer.
 * Loads Google Analytics 4 when a valid ID is provided at runtime via
 * window.ELECTIQ_GA_ID. No fake or placeholder IDs are used.
 */
window.dataLayer = window.dataLayer || [];

/**
 * Google Analytics gtag command queue function.
 * @returns {void}
 */
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());

(function initAnalytics() {
  var id = (typeof window.ELECTIQ_GA_ID === 'string' && window.ELECTIQ_GA_ID.length > 0)
    ? window.ELECTIQ_GA_ID
    : null;
  if (!id) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(s);
  gtag('config', id);
  gtag('event', 'app_init', { event_category: 'system' });
}());