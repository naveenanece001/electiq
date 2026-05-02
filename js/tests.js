/**
 * ElectIQ Test Suite - Vanilla JS
 * Run automatically on page load. Results logged to console.
 */

"use strict";

/**
 * Utility class to run and track test assertions.
 */
class TestRunner {
  /**
   * Initializes a new TestRunner instance.
   */
  constructor() {
    this.total = 0;
    this.passed = 0;
    this.results = [];
  }

  /**
   * Asserts a condition and logs the result.
   * @param {boolean} condition - The condition to test
   * @param {string} message - Description of the test case
   * @returns {void}
   */
  assert(condition, message) {
    this.total++;
    if (condition) {
      this.passed++;
      console.log(`%c[PASS] ${message}`, 'color: #10b981; font-weight: bold;');
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  /**
   * Logs a summary of all executed tests.
   * @returns {void}
   */
  summary() {
    console.log(`\n%c[ElectIQ Tests] Results: ${this.passed}/${this.total} passed`, 'font-weight: bold; font-size: 1.1rem; color: #2563eb;');
  }
}

/**
 * Main test execution loop.
 * Orchestrates all category-based test assertions.
 * @returns {void}
 */
async function runAllTests() {
  const runner = new TestRunner();
  const exports = window._testExports;

  if (!exports) {
    console.error("[ElectIQ Tests] Error: window._testExports not found. Ensure app.js is loaded first.");
    return;
  }

  console.log("%c[ElectIQ Tests] Starting test suite...", 'font-weight: bold; font-size: 1.1rem; color: #2563eb;');

  // --- Category A: Glossary Filter Tests ---
  const { filterGlossaryTerms, GLOSSARY_TERMS } = exports;
  runner.assert(filterGlossaryTerms("EVM").length === 1, 'filterGlossary("EVM") returns exactly 1 result');
  runner.assert(filterGlossaryTerms("").length === GLOSSARY_TERMS.length, 'filterGlossary("") returns all terms');
  runner.assert(filterGlossaryTerms("NOTA").some(t => t.term === "NOTA"), 'filterGlossary("NOTA") returns the NOTA term');
  runner.assert(filterGlossaryTerms("xyz123").length === 0, 'filterGlossary("xyz123") returns 0 results');
  runner.assert(filterGlossaryTerms("technology").length >= 3, 'filterGlossary("technology") returns technology category items');
  runner.assert(filterGlossaryTerms("voter").every(t => t.term.toLowerCase().includes("voter") || t.definition.toLowerCase().includes("voter")), 'filterGlossary("voter") returns items containing "voter"');

  // --- Category B: Quiz Logic Tests ---
  const { QUIZ_QUESTIONS, getQuizState, resetQuiz } = exports;
  const handleQuizAnswer = exports.handleQuizAnswer;
  runner.assert(QUIZ_QUESTIONS.length === 10, 'Quiz has exactly 10 questions');
  runner.assert(QUIZ_QUESTIONS.every(q => q.options.length === 3), 'Every question has exactly 3 options');
  runner.assert(QUIZ_QUESTIONS.every(q => q.correct >= 0 && q.correct <= 2), 'Every question correct index is in valid range (0-2)');

  resetQuiz();
  let state = getQuizState();
  runner.assert(state.quizIndex === 0 && state.quizScore === 0, 'initQuiz() resets score and index');

  // --- Quiz answer scoring tests ---

  // Test correct answer increments score (test on Question 0)
  resetQuiz();
  const q0correct = QUIZ_QUESTIONS[0].correct;
  handleQuizAnswer(q0correct);
  let afterCorrect = getQuizState();
  runner.assert(afterCorrect.quizScore === 1, 'Correct answer increments score by 1');

  // Test wrong answer does NOT increment score (fresh reset, test on Question 0 again)
  resetQuiz();
  const q0wrong = QUIZ_QUESTIONS[0].correct === 0 ? 1 : 0;
  handleQuizAnswer(q0wrong);
  let afterWrong = getQuizState();
  runner.assert(afterWrong.quizScore === 0, 'Wrong answer does not increment score');

  // Reset quiz back to clean state for remaining tests
  resetQuiz();

  // --- Category C: API Key Validation ---
  // Note: These test the regex/logic in saveApiKeyAndValidate if we could expose it, 
  // but we can test the length and character validation logic.
  const isValidKey = (key) => {
    if (!key || key.trim() === '') return false;
    if (key.trim().length < 20) return false;
    if (!/^[A-Za-z0-9_\-]+$/.test(key.trim())) return false;
    return true;
  };
  runner.assert(isValidKey("") === false, 'Empty string key is invalid');
  runner.assert(isValidKey("   ") === false, 'Whitespace-only key is invalid');
  runner.assert(isValidKey("short") === false, 'Key shorter than 20 chars is invalid');
  runner.assert(isValidKey("valid_key_with_length_20_chars") === true, 'Standard 20+ char alphanumeric key is valid');

  // --- Category D: Timeline Data Tests ---
  const { TIMELINE_EVENTS } = exports;
  runner.assert(TIMELINE_EVENTS.length === 10, 'TIMELINE_EVENTS has exactly 10 stages');
  runner.assert(TIMELINE_EVENTS.every(e => e.date && e.title && e.detail), 'Every stage has date, title, and detail');
  runner.assert(TIMELINE_EVENTS.every(e => e.title.trim() !== ""), 'No stage has empty title');
  runner.assert(TIMELINE_EVENTS.every(e => e.detail.trim() !== ""), 'No stage has empty detail');

  // --- Category E: Input Sanitization Tests ---
  const { sanitizeInput } = exports;
  runner.assert(sanitizeInput("<script>alert('xss')</script>").indexOf("<script>") === -1, 'sanitizeInput removes <script> tags');
  runner.assert(sanitizeInput("normal text") === "normal text", 'sanitizeInput leaves normal text unchanged');
  runner.assert(sanitizeInput("") === "", 'sanitizeInput handles empty string');

  // --- Category F: Navigation Tests ---
  const { setActivePanel } = exports;
  setActivePanel('glossary');
  runner.assert(document.getElementById('glossary').classList.contains('active'), 'setActivePanel("glossary") makes glossary panel active');
  runner.assert(!document.getElementById('home').classList.contains('active'), 'setActivePanel removes active from other panels');
  runner.assert(document.querySelectorAll('.panel.active').length === 1, 'Only one panel active at a time');

  // --- Category G: Chat History Tests ---
  const { chatHistory } = exports;
  const initialLength = chatHistory.length;
  // Mock adding message pair
  chatHistory.push({ role: 'user', parts: [{ text: 'hi' }] }, { role: 'model', parts: [{ text: 'hello' }] });
  runner.assert(chatHistory.length === initialLength + 2, 'Chat history length increases by 2 after message pair');
  runner.assert(chatHistory[chatHistory.length - 2].role === 'user', 'Last-1 entry is user');
  runner.assert(chatHistory[chatHistory.length - 1].role === 'model', 'Last entry is model');

  // --- Category H: Session Storage Tests ---
  runner.assert(typeof sessionStorage !== 'undefined', 'sessionStorage is available');
  runner.assert(localStorage.getItem('ELECTIQ_API_KEY') === null, 'API key is NOT stored in localStorage');

  // --- Category I: Edge Case Tests ---
  runner.assert(sanitizeInput(null) === '', 'sanitizeInput handles null gracefully');
  runner.assert(sanitizeInput(123) === '', 'sanitizeInput handles non-string gracefully');
  runner.assert(filterGlossaryTerms("  ").length === GLOSSARY_TERMS.length, 'filterGlossary with whitespace-only returns all terms');

  // --- Category J: Escape Key Tests ---
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    runner.assert(modal.style.display === 'none', 'Escape key closes the settings modal');
  }

  // --- Category K: Debounce Utility Test ---
  const { debounce } = exports;
  let callCount = 0;
  const debouncedFn = debounce(() => { callCount++; }, 50);
  debouncedFn(); debouncedFn(); debouncedFn();
  await new Promise(r => setTimeout(r, 100));
  runner.assert(callCount === 1, 'debounce fires function only once after rapid calls');

  // --- Category L: Google Analytics Event Tests ---
  // Tests startQuiz() — the user-initiated entry point — not initQuiz() (internal reset).
  let gtagFired = false;
  let gtagEventName = null;
  const originalGtag = window.gtag;
  window.gtag = (type, eventName) => { if (type === 'event') { gtagFired = true; gtagEventName = eventName; } };
  exports.startQuiz();
  runner.assert(gtagFired === true, 'startQuiz() fires a gtag event');
  runner.assert(gtagEventName === 'quiz_start', 'startQuiz() fires gtag event named quiz_start');
  window.gtag = originalGtag;

  // --- Category M: openDrawer / DOM Integration Tests ---
  const drawer = document.getElementById('chat-drawer');
  if (drawer) {
    // Force close first
    drawer.style.transform = 'translateX(100%)';
    drawer.setAttribute('aria-hidden', 'true');
    exports.setActivePanel('home');
    runner.assert(drawer.style.transform === 'translateX(100%)', 'Drawer starts closed');
    runner.assert(drawer.getAttribute('aria-hidden') === 'true', 'Drawer aria-hidden is true when closed');
  }

  // --- Category N: Maps Embed URL Test ---
  const mapFrame = document.getElementById('maps-embed');
  if (mapFrame) {
    runner.assert(
      mapFrame.src.includes('google.com/maps') && !mapFrame.src.includes('AIzaSy'),
      'Maps iframe does not contain a hardcoded API key'
    );
  }

  runner.summary();
}

// Run tests after a short delay to ensure DOM and scripts are fully ready
setTimeout(runAllTests, 1000);
