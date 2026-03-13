// app/api/generate-lesson/route.ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, style } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const styleInstructions: Record<string, string> = {
      Visual: "Use vivid visual metaphors, diagrams described in text, spatial relationships, and colour-coded concepts. Each slide should paint a picture in the learner's mind.",
      Auditory: "Use rhythm, storytelling, mnemonics, and conversational language. Write as if narrating aloud. Use analogies that sound natural when spoken.",
      Kinesthetic: "Use step-by-step processes, hands-on examples, real-world applications, and action verbs. Focus on what the learner can DO with this knowledge.",
    };

    const prompt = `You are an expert educational content creator. Generate a structured 5-slide video lesson about: "${topic}"

Learning style: ${style}
Style guidance: ${styleInstructions[style] || styleInstructions.Visual}

Return ONLY valid JSON (no markdown, no backticks, no explanation) in this exact format:
{
  "topic": "concise topic title (max 6 words)",
  "summary": "one sentence describing what the student will learn",
  "slides": [
    {
      "id": 1,
      "type": "intro",
      "headline": "engaging slide headline (max 8 words)",
      "body": "2-3 sentence explanation that's clear and memorable",
      "emoji": "single relevant emoji",
      "points": null,
      "tag": "INTRODUCTION",
      "accentColor": "#3D8B71",
      "bg": "linear-gradient(135deg,#0f1a14,#0d1f18)"
    },
    {
      "id": 2,
      "type": "concept",
      "headline": "core concept headline",
      "body": "clear explanation of the main concept",
      "emoji": "relevant emoji",
      "points": ["key point one", "key point two", "key point three"],
      "tag": "CORE CONCEPT",
      "accentColor": "#4A7FC1",
      "bg": "linear-gradient(135deg,#0d1520,#0a1628)"
    },
    {
      "id": 3,
      "type": "deep-dive",
      "headline": "deeper explanation headline",
      "body": "more detailed explanation with analogy or example",
      "emoji": "relevant emoji",
      "points": ["detail one", "detail two", "detail three"],
      "tag": "DEEP DIVE",
      "accentColor": "#A06CB0",
      "bg": "linear-gradient(135deg,#160d20,#1a0d24)"
    },
    {
      "id": 4,
      "type": "example",
      "headline": "real-world example headline",
      "body": "concrete real-world example or application",
      "emoji": "relevant emoji",
      "points": ["example point one", "example point two", "example point three"],
      "tag": "REAL WORLD",
      "accentColor": "#F5A623",
      "bg": "linear-gradient(135deg,#1f1505,#201408)"
    },
    {
      "id": 5,
      "type": "summary",
      "headline": "key takeaway headline",
      "body": "memorable summary that reinforces the main lesson",
      "emoji": "relevant emoji",
      "points": ["takeaway one", "takeaway two", "takeaway three"],
      "tag": "KEY TAKEAWAYS",
      "accentColor": "#2E9E6B",
      "bg": "linear-gradient(135deg,#081a10,#061510)"
    }
  ]
}

Rules:
- Headlines must be punchy and under 8 words
- Body text must be engaging and educational, not dry
- Emoji must be genuinely relevant (not generic like 📚)
- Points must be concise (under 12 words each)
- accentColor must be a valid hex color that matches the slide mood
- bg must be a dark gradient CSS string
- Tailor ALL content specifically to the learning style: ${style}
- Make it genuinely educational and memorable`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI");
    }

    const lesson = JSON.parse(content);
    return NextResponse.json(lesson);

  } catch (error: any) {
    console.error("Generate lesson error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate lesson" },
      { status: 500 }
    );
  }
}