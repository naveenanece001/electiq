# ElectIQ: Empowering Indian Democracy

**ElectIQ** is an AI-powered, high-fidelity civic education platform designed to simplify and demystify the Indian electoral process. Built for the modern citizen, it provides an enterprise-grade user interface with comprehensive tools to navigate the complexities of elections in India.

## Features

*   **Verified Knowledge Base:** Detailed information on the 10 stages of Indian elections, from boundary delimitation to result certification, plus a comprehensive glossary of operational terms (NOTA, BLO, RO, etc.).
*   **ElectIQ Intelligence Assistant:** A Gemini 2.5 Flash-powered conversational AI that answers complex procedural questions and acts as a personalized election guide.
*   **Live Election News:** Real-time election updates fetched via the Hacker News Algolia API, with AI-powered fallback summaries.
*   **Google Services Integration:**
    *   **Maps:** Find your exact polling booth and get interactive routing.
    *   **Calendar:** Sync important election dates directly to your Google Calendar.
    *   **Translate:** Full multilingual support via the Google Translate Widget.
    *   **Analytics:** Track engagement securely through a dynamic, runtime-injectable Google Analytics configuration.
*   **Citizen Awareness Audit:** A 10-question assessment module to test your voting awareness.
*   **Accessibility & Responsiveness:** Built with semantic HTML (landmarks, roles) and responsive CSS (fluid typography, tablet/mobile breakpoints). Optimized for `prefers-reduced-motion` and `prefers-contrast` media queries.

## Tech Stack

*   **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+). No heavy frameworks, ensuring blazing-fast performance and a sub-10MB repository footprint.
*   **APIs & Integrations:** 
    *   Google Gemini API (Generative Language)
    *   Google Maps Embed API
    *   Google Translate
    *   Hacker News Algolia API

## Setup & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/naveenanece001/electiq.git
    cd electiq
    ```
2.  **Run the application:**
    Since this is a vanilla frontend project, you can simply open `index.html` in your web browser. For the best experience and to avoid CORS issues with certain APIs, serve the directory using a local web server:
    ```bash
    npx serve .
    # or
    python -m http.server 8000
    ```
3.  **Configure AI Assistant (Gemini API):**
    Click the "Settings" gear icon in the top right corner of the application to securely enter your Gemini API key. The key is kept strictly in session storage and is never sent to external servers.

## Security & Compliance

This project has undergone strict security and performance audits:
*   **Content Security Policy (CSP):** Hardened directives to prevent XSS.
*   **Input Sanitization:** Robust `sanitizeInput()` utilities for all dynamic DOM insertions.
*   **Strict Mode:** Enforced `"use strict"` across all JavaScript modules.

---

*Built with ❤️ for democratic empowerment.*
