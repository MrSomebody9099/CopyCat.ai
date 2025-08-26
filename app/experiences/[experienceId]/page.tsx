"use client";
import { useEffect, useMemo, useState } from "react";
// Whop SDK will be initialized on the client side

export default function Page() {
  const [userName, setUserName] = useState<string>("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [sessionId, setSessionId] = useState("user-123");
  const disabled = useMemo(() => !userInput.trim() || loading, [userInput, loading]);

  useEffect(() => {
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
      console.log("Calling generate API with:", { userInput, sessionId });
      console.log("Current sessionId:", sessionId);
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
        // Clear input after successful generation
        setUserInput("");
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

  // Handle Enter key press
  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      generate();
    }
  }

  return (
    <main className="min-h-screen p-6 sm:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold">CopyCat AI 🐾</h1>
          <p className="text-sm text-slate-600">AI copywriter for Whop communities {userName ? `— hi ${userName}!` : ""}</p>
        </header>

        <section className="card space-y-4">
          <div className="flex gap-2">
            <textarea
              className="input flex-1 min-h-[60px] resize-none"
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={3}
            />
            <button className="button px-8" onClick={generate} disabled={disabled}>
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>
        </section>

        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Output</h2>
            <div className="flex items-center gap-2">
              <button className="button" onClick={copy} disabled={!output}>Copy</button>
            </div>
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm min-h-[120px]">
            {output || "Your conversation with CopyCat AI will appear here…"}
          </div>
        </section>
      </div>
    </main>
  );
}
