"use strict";

/**
 * ElectIQ - Indian Context Data
 * Contains terminology, election stages, and assessment questions.
 */

const GLOSSARY_TERMS = [
  { term: "EPIC", category: "Voter ID", definition: "Elector Photo Identity Card; official voter ID issued by the ECI. Essential for identity verification.", link: "https://voters.eci.gov.in/" },
  { term: "EVM", category: "Technology", definition: "Electronic Voting Machine; used for recording votes digitally with high security.", link: "https://www.eci.gov.in/evm/" },
  { term: "VVPAT", category: "Technology", definition: "Voter Verifiable Paper Audit Trail; prints a slip for 7s to verify your vote.", link: "https://www.eci.gov.in/evm/" },
  { term: "Model Code of Conduct", category: "Regulations", definition: "Rules governing parties and candidates to ensure fair play.", link: "https://www.eci.gov.in/mcc/" },
  { term: "BLO", category: "Personnel", definition: "Booth Level Officer; your local point of contact for all roll-related queries.", link: "https://voters.eci.gov.in/know-your-polling-station" },
  { term: "NOTA", category: "Voting", definition: "None Of The Above; ensures your right to reject all candidates in the fray.", link: "https://www.eci.gov.in/faqs/voter-education/nota/nota-r35/" },
  { term: "Form 6", category: "Registration", definition: "The primary portal for new voter registration and enrolment.", link: "https://voters.eci.gov.in/" },
  { term: "SVEEP", category: "Awareness", definition: "Flagship program for voter education and awareness across India.", link: "https://ecisveep.nic.in/" },
  { term: "Indelible Ink", category: "Voting", definition: "Special ink applied to the left forefinger to prevent electoral fraud.", link: "https://www.eci.gov.in/faqs/voter-education/voting-procedure/voting-procedure-r34/" },
  { term: "Form 17C", category: "Voting", definition: "The official account of votes recorded at each polling station.", link: "https://www.eci.gov.in/faqs/voter-education/voting-procedure/voting-procedure-r34/" },
  { term: "Returning Officer (RO)", category: "Personnel", definition: "Directly responsible for the conduct of elections in a constituency.", link: "https://www.eci.gov.in/faqs/voter-education/nominations/nominations-r33/" },
  { term: "cVIGIL", category: "Citizen Power", definition: "Official app for reporting Model Code of Conduct violations in real-time.", link: "https://cvigil.eci.gov.in/" },
  { term: "Ballot Unit", category: "Technology", definition: "The interface where voters press the button for their candidate.", link: "https://www.eci.gov.in/evm/" },
  { term: "Control Unit", category: "Technology", definition: "The central device managed by the PO that stores the votes.", link: "https://www.eci.gov.in/evm/" },
  { term: "Electoral Search", category: "Online Service", definition: "Universal search engine to find your name in the electoral roll.", link: "https://electoralsearch.eci.gov.in/" }
];

const TIMELINE_EVENTS = [
  { date: "Stage 1", title: "Delimitation", detail: "The process of redrawing boundaries of constituencies to ensure equal voter representation across the country." },
  { date: "Stage 2", title: "Summary Revision", detail: "Annual drive to update the electoral roll. Citizens can add, delete, or correct their details during this period." },
  { date: "Stage 3", title: "Election Notification", detail: "The formal call to the electorate. This sets the entire legal machinery of the election in motion." },
  { date: "Stage 4", title: "Filing of Nominations", detail: "Candidates file their papers and affidavits (Form 26) disclosing assets and criminal antecedents." },
  { date: "Stage 5", title: "Scrutiny", detail: "Returning Officers examine nomination papers to ensure the candidates are legally qualified to contest." },
  { date: "Stage 6", title: "Symbols Allocation", detail: "Parties are assigned their reserved symbols; independent candidates choose from a list of free symbols." },
  { date: "Stage 7", title: "Campaigning (MCC)", detail: "Strict adherence to the Model Code of Conduct. No new schemes or inducements can be announced by the government." },
  { date: "Stage 8", title: "Randomization of EVMs", detail: "Two stages of randomization using software to ensure no one knows which machine goes to which booth." },
  { date: "Stage 9", title: "Polling Day", detail: "Voting takes place under the supervision of Central Armed Police Forces (CAPF) and polling staff." },
  { date: "Stage 10", title: "Counting & Declaration", detail: "Votes are counted in the presence of candidates' agents, and the result is officially certified and notified." }
];

const QUIZ_QUESTIONS = [
  { q: "What is the minimum voting age in India?", options: ["18", "21", "25"], correct: 0 },
  { q: "Which body conducts elections for the Parliament?", options: ["Supreme Court", "Election Commission of India", "NITI Aayog"], correct: 1 },
  { q: "What does VVPAT stand for?", options: ["Voter Verifiable Paper Audit Trail", "Voter Visual Paper Audit Tool", "Voter Verified Personal Audit Tool"], correct: 0 },
  { q: "Which form is used for new voter registration?", options: ["Form 6", "Form 7", "Form 8"], correct: 0 },
  { q: "Who appoints the Chief Election Commissioner?", options: ["Prime Minister", "President of India", "Chief Justice"], correct: 1 },
  { q: "The Model Code of Conduct comes into force from:", options: ["Date of Polling", "Date of Notification", "Date of Result"], correct: 1 },
  { q: "What is NOTA?", options: ["None Of The Above", "National Online Training App", "Notice Of Transfer Authority"], correct: 0 },
  { q: "Which app allows reporting of MCC violations?", options: ["cVIGIL", "Electoral Search", "Voter Helpline"], correct: 0 },
  { q: "What is applied to the finger to prevent double voting?", options: ["Blue Paint", "Indelible Ink", "Sticker"], correct: 1 },
  { q: "The 'E' in EPIC stands for:", options: ["Electronic", "Elector", "Election"], correct: 1 }
];
