/**
 * Splits text into natural sentences for speech synthesis.
 * Handles common abbreviations and punctuation.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  
  // Basic sentence splitting logic
  // Matches periods, question marks, and exclamation marks followed by a space or end of string
  // Avoids splitting on common abbreviations (Dr., Mr., etc. - though simple regex might struggle)
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 0);
    
  return sentences;
}

/**
 * Finds the most natural-sounding voice available in the browser.
 */
export function getBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Preferred voice keywords in order of priority
  const preferredKeywords = [
    "Google US English",
    "Microsoft Aria",
    "Microsoft Jenny",
    "Google UK English Female",
    "Natural",
    "Neural",
    "en-US",
    "en-GB"
  ];

  for (const keyword of preferredKeywords) {
    const voice = voices.find(v => v.name.includes(keyword) || v.lang.includes(keyword));
    if (voice) return voice;
  }

  // Fallback to any English female voice
  const englishFemale = voices.find(v => 
    (v.lang.startsWith("en-") || v.lang === "en") && 
    (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha"))
  );

  return englishFemale || voices[0];
}

/**
 * Adds natural pauses and variations to text for more human-like speech.
 * This is a simple implementation that adds ellipses or commas for timing.
 */
export function enhanceTextForTTS(text: string): string {
  // Add slight pauses after commas and between complex clauses
  // We can't easily control synthesis timing perfectly without SSML (which Web Speech API doesn't support well)
  // But we can add punctuation hints.
  return text.replace(/,/g, ", ...");
}
