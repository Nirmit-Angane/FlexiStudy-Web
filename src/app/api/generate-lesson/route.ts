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

    const prompt = `You are LearnVid, an expert educational content creator. Generate a structured JSON lesson plan for an animated educational video about: "${topic}"

Learning style: ${style}
Style guidance: ${styleInstructions[style] || styleInstructions.Visual}

CRITICAL CONSTRAINTS:
- Video MUST be under 1 minute (60 seconds total)
- Use 5-7 slides maximum
- Each slide: 6-12 seconds
- Total estimated duration must be between 40-60 seconds

PHASE 1 — THEME SELECTION:
Select theme based on topic:
- Space/Astronomy → SPACE
- Biology/Nature → NATURE
- Chemistry → CHEMISTRY
- Physics → PHYSICS
- Mathematics → MATH
- Technology/AI → TECH
- Medicine/Health → MEDICAL
- Default → DEFAULT

PHASE 2 — CONTENT & NARRATION:
Write audioScript in natural SPOKEN English.
- Use contractions, rhetorical questions, casual phrasing.
- MAXIMUM 35 words per slide for audioScript.

Return ONLY valid JSON matching this exact schema (no markdown, no backticks):
{
  "meta": {
    "topic": "${topic}",
    "topicCategory": "Science|Math|Tech|etc",
    "difficulty": 1,
    "difficultyLabel": "Beginner",
    "duration": "short",
    "totalSlides": number,
    "estimatedDurationSeconds": number
  },
  "theme": {
    "name": "THEME_NAME",
    "bgColor": "#hex",
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "textColor": "#e2e8f0",
    "glowColor": "#hex",
    "particleStyle": "stars|dots|molecules|network|leaves|bubbles|grid",
    "fontMood": "scientific|elegant|technical|organic|bold"
  },
  "slides": [
    {
      "slideId": number,
      "type": "title|hook|realworld|concept|visual|formula|analogy|summary",
      "durationSeconds": number,
      "content": {
        "heading": "string",
        "subheading": "string",
        "body": "string",
        "detail": "string",
        "formula": "string",
        "icon": "emoji",
        "layout": "center|leftText_rightVisual|top_bottom",
        "funFact": "string"
      },
      "images": [],
      "animation": {
        "entrance": "fadeSlideUp|slideFromRight|zoomIn",
        "mainEffect": "typewriter|pulseGlow|staggerList|orbitSpin",
        "exitStyle": "fadeOut|slideLeft|dissolve"
      },
      "audioScript": "Spoken narration text.",
      "audioDurationSeconds": number
    }
  ],
  "quiz": [],
  "notes": {
    "keyPoints": [],
    "glossary": {},
    "funFacts": [],
    "summary": "string",
    "furtherReading": []
  }
}`;

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