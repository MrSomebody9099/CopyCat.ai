import { NextRequest, NextResponse } from "next/server";
import { SubscriptionTierService } from "@/app/lib/subscription-tier";
import { getWhopSdk } from "@/lib/whop-sdk";

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

      case 'check-access':
        if (!userId) {
          return NextResponse.json(
            { error: "User ID required" },
            { status: 400 }
          );
        }

        // Check if user has access to the premium product
        try {
          const whopSdk = getWhopSdk();
          if (!whopSdk) {
            // In localhost development, simulate access check
            if (isLocalhost) {
              return NextResponse.json({
                success: true,
                hasAccess: userId === 'localhost-dev-user' ? false : true,
                tier: userId === 'localhost-dev-user' ? 'free' : 'premium'
              });
            }
            throw new Error("Whop SDK not available");
          }

          const hasAccess = await whopSdk.access.checkIfUserHasAccessToAccessPass({
            accessPassId: "prod_AJiW8eRocqzjg", // Your product ID
            userId: userId
          });
          
          return NextResponse.json({
            success: true,
            hasAccess,
            tier: hasAccess ? 'premium' : 'free'
          });
        } catch (error) {
          console.error("Error checking access:", error);
          // In localhost development, provide fallback response
          if (isLocalhost) {
            return NextResponse.json({
              success: true,
              hasAccess: false,
              tier: 'free',
              message: "Simulated response for localhost development"
            });
          }
          return NextResponse.json({
            success: false,
            error: "Failed to check access"
          }, { status: 500 });
        }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: usage, can-send-message, can-create-session, upgrade-recommendations, global-stats, tier-info, check-access" },
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

        // Handle payment verification
        try {
          const whopSdk = getWhopSdk();
          if (!whopSdk) {
            // In localhost development, simulate payment verification
            if (isLocalhost) {
              return NextResponse.json({
                success: true,
                verified: true,
                message: "Payment verified (simulated for localhost development)"
              });
            }
            throw new Error("Whop SDK not available");
          }

          // Create checkout session
          const checkoutSession = await whopSdk.payments.createCheckoutSession({
            planId: "plan_uGs96XPxv08dR", // Use the plan ID directly
          });

          if (!checkoutSession) {
            throw new Error("Failed to create checkout session");
          }

          return NextResponse.json({
            success: true,
            checkoutUrl: checkoutSession.id, // Use the ID instead of url
          });
        } catch (error) {
          console.error("Error creating checkout session:", error);
          // In localhost development, provide fallback response
          if (isLocalhost) {
            return NextResponse.json({
              success: true,
              checkoutUrl: "/success", // Simulate successful checkout
              message: "Checkout session created (simulated for localhost development)"
            });
          }
          return NextResponse.json({
            success: false,
            error: "Failed to create checkout session"
          }, { status: 500 });
        }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: increment-usage, upgrade-tier, verify-payment" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error in subscription POST API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}