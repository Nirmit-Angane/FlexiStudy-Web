import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion, QUALITY_MODEL, DEFAULT_MODEL } from "@/lib/groq";

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

    const script = await generateChatCompletion(
      [{ role: "user", content: scriptPrompt }],
      {
        model: QUALITY_MODEL,
        temperature: 0.7,
        max_tokens: 500,
      }
    );

    if (!script) throw new Error("Script generation failed.");

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
  "duration": number (milliseconds, each should be around 10000ms),
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
    const content = await generateChatCompletion(
      [{ role: "user", content: prompt }],
      {
        model: QUALITY_MODEL,
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }
    );

    const parsed = JSON.parse(content || '{"scenes":[]}');
    let scenes = Array.isArray(parsed.scenes) ? parsed.scenes : [];
    
    // Ensure exactly 6 scenes
    if (scenes.length === 0) {
      scenes = [
        { type: "TextScene", duration: 10000, data: { heading: "Introduction", body: `Let's learn about ${topic}.`, color: "#3D8B71" } },
        { type: "TextScene", duration: 10000, data: { heading: "Core Concept", body: "Diving deeper into the mechanics.", color: "#4A7FC1" } },
        { type: "TextScene", duration: 10000, data: { heading: "Development", body: "How it applies in real world scenarios.", color: "#C4714A" } },
        { type: "TextScene", duration: 10000, data: { heading: "Example", body: "A practical illustration of the topic.", color: "#F5A623" } },
        { type: "TextScene", duration: 10000, data: { heading: "Key Takeaway", body: "The most important thing to remember.", color: "#A06CB0" } },
        { type: "TextScene", duration: 10000, data: { heading: "Summary", body: "Wrapping up our lesson.", color: "#3D8B71" } },
      ];
    } else if (scenes.length < 6) {
      while (scenes.length < 6) {
        scenes.push({ ...scenes[scenes.length - 1], duration: 10000 });
      }
    } else if (scenes.length > 6) {
      scenes = scenes.slice(0, 6);
    }

    // Normalize durations to 60000ms total
    const total = scenes.reduce((acc: number, s: any) => acc + (s.duration || 10000), 0);
    scenes = scenes.map((s: any) => ({
      ...s,
      duration: Math.round(((s.duration || 10000) / total) * 60000)
    }));

    return scenes;
  } catch (e) {
    console.error("Scene generation error:", e);
    return [
      { type: "TextScene", duration: 60000, data: { heading: topic, body: "Informational session starting...", color: "#3D8B71" } }
    ];
  }
}

async function generateMCQs(topic: string) {
  const prompt = `Generate 3 multiple choice questions to test the user's understanding of "${topic}".
Return ONLY a JSON object with an "mcqs" array.
Schema for each MCQ: { "question": "string", "options": ["A", "B", "C", "D"], "correctAnswer": 0-3 index, "explanation": "string" }`;

  try {
    const content = await generateChatCompletion(
      [{ role: "user", content: prompt }],
      {
        model: DEFAULT_MODEL, // Simple task, 8B is fine
        temperature: 0.4,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }
    );
    return JSON.parse(content || '{"mcqs":[]}').mcqs;
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
    const content = await generateChatCompletion(
      [{ role: "user", content: prompt }],
      {
        model: DEFAULT_MODEL, // Simple task, 8B is fine
        temperature: 0.4,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }
    );
    return JSON.parse(content || '{}');
  } catch (e) { return {}; }
} 
