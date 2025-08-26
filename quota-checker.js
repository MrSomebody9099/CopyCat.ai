// Quota Checker for CopyCat AI APIs
// Run with: node quota-checker.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Keys and Models from your configuration
const GEMINI_API_KEYS = [
  "AIzaSyBBkLxZe1OC4M7l7lT91AQYtouq388is4A", // Current in use
  "AIzaSyCTh6o0FOCsGVihunykAcM9Zsa1YKZMedk", // API 1
  "AIzaSyDYBjJYb9_c63lglYOQcAKS9O14VN_o4jA"  // API 3
];

const OPENROUTER_KEY = "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";

const OPENROUTER_FREE_MODELS = [
  // Test each unique working model once
  "mistralai/mistral-7b-instruct:free",
  "deepseek/deepseek-r1-0528-qwen3-8b:free",
  "deepseek/deepseek-chat-v3-0324:free", 
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "deepseek/deepseek-r1:free",
  "openrouter/auto",
  "meta-llama/llama-3.2-3b-instruct:free"
];

// GitHub Models - DISABLED
// const GITHUB_MODELS = [...]; // API no longer available

async function checkGeminiQuota(apiKey, index) {
  try {
    console.log(`🔵 Testing Gemini API Key ${index + 1}...`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a test assistant."
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Test message - respond with 'OK'" }] }]
    });

    const response = result.response.text();
    console.log(`✅ Gemini Key ${index + 1}: WORKING - Response: ${response.substring(0, 50)}...`);
    return { status: 'working', response: response.substring(0, 100) };
  } catch (error) {
    console.log(`❌ Gemini Key ${index + 1}: ERROR - ${error.message}`);
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      return { status: 'quota_exceeded', error: error.message };
    }
    return { status: 'error', error: error.message };
  }
}

async function checkOpenRouterQuota(model) {
  try {
    console.log(`🟡 Testing OpenRouter model: ${model}...`);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "CopyCat.ai-QuotaCheck"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: "Test message - respond with 'OK'" }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ OpenRouter ${model}: ERROR ${response.status} - ${errorText}`);
      if (response.status === 429 || response.status === 403) {
        return { status: 'quota_exceeded', error: `${response.status}: ${errorText}` };
      }
      return { status: 'error', error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "No response";
    console.log(`✅ OpenRouter ${model}: WORKING - Response: ${reply}`);
    return { status: 'working', response: reply };
  } catch (error) {
    console.log(`❌ OpenRouter ${model}: ERROR - ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

async function checkGitHubQuota(modelConfig) {
  try {
    console.log(`🟣 Testing GitHub Models: ${modelConfig.name}...`);
    const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${modelConfig.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelConfig.name,
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: "Test message - respond with 'OK'" }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ GitHub ${modelConfig.name}: ERROR ${response.status} - ${errorText}`);
      if (response.status === 429 || response.status === 403) {
        return { status: 'quota_exceeded', error: `${response.status}: ${errorText}` };
      }
      return { status: 'error', error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "No response";
    console.log(`✅ GitHub ${modelConfig.name}: WORKING - Response: ${reply}`);
    return { status: 'working', response: reply };
  } catch (error) {
    console.log(`❌ GitHub ${modelConfig.name}: ERROR - ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

async function checkAllQuotas() {
  console.log('🔍 API Quota Status Check Started...\n');
  
  const results = {
    gemini: [],
    openrouter: []
  };

  // Check Gemini APIs
  console.log('==================================================');
  console.log('🔵 GEMINI API STATUS');
  console.log('==================================================');
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const result = await checkGeminiQuota(GEMINI_API_KEYS[i], i);
    results.gemini.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }

  // Check OpenRouter APIs (test a few models)
  console.log('\n==================================================');
  console.log('🟡 OPENROUTER API STATUS');
  console.log('==================================================');
  for (const model of OPENROUTER_FREE_MODELS) { // Test all models
    const result = await checkOpenRouterQuota(model);
    results.openrouter.push({ model, ...result });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between requests
  }

  // Summary
  console.log('\n==================================================');
  console.log('📊 QUOTA STATUS SUMMARY');
  console.log('==================================================');
  
  const geminiWorking = results.gemini.filter(r => r.status === 'working').length;
  const openrouterWorking = results.openrouter.filter(r => r.status === 'working').length;
  
  console.log(`🔵 Gemini: ${geminiWorking}/${results.gemini.length} keys working`);
  console.log(`🟡 OpenRouter: ${openrouterWorking}/${results.openrouter.length} models working`);
  console.log(`🟣 GitHub: DISABLED (API no longer available)`);
  
  const totalWorking = geminiWorking + openrouterWorking;
  const totalTested = results.gemini.length + results.openrouter.length;
  
  console.log(`\n🎯 Overall Status: ${totalWorking}/${totalTested} APIs working`);
  
  if (totalWorking === 0) {
    console.log('🚨 WARNING: All APIs appear to be down or quota exceeded!');
  } else if (totalWorking < totalTested * 0.5) {
    console.log('⚠️  CAUTION: More than half of APIs are down or quota exceeded');
  } else {
    console.log('✅ GOOD: Most APIs are working normally');
  }
}

// Run the checker
checkAllQuotas().catch(console.error);