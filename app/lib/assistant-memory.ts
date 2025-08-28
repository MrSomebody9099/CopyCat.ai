/**
 * Assistant Memory Service
 * Enables AI to remember user preferences and context across chat sessions
 * Uses in-memory storage that resets on server restart (per user preferences)
 */

export interface UserMemory {
  userId: string;
  displayName?: string;
  email?: string;
  preferences: {
    // User's communication style preferences
    preferredTone?: 'casual' | 'professional' | 'friendly' | 'humorous';
    favoriteTopics?: string[];
    copywritingNiches?: string[]; // e.g., 'e-commerce', 'SaaS', 'fitness'
    commonRequests?: string[]; // frequently asked copy types
    // User's business context
    businessType?: string;
    targetAudience?: string;
    brandVoice?: string;
  };
  conversationContext: {
    // Key insights from past conversations
    frequentlyMentioned?: string[]; // topics user often talks about
    workingOn?: string; // current projects user mentioned
    painPoints?: string[]; // problems user frequently faces
    successes?: string[]; // wins user has shared
  };
  lastUpdated: Date;
  sessionCount: number;
}

export interface ConversationInsight {
  type: 'preference' | 'topic' | 'project' | 'pain_point' | 'success';
  content: string;
  confidence: number; // 0-1, how confident we are this is important
  extractedAt: Date;
  sessionId: string;
}

// In-memory storage (resets on server restart)
const userMemories = new Map<string, UserMemory>();
const conversationInsights = new Map<string, ConversationInsight[]>(); // userId -> insights

console.log('🧠 Assistant Memory Service initialized (in-memory, resets on restart)');

export class AssistantMemoryService {
  
  /**
   * Get user memory for personalization
   */
  static getUserMemory(userId: string): UserMemory | null {
    return userMemories.get(userId) || null;
  }

  /**
   * Initialize or update user memory
   */
  static updateUserMemory(userId: string, updates: Partial<UserMemory>): UserMemory {
    const existing = userMemories.get(userId) || {
      userId,
      preferences: {},
      conversationContext: {},
      lastUpdated: new Date(),
      sessionCount: 0
    };

    const updated: UserMemory = {
      ...existing,
      ...updates,
      userId, // Ensure userId is preserved
      preferences: { ...existing.preferences, ...updates.preferences },
      conversationContext: { ...existing.conversationContext, ...updates.conversationContext },
      lastUpdated: new Date(),
      sessionCount: existing.sessionCount + (updates.sessionCount || 0)
    };

    userMemories.set(userId, updated);
    console.log(`🧠 Updated memory for user ${userId}:`, {
      sessionCount: updated.sessionCount,
      preferences: Object.keys(updated.preferences).length,
      context: Object.keys(updated.conversationContext).length
    });

    return updated;
  }

  /**
   * Extract insights from a conversation
   */
  static extractInsights(userId: string, conversation: { role: 'user' | 'assistant'; content: string }[], sessionId: string): void {
    const userMessages = conversation.filter(m => m.role === 'user').map(m => m.content);
    const insights: ConversationInsight[] = [];

    for (const message of userMessages) {
      const lowerMessage = message.toLowerCase();

      // Extract preferences
      if (lowerMessage.includes('i prefer') || lowerMessage.includes('i like') || lowerMessage.includes('i love')) {
        insights.push({
          type: 'preference',
          content: message,
          confidence: 0.8,
          extractedAt: new Date(),
          sessionId
        });
      }

      // Extract current projects
      if (lowerMessage.includes('working on') || lowerMessage.includes('building') || lowerMessage.includes('launching')) {
        insights.push({
          type: 'project',
          content: message,
          confidence: 0.7,
          extractedAt: new Date(),
          sessionId
        });
      }

      // Extract pain points
      if (lowerMessage.includes('struggling with') || lowerMessage.includes('having trouble') || lowerMessage.includes('need help')) {
        insights.push({
          type: 'pain_point',
          content: message,
          confidence: 0.7,
          extractedAt: new Date(),
          sessionId
        });
      }

      // Extract successes
      if (lowerMessage.includes('successful') || lowerMessage.includes('worked great') || lowerMessage.includes('increased sales')) {
        insights.push({
          type: 'success',
          content: message,
          confidence: 0.8,
          extractedAt: new Date(),
          sessionId
        });
      }

      // Extract frequently mentioned topics
      const copywritingKeywords = ['email', 'ad copy', 'landing page', 'sales page', 'headline', 'cta', 'funnel', 'social media'];
      for (const keyword of copywritingKeywords) {
        if (lowerMessage.includes(keyword)) {
          insights.push({
            type: 'topic',
            content: keyword,
            confidence: 0.6,
            extractedAt: new Date(),
            sessionId
          });
        }
      }
    }

    // Store insights
    if (insights.length > 0) {
      const existingInsights = conversationInsights.get(userId) || [];
      const allInsights = [...existingInsights, ...insights];
      
      // Keep only the most recent 50 insights per user
      const recentInsights = allInsights
        .sort((a, b) => b.extractedAt.getTime() - a.extractedAt.getTime())
        .slice(0, 50);
      
      conversationInsights.set(userId, recentInsights);
      
      console.log(`🔍 Extracted ${insights.length} insights for user ${userId}`);
    }
  }

  /**
   * Generate memory context for AI system prompt
   */
  static generateMemoryContext(userId: string): string {
    const memory = userMemories.get(userId);
    const insights = conversationInsights.get(userId) || [];

    if (!memory && insights.length === 0) {
      return '';
    }

    let context = '\n\n--- ASSISTANT MEMORY ---\n';

    // Add user preferences
    if (memory?.preferences && Object.keys(memory.preferences).length > 0) {
      context += 'User Preferences:\n';
      if (memory.preferences.preferredTone) {
        context += `- Preferred communication tone: ${memory.preferences.preferredTone}\n`;
      }
      if (memory.preferences.copywritingNiches?.length) {
        context += `- Copy niches: ${memory.preferences.copywritingNiches.join(', ')}\n`;
      }
      if (memory.preferences.businessType) {
        context += `- Business type: ${memory.preferences.businessType}\n`;
      }
      if (memory.preferences.targetAudience) {
        context += `- Target audience: ${memory.preferences.targetAudience}\n`;
      }
    }

    // Add conversation context
    if (memory?.conversationContext && Object.keys(memory.conversationContext).length > 0) {
      context += '\nPrevious Context:\n';
      if (memory.conversationContext.workingOn) {
        context += `- Currently working on: ${memory.conversationContext.workingOn}\n`;
      }
      if (memory.conversationContext.frequentlyMentioned?.length) {
        context += `- Frequently discusses: ${memory.conversationContext.frequentlyMentioned.join(', ')}\n`;
      }
      if (memory.conversationContext.painPoints?.length) {
        context += `- Common challenges: ${memory.conversationContext.painPoints.join(', ')}\n`;
      }
    }

    // Add recent insights (most relevant)
    const recentInsights = insights
      .filter(i => i.confidence > 0.6)
      .slice(0, 5); // Only most recent and confident insights

    if (recentInsights.length > 0) {
      context += '\nRecent Context:\n';
      for (const insight of recentInsights) {
        context += `- ${insight.type}: ${insight.content.substring(0, 100)}\n`;
      }
    }

    if (memory?.sessionCount) {
      context += `\nSession History: This is your ${memory.sessionCount + 1} conversation with this user.\n`;
    }

    context += '--- END MEMORY ---\n\n';
    context += 'Use this memory context naturally in conversation. Reference past context when relevant, but don\'t mention this memory system explicitly.\n';

    return context;
  }

  /**
   * Learn from user profile updates
   */
  static learnFromProfile(userId: string, profileData: { displayName?: string; email?: string }): void {
    const updates: Partial<UserMemory> = {};
    
    if (profileData.displayName) {
      updates.displayName = profileData.displayName;
    }
    
    if (profileData.email) {
      updates.email = profileData.email;
    }

    if (Object.keys(updates).length > 0) {
      this.updateUserMemory(userId, updates);
    }
  }

  /**
   * Increment session count
   */
  static incrementSessionCount(userId: string): void {
    this.updateUserMemory(userId, { sessionCount: 1 });
  }

  /**
   * Get memory stats for debugging
   */
  static getMemoryStats(): { totalUsers: number; totalInsights: number } {
    const totalInsights = Array.from(conversationInsights.values())
      .reduce((sum, insights) => sum + insights.length, 0);
    
    return {
      totalUsers: userMemories.size,
      totalInsights
    };
  }

  /**
   * Delete user memory (for privacy/reset)
   */
  static deleteUserMemory(userId: string): boolean {
    const hadMemory = userMemories.has(userId) || conversationInsights.has(userId);
    
    userMemories.delete(userId);
    conversationInsights.delete(userId);
    
    if (hadMemory) {
      console.log(`🗑️ Deleted memory for user ${userId}`);
    }
    
    return hadMemory;
  }
}

export default AssistantMemoryService;