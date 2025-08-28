"use client";
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, MessageSquare, X, Settings, Edit2, Trash2 } from 'lucide-react';

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
  onSettingsClick?: () => void;
  onEditSession?: (sessionId: string, newTitle: string) => void;
  onDeleteSession?: (sessionId: string) => void;
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
  onToggle,
  onSettingsClick,
  onEditSession,
  onDeleteSession
}: ChatSidebarProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    console.log('🔍 ChatSidebar mounted - onSettingsClick available:', !!onSettingsClick);
  }, [onSettingsClick]);

  // Memoized session list conversion for performance
  const sessionList: ChatSession[] = useMemo(() => {
    return Array.from(sessions.entries()).map(([id, data]) => {
      const lastMessage = data.messages.length > 0 
        ? data.messages[data.messages.length - 1]?.content?.slice(0, 40) + "..."
        : "Start a new conversation";
      
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

  const handleEditStart = useCallback((sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(currentTitle);
  }, []);

  const handleEditSave = useCallback(() => {
    if (editingSessionId && editTitle.trim() && onEditSession) {
      onEditSession(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle('');
  }, [editingSessionId, editTitle, onEditSession]);

  const handleEditCancel = useCallback(() => {
    setEditingSessionId(null);
    setEditTitle('');
  }, []);

  const handleDelete = useCallback((sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteSession && confirm('Are you sure you want to delete this chat?')) {
      onDeleteSession(sessionId);
    }
  }, [onDeleteSession]);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out',
            pointerEvents: 'auto'
          }}
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full z-50"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: '280px',
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          willChange: 'transform',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div 
            className="flex items-center gap-2"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MessageSquare className="h-5 w-5" style={{ width: '1.25rem', height: '1.25rem', color: '#ffffff' }} />
            <span 
              className="font-semibold"
              style={{
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              Chats
            </span>
          </div>
          <div 
            className="flex items-center gap-2"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <button
              onClick={handleNewChat}
              className="inline-flex items-center justify-center rounded-md"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              title="New Chat"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <Plus className="h-4 w-4" style={{ width: '1rem', height: '1rem', pointerEvents: 'none' }} />
            </button>
            {onSettingsClick && (
              <button
                onClick={(e) => {
                  console.log('🔧 Settings button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  onSettingsClick();
                }}
                className="inline-flex items-center justify-center rounded-md"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  zIndex: 9999,
                  pointerEvents: 'auto'
                }}
                title="Settings"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <Settings className="h-4 w-4" style={{ width: '1rem', height: '1rem', pointerEvents: 'none' }} />
              </button>
            )}
            <button
              onClick={onToggle}
              className="inline-flex items-center justify-center rounded-md"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <X className="h-4 w-4" style={{ width: '1rem', height: '1rem', pointerEvents: 'none' }} />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div 
          className="flex-1 overflow-hidden"
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}
        >
          {sessionList.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center h-32 text-center p-4"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '8rem',
                textAlign: 'center',
                padding: '1rem'
              }}
            >
              <MessageSquare 
                className="h-8 w-8 mb-2"
                style={{
                  width: '2rem',
                  height: '2rem',
                  marginBottom: '0.5rem',
                  color: '#6b7280',
                  opacity: 0.5
                }}
              />
              <p 
                className="text-sm"
                style={{
                  fontSize: '0.875rem',
                  color: '#9ca3af'
                }}
              >
                No conversations yet
              </p>
              <p 
                className="text-xs"
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}
              >
                Start a new chat to begin
              </p>
            </div>
          ) : (
            <div 
              className="overflow-y-auto h-full"
              onScroll={handleScroll}
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                height: '100%',
                width: '100%'
              }}
            >
              <div 
                className="relative"
                style={{ height: totalHeight, paddingTop: offsetY }}
              >
                <div 
                  className="space-y-1 p-2"
                  style={{
                    padding: '0.5rem',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {visibleSessions.map((session) => (
                    <div
                      key={session.id}
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease',
                        border: 'none',
                        height: ITEM_HEIGHT - 4,
                        backgroundColor: currentSessionId === session.id 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'transparent',
                        borderColor: currentSessionId === session.id 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'transparent',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div 
                        className="flex items-start justify-between mb-1"
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '0.25rem'
                        }}
                      >
                        <div
                          onClick={() => editingSessionId !== session.id && handleSessionSelect(session.id)}
                          style={{
                            flex: 1,
                            cursor: editingSessionId === session.id ? 'default' : 'pointer',
                            paddingRight: '0.5rem'
                          }}
                        >
                          {editingSessionId === session.id ? (
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditSave();
                                if (e.key === 'Escape') handleEditCancel();
                              }}
                              onBlur={handleEditSave}
                              autoFocus
                              style={{
                                width: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#ffffff',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <h3 
                              className="font-medium text-sm truncate"
                              style={{
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: currentSessionId === session.id ? '#ffffff' : '#d1d5db'
                              }}
                            >
                              {session.title}
                            </h3>
                          )}
                        </div>
                        <div 
                          className="flex items-center gap-1"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            opacity: 0.7
                          }}
                        >
                          {editingSessionId !== session.id && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditStart(session.id, session.title);
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                  borderRadius: '0.25rem',
                                  color: '#9ca3af',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                  e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#9ca3af';
                                }}
                                title="Edit chat name"
                              >
                                <Edit2 style={{ width: '0.75rem', height: '0.75rem', pointerEvents: 'none' }} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(session.id, e)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0.25rem',
                                  borderRadius: '0.25rem',
                                  color: '#9ca3af',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                  e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#9ca3af';
                                }}
                                title="Delete chat"
                              >
                                <Trash2 style={{ width: '0.75rem', height: '0.75rem', pointerEvents: 'none' }} />
                              </button>
                            </>
                          )}
                          <span 
                            className="text-xs"
                            style={{
                              fontSize: '0.75rem'
                            }}
                          >
                            {session.messageCount}
                          </span>
                          <MessageSquare 
                            className="h-3 w-3" 
                            style={{ width: '0.75rem', height: '0.75rem' }} 
                          />
                        </div>
                      </div>
                      {editingSessionId !== session.id && (
                        <p 
                          className="text-xs truncate"
                          style={{
                            fontSize: '0.75rem',
                            opacity: 0.7,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: currentSessionId === session.id ? '#ffffff' : '#d1d5db'
                          }}
                        >
                          {session.lastMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div 
          className="border-t p-4"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div 
            className="flex items-center justify-between mb-2"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}
          >
            <div 
              className="flex items-center gap-2 text-xs"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}
            >
              <div 
                className="flex items-center gap-1"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <div 
                  className="w-2 h-2 bg-green-500 rounded-full"
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    backgroundColor: '#10b981',
                    borderRadius: '50%'
                  }}
                ></div>
                <span>Ready</span>
              </div>
              <span>•</span>
              <span>{sessionList.length} conversations</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}