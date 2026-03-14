import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion, QUALITY_MODEL } from "@/lib/groq";

// ── Style-specific prompt sections ──────────────────────────────────────────
const STYLE_INSTRUCTIONS: Record<string, string> = {
  interactive: `
LEARNING STYLE: Interactive
For the "interactive" segment, create ENGAGING ACTIVE-LEARNING moments:
  - Use "fill-blank" or "quick-question" interactiveType.
  - Include prediction questions, mini challenges, or pause-and-think prompts.
  - The content should keep the learner actively guessing, answering, and thinking.
  - Frame the question so the learner must recall or predict what comes next.
Example for Science: "Plants convert sunlight into ______ during photosynthesis."
Example for Coding: "What does this function return if n = 0? [choices]"
Example for History: "Which treaty ended World War 1? [choices]"`,

  example: `
LEARNING STYLE: Example-Based
For the "interactive" segment, create a STEP-BY-STEP WORKED EXAMPLE:
  - Use "flow-diagram" interactiveType with 3-4 nodes showing the steps of a worked example.
  - Each node should be one clear step in solving a problem or explaining a process.
  - For coding topics: show a code walkthrough with input → processing → output steps.
  - For math: show a solved problem step by step.
  - For science: show a process broken down into sequential stages.
  - For history: show an event → cause → effect breakdown.
The body/concept text should also use concrete examples rather than abstract explanations.`,

  visual: `
LEARNING STYLE: Visual
For the "interactive" segment, create a VISUAL DIAGRAM or CONCEPT MAP:
  - ALWAYS use "flow-diagram" interactiveType.
  - Create 3-4 nodes that form a clear visual representation of the concept.
  - Use descriptive edge labels to show relationships between concepts.
  - For science: show processes with arrows (e.g., Sunlight → Chlorophyll → Glucose).
  - For coding: show data flow or algorithm structure.
  - For history: show cause-and-effect chains or timelines.
  - For math: show formula derivation or concept relationships.
The body/concept text should reference visual elements and spatial relationships.`,

  practical: `
LEARNING STYLE: Practical / Hands-On
For the "interactive" segment, create a PRACTICE EXERCISE or MINI TASK:
  - Use "quick-question" interactiveType framed as a practical challenge.
  - Frame it as "Try this:" or "Your turn:" — a small activity the learner can do.
  - For coding: give a small coding challenge or ask what output a code snippet produces.
  - For science: suggest a quick experiment or observation task.
  - For math: present a problem to solve.
  - For history: ask the learner to analyze a scenario or make a decision.
The overall content should emphasize real-world application and doing over memorizing.`,
};

export async function POST(req: NextRequest) {
  try {
    const { topic, subject, learningStyle } = await req.json();
    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const styleKey = (learningStyle || "interactive").toLowerCase();
    const styleBlock = STYLE_INSTRUCTIONS[styleKey] || STYLE_INSTRUCTIONS.interactive;

    const prompt = `You are MicroLearnAI, an expert at creating 30-second micro-learning videos.
Generate a structured JSON micro-lesson for the topic: "${topic}" (subject: ${subject || "General"}).

The micro-lesson MUST have exactly 5 segments (30 seconds total) PLUS a 5-6 question MCQ quiz.

VIDEO SEGMENTS (30s):
1. "hook"        — 3 seconds  — catchy eye-catching title intro
2. "concept"     — 7 seconds  — animated concept explanation with highlighted keywords
3. "interactive" — 10 seconds — learning moment adapted to the learner's style (see below)
4. "insight"     — 7 seconds  — key insight / takeaway with emphasis
5. "closing"     — 3 seconds  — smooth outro reinforcing main concept

QUIZ SECTION:
- Generate 5-6 multiple-choice questions (MCQs) based ONLY on the content of this 30-second video.
- Each MCQ must have exactly 4 choices and 1 correctIdx (0-3).
- Focus on key takeaways and concepts explained in the video.

${styleBlock}

For the "interactive" segment, the interactiveType must be one of:
  - "fill-blank"   → provide a sentence with exactly one [BLANK] placeholder and the "answer" word
  - "quick-question" → a question with 2 answer choices, mark the correctIdx (0 or 1)
  - "flow-diagram"  → a small concept flow: 3–4 nodes connected by arrows (use for process/cause-effect topics)

Return ONLY valid JSON matching this EXACT schema:
{
  "topic": string,
  "subject": string,
  "learningStyle": "${styleKey}",
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "accentColor": "#hex",
  "segments": [
    { "id": "hook", "durationSeconds": 3, "title": string, "subtitle": string, "emoji": string, "narration": string },
    { "id": "concept", "durationSeconds": 7, "heading": string, "body": string, "keywords": [string, string, string], "icon": string, "narration": string },
    { 
      "id": "interactive", 
      "durationSeconds": 10, 
      "interactiveType": "fill-blank" | "quick-question" | "flow-diagram",
      "prompt": string,
      "fillBlank": { "sentence": string, "answer": string } | null,
      "quickQuestion": { "question": string, "choices": [string, string], "correctIdx": number } | null,
      "flowDiagram": { "nodes": [{"id": "n1", "label": string}], "edges": [{"from": "n1", "to": "n2", "label": string}] } | null,
      "narration": string
    },
    { "id": "insight", "durationSeconds": 7, "heading": string, "takeaway": string, "supportingPoints": [string, string], "narration": string },
    { "id": "closing", "durationSeconds": 3, "mainConcept": string, "tagline": string, "emoji": string, "narration": string }
  ],
  "quiz": [
    {
      "question": string,
      "choices": [string, string, string, string],
      "correctIdx": number
    }
  ],
  "script": string,
  "quickSummary": {
    "summary": string,
    "notes": [string, string, string, string]
  }
}

The "narration" field in each segment should be a natural script for that part. 
The "script" field should be the FULL concatenated narration of all segments combined.
The narration should be human-like, engaging, and fit the duration (approx 15 words per 5 seconds).

 (Return ONLY the JSON, exactly following this schema)
`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is missing from environment variables!");
      return NextResponse.json({ error: "API configuration error: Key missing" }, { status: 500 });
    }

    console.log("Generating lesson + quiz for topic:", topic, "subject:", subject, "style:", styleKey);
    
    const content = await generateChatCompletion(
      [{ role: "user", content: prompt }],
      {
        model: QUALITY_MODEL,
        temperature: 0.65,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }
    );
    console.log("AI Response received, length:", content?.length);
    
    if (!content) throw new Error("Empty AI response from both models");

    try {
      const lesson = JSON.parse(content);
      // Ensure the learningStyle field is set in the response
      lesson.learningStyle = styleKey;
      return NextResponse.json(lesson);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      throw new Error("AI returned invalid JSON structure");
    }
  } catch (error: any) {
    console.error("generate-microlesson final error:", error);
    return NextResponse.json(
      { 
        error: error?.message || "Failed to generate micro-lesson",
        details: error?.response?.data || error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
