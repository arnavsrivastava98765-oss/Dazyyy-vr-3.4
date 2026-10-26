// Dedicated Female Voice Synthesis Utility for Dazyyy
let cachedVoice = null;

const FEMALE_VOICE_NAMES = [
  'natural',
  'jenny',
  'aria',
  'zira',
  'sonia',
  'ava',
  'emma',
  'victoria',
  'samantha',
  'karen',
  'heera',
  'female',
  'woman'
];

export function findBestFemaleVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. First priority: Microsoft Zira or Natural Online female voices
  for (const v of voices) {
    const nameLower = v.name.toLowerCase();
    if (nameLower.includes('zira') || (nameLower.includes('natural') && (nameLower.includes('jenny') || nameLower.includes('aria')))) {
      cachedVoice = v;
      return v;
    }
  }

  // 2. Second priority: Any known female voice name in English
  for (const v of voices) {
    const nameLower = v.name.toLowerCase();
    const isEn = v.lang.startsWith('en');
    if (isEn && FEMALE_VOICE_NAMES.some(fn => nameLower.includes(fn))) {
      cachedVoice = v;
      return v;
    }
  }

  // 3. Third priority: Any voice labeled female
  for (const v of voices) {
    if (v.name.toLowerCase().includes('female')) {
      cachedVoice = v;
      return v;
    }
  }

  // Fallback to first available
  return voices[0] || null;
}

// Clean markdown, symbols, and code blocks before speaking
export function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links [title](url) -> title
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove markdown bold / italic / headers
    .replace(/[*#_~]/g, '')
    // Remove bullet points
    .replace(/^\s*[-•]\s*/gm, '')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove excess whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakWithFemaleVoice(text, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(clean);
  const voice = cachedVoice || findBestFemaleVoice();

  if (voice) {
    utterance.voice = voice;
  }

  // Soft, fluent, gentle feminine acoustic tuning
  utterance.pitch = 1.12; // Brighter, gentle feminine pitch
  utterance.rate = 1.02;  // Fluent natural conversational speed

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Pre-warm voices list
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    findBestFemaleVoice();
  };
}
