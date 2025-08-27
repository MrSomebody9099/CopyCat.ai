"use client";
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, MessageSquare, X } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
}

interface Message {
  type: "user" | "assistant";
  content: string;
  id: string;
}

interface ChatSidebarProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  sessions: Map<string, { title: string; messages: Message[] }>;
  isOpen: boolean;
  onToggle: () => void;
}

// Performance constants
const VISIBLE_ITEMS = 20;
const ITEM_HEIGHT = 72;

export default function ChatSidebar({ 
  currentSessionId, 
  onSessionSelect, 
  onNewChat, 
  sessions,
  isOpen,
  onToggle
}: ChatSidebarProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized session list conversion for performance
  const sessionList: ChatSession[] = useMemo(() => {
    return Array.from(sessions.entries()).map(([id, data]) => {
      const lastMessage = data.messages.length > 0 
        ? data.messages[data.messages.length - 1]?.content?.slice(0, 40) + "..."
        : "New chat";
      
      return {
        id,
        title: data.title,
        lastMessage,
        messageCount: data.messages.length
      };
    });
  }, [sessions]);

  // Virtual scrolling calculations
  const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  const endIndex = Math.min(startIndex + VISIBLE_ITEMS, sessionList.length);
  const visibleSessions = sessionList.slice(startIndex, endIndex);
  const totalHeight = sessionList.length * ITEM_HEIGHT;
  const offsetY = startIndex * ITEM_HEIGHT;

  // Optimized scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Optimized session selection
  const handleSessionSelect = useCallback((sessionId: string) => {
    onSessionSelect(sessionId);
    onToggle();
  }, [onSessionSelect, onToggle]);

  const handleNewChat = useCallback(() => {
    onNewChat();
    onToggle();
  }, [onNewChat, onToggle]);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
        style={{
          width: '280px',
          backgroundColor: '#0a0a0a',
          borderRight: '1px solid #27272a'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sidebar-foreground" />
            <span className="font-semibold text-sidebar-foreground">Chats</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 w-8"
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={onToggle}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 w-8 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {sessionList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70">Start a new chat to begin</p>
            </div>
          ) : (
            <div 
              className="overflow-y-auto h-full"
              onScroll={handleScroll}
            >
              <div 
                className="relative"
                style={{ height: totalHeight, paddingTop: offsetY }}
              >
                <div className="space-y-1 p-2">
                  {visibleSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionSelect(session.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 group ${
                        currentSessionId === session.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border/50'
                          : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }`}
                      style={{ height: ITEM_HEIGHT - 4 }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-sm truncate flex-1 pr-2">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-1 opacity-70">
                          <span className="text-xs">
                            {session.messageCount}
                          </span>
                          <MessageSquare className="h-3 w-3" />
                        </div>
                      </div>
                      <p className="text-xs opacity-70 truncate">
                        {session.lastMessage}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ready</span>
            </div>
            <span>•</span>
            <span>{sessionList.length} conversations</span>
          </div>
        </div>
      </div>
    </>
  );
}