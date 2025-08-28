import { NextRequest, NextResponse } from "next/server";
import { whopSdk } from "@/lib/whop-sdk";

// In-memory storage for custom user profile data
// This resets on server restart (aligns with project's session management approach)
interface CustomUserProfile {
  userId: string;
  displayName?: string;
  email?: string;
  preferences?: {
    [key: string]: any;
  };
  updatedAt: Date;
}

const customProfiles = new Map<string, CustomUserProfile>();

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the request headers (set by Whop)
    let userId = request.headers.get("x-whop-user-id");
    
    // For localhost development, use a default user ID
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    if (!userId && isLocalhost) {
      userId = 'localhost-dev-user';
      console.log('🔧 Using localhost development mode');
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    // Get custom profile data
    const customProfile = customProfiles.get(userId);
    
    // For localhost, create a mock user profile
    if (isLocalhost) {
      const userProfile = {
        id: userId,
        username: 'dev-user',
        displayName: customProfile?.displayName || '',  // Empty by default so users set their name
        email: customProfile?.email || '',
        preferences: customProfile?.preferences || {},
        updatedAt: customProfile?.updatedAt || null,
        isLocalhost: true
      };

      return NextResponse.json({
        success: true,
        profile: userProfile,
      });
    }

    // Get base user information from Whop (production only)
    const whopUser = await whopSdk.users.getUser({ userId });
    
    // Merge Whop data with custom profile data
    const userProfile = {
      id: whopUser.id,
      username: whopUser.username,
      displayName: customProfile?.displayName || whopUser.name || '',
      email: customProfile?.email || '',
      preferences: customProfile?.preferences || {},
      updatedAt: customProfile?.updatedAt || null,
      // Include original Whop data for reference
      originalWhopData: {
        name: whopUser.name,
        username: whopUser.username,
        createdAt: whopUser.createdAt,
      }
    };

    return NextResponse.json({
      success: true,
      profile: userProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the user ID from the request headers (set by Whop)
    let userId = request.headers.get("x-whop-user-id");
    
    // For localhost development, use a default user ID
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    if (!userId && isLocalhost) {
      userId = 'localhost-dev-user';
      console.log('🔧 Using localhost development mode for profile update');
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { displayName, email, preferences } = body;

    // Validate input
    if (displayName && typeof displayName !== 'string') {
      return NextResponse.json(
        { error: "Display name must be a string" },
        { status: 400 }
      );
    }

    if (email && typeof email !== 'string') {
      return NextResponse.json(
        { error: "Email must be a string" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Skip Whop user verification for localhost
    if (!isLocalhost) {
      try {
        await whopSdk.users.getUser({ userId });
      } catch (error) {
        return NextResponse.json(
          { error: "User not found in Whop" },
          { status: 404 }
        );
      }
    }

    // Get existing custom profile or create new one
    const existingProfile = customProfiles.get(userId) || {
      userId,
      preferences: {},
      updatedAt: new Date()
    };

    // Update profile data
    const updatedProfile: CustomUserProfile = {
      ...existingProfile,
      userId,
      updatedAt: new Date()
    };

    // Only update fields that are provided
    if (displayName !== undefined) {
      updatedProfile.displayName = displayName.trim();
    }

    if (email !== undefined) {
      updatedProfile.email = email.trim();
    }

    if (preferences !== undefined && typeof preferences === 'object') {
      updatedProfile.preferences = {
        ...existingProfile.preferences,
        ...preferences
      };
    }

    // Save updated profile
    customProfiles.set(userId, updatedProfile);

    console.log(`📝 User profile updated for ${userId}:`, {
      displayName: updatedProfile.displayName,
      email: updatedProfile.email ? '[SET]' : '[EMPTY]',
      preferences: Object.keys(updatedProfile.preferences || {}).length + ' preferences'
    });

    // Return updated profile (excluding sensitive data)
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: userId,
        displayName: updatedProfile.displayName,
        email: updatedProfile.email,
        preferences: updatedProfile.preferences,
        updatedAt: updatedProfile.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the user ID from the request headers (set by Whop)
    const userId = request.headers.get("x-whop-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in headers" },
        { status: 401 }
      );
    }

    // Remove custom profile data
    const existed = customProfiles.delete(userId);

    if (existed) {
      console.log(`🗑️ Custom profile data deleted for user ${userId}`);
      return NextResponse.json({
        success: true,
        message: "Profile data deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "No custom profile data found to delete"
      });
    }

  } catch (error) {
    console.error("Error deleting user profile:", error);
    return NextResponse.json(
      { error: "Failed to delete user profile" },
      { status: 500 }
    );
  }
}

// Helper function to get all custom profiles (for debugging)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Admin endpoint for debugging (you can remove this in production)
    if (body.action === 'debug_list_profiles') {
      const profiles = Array.from(customProfiles.entries()).map(([userId, profile]) => ({
        userId,
        displayName: profile.displayName,
        email: profile.email ? '[SET]' : '[EMPTY]',
        preferences: Object.keys(profile.preferences || {}).length,
        updatedAt: profile.updatedAt
      }));

      return NextResponse.json({
        success: true,
        totalProfiles: profiles.length,
        profiles
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in profile POST endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}