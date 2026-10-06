// ============================================================================
// SECURE AI API INTEGRATION SERVICE
// Medical-Safe AI Responses with Backend Proxy Architecture
// API Key NEVER exposed to frontend
// ============================================================================

const axios = require('axios');

// ============================================================================
// MEDICAL-SAFE SYSTEM PROMPT
// ============================================================================

const EMERGENCY_NUMBER = process.env.EMERGENCY_NUMBER || '911';

const SYSTEM_PROMPT = `You are a compassionate AI healthcare assistant for a Clinical Platform. Your role is to provide SAFE first aid guidance and general health information to patients.

CRITICAL RULES YOU MUST FOLLOW:
1. NEVER diagnose diseases or medical conditions
2. NEVER prescribe medications or treatments
3. NEVER provide medical certainty - use advisory language only
4. ALWAYS recommend visiting a qualified doctor or hospital
5. Provide calm, reassuring, and clear first aid guidance
6. For emergencies, emphasize calling ${EMERGENCY_NUMBER} or emergency services
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
- Serious symptoms → "This requires immediate medical attention. Please visit a doctor or call ${EMERGENCY_NUMBER}"

Remember: You are a helpful assistant, not a replacement for medical professionals. Patient safety is the top priority.`;

// ============================================================================
// AI API CONFIGURATION
// ============================================================================

const MAX_MESSAGE_LENGTH = 1000;
const DISCLAIMER = '⚠️ This is only first aid guidance and not a medical diagnosis. Please visit a qualified doctor or nearest hospital immediately.';

// Read lazily so configuration is picked up after dotenv has loaded.
const getConfig = () => ({
  apiUrl: process.env.AI_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
  apiKey: process.env.AI_API_KEY || process.env.GROQ_API_KEY,
  model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
  maxTokens: 1000,
  temperature: 0.7,
  timeout: 30000
});

// ============================================================================
// EMERGENCY KEYWORDS DETECTION
// ============================================================================

const EMERGENCY_KEYWORDS = [
  'bleeding', 'deep cut', 'wound',
  'burn',
  'chest pain', 'heart attack', 'stroke',
  'unconscious', 'fainted', 'passed out',
  'choking', 'can\'t breathe', 'cannot breathe', 'difficulty breathing',
  'seizure', 'convulsion',
  'fracture', 'broken bone',
  'head injury', 'concussion',
  'allergic reaction', 'anaphylaxis',
  'poisoning', 'overdose',
  'suicide', 'kill myself',
  'severe pain', 'emergency'
];

const detectEmergency = (message) => {
  const lowerMessage = String(message).toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
};

// ============================================================================
// INPUT / RESPONSE SANITIZATION
// ============================================================================

const sanitizeInput = (message) => {
  if (typeof message !== 'string') {
    throw new Error('Invalid message format');
  }

  const sanitized = message.trim().replace(/<[^>]*>/g, '');

  if (sanitized.length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
  }

  return sanitized;
};

const sanitizeResponse = (response, isEmergency = false) => {
  let sanitized = response.trim();

  const hasDisclaimer = sanitized.includes('⚠️') ||
    sanitized.includes('visit a doctor') ||
    sanitized.includes('medical professional');

  if (!hasDisclaimer) {
    sanitized += `\n\n${DISCLAIMER}`;
  }

  if (isEmergency && !sanitized.includes(EMERGENCY_NUMBER)) {
    sanitized = `⚠️ IMPORTANT: If this is a medical emergency, call ${EMERGENCY_NUMBER} immediately.\n\n${sanitized}`;
  }

  return sanitized;
};

// ============================================================================
// AI API CALL
// ============================================================================

const callAI = async (message) => {
  const config = getConfig();

  if (!config.apiKey) {
    return { success: false, error: 'AI API key not configured' };
  }

  try {
    const response = await axios.post(
      config.apiUrl,
      {
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: config.timeout
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: 'Invalid AI API response format' };
    }

    return { success: true, message: content };
  } catch (error) {
    // Log only status/metadata: request bodies contain patient health information.
    const status = error.response?.status;
    console.error(`❌ AI API call failed${status ? ` (HTTP ${status})` : ''}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// FALLBACK RESPONSES
// ============================================================================

const FALLBACK_RESPONSES = {
  emergency: `⚠️ I'm currently unable to access AI assistance.

For medical emergencies:
• Call ${EMERGENCY_NUMBER} immediately
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
• For emergencies, call ${EMERGENCY_NUMBER} immediately

⚠️ For specific medical advice, please consult with a qualified healthcare provider.`
};

// ============================================================================
// MAIN AI SERVICE FUNCTION
// Always resolves with a safe reply; falls back to static guidance when the
// AI provider is unavailable so the chat never breaks for the patient.
// ============================================================================

const getAIResponse = async (message) => {
  const isEmergency = detectEmergency(message);

  let sanitizedMessage;
  try {
    sanitizedMessage = sanitizeInput(message);
  } catch (error) {
    return {
      reply: isEmergency ? FALLBACK_RESPONSES.emergency : FALLBACK_RESPONSES.general,
      isEmergency,
      aiUsed: false
    };
  }

  const aiResult = await callAI(sanitizedMessage);

  if (aiResult.success) {
    return {
      reply: sanitizeResponse(aiResult.message, isEmergency),
      isEmergency,
      aiUsed: true
    };
  }

  return {
    reply: isEmergency ? FALLBACK_RESPONSES.emergency : FALLBACK_RESPONSES.general,
    isEmergency,
    aiUsed: false
  };
};

module.exports = {
  getAIResponse,
  detectEmergency,
  sanitizeInput,
  sanitizeResponse,
  MAX_MESSAGE_LENGTH
};
