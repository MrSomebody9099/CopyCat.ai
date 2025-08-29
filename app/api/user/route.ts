import { NextRequest, NextResponse } from "next/server";
import { getWhopSdk } from "@/lib/whop-sdk";

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the request headers (set by Whop)
    const userId = request.headers.get("x-whop-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    // Get the Whop SDK instance
    const whopSdk = getWhopSdk();
    if (!whopSdk) {
      return NextResponse.json(
        { error: "Whop SDK not available. This feature only works in Whop environment." },
        { status: 500 }
      );
    }

    // Get user information from Whop
    const user = await whopSdk.users.getUser({ userId });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}