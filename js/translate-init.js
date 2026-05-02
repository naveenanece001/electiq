"use strict";
/**
 * Google Translate widget initialization callback.
 * Called automatically by the Translate API script on load.
 * @returns {void}
 */
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    { pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE },
    'google_translate_element'
  );
}
