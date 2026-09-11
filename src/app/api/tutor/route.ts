import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion, DEFAULT_MODEL } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = `You are "Flexi", a helpful, patient, and highly knowledgeable AI Tutor for the FlexiStudy platform.
Your goal is to help students understand complex concepts, solve problems, and stay motivated.
Follow these guidelines:
1. Always be encouraging and supportive.
2. If a student asks a complex question, break it down into smaller, digestible parts.
3. Use analogies and real-world examples to explain abstract concepts.
4. Keep your responses concise but thorough.
5. Use markdown for better readability (bolding, lists, code blocks).
6. If the student asks something non-educational, politely steer the conversation back to their studies.
7. You cover all subjects: Math, Science, History, Coding, Economics, etc.

Current date: ${new Date().toLocaleDateString()}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    const answer = await generateChatCompletion(messages as any, {
      model: DEFAULT_MODEL,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Tutor API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get response from AI Tutor" },
      { status: 500 }
    );
  }
}
