import { getWhopSdk } from "@/lib/whop-sdk";

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

      // Get the Whop SDK instance
      const whopSdk = getWhopSdk();
      if (!whopSdk) {
        console.warn('Whop SDK not available. Whop chat features disabled.');
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
      // Get the Whop SDK instance
      const whopSdk = getWhopSdk();
      if (!whopSdk) {
        console.warn('Whop SDK not available. Whop chat features disabled.');
        return [];
      }

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
      // Get the Whop SDK instance
      const whopSdk = getWhopSdk();
      if (!whopSdk) {
        console.warn('Whop SDK not available. Whop chat features disabled.');
        return null;
      }

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

      // Get the Whop SDK instance
      const whopSdk = getWhopSdk();
      if (!whopSdk) {
        console.warn('Whop SDK not available. Whop access pass features disabled.');
        return null;
      }

      // In a real implementation, you would create or find an access pass
      // For now, we'll use a placeholder
      const accessPassId = "prod_AJiW8eRocqzjg"; // Your product ID
      this.accessPassCache.set(userId, accessPassId);
      
      return accessPassId;
    } catch (error) {
      console.error('Error getting or creating access pass:', error);
      return null;
    }
  }

  /**
   * Enable Whop integration for a specific session
   */
  async enableWhopIntegration(userId: string, sessionId: string): Promise<boolean> {
    try {
      // Get the Whop SDK instance
      const whopSdk = getWhopSdk();
      if (!whopSdk) {
        console.warn('Whop SDK not available. Whop integration disabled.');
        return false;
      }

      // Try to find or create a chat experience for this session
      const chatExperience = await this.findOrCreateChatExperience(userId, sessionId);
      
      if (chatExperience && chatExperience.id) {
        console.log(`✅ Whop integration enabled for session: ${sessionId} with experience: ${chatExperience.id}`);
        return true;
      } else {
        console.warn(`Failed to create Whop chat experience for session: ${sessionId}`);
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
      // Get the Whop SDK instance
      const whopSdk = getWhopSdk();
      return !!whopSdk;
    } catch (error) {
      console.error('Error checking Whop integration availability:', error);
      return false;
    }
  }

  /**
   * Load a session from Whop chat
   */
  async loadSessionFromWhop(sessionId: string, userId: string): Promise<Array<{
    type: 'user' | 'assistant';
    content: string;
    id: string;
    timestamp: Date;
    whopMessageId?: string;
  }> | null> {
    try {
      // Get the Whop SDK instance
      const whopSdk = getWhopSdk();
      if (!whopSdk) {
        console.warn('Whop SDK not available. Whop chat features disabled.');
        return null;
      }

      // Get chat experience ID for this session
      const experienceId = this.chatExperiences.get(sessionId);
      if (!experienceId) {
        console.warn(`No chat experience found for session: ${sessionId}`);
        return null;
      }

      // Get messages from Whop chat
      const whopMessages = await this.getMessagesFromChat(experienceId);
      
      // Convert to our internal format
      const internalMessages = this.convertWhopMessagesToInternal(whopMessages);
      
      console.log(`📥 Loaded ${internalMessages.length} messages from Whop for session: ${sessionId}`);
      return internalMessages;
    } catch (error) {
      console.error('Error loading session from Whop:', error);
      return null;
    }
  }

  /**
   * Sync local session with Whop chat
   */
  async syncLocalSessionWithWhop(sessionId: string, localMessages: Array<{
    type: 'user' | 'assistant';
    content: string;
    id: string;
    timestamp?: Date;
    whopMessageId?: string;
  }>): Promise<boolean> {
    try {
      // Get the Whop SDK instance
      const whopSdk = getWhopSdk();
      if (!whopSdk) {
        console.warn('Whop SDK not available. Whop chat features disabled.');
        return false;
      }

      // Get chat experience ID for this session
      const experienceId = this.chatExperiences.get(sessionId);
      if (!experienceId) {
        console.warn(`No chat experience found for session: ${sessionId}`);
        return false;
      }

      // Filter out messages that are already synced (have whopMessageId)
      const unsyncedMessages = localMessages.filter(msg => !msg.whopMessageId && msg.type === 'user');
      
      // Send unsynced messages to Whop chat
      let successCount = 0;
      for (const message of unsyncedMessages) {
        const result = await this.sendMessageToChat(experienceId, message.content);
        if (result) {
          successCount++;
        }
      }
      
      console.log(`🔄 Synced ${successCount}/${unsyncedMessages.length} messages to Whop for session: ${sessionId}`);
      return successCount === unsyncedMessages.length;
    } catch (error) {
      console.error('Error syncing session with Whop:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const whopChatService = WhopChatService.getInstance();


