"use client";
import { useEffect, useMemo, useState, useCallback } from "react";

interface Message {
  type: "user" | "assistant";
  content: string;
  id: string;
}

const placeholderTexts = [
  "What killer copy are we cooking today?",
  "Need ad magic or just wanna chat?",
  "Type here… I promise I won't bite 😼",
  "Your words → My copy superpowers.",
  "Ready to make your brand sound irresistible?",
  "meow",
];

export default function Page() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState("user-123");
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const disabled = useMemo(
    () => !userInput.trim() || loading,
    [userInput, loading]
  );

  // Typewriter effect for rotating placeholders
  useEffect(() => {
    if (userInput) return;

    const typeWriterEffect = () => {
      const currentText = placeholderTexts[currentPlaceholder];
      let i = 0;
      setDisplayedPlaceholder("");
      setIsTyping(true);

      const typeInterval = setInterval(() => {
        if (i < currentText.length) {
          setDisplayedPlaceholder(currentText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          // Wait 30 seconds before switching
          setTimeout(() => {
            setCurrentPlaceholder(
              (prev) => (prev + 1) % placeholderTexts.length
            );
          }, 30000);
        }
      }, 70);

      return () => clearInterval(typeInterval);
    };

    const cleanup = typeWriterEffect();
    return cleanup;
  }, [currentPlaceholder, userInput]);

  // Typewriter effect for CopyCat responses
  const typeWriterResponse = useCallback((text: string, messageId: string) => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: text.slice(0, i + 1) }
              : msg
          )
        );
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
  }, []);

  async function generate() {
    if (disabled) return;

    setLoading(true);
    const messageId = Date.now().toString();
    const userMessage: Message = {
      type: "user",
      content: userInput,
      id: `user-${messageId}`,
    };

    const assistantMessage: Message = {
      type: "assistant",
      content: "",
      id: `assistant-${messageId}`,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    const inputText = userInput;
    setUserInput("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: inputText, sessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = `⚠️ ${data.error || "Generation failed"}`;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: errorText }
              : msg
          )
        );
        return;
      }

      if (data.output) {
        typeWriterResponse(data.output, assistantMessage.id);
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content:
                    "⚠️ No content was generated. Please try again.",
                }
              : msg
          )
        );
      }
    } catch (e: any) {
      const errorText = `⚠️ Network error: ${
        e.message || "Please check your connection."
      }`;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: errorText }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      generate();
    }
  }

  return (
    <div 
      className="min-h-screen w-full bg-gray-900 text-white flex flex-col"
      style={{
        backgroundColor: '#1f2937',
        color: '#ffffff',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <header className="text-center py-8 border-b border-gray-700">
        <h1 
          className="text-4xl font-bold mb-2"
          style={{
            color: '#ffffff',
            fontSize: '2.25rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}
        >
          CopyCat AI 🐾
        </h1>
        <p className="opacity-80">
          AI copywriter with personality — let’s chat!
        </p>
      </header>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#1f2937',
          padding: '1.5rem 1rem'
        }}
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-32">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl px-5 py-3 shadow-md max-w-[70%] ${
                  message.type === "user"
                    ? "bg-white text-black"
                    : "bg-gray-800 text-white border border-gray-600"
                }`}
              >
                {message.type === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span>🐾</span>
                    <span className="text-sm opacity-80">CopyCat</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-600 rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2">
                  <span>🐾</span>
                  <span className="text-sm opacity-80">CopyCat</span>
                </div>
                <p className="text-gray-300">Typing...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Bar at Bottom */}
      <div 
        className="fixed bottom-6 left-0 right-0 flex justify-center px-4"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 1rem',
          zIndex: 50
        }}
      >
        <div 
          className="w-full max-w-3xl flex items-center bg-[#1a1a1a] rounded-full px-6 py-4 shadow-lg"
          style={{
            width: '100%',
            maxWidth: '48rem',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            border: 'none',
            borderRadius: '9999px',
            padding: '1rem 1.5rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2)'
          }}
        >
          <input
            type="text"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg border-none"
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '1.125rem',
              padding: 0,
              margin: 0,
              boxShadow: 'none'
            }}
            placeholder={displayedPlaceholder + (isTyping ? '|' : '')}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={generate}
            disabled={disabled}
            className={`w-12 h-12 ml-3 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              disabled 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95'
            }`}
            style={{
              width: '3rem',
              height: '3rem',
              marginLeft: '0.75rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            <svg 
              className={`w-6 h-6 ${disabled ? 'text-gray-400' : 'text-black'}`}
              style={{
                width: '1.5rem',
                height: '1.5rem'
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M12 19V5m0 0l-7 7m7-7l7 7" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
