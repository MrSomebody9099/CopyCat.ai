import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { brief, type, tone, length } = await req.json();
    
    // Validate input
    if (!brief?.trim()) {
      return NextResponse.json({ error: "Brief is required" }, { status: 400 });
    }
    
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY in environment variables");
      return NextResponse.json({ error: "API configuration error. Please check server setup." }, { status: 500 });
    }
    
    // Validate API key format (should be around 39-40 characters)
    if (process.env.GEMINI_API_KEY.length < 35) {
      console.error("Invalid GEMINI_API_KEY format - too short");
      return NextResponse.json({ error: "Invalid API key format. Please check your Gemini API key." }, { status: 500 });
    }

    console.log("Initializing Gemini AI with key length:", process.env.GEMINI_API_KEY.length);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const system = `You are CopyCat AI — an elite direct-response copywriter. You write high-converting, clear, specific, on-brand copy. Add strong hooks and clear CTAs.You Can explain why you choose the to say that justify it if user engages in conersation be as professional as posible they might even ask for suggestion. you can engage in converstion`;

    const prompt = `\nSYSTEM: ${system}\n\nTASK: Write ${length} ${type} copy.\nTONE: ${tone}.\nBRIEF: ${brief}.\n\nOutput only the final copy, no preface.`;

    console.log("Generating content with Gemini...");
    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
    const text = result.response?.text?.() ?? "";
    
    if (!text) {
      console.error("No text generated from Gemini");
      return NextResponse.json({ error: "No content generated. Please try again." }, { status: 500 });
    }

    console.log("Successfully generated content, length:", text.length);
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("Generate API error:", e);
    
    // Provide more specific error messages
    if (e.message?.includes("API_KEY_INVALID")) {
      return NextResponse.json({ error: "Invalid Gemini API key. Please check your API key." }, { status: 500 });
    }
    if (e.message?.includes("PERMISSION_DENIED")) {
      return NextResponse.json({ error: "API access denied. Please check your Gemini API key permissions." }, { status: 500 });
    }
    if (e.message?.includes("QUOTA_EXCEEDED")) {
      return NextResponse.json({ error: "API quota exceeded. Please try again later." }, { status: 500 });
    }
    if (e.message?.includes("SAFETY")) {
      return NextResponse.json({ error: "Content blocked by safety filters. Please try a different prompt." }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: `Generation failed: ${e?.message || "Unknown error"}` 
    }, { status: 500 });
  }
}
