"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import ClientOnlyInput from "../../components/ClientOnlyInput";
import ChatInputSection from "../../components/ChatInputSection";
import HistoryButton from "../../components/HistoryButton";
import ChatSidebar from "../../components/ChatSidebar";
import SettingsModal from "../../components/SettingsModal";
import MarkdownRenderer from "../../components/MarkdownRenderer";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    id: string;
    username: string;
    displayName: string;
    email?: string;
  } | null>(null);

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
    // Initialize placeholder on client side
    setDisplayedPlaceholder(placeholderTexts[0]);
    // Fetch user info
    fetchUserInfo();
  }, []);
  
  // Fetch user info from API
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setUserInfo({
            id: data.profile.id,
            username: data.profile.username,
            displayName: data.profile.displayName,
            email: data.profile.email || ''
          });
          console.log('📄 User profile loaded:', {
            displayName: data.profile.displayName,
            email: data.profile.email ? '[SET]' : '[EMPTY]',
            isLocalhost: data.profile.isLocalhost || false
          });
        }
      } else if (response.status === 401) {
        console.log('ℹ️ No authentication available (normal on localhost)');
        // Set a default user for localhost development
        setUserInfo({
          id: 'localhost-dev-user',
          username: 'dev-user', 
          displayName: 'Developer', // Better default name
          email: ''
        });
      } else {
        console.error('Failed to fetch user profile:', response.status);
        // Fallback with a better default display name
        setUserInfo({
          id: 'localhost-dev-user',
          username: 'dev-user',
          displayName: 'Developer',
          email: ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // Fallback for localhost with a better default display name
      setUserInfo({
        id: 'localhost-dev-user',
        username: 'dev-user',
        displayName: 'Developer',
        email: ''
      });
    }
  };

  // Handler for saving settings
  const handleSettingsSave = async (updatedInfo: { displayName: string; email: string }) => {
    console.log('💾 Saving settings:', updatedInfo);
    
    // Check if running in localhost
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
    
    if (isLocalhost) {
      console.log('🔧 Running in localhost mode');
    }
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: updatedInfo.displayName,
          email: updatedInfo.email
          // Note: username is read-only from Whop, so we don't send it
        })
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📝 Response data:', data);
        
        if (data.success) {
          // Update local state with saved data
          setUserInfo(prev => prev ? {
            ...prev,
            displayName: updatedInfo.displayName,
            email: updatedInfo.email
          } : null);
          
          console.log('✅ Settings saved successfully');
        } else {
          console.error('Failed to save settings:', data.error);
          throw new Error(data.error || 'Failed to save settings');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API error:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Re-throw so the SettingsModal can show the error
      throw error;
    }
  };

  // Handler to refresh user info
  const handleRefreshUserInfo = async () => {
    await fetchUserInfo();
  };

  // Session management
  const {
    currentSessionId,
    currentUserId,
    createNewSession,
    addMessage,
    updateMessage,
    getCurrentSession,
    setCurrentSessionId,
    setUserId,
    enableWhopIntegration,
    syncSessionWithWhop,
    isWhopIntegrationAvailable,
    loadSessionsFromWhop,
    switchToSession,
    getSimpleSessions,
    deleteSession,
    updateSessionTitle
  } = useSessionManager();
  
  // Set user ID when userInfo is loaded
  useEffect(() => {
    if (userInfo?.id) {
      setUserId(userInfo.id);
      
      // Enable Whop integration for the current session
      if (currentSessionId && isWhopIntegrationAvailable()) {
        enableWhopIntegration(currentSessionId, userInfo.id)
          .then(success => {
            if (success) {
              console.log('✅ Whop integration enabled for current session');
            } else {
              console.log('ℹ️ Whop integration not available or failed to enable');
            }
          })
          .catch(error => {
            console.error('Error enabling Whop integration:', error);
          });
      }
    }
  }, [userInfo, setUserId, currentSessionId, enableWhopIntegration, isWhopIntegrationAvailable]);
  
  // Load existing sessions from Whop when user info is available
  useEffect(() => {
    if (userInfo?.id && isWhopIntegrationAvailable()) {
      loadSessionsFromWhop(userInfo.id)
        .then(success => {
          if (success) {
            console.log('✅ Loaded existing sessions from Whop');
          } else {
            console.log('ℹ️ No existing sessions found in Whop or integration not available');
          }
        })
        .catch(error => {
          console.error('Error loading sessions from Whop:', error);
        });
    }
  }, [userInfo, isWhopIntegrationAvailable, loadSessionsFromWhop]);
  
  // Function to load existing sessions from Whop
  const loadExistingSessionsFromWhop = async () => {
    if (!userInfo?.id || !isWhopIntegrationAvailable()) {
      return;
    }
    
    try {
      // This would be the implementation to load existing sessions from Whop
      // For now, we're just logging that we would do this
      console.log('📥 Would load existing sessions from Whop for user:', userInfo.id);
    } catch (error) {
      console.error('Error loading sessions from Whop:', error);
    }
  };
  
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
          // Prepare headers with user info for personalization
          const headers: Record<string, string> = {
            "Content-Type": "application/json"
          };
          
          // Add user ID for personalization if available
          if (userInfo?.id) {
            headers["x-whop-user-id"] = userInfo.id;
            console.log('🔗 Sending user info for personalization:', {
              id: userInfo.id,
              displayName: userInfo.displayName || '[EMPTY]'
            });
          } else {
            console.log('⚠️ No user info available for personalization');
          }
          
          const res = await fetch("/api/generate", {
            method: "POST",
            headers,
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
        
        // Sync with Whop if integration is enabled
        if (currentUserId) {
          syncSessionWithWhop(currentSessionId)
            .then(success => {
              if (success) {
                console.log('✅ Session synced with Whop');
              } else {
                console.log('ℹ️ Failed to sync session with Whop');
              }
            })
            .catch(error => {
              console.error('Error syncing session with Whop:', error);
            });
        }
        
        // Simple session activity tracking
        if (currentUserId) {
          try {
            await fetch('/api/chat/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: currentSessionId,
                messageCount: messages.length + 1, // +1 for the new message
                lastActivity: new Date().toISOString()
              })
            });
          } catch (error) {
            console.log('Note: Session tracking unavailable:', error);
          }
        }
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

  // Handler functions for sidebar actions
  const handleSettingsClick = () => {
    console.log('Settings clicked - opening settings modal');
    setIsSettingsOpen(true);
    setIsSidebarOpen(false); // Close sidebar when opening settings
  };

  // Handler for new chat with simple session tracking
  const handleNewChatClick = async () => {
    console.log('New chat clicked - creating new session');
    
    try {
      const newSessionId = createNewSession(userInfo?.id);
      setCurrentSessionId(newSessionId);
      
      // Simple session tracking (can be extended to full Whop integration later)
      if (userInfo?.id) {
        try {
          await fetch('/api/chat/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: newSessionId,
              messageCount: 0,
              lastActivity: new Date().toISOString()
            })
          });
          console.log('✅ Session tracking enabled');
        } catch (error) {
          console.log('ℹ️ Session tracking unavailable:', error);
        }
      }
      
      setIsSidebarOpen(false); // Close sidebar after creating new chat
    } catch (error: any) {
      console.error('Failed to create new session:', error);
      // Show user-friendly error for subscription limits
      setError(error.message || 'Failed to create new chat session');
      
      // Don't close sidebar if there was an error
    }
  };

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      generate();
    }
  }

  // Get current session messages
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userInfo={userInfo}
        onSave={handleSettingsSave}
      />

      {/* Chat Sidebar */}
      <ChatSidebar 
        currentSessionId={currentSessionId}
        onSessionSelect={switchToSession}
        onNewChat={handleNewChatClick}
        sessions={getSimpleSessions()}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSettingsClick={handleSettingsClick}
        onEditSession={updateSessionTitle}
        onDeleteSession={deleteSession}
      />
      
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
                // Assistant message: full-width document block with markdown rendering
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
                  <MarkdownRenderer content={message.content} />
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
        isSidebarOpen={isSidebarOpen} // Pass sidebar state
      />
      
      </div> {/* End Main Chat Area */}
    </div>
  );
}