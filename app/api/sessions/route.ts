import { NextRequest, NextResponse } from 'next/server';

// In-memory session storage (aligns with user preference for session-based memory)
let sessions = new Map<string, {
  id: string;
  title: string;
  messages: Array<{ type: string; content: string; id: string }>;
  createdAt: string;
  updatedAt: string;
}>();

let sessionCounter = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (sessionId) {
      // Get specific session
      const session = sessions.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json({ session });
    }

    // Get all sessions with pagination
    const allSessions = Array.from(sessions.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(offset, offset + limit);

    return NextResponse.json({ 
      sessions: allSessions,
      total: sessions.size,
      offset,
      limit
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    sessionCounter++;
    const sessionId = `session_${Date.now()}_${sessionCounter}`;
    const now = new Date().toISOString();

    const newSession = {
      id: sessionId,
      title: title || `Chat ${sessionCounter}`,
      messages: [],
      createdAt: now,
      updatedAt: now
    };

    sessions.set(sessionId, newSession);

    return NextResponse.json({ session: newSession }, { status: 201 });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, messages } = body;

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = sessions.get(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update session
    const updatedSession = {
      ...session,
      title: title || session.title,
      messages: messages || session.messages,
      updatedAt: new Date().toISOString()
    };

    sessions.set(id, updatedSession);

    return NextResponse.json({ session: updatedSession });

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    sessions.delete(sessionId);

    return NextResponse.json({ message: 'Session deleted successfully' });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}