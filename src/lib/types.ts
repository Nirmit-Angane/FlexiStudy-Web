// ===== LearnVid Type Definitions =====

export interface LessonMeta {
  topic: string;
  topicCategory: string;
  difficulty: 1 | 2 | 3 | 4;
  difficultyLabel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Deep Dive';
  duration: 'short' | 'medium' | 'long' | 'complete';
  validated: boolean;
  validationNote: string;
  sourceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  totalSlides: number;
  estimatedDurationSeconds: number;
}

export type ThemeName =
  | 'SPACE' | 'NATURE' | 'CHEMISTRY' | 'PHYSICS' | 'MATH'
  | 'TECH' | 'MEDICAL' | 'EARTH' | 'HISTORY' | 'OCEAN'
  | 'FIRE' | 'ICE' | 'MIND' | 'FINANCE' | 'DEFAULT';

export type ParticleStyle = 'stars' | 'dots' | 'molecules' | 'network' | 'leaves' | 'bubbles' | 'grid';
export type FontMood = 'scientific' | 'elegant' | 'technical' | 'organic' | 'bold';

export interface LessonTheme {
  name: ThemeName;
  bgColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  particleStyle: ParticleStyle;
  fontMood: FontMood;
  glowColor: string;
}

export type SlideType =
  | 'title' | 'hook' | 'realworld' | 'concept' | 'visual' | 'formula' | 'worked_example'
  | 'analogy' | 'timeline' | 'comparison' | 'diagram'
  | 'misconception' | 'quote' | 'interaction' | 'statistic'
  | 'summary' | 'nextsteps';

export type EntranceAnimation =
  | 'fadeSlideUp' | 'slideFromRight' | 'slideFromLeft'
  | 'zoomIn' | 'typewriter';

export type MainEffect =
  | 'typewriter' | 'countUp' | 'drawLine' | 'orbitSpin'
  | 'particleBurst' | 'pulseGlow' | 'trampoline'
  | 'networkPulse' | 'dnaHelix' | 'waveform' | 'bounceIn'
  | 'drawDiagram' | 'imageReveal' | 'staggerList';

export type ExitStyle = 'fadeOut' | 'slideLeft' | 'dissolve';

export interface SlideImage {
  searchQuery: string;
  imageType: 'diagram' | 'photo' | 'illustration' | 'chart' | 'microscope' | 'infographic';
  placement: 'background' | 'side-panel' | 'full-slide' | 'inset' | 'overlay';
  canvasDraw: 'rightTriangle' | 'unitCircle' | 'sineWave' | 'workedExample' | 'none' | string;
  resolvedUrl?: string;
}

export interface SlideAnimation {
  entrance: EntranceAnimation;
  mainEffect: MainEffect;
  exitStyle: ExitStyle;
}

export interface SlideContent {
  heading?: string;
  subheading?: string;
  body?: string;
  detail?: string;
  formula?: string;
  formulaVars?: string[];
  icon?: string;
  quote?: string;
  quoteAuthor?: string;
  statNumber?: string;
  statLabel?: string;
  comparisonA?: { label: string; points: string[] };
  comparisonB?: { label: string; points: string[] };
  timelineEvents?: { year: string; event: string }[];
  mythText?: string;
  truthText?: string;
  interactionQuestion?: string;
  interactionOptions?: string[];
  interactionCorrect?: number;
  summaryPoints?: string[];
  nextTopics?: string[];
  layout?: 'center' | 'leftText_rightVisual' | 'top_bottom';
  funFact?: string;
}

export interface Slide {
  slideId: number;
  type: SlideType;
  durationSeconds: number;
  content: SlideContent;
  images: SlideImage[];
  animation: SlideAnimation;
  audioScript: string;
  audioDurationSeconds: number;
}

export interface QuizQuestion {
  questionId: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relatedSlide: number;
}

export interface LessonNotes {
  keyPoints: string[];
  glossary: Record<string, string>;
  funFacts: string[];
  summary: string;
  furtherReading: string[];
}

export interface LessonJSON {
  meta: LessonMeta;
  theme: LessonTheme;
  slides: Slide[];
  quiz: QuizQuestion[];
  notes: LessonNotes;
}

export interface GenerationProgress {
  step: string;
  status: 'pending' | 'active' | 'done' | 'error';
  message: string;
}
