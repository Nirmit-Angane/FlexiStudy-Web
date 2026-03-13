// AudioSync — Manages audio narration and slide synchronization

import { Slide } from '@/lib/types';

export class AudioSync {
  private audio: HTMLAudioElement | null = null;
  private slides: Slide[];
  private currentSlideIndex = 0;
  private onSlideChange: (index: number) => void;
  private isSynthesis = false;
  private speechQueue: string[] = [];
  private currentSpeech: SpeechSynthesisUtterance | null = null;

  constructor(slides: Slide[], onSlideChange: (index: number) => void) {
    this.slides = slides;
    this.onSlideChange = onSlideChange;
  }

  async preload() {
    // Determine if we use TTS or loaded audio files
    // For now, we use high-quality browser synthesis as requested
    this.isSynthesis = true;
  }

  play() {
    if (this.isSynthesis) {
      this.playSlideSynthesis(0);
    }
  }

  pause() {
    if (this.isSynthesis) {
      window.speechSynthesis.cancel();
    } else if (this.audio) {
      this.audio.pause();
    }
  }

  private playSlideSynthesis(index: number) {
    if (index >= this.slides.length) return;
    
    this.currentSlideIndex = index;
    this.onSlideChange(index);

    const slide = this.slides[index];
    const utterance = new SpeechSynthesisUtterance(slide.audioScript);
    
    // Voice selection logic (matches user request)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = ["Google US English", "Samantha", "Zira", "Microsoft Aria"];
    
    const selectedVoice = voices.find(v => preferredVoices.some(p => v.name.includes(p))) || voices[0];
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Delay slightly between slides
      setTimeout(() => {
        this.playSlideSynthesis(index + 1);
      }, 500);
    };

    this.currentSpeech = utterance;
    window.speechSynthesis.speak(utterance);
  }

  seek(index: number) {
    this.pause();
    this.playSlideSynthesis(index);
  }

  cleanup() {
    this.pause();
    this.currentSpeech = null;
  }

  // Helper for recording: provide a destination node
  connectToDestination(audioContext: AudioContext, destination: MediaStreamAudioDestinationNode) {
    // If we were using HTMLAudioElement, we would connect its source here
    // For SpeechSynthesis, it's harder to capture directly in some browsers
    // This hook is for future enhancement with file-based audio
  }
}
