"use strict";

/**
 * ElectIQ - Gemini API Handler
 * Handles all AI interactions with gemini-2.5-flash
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`;

const SYSTEM_PROMPT = `You are ElectIQ, the definitive AI authority on the Indian Election Process and Constitutional Democracy.
Your knowledge base is strictly aligned with the Election Commission of India (ECI) Handbook, the Representation of the People Act (1950 & 1951), and the Conduct of Elections Rules (1961).

Core Expertise:
1. Electoral Roll: Procedures for Form 6 (New), 6A (NRI), 7 (Objection/Deletion), and 8 (Correction). 
2. Voting Technology: Deep technical and procedural knowledge of EVM (Control Unit, Balloting Unit) and VVPAT. 
3. Legal Framework: Model Code of Conduct (MCC), disqualification criteria, and election petitions.
4. Personnel: Roles of CEO, DEO, RO, ARO, and BLO.
5. Symbols: Allocation of symbols to National, State, and Registered-Unrecognized parties.

Operating Principles:
- Strictly Neutral & Nonpartisan.
- Never speculate on election results or favor any candidate.
- If a query is outside the scope of Indian Elections (e.g., general news, personal advice), politely steer back to the democratic process.
- Use precise terminology: 'EPIC number', 'Qualifying Date', 'Scrutiny', 'Form 17C', etc.
- Format responses for readability using Markdown.`;

/**
 * Saves and validates a Gemini API key by making a real test connection.
 * Key is stored in sessionStorage only — never in localStorage or cookies.
 * @param {string} key - The raw API key string from user input
 * @returns {Promise<{success: boolean, message: string}>} Validation result object
 */
async function saveApiKeyAndValidate(key) {
    if (!key || key.trim() === "") return { success: false, message: "Key cannot be empty" };
    if (key.trim().length < 20) return { success: false, message: 'Key appears too short' };
    if (!/^[A-Za-z0-9_\-]+$/.test(key.trim())) return { success: false, message: 'Key contains invalid characters' };
    
    // Quick test call to validate key
    const testUrl = `${BASE_URL}:generateContent`;
    try {
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': key.trim()
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
        });
        
        if (response.ok) {
            sessionStorage.setItem('ELECTIQ_API_KEY', key.trim());
            return { success: true, message: "Connection Established" };
        } else {
            const err = await response.json();
            return { success: false, message: err.error?.message || "Invalid Key" };
        }
    } catch (e) {
        return { success: false, message: "Network Error" };
    }
}

/**
 * Retrieves the stored API key from sessionStorage.
 * @returns {string|null} The stored API key, or null if not configured
 */
function getApiKey() {
    return sessionStorage.getItem('ELECTIQ_API_KEY');
}

/**
 * Calls the Gemini 2.5 Flash API with streaming support.
 * Processes the streaming response chunk-by-chunk for real-time display.
 * @param {string} userMessage - The user's question or prompt
 * @param {Array<{role: string, parts: Array}>} history - Prior conversation turns
 * @param {Function} onChunk - Callback called on each streamed text chunk: (chunk, fullText) => void
 * @returns {Promise<string>} The complete response text after streaming finishes
 * @throws {Error} If API key is missing or API returns an error
 */
async function callGemini(userMessage, history = [], onChunk = () => {}) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key required. Please configure it in Settings.");
    }

    const endpoint = `${BASE_URL}:streamGenerateContent`;
    const contents = [...history, { role: "user", parts: [{ text: userMessage }] }];

    /**
     * Executes the fetch request to Gemini API.
     * @returns {Promise<Response>} The API response
     */
    async function makeRequest() {
        return fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });
    }

    try {
        let response = await makeRequest();

        if (response.status === 429) {
            await new Promise(r => setTimeout(r, 2000));
            response = await makeRequest();
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to communicate with Gemini API");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            let startIdx;
            while ((startIdx = buffer.indexOf('{')) !== -1) {
                let braceCount = 0;
                let endIdx = -1;
                
                for (let i = startIdx; i < buffer.length; i++) {
                    if (buffer[i] === '{') braceCount++;
                    else if (buffer[i] === '}') braceCount--;
                    
                    if (braceCount === 0) {
                        endIdx = i;
                        break;
                    }
                }
                
                if (endIdx !== -1) {
                    const jsonStr = buffer.substring(startIdx, endIdx + 1);
                    try {
                        const json = JSON.parse(jsonStr);
                        const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        if (textChunk) {
                            fullText += textChunk;
                            onChunk(textChunk, fullText);
                        }
                    } catch (e) {
                        /* stream chunk was not valid JSON — skip and continue */
                    }
                    buffer = buffer.substring(endIdx + 1);
                } else {
                    break;
                }
            }
        }

        return fullText;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
