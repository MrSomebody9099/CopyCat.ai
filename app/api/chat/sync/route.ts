import { NextRequest, NextResponse } from "next/server";

// Simple API to check if Whop chat integration is working
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-whop-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    // For now, we'll indicate that Whop chat integration is available but optional
    // This keeps the implementation simple while providing future extensibility
    return NextResponse.json({
      success: true,
      whopChatAvailable: false, // Set to false until we have proper access pass setup
      message: "Using local session storage for chat persistence",
      fallbackMode: true
    });

  } catch (error) {
    console.error("Error checking chat sync status:", error);
    return NextResponse.json(
      { error: "Failed to check chat sync status" },
      { status: 500 }
    );
  }
}

// Simple endpoint to log chat sessions (for future Whop integration)
export async function POST(request: NextRequest) {
  try {
    const { sessionId, messageCount, lastActivity } = await request.json();
    const userId = request.headers.get("x-whop-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    // Simple logging for now - can be extended to sync with Whop later
    console.log(`📊 Chat session activity - User: ${userId}, Session: ${sessionId}, Messages: ${messageCount}, Last Activity: ${lastActivity}`);

    return NextResponse.json({
      success: true,
      message: "Session activity logged",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error logging chat activity:", error);
    return NextResponse.json(
      { error: "Failed to log chat activity" },
      { status: 500 }
    );
  }
}