import { NextRequest, NextResponse } from "next/server";
import { AssistantMemoryService } from "@/app/lib/assistant-memory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = request.headers.get("x-whop-user-id");

    // Handle localhost development
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    let targetUserId = userId;
    if (!targetUserId && isLocalhost) {
      targetUserId = 'localhost-dev-user';
      console.log('🔧 Using localhost development mode for memory');
    }

    switch (action) {
      case 'stats':
        // Get overall memory statistics
        const stats = AssistantMemoryService.getMemoryStats();
        return NextResponse.json({
          success: true,
          stats
        });

      case 'user-memory':
        if (!targetUserId) {
          return NextResponse.json(
            { error: "User ID required" },
            { status: 400 }
          );
        }

        const userMemory = AssistantMemoryService.getUserMemory(targetUserId);
        return NextResponse.json({
          success: true,
          memory: userMemory,
          hasMemory: !!userMemory
        });

      case 'memory-context':
        if (!targetUserId) {
          return NextResponse.json(
            { error: "User ID required" },
            { status: 400 }
          );
        }

        const memoryContext = AssistantMemoryService.generateMemoryContext(targetUserId);
        return NextResponse.json({
          success: true,
          context: memoryContext,
          hasContext: !!memoryContext
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: stats, user-memory, memory-context" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error in assistant memory API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, preferences, context } = await request.json();
    let userId = request.headers.get("x-whop-user-id");

    // Handle localhost development
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    if (!userId && isLocalhost) {
      userId = 'localhost-dev-user';
      console.log('🔧 Using localhost development mode for memory update');
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    switch (action) {
      case 'update-preferences':
        if (!preferences || typeof preferences !== 'object') {
          return NextResponse.json(
            { error: "Preferences object required" },
            { status: 400 }
          );
        }

        const updatedMemory = AssistantMemoryService.updateUserMemory(userId, {
          preferences
        });

        return NextResponse.json({
          success: true,
          message: "Preferences updated successfully",
          memory: updatedMemory
        });

      case 'update-context':
        if (!context || typeof context !== 'object') {
          return NextResponse.json(
            { error: "Context object required" },
            { status: 400 }
          );
        }

        const updatedContextMemory = AssistantMemoryService.updateUserMemory(userId, {
          conversationContext: context
        });

        return NextResponse.json({
          success: true,
          message: "Context updated successfully",
          memory: updatedContextMemory
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: update-preferences, update-context" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error updating assistant memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let userId = request.headers.get("x-whop-user-id");

    // Handle localhost development
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    if (!userId && isLocalhost) {
      userId = 'localhost-dev-user';
      console.log('🔧 Using localhost development mode for memory deletion');
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    // Clear user memory (for privacy/reset purposes)
    const hadMemory = AssistantMemoryService.deleteUserMemory(userId);
    
    return NextResponse.json({
      success: true,
      message: hadMemory ? "User memory cleared" : "No memory found to clear"
    });

  } catch (error) {
    console.error("Error deleting assistant memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}