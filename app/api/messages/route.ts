import { NextRequest, NextResponse } from 'next/server';

// In-memory session storage (shared with sessions API)
declare global {
  var globalSessions: Map<string, {
    id: string;
    title: string;
    messages: Array<{ type: string; content: string; id: string; timestamp: string }>;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Initialize global sessions if not exists
if (!global.globalSessions) {
  global.globalSessions = new Map();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = global.globalSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get messages with pagination
    const messages = session.messages
      .slice(offset, offset + limit);

    return NextResponse.json({ 
      messages,
      total: session.messages.length,
      sessionId,
      offset,
      limit
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, type, content } = body;

    if (!sessionId || !type || !content) {
      return NextResponse.json({ 
        error: 'sessionId, type, and content are required' 
      }, { status: 400 });
    }

    let session = global.globalSessions.get(sessionId);
    
    // Create session if it doesn't exist
    if (!session) {
      const now = new Date().toISOString();
      session = {
        id: sessionId,
        title: `Chat ${Date.now()}`,
        messages: [],
        createdAt: now,
        updatedAt: now
      };
      global.globalSessions.set(sessionId, session);
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage = {
      id: messageId,
      type,
      content,
      timestamp: new Date().toISOString()
    };

    session.messages.push(newMessage);
    session.updatedAt = new Date().toISOString();

    // Auto-generate title from first user message
    if (session.messages.length === 1 && type === 'user') {
      session.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }

    global.globalSessions.set(sessionId, session);

    return NextResponse.json({ message: newMessage }, { status: 201 });

  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, messageId, content } = body;

    if (!sessionId || !messageId || !content) {
      return NextResponse.json({ 
        error: 'sessionId, messageId, and content are required' 
      }, { status: 400 });
    }

    const session = global.globalSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const messageIndex = session.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Update message content
    session.messages[messageIndex] = {
      ...session.messages[messageIndex],
      content,
      timestamp: new Date().toISOString()
    };

    session.updatedAt = new Date().toISOString();
    global.globalSessions.set(sessionId, session);

    return NextResponse.json({ message: session.messages[messageIndex] });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const messageId = searchParams.get('messageId');

    if (!sessionId || !messageId) {
      return NextResponse.json({ 
        error: 'sessionId and messageId are required' 
      }, { status: 400 });
    }

    const session = global.globalSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const messageIndex = session.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Remove message
    session.messages.splice(messageIndex, 1);
    session.updatedAt = new Date().toISOString();
    global.globalSessions.set(sessionId, session);

    return NextResponse.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}