// ============================================================================
// SECURE AI API INTEGRATION SERVICE
// Medical-Safe AI Responses with Backend Proxy Architecture
// API Key NEVER exposed to frontend
// ============================================================================

const axios = require('axios');

// ============================================================================
// MEDICAL-SAFE SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `You are a compassionate AI healthcare assistant for a Clinical Platform. Your role is to provide SAFE first aid guidance and general health information to patients.

CRITICAL RULES YOU MUST FOLLOW:
1. NEVER diagnose diseases or medical conditions
2. NEVER prescribe medications or treatments
3. NEVER provide medical certainty - use advisory language only
4. ALWAYS recommend visiting a qualified doctor or hospital
5. Provide calm, reassuring, and clear first aid guidance
6. For emergencies, emphasize calling 911 or emergency services
7. Keep responses concise, structured, and easy to understand

RESPONSE STRUCTURE:
- Start with calm reassurance
- Provide step-by-step first aid guidance (if applicable)
- List warning signs to watch for
- ALWAYS end with: "⚠️ This is only first aid guidance and not a medical diagnosis. Please visit a qualified doctor or nearest hospital immediately."

TOPICS YOU CAN HELP WITH:
- First aid for emergencies (bleeding, burns, choking, fractures, etc.)
- General health guidance (fever, minor injuries, etc.)
- Clinic information (appointments, reports, doctor availability)
- Wellness and preventive care advice

TOPICS YOU MUST REDIRECT:
- Diagnosis requests → "Please consult a doctor for proper diagnosis"
- Prescription requests → "Only a licensed doctor can prescribe medications"
- Serious symptoms → "This requires immediate medical attention. Please visit a doctor or call 911"

Remember: You are a helpful assistant, not a replacement for medical professionals. Patient safety is the top priority.`;

// ============================================================================
// AI API CONFIGURATION
// ============================================================================

const AI_CONFIG = {
  apiUrl: process.env.AI_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
  maxTokens: 1000,
  temperature: 0.7,
  timeout: 30000 // 30 seconds
};

// ============================================================================
// EMERGENCY KEYWORDS DETECTION
// ============================================================================

const EMERGENCY_KEYWORDS = [
  'bleeding', 'blood', 'cut', 'wound',
  'burn', 'burning', 'fire',
  'chest pain', 'heart attack', 'heart',
  'unconscious', 'fainted', 'passed out',
  'choking', 'can\'t breathe', 'difficulty breathing',
  'seizure', 'convulsion',
  'fracture', 'broken bone',
  'head injury', 'concussion',
  'allergic reaction', 'anaphylaxis',
  'poisoning', 'overdose',
  'severe pain', 'emergency'
];

const detectEmergency = (message) => {
  const lowerMessage = message.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

const sanitizeInput = (message) => {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message format');
  }

  // Trim whitespace
  let sanitized = message.trim();

  // Check length
  if (sanitized.length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (sanitized.length > 1000) {
    throw new Error('Message too long (max 1000 characters)');
  }

  // Remove potential injection attempts
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');

  return sanitized;
};

// ============================================================================
// RESPONSE SANITIZATION
// ============================================================================

const sanitizeResponse = (response, isEmergency = false) => {
  let sanitized = response.trim();

  // Ensure medical disclaimer is present
  const hasDisclaimer = sanitized.includes('⚠️') || 
                        sanitized.includes('visit a doctor') ||
                        sanitized.includes('medical professional');

  if (!hasDisclaimer) {
    sanitized += '\n\n⚠️ This is only first aid guidance and not a medical diagnosis. Please visit a qualified doctor or nearest hospital immediately.';
  }

  // For emergencies, emphasize urgency
  if (isEmergency && !sanitized.includes('911') && !sanitized.includes('emergency')) {
    sanitized = '⚠️ IMPORTANT: If this is a medical emergency, call 911 immediately.\n\n' + sanitized;
  }

  return sanitized;
};

// ============================================================================
// AI API CALL
// ============================================================================

const callAI = async (message, conversationHistory = []) => {
  try {
    // Validate API configuration
    if (!AI_CONFIG.apiKey) {
      throw new Error('AI API key not configured');
    }

    // Prepare messages for AI
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Make API request
    const response = await axios.post(
      AI_CONFIG.apiUrl,
      {
        model: AI_CONFIG.model,
        messages: messages,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: AI_CONFIG.timeout
      }
    );

    // Extract AI response
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const aiMessage = response.data.choices[0].message.content;
      
      // Log usage for monitoring
      console.log('✅ AI API call successful');
      console.log(`   Tokens used: ${response.data.usage?.total_tokens || 'N/A'}`);
      
      return {
        success: true,
        message: aiMessage,
        usage: response.data.usage
      };
    } else {
      throw new Error('Invalid AI API response format');
    }

  } catch (error) {
    console.error('❌ AI API call failed:', error.message);
    
    // Log detailed error for debugging
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }

    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================================================
// FALLBACK RESPONSES
// ============================================================================

const FALLBACK_RESPONSES = {
  emergency: `⚠️ I'm currently unable to access AI assistance. 

For medical emergencies:
• Call 911 immediately
• Or visit the nearest emergency room

For urgent medical concerns:
• Contact your doctor
• Visit an urgent care clinic
• Use our appointment booking system

Your safety is our priority. Please seek immediate medical help if this is an emergency.`,

  general: `I apologize, but I'm currently unable to access AI assistance to provide a detailed response.

For medical questions:
• Book an appointment with your doctor through our Appointments section
• Call our clinic during business hours
• For emergencies, call 911 immediately

How else can I help you today?

⚠️ For specific medical advice, please consult with a qualified healthcare provider.`
};

// ============================================================================
// MAIN AI SERVICE FUNCTION
// ============================================================================

const getAIResponse = async (message, userId = null) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🤖 AI SERVICE - Processing Message');
    console.log('='.repeat(70));
    console.log(`   User ID: ${userId || 'Anonymous'}`);
    console.log(`   Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

    // Step 1: Sanitize input
    const sanitizedMessage = sanitizeInput(message);
    console.log('✅ Input sanitized');

    // Step 2: Detect emergency
    const isEmergency = detectEmergency(sanitizedMessage);
    if (isEmergency) {
      console.log('⚠️  EMERGENCY DETECTED');
    }

    // Step 3: Call AI API
    console.log('📡 Calling AI API...');
    const aiResult = await callAI(sanitizedMessage);

    // Step 4: Handle AI response or fallback
    let finalResponse;

    if (aiResult.success) {
      // Sanitize AI response
      finalResponse = sanitizeResponse(aiResult.message, isEmergency);
      console.log('✅ AI response received and sanitized');
    } else {
      // Use fallback response
      finalResponse = isEmergency ? FALLBACK_RESPONSES.emergency : FALLBACK_RESPONSES.general;
      console.log('⚠️  Using fallback response');
    }

    console.log('='.repeat(70) + '\n');

    return {
      success: true,
      reply: finalResponse,
      isEmergency: isEmergency,
      aiUsed: aiResult.success,
      usage: aiResult.usage
    };

  } catch (error) {
    console.error('❌ AI Service Error:', error.message);
    
    // Return safe fallback
    const isEmergency = detectEmergency(message);
    return {
      success: true, // Still return success to not break frontend
      reply: isEmergency ? FALLBACK_RESPONSES.emergency : FALLBACK_RESPONSES.general,
      isEmergency: isEmergency,
      aiUsed: false,
      error: error.message
    };
  }
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

const checkAIHealth = async () => {
  try {
    if (!AI_CONFIG.apiKey) {
      return {
        status: 'not_configured',
        message: 'AI API key not configured'
      };
    }

    // Test with a simple message
    const result = await callAI('Hello');
    
    return {
      status: result.success ? 'healthy' : 'unhealthy',
      message: result.success ? 'AI API is responding' : 'AI API is not responding',
      details: result
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  getAIResponse,
  checkAIHealth,
  detectEmergency,
  sanitizeInput,
  sanitizeResponse
};
