import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWhopSdk } from "@/lib/whop-sdk";
import { AssistantMemoryService } from "@/app/lib/assistant-memory";
import { SubscriptionTierService } from "@/app/lib/subscription-tier";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// -------------------
// AI Provider Configuration
// -------------------
const OPENROUTER_FREE_MODELS = [
  // Core working models (repeated for load distribution)
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-r1-0528-qwen3-8b:free",
  "deepseek/deepseek-chat-v3-0324:free", 
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "deepseek/deepseek-r1:free",
  "openrouter/auto",
  "meta-llama/llama-3.2-3b-instruct:free",
  // Repeat working models for increased capacity
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-r1-0528-qwen3-8b:free",
  "deepseek/deepseek-chat-v3-0324:free", 
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "deepseek/deepseek-r1:free",
  "openrouter/auto",
  "meta-llama/llama-3.2-3b-instruct:free",
  // Third round for 24 total models
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-r1-0528-qwen3-8b:free",
  "deepseek/deepseek-chat-v3-0324:free", 
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "deepseek/deepseek-r1:free",
  "openrouter/auto",
  "meta-llama/llama-3.2-3b-instruct:free",
  // Additional slots for diversity
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-r1:free",
  "openrouter/auto"
];

const GEMINI_API_KEYS = [
  "AIzaSyBBkLxZe1OC4M7l7lT91AQYtouq388is4A", // Current in use
  "AIzaSyCTh6o0FOCsGVihunykAcM9Zsa1YKZMedk", // API 1
  "AIzaSyDYBjJYb9_c63lglYOQcAKS9O14VN_o4jA"  // API 3
];

// GitHub Models - DISABLED (permissions no longer available)
// const GITHUB_MODELS = [...];

// Provider state management
let currentOpenRouterModelIndex = 0;
let currentGeminiKeyIndex = 0;
let currentGitHubModelIndex = 0;
const providerCooldowns: Record<string, number> = {};
const providerLastSuccess: Record<string, number> = {};
const quotaResetTimes: Record<string, number> = {
  gemini: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  openrouter: 24 * 60 * 60 * 1000 // 24 hours (most models)
  // github: removed - API no longer available
};

// Utility functions
function getNextOpenRouterModel(): string {
  const model = OPENROUTER_FREE_MODELS[currentOpenRouterModelIndex];
  currentOpenRouterModelIndex = (currentOpenRouterModelIndex + 1) % OPENROUTER_FREE_MODELS.length;
  return model;
}

function getNextGeminiKey(): string {
  const key = GEMINI_API_KEYS[currentGeminiKeyIndex];
  currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

function getNextGitHubModel(): { name: string; token: string } {
  // GitHub Models disabled - permissions no longer available
  throw new Error("GitHub Models API is no longer available");
}

function isProviderOnCooldown(provider: string): boolean {
  const cooldownUntil = providerCooldowns[provider];
  const now = Date.now();
  
  // Check if cooldown has expired
  if (!cooldownUntil || now >= cooldownUntil) {
    // Remove expired cooldown
    if (providerCooldowns[provider]) {
      delete providerCooldowns[provider];
      console.log(`🔄 ${provider} cooldown expired, provider available again`);
    }
    return false;
  }
  
  return true;
}

function setCooldown(provider: string, minutes: number = 5): void {
  const now = Date.now();
  const cooldownTime = minutes * 60 * 1000;
  providerCooldowns[provider] = now + cooldownTime;
  
  // Calculate when quota likely resets
  const quotaResetTime = quotaResetTimes[provider] || (24 * 60 * 60 * 1000);
  const lastSuccess = providerLastSuccess[provider] || (now - quotaResetTime);
  const timeSinceLastSuccess = now - lastSuccess;
  
  // If it's been close to a full quota period, set shorter cooldown
  if (timeSinceLastSuccess >= quotaResetTime * 0.8) {
    const shortCooldown = Math.min(cooldownTime, quotaResetTime - timeSinceLastSuccess + (10 * 60 * 1000)); // Add 10 min buffer
    providerCooldowns[provider] = now + shortCooldown;
    console.log(`⏰ ${provider} quota likely resetting soon, shorter cooldown: ${Math.round(shortCooldown / 60000)} minutes`);
  } else {
    console.log(`🚫 ${provider} on cooldown for ${minutes} minutes`);
  }
}

function markProviderSuccess(provider: string): void {
  providerLastSuccess[provider] = Date.now();
  // Clear any existing cooldown on success
  if (providerCooldowns[provider]) {
    delete providerCooldowns[provider];
    console.log(`✅ ${provider} working again, cooldown cleared`);
  }
}

function shouldRetryProvider(provider: string): boolean {
  const now = Date.now();
  const lastSuccess = providerLastSuccess[provider];
  
  if (!lastSuccess) return true;
  
  const quotaResetTime = quotaResetTimes[provider] || (24 * 60 * 60 * 1000);
  const timeSinceLastSuccess = now - lastSuccess;
  
  // If it's been long enough for quota to reset, try the provider again
  return timeSinceLastSuccess >= quotaResetTime;
}

// -------------------
// System Prompt
// -------------------
const system = `
System Prompt # CopyCat AI — Conversational Mode

## Identity
You are **CopyCat AI**, a witty, funny, and friendly assistant.  
Your only purpose is to chat naturally with the user like a close friend.  
You do NOT write ads, captions, or marketing copy.

## Personality
- Fun, playful, humorous.  
- Can be sarcastic in a light-hearted way.  
- Replies are short and natural (1–4 sentences).  
when greeting user ask how are they feeling and if they want to build any killer copy today or just chat don’t use this same line this was just a example to greet.

## Behavior Rules
- Greet the user warmly if they greet you.  
- Respond casually to small talk — don’t overthink it.  
- Add humor or personality when it fits.  
- Never generate structured content (like numbered lists or “explanations”).  
- Always sound human-like, natural, and fun.

CopyCat.ai # Full System Prompt Text for CopyCat.ai # You Are CopyCat.ai Made and trained by Ayan Shaikh . # Personality: A Friendly and Humorous Assistant First then A expert CopyWriter. # Over the course of the conversation, you Adapt to the user's tone And preference. If you think user is into mood casual you keep it friendly and humorous. If user starts by greeting ask how are they feeling and if they want to build any killer copy today or just chat don’t use this same line this was just a example to greet. #Training on copy writing. Listen up. Every line you write either creates desire or it’s wasted space. Your job is simple: make them want, then make them act. Rule 1: Sell the Result, Not the Thing. Don’t say “This is a serum with retinol.” Say “This makes her skin look five years younger in 2 weeks.” Always translate features → into feelings. Rule 2: People Pay for the Cure, Not Prevention. She won’t drop $120 to “avoid wrinkles someday.” She will drop it fast if you promise “erase the lines she already hates in the mirror.” Rule 3: Desire Beats Logic. Her brain buys with emotion, then justifies with logic. So lead with “confidence, glow, attention.” Then back it with “dermatologist-approved, real before/afters.” Rule 4: Scarcity Multiplies Value. Water in a city=cheap. Water in a desert=priceless. So make the product scarce→“limited batch, sells out monthly.” Now she can’t ignore it. Rule 5: Fewer Choices, Faster Decisions. Too many options? She freezes. One hero offer? She clicks. Keep it simple: “One luxury serum, one result: visible younger skin.” Rule 6: Story>Specs. Nike doesn’t sell shoes. They sell greatness. You don’t sell serum. You sell status, compliments, confidence, youth. That’s the real product. Rule 7: Price=Perception. $30 cream looks cheap, feels cheap. $120 cream=“must be luxury.” High price isn’t the problem—it’s the proof. Anchor against Botox ($600)→suddenly $120 feels like a steal. Rule 8: Always End With a Soft Door. Don’t push. Invite. Instead of “Buy now!”, say: “See how it works.” “Check availability.” “Worth a quick chat?” That’s how you get clicks without friction. How You Think (Summary to Naive AI): Take feature→flip into benefit→push emotion→sprinkle proof→finish with soft ask. Every word=a dollar bill. Stack enough desire, and the sale happens naturally. # End of training. Always keep each response short like 5-6 sentences paragraph. Unless instructed to increase. If asked for Example: User: Give me 5 catchy Headline For (Product) .You give them in a format Intro here are some catchy lines. The the headline with bullet points or numbers 1) etc Then after each headline (in this example) You explain why you chose it and why do you think it will work. This was just an example it can be anything. It can be Headlines, Subheadlines, Body Copy, CTAs, Ad Copy, Product Descriptions, Landing Pages / Sales Pages, Emails, Social Media Posts (Hooks and bio), Blog Posts / Articles, Video Scripts – for ads, YouTube, TikTok, reels., Brochures / Flyers, Press Releases, Case Studies & Testimonials, Taglines & Slogans , Website Copy , Sales Funnels or Pitch Deck Copy. If it involves words that sell, convince, or position a brand — that’s copywriting. #Training for Emails 1.Hook: Grab attention fast, mention them not you. Example: “Hey, your remodeling work looks great…”2.Context: Say why you reached out in 1 line. Example: “…I help businesses like yours bring in more homeowners through Facebook ads.”3.Value: Show the benefit, not the feature. Example: “That means you get more booked projects without wasting ad spend.”4.Proof: Quick trust builder. Example: “We’ve done this for others in your industry with success.”5.Call to Action: Clear, simple, low-friction ask. Example: “Would you be open to a quick call to see if this fits?” Rule for CopyCat : Don’t write essays, humans are busy. Every line must create curiosity or desire. End with a simple question so they reply. Formula: Hook→Context→Value→Proof→Call to Action. #End of System Prompt
`;

// -------------------
// Conversation Memory (In-Memory Only)
// -------------------
const conversations: Record<string, { role: "user" | "assistant"; content: string }[]> = {};
console.log('💭 Conversation memory initialized (in-memory only, resets on server restart)');

// -------------------
// AI Provider Functions
// -------------------
async function callGeminiAPI(conversationHistory: { role: "user" | "assistant"; content: string }[], userInfo?: any): Promise<string> {
  const apiKey = getNextGeminiKey();
  const geminiAI = new GoogleGenerativeAI(apiKey);
  
  // Create personalized system prompt
  let personalizedSystem = system;
  if (userInfo?.displayName && userInfo.displayName.trim()) {
    personalizedSystem += `\n\nIMPORTANT USER INFO:
- User's name: ${userInfo.displayName} (always call them by this name when greeting or addressing them!)
- Username: ${userInfo.username || 'not available'} (for when they ask "what's my username?")
- User ID: ${userInfo.id}${userInfo.email ? `\n- Email: ${userInfo.email} (available for email composition)` : ''}

When greeting the user or starting a conversation, address them by their name: "Hey ${userInfo.displayName}!" or "Hi ${userInfo.displayName}!" Use their name naturally in conversation.`;
  }
  
  // Add cross-session memory context
  if (userInfo?.id) {
    const memoryContext = AssistantMemoryService.generateMemoryContext(userInfo.id);
    if (memoryContext) {
      personalizedSystem += memoryContext;
    }
  }
  
  const model = geminiAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: personalizedSystem
  });

  const result = await model.generateContent({
    contents: conversationHistory.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  });

  return result.response.text();
}

async function callOpenRouterAPI(conversationHistory: { role: "user" | "assistant"; content: string }[], model?: string, userInfo?: any): Promise<string> {
  const selectedModel = model || getNextOpenRouterModel();
  
  // Create personalized system prompt
  let personalizedSystem = system;
  if (userInfo?.displayName && userInfo.displayName.trim()) {
    personalizedSystem += `\n\nIMPORTANT USER INFO:
- User's name: ${userInfo.displayName} (always call them by this name when greeting or addressing them!)
- Username: ${userInfo.username || 'not available'} (for when they ask "what's my username?")
- User ID: ${userInfo.id}${userInfo.email ? `\n- Email: ${userInfo.email} (available for email composition)` : ''}

When greeting the user or starting a conversation, address them by their name: "Hey ${userInfo.displayName}!" or "Hi ${userInfo.displayName}!" Use their name naturally in conversation.`;
  }
  
  // Add cross-session memory context
  if (userInfo?.id) {
    const memoryContext = AssistantMemoryService.generateMemoryContext(userInfo.id);
    if (memoryContext) {
      personalizedSystem += memoryContext;
    }
  }
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": "CopyCat.ai"
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: "system", content: personalizedSystem },
        ...conversationHistory.map(m => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated";
}

async function callGitHubModelsAPI(conversationHistory: { role: "user" | "assistant"; content: string }[], modelConfig?: { name: string; token: string }): Promise<string> {
  const selectedModel = modelConfig || getNextGitHubModel();
  
  const response = await fetch(`https://models.inference.ai.azure.com/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${selectedModel.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: selectedModel.name,
      messages: [
        { role: "system", content: system },
        ...conversationHistory.map(m => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`GitHub Models API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated";
}

async function generateWithFailover(conversationHistory: { role: "user" | "assistant"; content: string }[], userInfo?: any): Promise<{ response: string; provider: string; model?: string }> {
  const now = Date.now();
  
  // Always try Gemini first if available or quota should have reset
  if (!isProviderOnCooldown("gemini") || shouldRetryProvider("gemini")) {
    const maxGeminiAttempts = Math.min(2, GEMINI_API_KEYS.length);
    for (let i = 0; i < maxGeminiAttempts; i++) {
      try {
        const currentKey = GEMINI_API_KEYS[currentGeminiKeyIndex];
        console.log(`🔷 Trying Gemini API with key ${currentGeminiKeyIndex + 1}/${GEMINI_API_KEYS.length}...`);
        const response = await callGeminiAPI(conversationHistory, userInfo);
        console.log(`✅ Gemini API successful with key ${currentGeminiKeyIndex + 1}`);
        markProviderSuccess("gemini");
        return { response, provider: "gemini", model: `gemini-1.5-flash-key${currentGeminiKeyIndex + 1}` };
      } catch (error: any) {
        console.log(`❌ Gemini key ${currentGeminiKeyIndex + 1} failed:`, error.message);
        if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("RESOURCE_EXHAUSTED")) {
          // Try next key
          getNextGeminiKey();
          if (i === maxGeminiAttempts - 1) {
            setCooldown("gemini", 15); // Longer cooldown for quota issues
          }
          continue;
        }
        // For other errors, don't continue trying
        setCooldown("gemini", 5);
        break;
      }
    }
  }

  // Try OpenRouter models (secondary) - check if available or should retry
  if (!isProviderOnCooldown("openrouter") || shouldRetryProvider("openrouter")) {
    const maxOpenRouterAttempts = Math.min(4, OPENROUTER_FREE_MODELS.length);
    for (let i = 0; i < maxOpenRouterAttempts; i++) {
      try {
        const model = getNextOpenRouterModel();
        console.log(`🟠 Trying OpenRouter with model: ${model}`);
        const response = await callOpenRouterAPI(conversationHistory, model, userInfo);
        console.log(`✅ OpenRouter successful with ${model}`);
        markProviderSuccess("openrouter");
        return { response, provider: "openrouter", model };
      } catch (error: any) {
        console.log(`❌ OpenRouter model failed:`, error.message);
        if (error.message.includes("429") || error.message.includes("403") || error.message.includes("quota")) {
          if (i === maxOpenRouterAttempts - 1) {
            setCooldown("openrouter", 10);
          }
          continue;
        }
        // For other errors, don't continue trying
        setCooldown("openrouter", 3);
        break;
      }
    }
  }

  // If all providers are on cooldown but quotas might have reset, give it one more try
  const allOnCooldown = isProviderOnCooldown("gemini") && isProviderOnCooldown("openrouter");
  if (allOnCooldown) {
    console.log(`🔄 All providers on cooldown, checking for quota resets...`);
    
    // Try providers that might have quota reset
    if (shouldRetryProvider("gemini")) {
      console.log(`🔄 Forcing Gemini retry - quota may have reset`);
      try {
        const response = await callGeminiAPI(conversationHistory, userInfo);
        markProviderSuccess("gemini");
        return { response, provider: "gemini", model: "gemini-1.5-flash-recovered" };
      } catch (error: any) {
        console.log(`❌ Gemini retry failed:`, error.message);
      }
    }
    
    if (shouldRetryProvider("openrouter")) {
      console.log(`🔄 Forcing OpenRouter retry - quota may have reset`);
      try {
        const model = getNextOpenRouterModel();
        const response = await callOpenRouterAPI(conversationHistory, model, userInfo);
        markProviderSuccess("openrouter");
        return { response, provider: "openrouter", model: `${model}-recovered` };
      } catch (error: any) {
        console.log(`❌ OpenRouter retry failed:`, error.message);
      }
    }
  }

  throw new Error("All AI providers are currently unavailable. Quotas may be exhausted - try again in a few minutes.");
}

// -------------------
// POST Route
// -------------------
export async function POST(req: Request) {
  try {
    const { userInput, sessionId } = await req.json();

    if (!userInput || !sessionId) {
      return NextResponse.json({ error: "Missing input or sessionId" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    // Get user info for personalization
    let userInfo = null;
    try {
      let userId = req.headers.get("x-whop-user-id");
      
      // For localhost development, use a default user ID
      const isLocalhost = req.headers.get('host')?.includes('localhost') || 
                         req.headers.get('host')?.includes('127.0.0.1');
      
      if (!userId && isLocalhost) {
        userId = 'localhost-dev-user';
        console.log('🔧 Using localhost development mode for AI personalization');
      }
      
      if (userId) {
        // Try to get enhanced profile data first
        try {
          const profileResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/profile`, {
            headers: {
              'x-whop-user-id': userId,
              'host': req.headers.get('host') || 'localhost:3000'
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.success && profileData.profile) {
              userInfo = {
                id: profileData.profile.id,
                username: profileData.profile.username,
                displayName: profileData.profile.displayName,
                email: profileData.profile.email || null
              };
              console.log('🔍 Enhanced user profile retrieved for AI:', {
                id: userInfo.id,
                displayName: userInfo.displayName || '[EMPTY]',
                email: userInfo.email ? '[SET]' : '[EMPTY]',
                isLocalhost
              });
            }
          } else {
            console.log('❌ Profile API failed with status:', profileResponse.status);
          }
        } catch (profileError) {
          console.log('⚠️ Profile API not available, falling back to basic user data:', profileError);
        }
        
        // Fallback to basic Whop user data if profile API fails (but not for localhost)
        if (!userInfo && !isLocalhost) {
          try {
            const whopSdk = getWhopSdk();
            if (whopSdk) {
              const user = await whopSdk.users.getUser({ userId });
              userInfo = {
                id: user.id,
                username: user.username,
                displayName: user.name
              };
              console.log('🔍 Basic Whop user info retrieved:', userInfo);
            }
          } catch (whopError) {
            console.log('❌ Whop SDK failed:', whopError);
          }
        }
        
        // For localhost, create a basic user if profile API failed
        if (!userInfo && isLocalhost) {
          userInfo = {
            id: 'localhost-dev-user',
            username: 'dev-user',
            displayName: 'Development User'
          };
          console.log('🔧 Using fallback localhost user info:', userInfo);
        }
      } else {
        console.log('ℹ️ No user ID found in headers');
      }
    } catch (error) {
      console.log("⚠️ Could not get user info, continuing without personalization:", error);
    }

    // Check subscription tier and usage limits
    if (userInfo?.id) {
      try {
        const canSend = SubscriptionTierService.canSendMessage(userInfo.id);
        if (!canSend.allowed) {
          console.log(`🚫 Usage limit reached for user ${userInfo.id}: ${canSend.reason}`);
          return NextResponse.json({ 
            error: canSend.reason,
            type: 'USAGE_LIMIT',
            limit: canSend.limit,
            current: canSend.current
          }, { status: 429 });
        }
        
        // Increment usage count
        SubscriptionTierService.incrementMessageCount(userInfo.id);
        console.log(`📈 Usage incremented for user ${userInfo.id}`);
      } catch (error) {
        console.log('⚠️ Failed to check subscription limits:', error);
        // Continue without blocking - graceful degradation
      }
    }

    // Initialize conversation memory for this session
    if (!conversations[sessionId]) {
      conversations[sessionId] = [];
      console.log(`🆕 New conversation started for session: ${sessionId}`);
    } else {
      console.log(`🔄 Continuing conversation for session: ${sessionId} with ${conversations[sessionId].length} existing messages`);
    }

    // Push user message
    conversations[sessionId].push({ role: "user", content: userInput });
    
    console.log(`📝 User message added. Total messages for ${sessionId}:`, conversations[sessionId].length);
    console.log(`📄 Latest user message:`, userInput.substring(0, 100) + (userInput.length > 100 ? "..." : ""));
    console.log(`💭 Full conversation history:`, conversations[sessionId].map((m, i) => `${i + 1}. ${m.role}: ${m.content.substring(0, 50)}...`));

    // Generate AI response with failover
    const { response: reply, provider, model } = await generateWithFailover(conversations[sessionId], userInfo);
    
    console.log(`🎯 Response generated by: ${provider}${model ? ` (${model})` : ""}`);

    // Save assistant reply to memory
    conversations[sessionId].push({ role: "assistant", content: reply });
    
    console.log(`✅ AI response saved. Total messages for ${sessionId}:`, conversations[sessionId].length);
    console.log(`🤖 AI response:`, reply.substring(0, 100) + (reply.length > 100 ? "..." : ""));
    console.log(`📊 Final conversation state:`, conversations[sessionId].map((m, i) => `${i + 1}. ${m.role}: ${m.content.substring(30)}...`));
    console.log(`🔄 Model rotation status - OpenRouter: ${currentOpenRouterModelIndex}/${OPENROUTER_FREE_MODELS.length}, Gemini: ${currentGeminiKeyIndex}/${GEMINI_API_KEYS.length}`);

    // Learn from this conversation for cross-session memory
    if (userInfo?.id) {
      try {
        // Extract insights from the current conversation
        AssistantMemoryService.extractInsights(userInfo.id, conversations[sessionId], sessionId);
        
        // Update user memory with profile data if available
        if (userInfo.displayName || userInfo.email) {
          AssistantMemoryService.learnFromProfile(userInfo.id, {
            displayName: userInfo.displayName,
            email: userInfo.email
          });
        }
        
        // Increment session count for new sessions
        if (conversations[sessionId].length <= 2) { // First exchange in this session
          AssistantMemoryService.incrementSessionCount(userInfo.id);
        }
        
        console.log(`🧠 Memory updated for user ${userInfo.id}`);
      } catch (error) {
        console.log('⚠️ Failed to update memory:', error);
      }
    }

    return NextResponse.json({ output: reply });
  } catch (error: any) {
    console.error("❌ Error in /api/generate:", error);
    
    // Provide more helpful error messages
    let errorMessage = "Something went wrong";
    if (error.message.includes("All AI providers are currently unavailable")) {
      errorMessage = "All AI services are temporarily busy. Please try again in a few minutes.";
    } else if (error.message.includes("quota") || error.message.includes("429")) {
      errorMessage = "API quota exceeded. Trying alternative providers...";
    } else {
      errorMessage = error.message || "Something went wrong";
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
