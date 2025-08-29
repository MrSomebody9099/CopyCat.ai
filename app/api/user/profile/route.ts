import { NextRequest, NextResponse } from "next/server";
import { getWhopSdk } from "@/lib/whop-sdk";

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
    // Log all headers for debugging
    console.log('🔍 All request headers:');
    request.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Get the user ID from the request headers (set by Whop)
    let userId = request.headers.get("x-whop-user-id");
    
    // For localhost development, use a default user ID
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    console.log('🌐 Host:', request.headers.get('host'));
    console.log('🔧 Is localhost:', isLocalhost);
    console.log('👤 User ID from header:', userId);
    
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
        displayName: customProfile?.displayName || 'Developer',  // Better default for testing
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
    const whopSdk = getWhopSdk();
    if (!whopSdk) {
      return NextResponse.json(
        { error: "Whop SDK not available. This feature only works in Whop environment." },
        { status: 500 }
      );
    }
    
    const whopUser = await whopSdk.users.getUser({ userId });
    
    // Merge Whop data with custom profile data
    const userProfile = {
      id: whopUser.id,
      username: whopUser.username,
      displayName: customProfile?.displayName || whopUser.name || whopUser.username || 'User',
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
    // Log all headers for debugging
    console.log('🔍 All request headers (PUT):');
    request.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Get the user ID from the request headers (set by Whop)
    let userId = request.headers.get("x-whop-user-id");
    
    // For localhost development, use a default user ID
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    console.log('🌐 Host (PUT):', request.headers.get('host'));
    console.log('🔧 Is localhost (PUT):', isLocalhost);
    console.log('👤 User ID from header (PUT):', userId);
    
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
        const whopSdk = getWhopSdk();
        if (!whopSdk) {
          return NextResponse.json(
            { error: "Whop SDK not available. This feature only works in Whop environment." },
            { status: 500 }
          );
        }
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

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.userId,
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