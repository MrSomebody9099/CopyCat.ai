import { NextRequest, NextResponse } from "next/server";
import { SubscriptionTierService } from "@/app/lib/subscription-tier";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    let userId = request.headers.get("x-whop-user-id");

    // Handle localhost development
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    if (!userId && isLocalhost) {
      userId = 'localhost-dev-user';
      console.log('🔧 Using localhost development mode for subscription');
    }

    switch (action) {
      case 'usage':
        if (!userId) {
          return NextResponse.json(
            { error: "User ID required" },
            { status: 400 }
          );
        }

        const userStats = SubscriptionTierService.getUserStats(userId);
        return NextResponse.json({
          success: true,
          ...userStats
        });

      case 'can-send-message':
        if (!userId) {
          return NextResponse.json(
            { error: "User ID required" },
            { status: 400 }
          );
        }

        const canSend = SubscriptionTierService.canSendMessage(userId);
        return NextResponse.json({
          success: true,
          ...canSend
        });

      case 'can-create-session':
        if (!userId) {
          return NextResponse.json(
            { error: "User ID required" },
            { status: 400 }
          );
        }

        const sessionCount = parseInt(searchParams.get('sessionCount') || '0');
        const canCreate = SubscriptionTierService.canCreateSession(userId, sessionCount);
        return NextResponse.json({
          success: true,
          ...canCreate
        });

      case 'upgrade-recommendations':
        if (!userId) {
          return NextResponse.json(
            { error: "User ID required" },
            { status: 400 }
          );
        }

        const recommendations = SubscriptionTierService.getUpgradeRecommendations(userId);
        return NextResponse.json({
          success: true,
          ...recommendations
        });

      case 'global-stats':
        // Admin endpoint - in production you'd want to protect this
        const globalStats = SubscriptionTierService.getGlobalStats();
        return NextResponse.json({
          success: true,
          stats: globalStats
        });

      case 'tier-info':
        const tier = searchParams.get('tier') || 'free';
        const tierInfo = SubscriptionTierService.getTierInfo(tier);
        
        if (!tierInfo) {
          return NextResponse.json(
            { error: "Invalid tier" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          tier,
          limits: tierInfo
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: usage, can-send-message, can-create-session, upgrade-recommendations, global-stats, tier-info" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error in subscription API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, tier, plan } = await request.json();
    let userId = request.headers.get("x-whop-user-id");

    // Handle localhost development
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    if (!userId && isLocalhost) {
      userId = 'localhost-dev-user';
      console.log('🔧 Using localhost development mode for subscription update');
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    switch (action) {
      case 'increment-usage':
        // Increment user's message count
        const updatedUsage = SubscriptionTierService.incrementMessageCount(userId);
        return NextResponse.json({
          success: true,
          usage: updatedUsage,
          message: "Usage incremented"
        });

      case 'upgrade-tier':
        if (!tier || !['premium', 'pro'].includes(tier)) {
          return NextResponse.json(
            { error: "Invalid tier. Use: premium, pro" },
            { status: 400 }
          );
        }

        const upgradedUsage = SubscriptionTierService.upgradeUserTier(userId, tier);
        return NextResponse.json({
          success: true,
          usage: upgradedUsage,
          message: `Successfully upgraded to ${tier} tier`
        });

      case 'verify-payment':
        if (!plan || !['premium', 'pro'].includes(plan)) {
          return NextResponse.json(
            { error: "Invalid plan. Use: premium, pro" },
            { status: 400 }
          );
        }

        // Mock payment verification (in real app, integrate with Stripe)
        const paymentResult = SubscriptionTierService.verifyPayment(userId, plan);
        
        return NextResponse.json({
          success: paymentResult.success,
          message: paymentResult.message,
          tier: plan
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: increment-usage, upgrade-tier, verify-payment" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // For future subscription modifications like pause/resume
    return NextResponse.json({
      success: false,
      message: "Subscription modifications not yet implemented"
    });
  } catch (error) {
    console.error("Error modifying subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}