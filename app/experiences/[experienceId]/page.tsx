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
          // Wait 10 seconds before switching
          setTimeout(() => {
            setCurrentPlaceholder(
              (prev) => (prev + 1) % placeholderTexts.length
            );
          }, 10000);
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
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <header className="py-4">
        <div 
          className="flex items-center justify-center w-full"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <h1 
            className="text-3xl font-semibold tracking-wide"
            style={{
              color: '#ffffff',
              fontSize: '1.875rem',
              fontWeight: '600',
              letterSpacing: '0.025em',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              textAlign: 'center'
            }}
          >
            CopyCat
          </h1>
        </div>
        <div 
          className="mt-2"
          style={{
            height: '1px',
            width: '100vw',
            backgroundColor: '#6b7280',
            marginTop: '0.5rem',
            marginLeft: '-0rem',
            position: 'relative'
          }}
        ></div>
      </header>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#1a1a1a',
          padding: '1.5rem 1rem'
        }}
      >
        <div className="w-full space-y-2 pb-32 px-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex"
              style={{
                display: 'flex',
                margin: '8px 0',
                justifyContent: message.type === "user" 
                  ? 'flex-end'   // User: pushes bubble to right
                  : 'flex-start' // Assistant: full width block
              }}
            >
              {message.type === "user" ? (
                // User message: bubble style
                <div
                  className="shadow-md text-white border"
                  style={{
                    display: 'inline-block',
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '20px',
                    lineHeight: '1.5',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontFamily: '"ABC Diatype", Helvetica, Arial, system-ui, -apple-system, sans-serif',
                    fontSize: '1rem',
                    color: 'white',
                    marginRight: '32px'
                  }}
                >
                  <p 
                    className="whitespace-pre-wrap"
                    style={{
                      fontFamily: '"ABC Diatype", Helvetica, Arial, system-ui, -apple-system, sans-serif',
                      lineHeight: '1.5',
                      fontSize: '1rem',
                      margin: 0,
                      padding: 0
                    }}
                  >
                    {message.content}
                  </p>
                </div>
              ) : (
                // Assistant message: full-width document block
                <div
                  style={{
                    width: '100%',
                    background: 'transparent',
                    padding: '8px 32px',
                    fontFamily: '"ABC Diatype", Helvetica, Arial, system-ui, -apple-system, sans-serif',
                    fontSize: '1rem',
                    color: '#ececec',
                    margin: '0 auto',
                    textAlign: 'left'
                  }}
                >
                  <div 
                    className="whitespace-pre-wrap"
                    style={{
                      fontFamily: '"ABC Diatype", Helvetica, Arial, system-ui, -apple-system, sans-serif',
                      lineHeight: '1.6',
                      fontSize: '1rem',
                      margin: 0,
                      color: '#ececec'
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div 
              className="flex"
              style={{
                display: 'flex',
                margin: '8px 0',
                justifyContent: 'flex-start' // Assistant style: full width
              }}
            >
              <div
                style={{
                  width: '100%',
                  background: 'transparent',
                  padding: '8px 32px',
                  fontFamily: '"ABC Diatype", Helvetica, Arial, system-ui, -apple-system, sans-serif',
                  fontSize: '1rem',
                  color: '#ececec',
                  margin: '0 auto',
                  textAlign: 'left'
                }}
              >
                <p className="text-gray-300">CopyCat is typing...</p>
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
            border: '1px solid rgba(255, 255, 255, 0.2)',
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
