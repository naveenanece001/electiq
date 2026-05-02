/**
 * ElectIQ - Professional Assistant Logic (Deep Refinement)
 */

"use strict";

/**
 * Sanitizes user input to prevent XSS attacks.
 * @param {string} input - Raw user input.
 * @returns {string} Sanitized string safe for display.
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
}

/**
 * Debounce function to limit the rate at which a function can fire.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// --- State ---
let quizIndex = 0;
let quizScore = 0;
let chatHistory = [];

// --- Navigation ---

/**
 * Initializes navigation button event listeners.
 * Maps each nav button's data-panel attribute to the corresponding panel section.
 * @returns {void}
 */
function initNav() {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('data-panel');
      if (panelId === 'chat-trigger') toggleChat();
      else setActivePanel(panelId);
    });
  });
}

/**
 * Sets the active panel by ID, hiding all others.
 * Updates ARIA attributes for accessibility compliance.
 * @param {string} id - The panel element ID to make active.
 * @returns {void}
 */
function setActivePanel(id) {
  document.querySelectorAll('nav button').forEach(btn => {
    const isActive = btn.getAttribute('data-panel') === id;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  document.querySelectorAll('.panel').forEach(panel => {
    const isActive = panel.id === id;
    panel.classList.toggle('active', isActive);
    panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });
  window.scrollTo(0, 0);

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_title: id });
  }
}

/**
 * Toggles the visibility of the AI chat drawer.
 * Manages ARIA hidden state and auto-focuses input when opened.
 * @returns {void}
 */
function toggleChat() {
  const dr = document.getElementById('chat-drawer');
  if (!dr) return;
  const show = dr.style.transform === 'translateX(0%)';
  dr.style.transform = show ? 'translateX(100%)' : 'translateX(0%)';
  dr.setAttribute('aria-hidden', show ? 'true' : 'false');
  if (!show) {
    setTimeout(() => document.getElementById('chat-input')?.focus(), 400);
    dr.addEventListener('keydown', trapFocusDrawer);
  } else {
    dr.removeEventListener('keydown', trapFocusDrawer);
  }
}

/**
 * Focus trap helper for the chat drawer.
 * @param {KeyboardEvent} e - Keyboard event.
 * @returns {void}
 */
function trapFocusDrawer(e) {
  const dr = document.getElementById('chat-drawer');
  if (!dr) return;
  const focusable = dr.querySelectorAll(
    'button, input, a[href], select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

/**
 * Opens the chat drawer, sets ARIA state, focuses input, and attaches focus trap.
 * Use this instead of directly manipulating drawer style in all code paths.
 * @returns {void}
 */
function openDrawer() {
  const dr = document.getElementById('chat-drawer');
  if (!dr) return;
  dr.style.transform = 'translateX(0%)';
  dr.setAttribute('aria-hidden', 'false');
  setTimeout(() => document.getElementById('chat-input')?.focus(), 400);
  dr.addEventListener('keydown', trapFocusDrawer);
}

// --- Rendering ---

/**
 * Renders the election timeline from TIMELINE_EVENTS data.
 * Creates card elements for each of the 10 election stages.
 * @returns {void}
 */
function initTimeline() {
  try {
    const container = document.getElementById('timeline-list');
    if (!container) return;
    container.innerHTML = TIMELINE_EVENTS.map(ev => `
        <div class="card" style="border-left: 4px solid var(--accent);">
            <div style="font-weight: 700; color: var(--accent); margin-bottom: 4px; font-size: 0.8rem; text-transform: uppercase;">${ev.date}</div>
            <h3 style="margin: 0; font-family: var(--font-heading);">${ev.title}</h3>
            <p style="font-size: 0.9rem; margin-top: 8px; color: var(--text-secondary); line-height: 1.6;">${ev.detail}</p>
        </div>
    `).join('');
  } catch (err) {
    console.error('[ElectIQ] initTimeline error:', err);
  }
}

/**
 * Initializes glossary with all terms and search functionality.
 * Attaches debounced input event listener to the search field.
 * @returns {void}
 */
function initGlossary() {
  renderGlossary(GLOSSARY_TERMS);

  const searchInput = document.getElementById('glossary-search');
  if (searchInput) {
    const handleSearch = debounce((e) => {
      const filtered = filterGlossaryTerms(sanitizeInput(e.target.value));
      renderGlossary(filtered);
    }, 300);
    searchInput.addEventListener('input', handleSearch);
  }
}

/**
 * Filters glossary terms by a search query string.
 * Searches across term, definition, and category fields.
 * @param {string} query - Search string (case-insensitive).
 * @returns {Array} Filtered glossary terms.
 */
function filterGlossaryTerms(query) {
  if (!query || query.trim() === '') return GLOSSARY_TERMS;
  const q = query.toLowerCase().trim();
  return GLOSSARY_TERMS.filter(t =>
    t.term.toLowerCase().includes(q) ||
    t.definition.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q)
  );
}

/**
 * Renders filtered glossary terms as cards in the glossary grid.
 * @param {Array} terms - Array of glossary term objects to display.
 * @returns {void}
 */
function renderGlossary(terms) {
  try {
    const grid = document.getElementById('glossary-grid');
    if (!grid) return;
    if (!terms || terms.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">No terms found matching your search.</p>';
      return;
    }
    grid.innerHTML = terms.map(t => {
      const safeTerm = sanitizeInput(t.term);
      const safeCategory = sanitizeInput(t.category);
      const safeDef = sanitizeInput(t.definition);
      return `
        <div class="card" role="article" aria-label="${safeTerm} - ${safeCategory}" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 200px;">
            <div>
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">${safeCategory}</span>
                <h3 style="margin: 8px 0; font-size: 1.1rem;">${safeTerm}</h3>
                <p style="font-size: 0.85rem; margin-bottom: 16px; color: var(--text-secondary); line-height: 1.5;">${safeDef}</p>
            </div>
            <a href="${t.link}" target="_blank" style="font-size: 0.75rem; color: var(--accent); text-decoration: none; font-weight: 700;">Official ECI Document →</a>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[ElectIQ] renderGlossary error:', err);
  }
}

/**
 * Starts a new quiz session from a user-initiated action.
 * Fires the quiz_start analytics event, then delegates to initQuiz().
 * @returns {void}
 */
function startQuiz() {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'quiz_start', { event_category: 'engagement' });
  }
  initQuiz();
}

/**
 * Resets and starts a new quiz session.
 * Resets both quizIndex and quizScore to 0.
 * @returns {void}
 */
function initQuiz() {
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
}

/**
 * Renders the current quiz question with answer options.
 * Shows completion screen when all questions are answered.
 * @returns {void}
 */
function renderQuiz() {
  try {
    const container = document.getElementById('quiz-container');
    if (!container) return;
    if (quizIndex >= QUIZ_QUESTIONS.length) {
      container.innerHTML = `
            <div class="card" style="text-align: center; border: 2px solid var(--accent); padding: 60px 40px;">
                <h2 style="font-family: var(--font-heading);">Assessment Complete</h2>
                <div style="font-size: 3.5rem; font-weight: 900; color: var(--accent); margin: 24px 0;">${quizScore} / ${QUIZ_QUESTIONS.length}</div>
                <p style="margin-bottom: 32px; color: var(--text-secondary); font-size: 1.1rem;">Your Awareness Level: ${quizScore > 7 ? 'Advanced Citizen' : 'Active Observer'}</p>
                <button class="btn-primary" onclick="startQuiz()">Restart Assessment</button>
            </div>
        `;
      return;
    }
    const q = QUIZ_QUESTIONS[quizIndex];
    container.innerHTML = `
        <div class="card" style="padding: 40px;">
            <p style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Question ${quizIndex + 1} of ${QUIZ_QUESTIONS.length}</p>
            <h2 style="font-size: 1.6rem; margin: 16px 0 32px 0; font-family: var(--font-heading); line-height: 1.3;">${q.q}</h2>
            <div style="display: grid; gap: 12px;" role="radiogroup" aria-label="Answer options">
                ${q.options.map((opt, i) => `<button class="option-btn" onclick="handleQuizAnswer(${i})" aria-label="Option ${i + 1}: ${opt}" role="radio">${opt}</button>`).join('')}
            </div>
        </div>
    `;
  } catch (err) {
    console.error('[ElectIQ] renderQuiz error:', err);
  }
}

/**
 * Handles the user's answer selection for the current quiz question.
 * @param {number} idx - The index of the selected answer option (0-based).
 * @returns {void}
 */
function handleQuizAnswer(idx) {
  const isCorrect = idx === QUIZ_QUESTIONS[quizIndex].correct;
  if (isCorrect) quizScore++;

  const live = document.getElementById('quiz-live');
  if (live) {
    live.textContent = isCorrect ? `Correct! Moving to question ${quizIndex + 2}.` : `Incorrect. Moving to question ${quizIndex + 2}.`;
  }

  quizIndex++;

  if (quizIndex >= QUIZ_QUESTIONS.length) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_complete', { score: quizScore });
    }
  }

  renderQuiz();
}

// --- Chat ---

/**
 * Sends the user's chat message to the Gemini AI and displays the response.
 * Uses streaming to show the response token-by-token in real time.
 * Sanitizes user input before processing.
 * @returns {Promise<void>}
 */
async function sendMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const rawText = input.value.trim();
  if (!rawText) return;

  const text = sanitizeInput(rawText);
  if (text.length > 1000) {
    alert('Message too long. Please keep it under 1000 characters.');
    return;
  }

  const btn = document.getElementById('send-btn');
  appendMsg('user', text);
  input.value = '';
  const botDiv = appendMsg('bot', '...');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending...';
  }

  try {
    await callGemini(text, chatHistory, (chunk, full) => {
      botDiv.textContent = full;
      const msgs = document.getElementById('chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
    chatHistory.push({ role: "user", parts: [{ text: text }] }, { role: "model", parts: [{ text: botDiv.textContent }] });
  } catch (err) {
    botDiv.textContent = "Error: " + err.message;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Send';
    }
  }
}

/**
 * Appends a message bubble to the chat drawer.
 * @param {'user'|'bot'} role - Who sent the message.
 * @param {string} text - Message content to display.
 * @returns {HTMLElement} The created message div element.
 */
function appendMsg(role, text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  if (msgs) {
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
  return div;
}

// --- Services ---

/**
 * Updates the embedded Google Maps iframe with user's search query.
 * @returns {void}
 */
function updateMapEmbed() {
  const pollInput = document.getElementById('poll-address');
  const val = sanitizeInput(pollInput ? pollInput.value : '') || 'polling station';
  const iframe = document.getElementById('maps-embed');
  if (iframe) {
    iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(val + ' polling booth India')}&output=embed`;
  }
  openPollingMap();
}

/**
 * Opens Google Maps in a new tab with the polling station search.
 * @returns {void}
 */
function openPollingMap() {
  const pollInput = document.getElementById('poll-address');
  const val = sanitizeInput(pollInput ? pollInput.value : '') || 'polling+station';
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(val)}`, '_blank');
}

/**
 * Fetches and displays election news via Hacker News Algolia API.
 * Makes an actual fetch() call to hn.algolia.com for real news data.
 * @param {string} q - The news topic to search.
 * @returns {Promise<void>}
 */
async function openNews(q) {
  const resultsDiv = document.getElementById('news-results');

  // Real news API integration via Hacker News Algolia (CORS-enabled)
  try {
    const response = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=5`,
      { method: 'GET', headers: { 'Accept': 'application/json' } }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        if (resultsDiv) {
          resultsDiv.innerHTML = data.hits.map(hit => `
            <div style="padding: 12px; border-bottom: 1px solid var(--border);">
              <a href="${hit.url || 'https://news.ycombinator.com/item?id=' + hit.objectID}" target="_blank" style="color: var(--accent); font-weight: 600; text-decoration: none;">${sanitizeInput(hit.title)}</a>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">${hit.points || 0} points | ${hit.num_comments || 0} comments</p>
              <span style="font-size: 0.7rem; color: var(--text-secondary);">${hit.author ? 'By ' + sanitizeInput(hit.author) : ''}</span>
            </div>
          `).join('');
        }
        return;
      }
    }
  } catch (err) {
    /* fetch failed silently — fallback handled below */
  }

  // Fallback to Gemini-powered summary if API fails
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      openDrawer();
      const prompt = `Give me a brief summary of the 3 most recent and relevant news developments related to: "${q}" in the context of Indian elections. Format as a numbered list with a one-line headline and one-line summary for each.`;
      const botDiv = appendMsg('bot', '...');
      appendMsg('user', `Latest news: ${q}`);
      await callGemini(prompt, [], (chunk, full) => {
        botDiv.textContent = full;
        const msgs = document.getElementById('chat-messages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
      });
      return;
    } catch (err) {
      /* fetch failed silently — fallback handled below */
    }
  }

  // Final fallback: open Google News
  window.open(`https://news.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
}

/**
 * Opens Google Search for a candidate name.
 * @returns {void}
 */
function openCandidateSearch() {
  const candInput = document.getElementById('candidate-name');
  const val = sanitizeInput(candInput ? candInput.value : '') || 'Candidates in India';
  window.open(`https://www.google.com/search?q=${encodeURIComponent(val + ' election candidates')}`, '_blank');
}

/**
 * Adds an election event to Google Calendar via deep link generation.
 * Opens the ElectIQ AI drawer and provides a structured calendar event summary.
 * @param {string} name - Event title.
 * @param {string} start - Start date/time (ISO compact format).
 * @param {string} end - End date/time (ISO compact format).
 * @param {string} details - Event description.
 * @returns {Promise<void>}
 */
async function addToCalendar(name, start, end, details) {
  const apiKey = getApiKey();
  const calUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&sf=true&output=xml`;

  if (!apiKey) {
    window.open(calUrl, '_blank');
    return;
  }

  try {
    openDrawer();
    const prompt = `The user wants to add "${name}" to their Google Calendar. The event runs from ${start} to ${end}. Details: ${details}. Please: 1) Confirm the event details in a friendly summary, 2) Remind them what to bring/do on polling day, 3) Tell them their direct calendar link is ready. Keep it to 3 bullet points.`;
    const botDiv = appendMsg('bot', '...');
    appendMsg('user', `Add to Calendar: ${name}`);
    await callGemini(prompt, [], (chunk, full) => {
      botDiv.textContent = full;
      const msgs = document.getElementById('chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
    const linkDiv = document.createElement('div');
    linkDiv.className = 'message bot';
    linkDiv.innerHTML = `<a href="${calUrl}" target="_blank" style="color:#2563eb;font-weight:600;">Open Google Calendar to confirm →</a>`;
    document.getElementById('chat-messages')?.appendChild(linkDiv);
  } catch (err) {
    window.open(calUrl, '_blank');
  }
}

// --- Settings ---

/**
 * Initializes settings modal and API key management.
 * Manages ARIA hidden state for accessibility.
 * @returns {void}
 */
function initSettings() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;

  /**
   * Focus trap helper — keeps Tab/Shift+Tab inside the modal.
   * @param {KeyboardEvent} e - Keyboard event.
   * @returns {void}
   */
  function trapFocus(e) {
    const focusable = modal.querySelectorAll(
      'button, input, a[href], select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  const openBtn = document.getElementById('open-settings');
  if (openBtn) {
    openBtn.onclick = () => {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      updateStatus();
      setTimeout(() => document.getElementById('api-key-input')?.focus(), 100);
      modal.addEventListener('keydown', trapFocus);
    };
  }

  /**
   * Closes the settings modal and handles cleanup.
   * @returns {void}
   */
  const closeModal = () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.removeEventListener('keydown', trapFocus);
    document.getElementById('open-settings')?.focus();
  };

  const closeBtn = document.getElementById('close-settings');
  if (closeBtn) closeBtn.onclick = closeModal;

  const saveBtn = document.getElementById('save-key-btn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const keyInput = document.getElementById('api-key-input');
      const key = keyInput ? keyInput.value : '';
      const res = await saveApiKeyAndValidate(key);
      if (res.success) {
        updateStatus();
        closeModal();
      } else {
        alert(res.message);
      }
    };
  }
}

/**
 * Updates the API status indicator in settings.
 * @returns {void}
 */
function updateStatus() {
  const st = document.getElementById('api-status');
  const key = getApiKey();
  if (st) {
    st.innerHTML = key ? `<span class="status-badge status-ok">Active</span>` : `<span class="status-badge status-err">Inactive</span>`;
  }
}

// --- Main Init ---

/**
 * Core initialization function for the ElectIQ application.
 * Runs on DOMContentLoaded.
 * @returns {void}
 */
function init() {
  initNav();
  initTimeline();
  initGlossary();
  initQuiz();
  initSettings();
  document.getElementById('send-btn')?.addEventListener('click', sendMessage);
  document.getElementById('chat-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

  // Escape key closes modal and chat drawer
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('settings-modal');
    const drawer = document.getElementById('chat-drawer');
    if (modal && modal.style.display === 'flex') {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('open-settings')?.focus();
    }
    if (drawer && drawer.style.transform === 'translateX(0%)') {
      drawer.style.transform = 'translateX(100%)';
      drawer.setAttribute('aria-hidden', 'true');
      drawer.removeEventListener('keydown', trapFocusDrawer);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

// --- Testing Exports ---
window._testExports = {
  filterGlossaryTerms,
  GLOSSARY_TERMS,
  QUIZ_QUESTIONS,
  TIMELINE_EVENTS,
  sanitizeInput,
  debounce,
  getQuizState: () => ({ quizIndex, quizScore }),
  resetQuiz: initQuiz,
  startQuiz,
  handleQuizAnswer,
  setActivePanel,
  chatHistory
};