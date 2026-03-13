import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, count = 8 } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = `You are an expert educator. Generate exactly ${count} flashcards for the topic: "${topic}".
Each flashcard must have a clear question on the front and a concise, accurate answer on the back.
Cover a variety of difficulty levels: basic recall, conceptual understanding, and application.

Return ONLY a valid JSON object with this exact schema:
{
  "cards": [
    { "front": "Question text here?", "back": "Answer text here." }
  ]
}

Important:
- Questions should be specific and educational
- Answers should be concise but complete (1-3 sentences max)
- Cover different aspects of the topic
- Do NOT use markdown formatting inside the strings`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(
      completion.choices[0]?.message?.content || '{"cards":[]}'
    );

    return NextResponse.json({
      topic,
      cards: parsed.cards || [],
    });
  } catch (error: any) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
