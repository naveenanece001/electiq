"use strict";

/**
 * Google Translate widget initialization callback.
 * Invoked automatically by the Google Translate API script after load.
 * @returns {void}
 */
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    { pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE },
    'google_translate_element'
  );
}
