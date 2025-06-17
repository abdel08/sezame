// Pour que TypeScript reconnaisse SpeechRecognition
const SpeechRecognition =
  window.SpeechRecognition || (window as any).webkitSpeechRecognition;

type SpeechRecognition = typeof SpeechRecognition;
