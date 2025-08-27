"use client";
import { useState, useCallback, useEffect, useMemo } from 'react';

export interface Message {
  type: "user" | "assistant";
  content: string;
  id: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage that resets on server restart (aligns with user preferences)
let globalSessions = new Map<string, ChatSession>();
let sessionCounter = 0;

// Performance constants
const MESSAGES_PER_PAGE = 50;
const MAX_SESSIONS_DISPLAY = 100;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple cache for expensive operations
const cache = new Map<string, { data: any; timestamp: number }>();

function getCached<T>(key: string, fallback: () => T): T {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  const data = fallback();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

export function useSessionManager() {
  const [sessions, setSessions] = useState<Map<string, ChatSession>>(globalSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // Initialize with first session if none exist
  useEffect(() => {
    if (globalSessions.size === 0) {
      const firstSessionId = createNewSession();
      setCurrentSessionId(firstSessionId);
    } else {
      // Set current session to the most recent one
      const sessionIds = Array.from(globalSessions.keys());
      if (sessionIds.length > 0 && !currentSessionId) {
        setCurrentSessionId(sessionIds[sessionIds.length - 1]);
      }
    }
  }, [currentSessionId]);

  const createNewSession = useCallback((): string => {
    sessionCounter++;
    const sessionId = `session_${Date.now()}_${sessionCounter}`;
    const newSession: ChatSession = {
      id: sessionId,
      title: `Chat ${sessionCounter}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    globalSessions.set(sessionId, newSession);
    setSessions(new Map(globalSessions));
    return sessionId;
  }, []);

  // Convert sessions to simple format for sidebar with performance optimization
  const getSimpleSessions = useCallback(() => {
    return getCached('simpleSessions', () => {
      const simpleSessions = new Map<string, { title: string; messages: Message[] }>();
      
      // Limit sessions displayed for performance and filter out empty sessions
      const sessionEntries = Array.from(globalSessions.entries())
        .filter(([, session]) => session.messages.length > 0) // Only show sessions with messages
        .sort(([, a], [, b]) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, MAX_SESSIONS_DISPLAY);
        
      sessionEntries.forEach(([id, session]) => {
        simpleSessions.set(id, {
          title: session.title,
          messages: session.messages.slice(-MESSAGES_PER_PAGE) // Only recent messages for sidebar preview
        });
      });
      
      return simpleSessions;
    });
  }, [sessions]);

  // Optimized message retrieval with pagination
  const getSessionMessages = useCallback((sessionId: string, page: number = 0): Message[] => {
    const session = globalSessions.get(sessionId);
    if (!session) return [];
    
    const startIndex = page * MESSAGES_PER_PAGE;
    const endIndex = startIndex + MESSAGES_PER_PAGE;
    
    return session.messages.slice(Math.max(0, session.messages.length - endIndex), 
                                session.messages.length - startIndex);
  }, []);

  // Performance-optimized add message with cache invalidation
  const addMessage = useCallback((sessionId: string, message: Message) => {
    const session = globalSessions.get(sessionId);
    if (session) {
      session.messages.push(message);
      session.updatedAt = new Date();
      
      // Auto-generate title from first user message
      if (session.messages.length === 1 && message.type === 'user') {
        session.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
      }
      
      globalSessions.set(sessionId, session);
      
      // Invalidate cache
      cache.clear();
      
      setSessions(new Map(globalSessions));
    }
  }, []);

  // Update existing message content (for streaming responses)
  const updateMessage = useCallback((sessionId: string, messageId: string, newContent: string) => {
    const session = globalSessions.get(sessionId);
    if (session) {
      const messageIndex = session.messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        session.messages[messageIndex].content = newContent;
        session.updatedAt = new Date();
        globalSessions.set(sessionId, session);
        
        // Invalidate cache
        cache.clear();
        
        setSessions(new Map(globalSessions));
      }
    }
  }, []);

  const getCurrentSession = useCallback((): ChatSession | undefined => {
    return globalSessions.get(currentSessionId);
  }, [currentSessionId]);

  const switchToSession = useCallback((sessionId: string) => {
    if (globalSessions.has(sessionId)) {
      setCurrentSessionId(sessionId);
    }
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    globalSessions.delete(sessionId);
    setSessions(new Map(globalSessions));
    
    // If we deleted the current session, switch to another one or create new
    if (sessionId === currentSessionId) {
      const remainingSessions = Array.from(globalSessions.keys());
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[remainingSessions.length - 1]);
      } else {
        const newSessionId = createNewSession();
        setCurrentSessionId(newSessionId);
      }
    }
  }, [currentSessionId, createNewSession]);

  const updateSessionTitle = useCallback((sessionId: string, newTitle: string) => {
    const session = globalSessions.get(sessionId);
    if (session) {
      session.title = newTitle;
      session.updatedAt = new Date();
      globalSessions.set(sessionId, session);
      setSessions(new Map(globalSessions));
    }
  }, []);

  const clearAllSessions = useCallback(() => {
    globalSessions.clear();
    sessionCounter = 0;
    setSessions(new Map());
    const newSessionId = createNewSession();
    setCurrentSessionId(newSessionId);
  }, [createNewSession]);

  return {
    sessions,
    currentSessionId,
    createNewSession,
    addMessage,
    updateMessage,
    getCurrentSession,
    switchToSession,
    deleteSession,
    updateSessionTitle,
    clearAllSessions,
    getSimpleSessions,
    getSessionMessages,
    setCurrentSessionId
  };
}