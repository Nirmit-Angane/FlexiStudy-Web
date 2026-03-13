export type SceneType = "TextScene" | "ComparisonScene" | "CodeScene" | "TerminalScene";

export interface SceneData {
  type: SceneType;
  duration: number; // in ms
  data: any; // specific to scene type
}

export interface VideoLesson {
  topic: string;
  script: string;
  scenes: SceneData[];
  mcqs: any[];
  notes: any;
}
