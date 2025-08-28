/**
 * Subscription Tier Service
 * Handles free/paid user limitations and premium features
 * Uses in-memory storage that resets on server restart (per user preferences)
 */

export interface UserUsage {
  userId: string;
  tier: 'free' | 'premium' | 'pro';
  dailyMessageCount: number;
  lastResetDate: string; // ISO date string
  totalMessages: number;
  features: {
    unlimitedChats: boolean;
    advancedMemory: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
}

export interface TierLimits {
  dailyMessages: number;
  maxSessions: number;
  memoryRetention: number; // days
  features: string[];
}

// Tier configurations
const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    dailyMessages: 50,
    maxSessions: 5,
    memoryRetention: 1, // 1 day memory
    features: ['basic_chat', 'basic_memory']
  },
  premium: {
    dailyMessages: 500,
    maxSessions: 50,
    memoryRetention: 30, // 30 days memory
    features: ['basic_chat', 'advanced_memory', 'priority_support', 'unlimited_sessions']
  },
  pro: {
    dailyMessages: -1, // unlimited
    maxSessions: -1, // unlimited
    memoryRetention: 365, // 1 year memory
    features: ['basic_chat', 'advanced_memory', 'priority_support', 'unlimited_sessions', 'custom_branding', 'api_access']
  }
};

// In-memory storage (resets on server restart)
const userUsageMap = new Map<string, UserUsage>();

console.log('💳 Subscription Tier Service initialized (in-memory, resets on restart)');

export class SubscriptionTierService {
  
  /**
   * Get user's current usage and tier info
   */
  static getUserUsage(userId: string): UserUsage {
    const today = new Date().toISOString().split('T')[0];
    let usage = userUsageMap.get(userId);

    if (!usage) {
      // Create new user with free tier
      usage = {
        userId,
        tier: 'free',
        dailyMessageCount: 0,
        lastResetDate: today,
        totalMessages: 0,
        features: {
          unlimitedChats: false,
          advancedMemory: false,
          prioritySupport: false,
          customBranding: false,
          apiAccess: false
        }
      };
      userUsageMap.set(userId, usage);
      console.log(`👤 Created new user with free tier: ${userId}`);
    } else {
      // Reset daily count if it's a new day
      if (usage.lastResetDate !== today) {
        usage.dailyMessageCount = 0;
        usage.lastResetDate = today;
        userUsageMap.set(userId, usage);
        console.log(`🔄 Reset daily count for user: ${userId}`);
      }
    }

    return usage;
  }

  /**
   * Check if user can send a message (within limits)
   */
  static canSendMessage(userId: string): { allowed: boolean; reason?: string; limit?: number; current?: number } {
    const usage = this.getUserUsage(userId);
    const limits = TIER_LIMITS[usage.tier];

    // Check daily message limit
    if (limits.dailyMessages > 0 && usage.dailyMessageCount >= limits.dailyMessages) {
      return {
        allowed: false,
        reason: `Daily message limit reached (${limits.dailyMessages} messages per day)`,
        limit: limits.dailyMessages,
        current: usage.dailyMessageCount
      };
    }

    return { allowed: true };
  }

  /**
   * Increment user's message count
   */
  static incrementMessageCount(userId: string): UserUsage {
    const usage = this.getUserUsage(userId);
    usage.dailyMessageCount += 1;
    usage.totalMessages += 1;
    userUsageMap.set(userId, usage);

    console.log(`📊 User ${userId} message count: ${usage.dailyMessageCount}/${TIER_LIMITS[usage.tier].dailyMessages === -1 ? '∞' : TIER_LIMITS[usage.tier].dailyMessages}`);
    
    return usage;
  }

  /**
   * Check if user can create new session (within limits)
   */
  static canCreateSession(userId: string, currentSessionCount: number): { allowed: boolean; reason?: string; limit?: number; current?: number } {
    const usage = this.getUserUsage(userId);
    const limits = TIER_LIMITS[usage.tier];

    // Check session limit
    if (limits.maxSessions > 0 && currentSessionCount >= limits.maxSessions) {
      return {
        allowed: false,
        reason: `Session limit reached (${limits.maxSessions} sessions max)`,
        limit: limits.maxSessions,
        current: currentSessionCount
      };
    }

    return { allowed: true };
  }

  /**
   * Upgrade user tier (mock implementation - in real app this would check payment)
   */
  static upgradeUserTier(userId: string, newTier: 'premium' | 'pro'): UserUsage {
    const usage = this.getUserUsage(userId);
    usage.tier = newTier;

    // Update features based on new tier
    const tierFeatures = TIER_LIMITS[newTier].features;
    usage.features = {
      unlimitedChats: tierFeatures.includes('unlimited_sessions'),
      advancedMemory: tierFeatures.includes('advanced_memory'),
      prioritySupport: tierFeatures.includes('priority_support'),
      customBranding: tierFeatures.includes('custom_branding'),
      apiAccess: tierFeatures.includes('api_access')
    };

    userUsageMap.set(userId, usage);
    console.log(`⬆️ Upgraded user ${userId} to ${newTier} tier`);
    
    return usage;
  }

  /**
   * Get tier information and limits
   */
  static getTierInfo(tier: string): TierLimits | null {
    return TIER_LIMITS[tier] || null;
  }

  /**
   * Get usage stats for a user
   */
  static getUserStats(userId: string): {
    usage: UserUsage;
    limits: TierLimits;
    utilization: {
      dailyMessages: { used: number; limit: number; percentage: number };
      features: string[];
    };
  } {
    const usage = this.getUserUsage(userId);
    const limits = TIER_LIMITS[usage.tier];

    const dailyPercentage = limits.dailyMessages > 0 
      ? Math.round((usage.dailyMessageCount / limits.dailyMessages) * 100)
      : 0;

    return {
      usage,
      limits,
      utilization: {
        dailyMessages: {
          used: usage.dailyMessageCount,
          limit: limits.dailyMessages,
          percentage: dailyPercentage
        },
        features: limits.features
      }
    };
  }

  /**
   * Check if user has access to a specific feature
   */
  static hasFeatureAccess(userId: string, feature: string): boolean {
    const usage = this.getUserUsage(userId);
    const limits = TIER_LIMITS[usage.tier];
    return limits.features.includes(feature);
  }

  /**
   * Get usage statistics for all users (admin function)
   */
  static getGlobalStats(): {
    totalUsers: number;
    tierDistribution: Record<string, number>;
    totalMessages: number;
    activeToday: number;
  } {
    const today = new Date().toISOString().split('T')[0];
    let totalMessages = 0;
    let activeToday = 0;
    const tierDistribution: Record<string, number> = { free: 0, premium: 0, pro: 0 };

    for (const [, usage] of userUsageMap) {
      totalMessages += usage.totalMessages;
      if (usage.lastResetDate === today && usage.dailyMessageCount > 0) {
        activeToday++;
      }
      tierDistribution[usage.tier] = (tierDistribution[usage.tier] || 0) + 1;
    }

    return {
      totalUsers: userUsageMap.size,
      tierDistribution,
      totalMessages,
      activeToday
    };
  }

  /**
   * Mock payment verification (in real app, this would integrate with Stripe/payment processor)
   */
  static verifyPayment(userId: string, plan: 'premium' | 'pro'): { success: boolean; message: string } {
    // Mock implementation - always succeeds for demo
    console.log(`💳 Mock payment verification for ${userId} - ${plan} plan`);
    
    this.upgradeUserTier(userId, plan);
    
    return {
      success: true,
      message: `Successfully upgraded to ${plan} plan!`
    };
  }

  /**
   * Get upgrade recommendations for user
   */
  static getUpgradeRecommendations(userId: string): {
    shouldUpgrade: boolean;
    reason: string;
    recommendedTier: string;
    benefits: string[];
  } {
    const usage = this.getUserUsage(userId);
    const limits = TIER_LIMITS[usage.tier];

    // Check if user is hitting limits
    const messageUtilization = limits.dailyMessages > 0 
      ? (usage.dailyMessageCount / limits.dailyMessages) 
      : 0;

    if (usage.tier === 'free' && messageUtilization > 0.8) {
      return {
        shouldUpgrade: true,
        reason: 'You\'re using 80%+ of your daily message limit',
        recommendedTier: 'premium',
        benefits: [
          '10x more daily messages (500 vs 50)',
          'Extended memory retention (30 days)',
          'Unlimited chat sessions',
          'Priority support'
        ]
      };
    }

    if (usage.tier === 'premium' && messageUtilization > 0.9) {
      return {
        shouldUpgrade: true,
        reason: 'You\'re a power user hitting premium limits',
        recommendedTier: 'pro',
        benefits: [
          'Unlimited messages',
          'Unlimited sessions',
          '1-year memory retention',
          'Custom branding',
          'API access'
        ]
      };
    }

    return {
      shouldUpgrade: false,
      reason: 'Your current plan meets your usage needs',
      recommendedTier: usage.tier,
      benefits: []
    };
  }
}

export default SubscriptionTierService;