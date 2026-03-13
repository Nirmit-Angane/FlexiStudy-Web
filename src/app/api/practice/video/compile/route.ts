import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // 1. Generate the master script first
    const scriptPrompt = `You are an expert educational content creator covering all subjects (Math, Science, History, Tech, etc).
Write a 60-second narration script for an educational video about: "${topic}".
Structure: intro (10s) → core concept 1 (15s) → core concept 2 (15s) → example/analogy (10s) → summary (10s).
Output the script ONLY as a raw string. Provide only the spoken text, without any visual cues or headers. Do not use markdown.`;

    const scriptCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: scriptPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const script = scriptCompletion.choices[0]?.message?.content?.trim() || "Script generation failed.";

    // 2. Generate scenes, MCQs, and notes in parallel relying on the generated script
    const [scenesData, mcqData, notesData] = await Promise.all([
      generateScenes(topic, script),
      generateMCQs(topic),
      generateNotes(topic),
    ]);

    return NextResponse.json({
      topic,
      script,
      scenes: scenesData,
      mcqs: mcqData,
      notes: notesData,
    });
  } catch (error: any) {
    console.error("Video compile error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to compile video" },
      { status: 500 }
    );
  }
}

async function generateScenes(topic: string, script: string) {
  const prompt = `Based on the following 60-second narration script about "${topic}", generate exactly 6 visual scenes to accompany the text.
Available Scene Types (CHOOSE WISELY based on the subject):
- "TextScene": Displays a large heading and body text. (Great for intro, definition, summary)
- "ComparisonScene": Compares two concepts side-by-side. (e.g. Plant vs Animal Cell, Demand vs Supply)
- "CodeScene": Displays a code snippet OR a math/logic formula. (Great for Tech, Math, Physics equations)
- "TerminalScene": Shows command line output OR raw data events. (Great for coding, or timelines in History)

Return ONLY a JSON object with a "scenes" array containing exactly 6 objects.
Schema for each scene in the array:
{
  "type": "TextScene" | "ComparisonScene" | "CodeScene" | "TerminalScene",
  "duration": number (milliseconds, all 6 must add up to exactly 60000),
  "data": {
       // IF TextScene: { "heading": "string", "body": "string", "color": "#hex" }
       // IF CodeScene: { "code": "string", "language": "string", "description": "string" }
       // IF ComparisonScene: { "leftTitle": "string", "leftBody": "string", "rightTitle": "string", "rightBody": "string" }
       // IF TerminalScene: { "lines": ["string", "string"], "prompt": "string" }
  }
}

Script to match:
${script}
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{"scenes":[]}');
    return parsed.scenes;
  } catch (e) {
    console.error("Scene generation error:", e);
    return [];
  }
}

async function generateMCQs(topic: string) {
  const prompt = `Generate 3 multiple choice questions to test the user's understanding of "${topic}".
Return ONLY a JSON object with an "mcqs" array.
Schema for each MCQ: { "question": "string", "options": ["A", "B", "C", "D"], "correctAnswer": 0-3 index, "explanation": "string" }`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });
    return JSON.parse(completion.choices[0]?.message?.content || '{"mcqs":[]}').mcqs;
  } catch (e) { return []; }
}

async function generateNotes(topic: string) {
  const prompt = `Generate detailed study notes for the topic "${topic}".
Return ONLY a JSON object with this schema:
{
  "summary": "string",
  "keyPoints": ["string"],
  "funFact": "string"
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });
    return JSON.parse(completion.choices[0]?.message?.content || '{}');
  } catch (e) { return {}; }
} 
