// app/api/generate-microlesson/route.ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, subject } = await req.json();
    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = `You are MicroLearnAI, an expert at creating 30-second micro-learning videos.
Generate a structured JSON micro-lesson for the topic: "${topic}" (subject: ${subject || "General"}).

The micro-lesson MUST have exactly 5 segments:
1. "hook"        — 3 seconds  — catchy eye-catching title intro
2. "concept"     — 7 seconds  — animated concept explanation with highlighted keywords
3. "interactive" — 10 seconds — interactive learning moment
4. "insight"     — 7 seconds  — key insight / takeaway with emphasis
5. "closing"     — 3 seconds  — smooth outro reinforcing main concept

TOTAL DURATION = exactly 30 seconds.

For the "interactive" segment, pick ONE interactiveType from:
  - "fill-blank"   → provide a sentence with exactly one [BLANK] placeholder and the "answer" word
  - "quick-question" → a question with 2 answer choices, mark the correctIdx (0 or 1)
  - "flow-diagram"  → a small concept flow: 3–4 nodes connected by arrows (use for process/cause-effect topics)

Return ONLY valid JSON matching this EXACT schema:
{
  "topic": string,
  "subject": string,
  "primaryColor": "#hex",
  "secondaryColor": "#hex",
  "accentColor": "#hex",
  "segments": [
    { "id": "hook", "durationSeconds": 3, "title": string, "subtitle": string, "emoji": string },
    { "id": "concept", "durationSeconds": 7, "heading": string, "body": string, "keywords": [string, string, string], "icon": string },
    { 
      "id": "interactive", 
      "durationSeconds": 10, 
      "interactiveType": "fill-blank" | "quick-question" | "flow-diagram",
      "prompt": string,
      "fillBlank": { "sentence": string, "answer": string } | null,
      "quickQuestion": { "question": string, "choices": [string, string], "correctIdx": number } | null,
      "flowDiagram": { "nodes": [{"id": "n1", "label": string}], "edges": [{"from": "n1", "to": "n2", "label": string}] } | null
    },
    { "id": "insight", "durationSeconds": 7, "heading": string, "takeaway": string, "supportingPoints": [string, string] },
    { "id": "closing", "durationSeconds": 3, "mainConcept": string, "tagline": string, "emoji": string }
  ],
  "quickSummary": {
    "summary": string,
    "notes": [string, string, string, string]
  }
}
 (Return ONLY the JSON, exactly following this schema)
`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is missing from environment variables!");
      return NextResponse.json({ error: "API configuration error: Key missing" }, { status: 500 });
    }

    console.log("Generating lesson for topic:", topic, "subject:", subject);
    
    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.65,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });
    } catch (primaryError: any) {
      console.warn("Primary model failed, trying fallback llama-3.1-8b-instant:", primaryError.message);
      completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.65,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });
    }

    const content = completion.choices[0]?.message?.content;
    console.log("AI Response received, length:", content?.length);
    
    if (!content) throw new Error("Empty AI response from both models");

    try {
      const lesson = JSON.parse(content);
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
