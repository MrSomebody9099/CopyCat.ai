"use client";
import { useEffect, useMemo, useState } from "react";
// Whop SDK will be initialized on the client side

// Simple copy types & presets
const COPY_TYPES = [
  { id: "social", label: "Social Caption" },
  { id: "ad", label: "Ad Headline" },
  { id: "email", label: "Email Body" },
  { id: "blog", label: "Blog Intro" },
  { id: "hook", label: "Hook / Lead" },
];

const TONES = ["Neutral", "Casual", "Professional", "Playful", "Luxury", "Bold"] as const;
const LENGTHS = ["Short", "Medium", "Long"] as const;

export default function Page() {
  const [userName, setUserName] = useState<string>("");
  const [brief, setBrief] = useState("");
  const [type, setType] = useState(COPY_TYPES[0].id);
  const [tone, setTone] = useState<(typeof TONES)[number]>("Neutral");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [conversation, setConversation] = useState<{role: string, content: string}[]>([]);
  const disabled = useMemo(() => !brief.trim() || loading, [brief, loading]);

  useEffect(() => {
    // Generate a unique session ID for this user session
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Whop SDK will be available in the iframe context
    // For now, we'll handle this gracefully
    try {
      // Check if we're in a Whop iframe
      if (window.parent !== window) {
        // We're in an iframe, likely Whop
        setUserName("Whop User");
      }
    } catch {
      // If not inside Whop, ignore
    }
  }, []);

  async function generate() {
    setLoading(true);
    setOutput("");
    try {
      // Construct the user input based on the form values
      const userInput = `Write ${length} ${type} copy with a ${tone} tone for: ${brief}`;
      const sessionId = "user-123"; // Later: generate per user dynamically
      
      console.log("Calling generate API with:", { userInput, sessionId });
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, sessionId }),
      });
      
      console.log("API response status:", res.status);
      const data = await res.json();
      console.log("API response data:", data);
      
      if (!res.ok) {
        // Show the actual error message from the API
        setOutput(`⚠️ ${data.error || 'Generation failed'}`);
        return;
      }
      
      if (data.output) {
        setOutput(data.output);
      } else {
        setOutput("⚠️ No content was generated. Please try again.");
      }
    } catch (e: any) {
      console.error("Frontend error:", e);
      setOutput(`⚠️ Network error: ${e.message || 'Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
  }

  return (
    <main className="min-h-screen p-6 sm:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">CopyCat AI 🐾</h1>
            <p className="text-sm text-slate-600">All-in-one AI copywriter for Whop communities {userName ? `— hi ${userName}!` : ""}</p>
          </div>
          <button className="button" onClick={generate} disabled={disabled}>
            {loading ? "Generating…" : "Generate"}
          </button>
        </header>

        <section className="card space-y-4">
          <div>
            <label className="label">What are we writing about? (product, offer, audience, goal)</label>
            <textarea
              className="input min-h-[120px]"
              placeholder="e.g., Fitness coaching program for busy dads, goal: book a strategy call"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Copy type</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                {COPY_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tone</label>
              <select className="select" value={tone} onChange={(e) => setTone(e.target.value as any)}>
                {TONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Length</label>
              <select className="select" value={length} onChange={(e) => setLength(e.target.value as any)}>
                {LENGTHS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Output</h2>
            <div className="flex items-center gap-2">
              <button className="button" onClick={copy} disabled={!output}>Copy</button>
            </div>
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            {output || "Your generated copy will appear here…"}
          </div>
        </section>
      </div>
    </main>
  );
}
