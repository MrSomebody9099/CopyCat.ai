import { whopSdk } from "@/lib/whop-sdk";

// Types for Whop chat integration
interface WhopChatExperience {
  id: string;
  link: string;
}

interface WhopMessage {
  id: string;
  content: string;
  richContent?: string;
  createdAt: string;
  updatedAt: string;
  messageType: 'automated' | 'regular' | 'system';
  user: {
    id: string;
    name: string;
    username: string;
    profilePicture?: {
      sourceUrl: string;
    };
  };
  attachments?: Array<{
    id: string;
    contentType: string;
    sourceUrl: string;
  }>;
  isDeleted: boolean;
  isEdited: boolean;
  isPinned: boolean;
  replyingToPostId?: string;
  viewCount: number;
}

interface WhopChatResponse {
  posts: WhopMessage[];
}

// Configuration for Whop chat experiences
interface WhopChatConfig {
  accessPassId?: string;
  experienceId?: string;
  name: string;
  expiresAt?: number;
  whoCanPost?: 'admins' | 'everyone';
}

export class WhopChatService {
  private static instance: WhopChatService;
  private chatExperiences = new Map<string, string>(); // sessionId -> experienceId
  private accessPassCache = new Map<string, string>(); // userId -> accessPassId

  public static getInstance(): WhopChatService {
    if (!WhopChatService.instance) {
      WhopChatService.instance = new WhopChatService();
    }
    return WhopChatService.instance;
  }

  /**
   * Find or create a chat experience for a user session
   */
  async findOrCreateChatExperience(
    userId: string, 
    sessionId: string, 
    config: Partial<WhopChatConfig> = {}
  ): Promise<WhopChatExperience | null> {
    try {
      // Check if we already have a chat experience for this session
      const existingExperienceId = this.chatExperiences.get(sessionId);
      if (existingExperienceId) {
        return {
          id: existingExperienceId,
          link: '' // We'd need to construct or fetch the actual link
        };
      }

      // Try to find or create access pass
      const accessPassId = await this.getOrCreateAccessPass(userId);
      if (!accessPassId) {
        console.warn('Could not find or create access pass for user:', userId);
        return null;
      }

      // Create chat experience
      const result = await whopSdk.messages.findOrCreateChat({
        accessPassId,
        name: config.name || `CopyCat Chat - ${new Date().toLocaleDateString()}`,
        expiresAt: config.expiresAt || Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        whoCanPost: config.whoCanPost || 'everyone'
      });

      if (result && result.id) {
        this.chatExperiences.set(sessionId, result.id);
        
        console.log(`📝 Created Whop chat experience: ${result.id} for session: ${sessionId}`);
        return {
          id: result.id,
          link: result.link || ''
        };
      } else {
        console.warn('Failed to create Whop chat experience');
        return null;
      }

    } catch (error) {
      console.error('Error creating Whop chat experience:', error);
      return null;
    }
  }

  /**
   * Get messages from a chat experience
   */
  async getMessagesFromChat(experienceId: string): Promise<WhopMessage[]> {
    try {
      const result = await whopSdk.messages.listMessagesFromChat({
        chatExperienceId: experienceId
      });

      if (result?.posts) {
        return result.posts as WhopMessage[];
      } else {
        console.warn('No posts found in Whop chat response');
        return [];
      }
    } catch (error) {
      console.error('Error fetching messages from Whop chat:', error);
      return [];
    }
  }

  /**
   * Send a message to a chat experience
   */
  async sendMessageToChat(experienceId: string, message: string): Promise<string | null> {
    try {
      const result = await whopSdk.messages.sendMessageToChat({
        experienceId,
        message
      });

      if (result) {
        console.log(`💬 Sent message to Whop chat: ${experienceId}`);
        return String(result);
      } else {
        console.warn('No result returned from Whop message send');
        return null;
      }
    } catch (error) {
      console.error('Error sending message to Whop chat:', error);
      return null;
    }
  }

  /**
   * Convert Whop messages to our internal message format
   */
  convertWhopMessagesToInternal(whopMessages: WhopMessage[]): Array<{
    type: 'user' | 'assistant';
    content: string;
    id: string;
    timestamp: Date;
    whopMessageId?: string;
  }> {
    return whopMessages.map(msg => {
      // Determine if this is a user or assistant message
      // You might need to adjust this logic based on your bot's user ID
      const isAssistant = msg.messageType === 'automated' || 
                         msg.user.username.includes('copycat') || 
                         msg.user.username.includes('assistant');
      
      return {
        type: isAssistant ? 'assistant' : 'user',
        content: msg.content,
        id: `whop-${msg.id}`,
        timestamp: new Date(parseInt(msg.createdAt)),
        whopMessageId: msg.id
      };
    });
  }

  /**
   * Get chat experience ID for a session
   */
  getChatExperienceId(sessionId: string): string | undefined {
    return this.chatExperiences.get(sessionId);
  }

  /**
   * Helper method to get or create access pass
   * This implementation uses a simplified approach for demo purposes
   */
  private async getOrCreateAccessPass(userId: string): Promise<string | null> {
    try {
      // Check cache first
      const cachedAccessPassId = this.accessPassCache.get(userId);
      if (cachedAccessPassId) {
        return cachedAccessPassId;
      }

      // For demo purposes, we'll use a placeholder access pass ID
      // In a real implementation, you would:
      // 1. Have a predefined access pass ID for your app
      // 2. Or query the user's access passes if they have specific ones
      // 3. Or create a new access pass for the user
      
      // Using the companyId from the SDK config as a fallback
      // In a real app, you would use an actual access pass ID
      const accessPassId = process.env.NEXT_PUBLIC_WHOP_DEFAULT_ACCESS_PASS_ID || 
                          process.env.NEXT_PUBLIC_WHOP_COMPANY_ID || 
                          'prod_demo_access_pass';
      
      this.accessPassCache.set(userId, accessPassId);
      return accessPassId;

    } catch (error) {
      console.error('Error handling access pass:', error);
      return null;
    }
  }

  /**
   * Sync local session data with Whop chat
   */
  async syncLocalSessionWithWhop(
    sessionId: string, 
    localMessages: Array<{ type: 'user' | 'assistant'; content: string; id: string }>
  ): Promise<boolean> {
    try {
      const experienceId = this.chatExperiences.get(sessionId);
      if (!experienceId) {
        console.log('No Whop chat experience found for session:', sessionId);
        return false;
      }

      // Get existing Whop messages
      const whopMessages = await this.getMessagesFromChat(experienceId);
      const existingMessageCount = whopMessages.length;

      // Send any new local messages to Whop
      const newMessages = localMessages.slice(existingMessageCount);
      
      for (const message of newMessages) {
        await this.sendMessageToChat(experienceId, `[${message.type.toUpperCase()}]: ${message.content}`);
      }

      console.log(`🔄 Synced ${newMessages.length} messages to Whop chat`);
      return true;

    } catch (error) {
      console.error('Error syncing with Whop chat:', error);
      return false;
    }
  }

  /**
   * Load session from Whop chat
   */
  async loadSessionFromWhop(sessionId: string, userId: string): Promise<Array<{
    type: 'user' | 'assistant';
    content: string;
    id: string;
  }> | null> {
    try {
      // Try to find existing chat experience
      const experienceId = this.chatExperiences.get(sessionId);
      if (!experienceId) {
        console.log('No existing Whop chat experience for session:', sessionId);
        return null;
      }

      // Get messages from Whop
      const whopMessages = await this.getMessagesFromChat(experienceId);
      const convertedMessages = this.convertWhopMessagesToInternal(whopMessages);

      console.log(`📥 Loaded ${convertedMessages.length} messages from Whop chat`);
      return convertedMessages;

    } catch (error) {
      console.error('Error loading session from Whop:', error);
      return null;
    }
  }

  /**
   * Enable Whop chat integration for a session
   */
  async enableWhopIntegration(userId: string, sessionId: string): Promise<boolean> {
    try {
      const chatExperience = await this.findOrCreateChatExperience(userId, sessionId, {
        name: `CopyCat.ai Chat - ${new Date().toLocaleDateString()}`,
        whoCanPost: 'everyone'
      });

      if (chatExperience) {
        console.log(`✅ Whop integration enabled for session: ${sessionId}`);
        return true;
      } else {
        console.log(`❌ Failed to enable Whop integration for session: ${sessionId}`);
        return false;
      }
    } catch (error) {
      console.error('Error enabling Whop integration:', error);
      return false;
    }
  }

  /**
   * Check if Whop integration is available
   */
  isWhopIntegrationAvailable(): boolean {
    try {
      // Check if we have the necessary SDK methods
      return !!(
        whopSdk && 
        whopSdk.messages &&
        typeof whopSdk.messages.findOrCreateChat === 'function' && 
        typeof whopSdk.messages.listMessagesFromChat === 'function' && 
        typeof whopSdk.messages.sendMessageToChat === 'function'
      );
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const whopChatService = WhopChatService.getInstance();
