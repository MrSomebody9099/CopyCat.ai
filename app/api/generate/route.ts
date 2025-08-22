import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { brief, type, tone, length } = await req.json();
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const system = `You are CopyCat AI — an elite direct-response copywriter. You write high-converting, clear, specific, on-brand copy. Avoid generic fluff. Add strong hooks and clear CTAs.`;

    const prompt = `\nSYSTEM: ${system}\n\nTASK: Write ${length} ${type} copy.\nTONE: ${tone}.\nBRIEF: ${brief}.\n\nOutput only the final copy, no preface.`;

    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
    const text = result.response?.text?.() ?? "";

    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}
