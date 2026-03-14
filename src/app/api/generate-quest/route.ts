import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, difficulty } = body;

    const prompt = `You are an AI mission generator for a cyberpunk isometric RPG called "FlexiQuest". 
    Create a fun, short educational trivia challenge about the subject: "${subject}" at a "${difficulty}" level.
    Make the description immersive and mention "Kenney City" or hackers/agents occasionally.
    
    Output a STRICT JSON object matching exactly this schema and nothing else:
    {
      "id": "ai_quest",
      "npcId": "sigma", 
      "title": "Short Catchy Title",
      "diff": "${difficulty}",
      "coins": 150,
      "xp": 100,
      "desc": "A short, engaging description of the problem ending with a clear question. Feel free to use <code>tags</code> for emphasis.",
      "acceptableAnswers": ["main correct answer", "acceptable variation 1", "acceptable variation 2"]
    }
    
    The acceptableAnswers array must contain valid, short text answers that the user might type in. Provide a few variations of the correct answer (e.g. lowercase, slightly different phrasing).
    Keep the string lengths reasonable. Ensure JSON is valid.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) throw new Error("No content generated");

    const questData = JSON.parse(responseContent);
    questData.id = `ai_quest_${Date.now()}`;
    
    return NextResponse.json(questData);
  } catch (error) {
    console.error("Error generating AI quest:", error);
    return NextResponse.json(
      { error: "Failed to generate AI mission" },
      { status: 500 }
    );
  }
}
