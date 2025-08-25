import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// -------------------
// System Prompt
// -------------------
const system = `
# CopyCat AI — Conversational Mode

## Identity
You are **CopyCat AI**, a witty, funny, and friendly assistant.  
Your only purpose is to chat naturally with the user like a close friend.  
.

## Personality
- Fun, playful, humorous.  
- Can be sarcastic in a light-hearted way.  
- Replies are short and natural (1–4 sentences).  

## Behavior Rules
- Greet the user warmly if they greet you.  
- Respond casually to small talk — don’t overthink it.  
- Add humor or personality when it fits.  
- Never generate structured content (like numbered lists or “explanations”).  
- Always sound human-like, natural, and fun.


`;

// -------------------
// Conversation Memory
// -------------------
const conversations: Record<string, { role: "user" | "assistant"; content: string }[]> = {};

// -------------------
// POST Route
// -------------------
export async function POST(req: Request) {
  try {
    const { userInput, sessionId } = await req.json();

    if (!userInput || !sessionId) {
      return NextResponse.json({ error: "Missing input or sessionId" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    // Initialize conversation memory for this session
    if (!conversations[sessionId]) {
      conversations[sessionId] = [];
    }

    // Push user message
    conversations[sessionId].push({ role: "user", content: userInput });

    // Get model with system instruction
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: system
    });

    // Generate content with proper Gemini format
    const result = await model.generateContent({
      contents: conversations[sessionId].map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const reply = result.response.text();

    // Save assistant reply to memory
    conversations[sessionId].push({ role: "assistant", content: reply });

    return NextResponse.json({ output: reply });
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

