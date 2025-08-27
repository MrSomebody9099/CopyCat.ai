"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import ClientOnlyInput from "../../components/ClientOnlyInput";
import ChatInputSection from "../../components/ChatInputSection";
import HistoryButton from "../../components/HistoryButton";
import Sidebar from "../../components/Sidebar";
import { useSessionManager, Message } from "../../hooks/useSessionManager";
import { 
  handleApiError, 
  retryOperation, 
  validateInput, 
  getErrorMessage, 
  isRecoverableError,
  checkMemoryUsage,
  ErrorCode 
} from "../../utils/errorHandler";

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
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
    // Initialize placeholder on client side
    setDisplayedPlaceholder(placeholderTexts[0]);
  }, []);
  
  // Session management
  const {
    currentSessionId,
    createNewSession,
    addMessage,
    updateMessage,
    getCurrentSession,
    setCurrentSessionId
  } = useSessionManager();
  
  // Get current session messages
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];
  
  const disabled = useMemo(
    () => !userInput.trim() || loading,
    [userInput, loading]
  );

  // Typewriter effect for rotating placeholders
  useEffect(() => {
    if (!isClient || userInput) return;

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
  }, [currentPlaceholder, userInput, isClient]);

  // Typewriter effect for CopyCat responses
  const typeWriterResponse = useCallback((text: string, messageId: string, sessionId: string) => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        // Update the existing message content
        updateMessage(sessionId, messageId, text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
    
    // Return cleanup function
    return () => clearInterval(typeInterval);
  }, [updateMessage]);

  async function generate() {
    if (disabled) return;

    try {
      // Clear any previous errors
      setError(null);
      
      // Validate input
      validateInput(userInput);
      
      // Check memory usage
      checkMemoryUsage();
      
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

      // Add messages to current session
      addMessage(currentSessionId, userMessage);
      addMessage(currentSessionId, assistantMessage);
      
      const inputText = userInput;
      setUserInput("");

      // Use retry logic for API call
      const data = await retryOperation(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userInput: inputText, sessionId: currentSessionId }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
            throw { status: res.status, message: errorData.error || 'Request failed' };
          }
          
          return await res.json();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }, 3, 1000);

      if (data.output) {
        typeWriterResponse(data.output, assistantMessage.id, currentSessionId);
        setRetryCount(0); // Reset retry count on success
      } else {
        const noContentMessage: Message = {
          type: "assistant",
          content: "⚠️ No content was generated. Please try again.",
          id: assistantMessage.id
        };
        addMessage(currentSessionId, noContentMessage);
      }
    } catch (error: any) {
      console.error('Generate error:', error);
      
      const chatError = handleApiError(error);
      const errorText = `⚠️ ${getErrorMessage(chatError)}`;
      
      const errorMessage: Message = {
        type: "assistant",
        content: errorText,
        id: `assistant-${Date.now()}`
      };
      
      addMessage(currentSessionId, errorMessage);
      
      // Set error state for UI feedback
      if (!isRecoverableError(chatError)) {
        setError(chatError.message);
      }
      
      setRetryCount(prev => prev + 1);
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
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* History Button - Top Left - Hidden when sidebar is open */}
      {!isSidebarOpen && (
        <HistoryButton onClick={() => setIsSidebarOpen(true)} />
      )}
      
      {/* Main Chat Area */}
      <div 
        className="flex-1 flex flex-col"
        style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
      {/* Error Display */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-900 border border-red-700 rounded-lg p-4 max-w-md">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-200 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {retryCount > 0 && (
            <p className="text-red-300 text-xs mt-1">Retry attempts: {retryCount}</p>
          )}
        </div>
      )}
              
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
      <ChatInputSection
        userInput={userInput}
        setUserInput={setUserInput}
        handleKeyPress={handleKeyPress}
        generate={generate}
        disabled={disabled}
        placeholder={isClient ? (displayedPlaceholder + (isTyping ? '|' : '')) : placeholderTexts[0]}
        isClient={isClient}
      />
      
      </div> {/* End Main Chat Area */}
    </div>
  );
}
