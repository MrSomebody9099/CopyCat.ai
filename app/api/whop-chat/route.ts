import { NextRequest, NextResponse } from "next/server";
import { whopChatService } from "@/app/lib/whop-chat-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');
    const userId = request.headers.get("x-whop-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    switch (action) {
      case 'check-availability':
        return NextResponse.json({
          success: true,
          available: whopChatService.isWhopIntegrationAvailable()
        });

      case 'load-session':
        if (!sessionId) {
          return NextResponse.json(
            { error: "Session ID is required" },
            { status: 400 }
          );
        }

        const messages = await whopChatService.loadSessionFromWhop(sessionId, userId);
        if (messages) {
          return NextResponse.json({
            success: true,
            messages,
            experienceId: whopChatService.getChatExperienceId(sessionId)
          });
        } else {
          return NextResponse.json({
            success: false,
            message: "No Whop chat data found for this session"
          });
        }

      case 'get-experience-id':
        if (!sessionId) {
          return NextResponse.json(
            { error: "Session ID is required" },
            { status: 400 }
          );
        }

        const experienceId = whopChatService.getChatExperienceId(sessionId);
        return NextResponse.json({
          success: true,
          experienceId: experienceId || null
        });

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error in Whop chat GET endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, messages } = body;
    const userId = request.headers.get("x-whop-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case 'enable-integration':
        const enabled = await whopChatService.enableWhopIntegration(userId, sessionId);
        return NextResponse.json({
          success: enabled,
          message: enabled ? "Whop integration enabled" : "Failed to enable Whop integration",
          experienceId: enabled ? whopChatService.getChatExperienceId(sessionId) : null
        });

      case 'sync-session':
        if (!Array.isArray(messages)) {
          return NextResponse.json(
            { error: "Messages array is required for sync operation" },
            { status: 400 }
          );
        }

        const synced = await whopChatService.syncLocalSessionWithWhop(sessionId, messages);
        return NextResponse.json({
          success: synced,
          message: synced ? "Session synced with Whop" : "Failed to sync session with Whop"
        });

      case 'send-message':
        const { message, experienceId } = body;
        if (!message || !experienceId) {
          return NextResponse.json(
            { error: "Message and experienceId are required" },
            { status: 400 }
          );
        }

        const messageId = await whopChatService.sendMessageToChat(experienceId, message);
        return NextResponse.json({
          success: !!messageId,
          messageId,
          message: messageId ? "Message sent to Whop chat" : "Failed to send message"
        });

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error in Whop chat POST endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;
    const userId = request.headers.get("x-whop-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Load fresh messages from Whop chat and update local session
    const messages = await whopChatService.loadSessionFromWhop(sessionId, userId);
    
    if (messages) {
      return NextResponse.json({
        success: true,
        messages,
        message: "Session refreshed from Whop chat"
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "No messages found in Whop chat or failed to load"
      });
    }

  } catch (error) {
    console.error("Error in Whop chat PUT endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}