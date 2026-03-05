// spoiler-rules.js
// Alle Muster und Wortlisten zur Spoiler-Erkennung

const SpoilerRules = {

  // Ergebnis-Muster: 3:0 / 3-0 / 3–0 / 3 zu 0 / 3 zu null
  scorePatterns: [
    /\b\d{1,2}\s*[:\-–]\s*\d{1,2}\b/g,          // 3:0, 3-0, 3–0
    /\b\d{1,2}\s+zu\s+\d{1,2}\b/gi,              // 3 zu 0
    /\b\d{1,2}\s+zu\s+(null|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn)\b/gi,
  ],

  // Emotionale Spoiler-Wörter (Deutsch + Englisch)
  spoilerKeywords: [
    // Deutsch
    "debakel", "sensation", "blamage", "hammer", "wahnsinn", "historisch",
    "überraschung", "schock", "thriller", "drama", "irre", "unglaublich",
    "klatsche", "abgezockt", "überragend", "traumtor", "elfmeter", "verlängerung",
    "penaltyschießen", "elfmeterschießen", "rote karte", "platzverweis",
    "aufholjagd", "comeback", "zitterspiel", "knapper", "mühsam", "souverän",
    // Englisch
    "stunning", "shocking", "incredible", "unbelievable", "dramatic",
    "comeback", "thriller", "chaos", "miracle", "upset", "dominant",
    "humiliation", "hammered", "thrashed", "demolished",
  ],

  // Regex aus Keywords bauen (einmalig, für Performance)
  buildKeywordRegex() {
    const escaped = this.spoilerKeywords.map(w =>
      w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  },

  // Prüft ob ein Titel einen Score enthält
  containsScore(title) {
    return this.scorePatterns.some(p => {
      p.lastIndex = 0;
      return p.test(title);
    });
  },

  // Prüft ob ein Titel Spoiler-Keywords enthält
  containsSpoilerKeyword(title) {
    const regex = this.buildKeywordRegex();
    return regex.test(title);
  },

  // Gibt einen bereinigten Titel zurück (Scores geschwärzt, Keywords ersetzt)
  sanitizeTitle(title) {
    let clean = title;

    // Scores schwärzen
    for (const pattern of this.scorePatterns) {
      const globalPattern = new RegExp(pattern.source, "gi");
      clean = clean.replace(globalPattern, "█:█");
    }

    // Spoiler-Keywords schwärzen
    clean = clean.replace(this.buildKeywordRegex(), "███");

    return clean;
  },

  // Versucht "Team A vs Team B" aus dem Titel zu extrahieren
  extractMatchup(title) {
    const vsPattern = /(.+?)\s+(?:vs\.?|gegen|–|-)\s+(.+?)(?:\s*[|\|,]|$)/i;
    const match = title.match(vsPattern);
    if (match) {
      const teamA = match[1].trim().replace(/^(.*?highlights?|.*?match|.*?game)/i, "").trim();
      const teamB = match[2].trim().split(/[|,]/)[0].trim();
      if (teamA && teamB) {
        return `🥷 ${teamA} vs. ${teamB}`;
      }
    }
    return null;
  },

};
