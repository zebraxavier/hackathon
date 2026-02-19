// ============================================================================
// CHATBOT INTELLIGENCE ENGINE
// Intent Detection, Classification, and Response Generation
// ============================================================================

const {
  EMERGENCY_KEYWORDS,
  FIRST_AID_RESPONSES,
  CLINIC_RESPONSES,
  GENERAL_RESPONSES,
  MEDICAL_DISCLAIMER
} = require('./medicalKnowledgeBase');

// ============================================================================
// INTENT CATEGORIES
// ============================================================================

const INTENT_CATEGORIES = {
  EMERGENCY: 'emergency',
  FIRST_AID: 'first_aid',
  CLINIC_INFO: 'clinic_info',
  GENERAL_HEALTH: 'general_health',
  GREETING: 'greeting',
  UNKNOWN: 'unknown'
};

// ============================================================================
// INTENT DETECTION
// ============================================================================

const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase().trim();

  // Check for emergency keywords (highest priority)
  const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );

  if (hasEmergencyKeyword) {
    return {
      category: INTENT_CATEGORIES.EMERGENCY,
      priority: 'high',
      urgency: true
    };
  }

  // Check for greeting
  if (GENERAL_RESPONSES.greeting.keywords.some(kw => lowerMessage.includes(kw))) {
    return {
      category: INTENT_CATEGORIES.GREETING,
      priority: 'low',
      urgency: false
    };
  }

  // Check for help request
  if (GENERAL_RESPONSES.help.keywords.some(kw => lowerMessage.includes(kw))) {
    return {
      category: INTENT_CATEGORIES.GENERAL_HEALTH,
      priority: 'low',
      urgency: false,
      subtype: 'help'
    };
  }

  // Check for thanks
  if (GENERAL_RESPONSES.thanks.keywords.some(kw => lowerMessage.includes(kw))) {
    return {
      category: INTENT_CATEGORIES.GENERAL_HEALTH,
      priority: 'low',
      urgency: false,
      subtype: 'thanks'
    };
  }

  // Check for clinic information
  for (const [key, value] of Object.entries(CLINIC_RESPONSES)) {
    if (value.keywords.some(kw => lowerMessage.includes(kw))) {
      return {
        category: INTENT_CATEGORIES.CLINIC_INFO,
        priority: 'medium',
        urgency: false,
        subtype: key
      };
    }
  }

  // Check for first aid topics
  for (const [key, value] of Object.entries(FIRST_AID_RESPONSES)) {
    if (value.keywords.some(kw => lowerMessage.includes(kw))) {
      return {
        category: INTENT_CATEGORIES.FIRST_AID,
        priority: 'high',
        urgency: true,
        subtype: key
      };
    }
  }

  // Unknown intent
  return {
    category: INTENT_CATEGORIES.UNKNOWN,
    priority: 'low',
    urgency: false
  };
};

// ============================================================================
// RESPONSE GENERATION
// ============================================================================

const generateResponse = (message, intent) => {
  const lowerMessage = message.toLowerCase().trim();

  // Handle greetings
  if (intent.category === INTENT_CATEGORIES.GREETING) {
    return GENERAL_RESPONSES.greeting.response;
  }

  // Handle help requests
  if (intent.subtype === 'help') {
    return GENERAL_RESPONSES.help.response;
  }

  // Handle thanks
  if (intent.subtype === 'thanks') {
    return GENERAL_RESPONSES.thanks.response;
  }

  // Handle clinic information
  if (intent.category === INTENT_CATEGORIES.CLINIC_INFO) {
    const clinicResponse = CLINIC_RESPONSES[intent.subtype];
    if (clinicResponse) {
      return clinicResponse.response;
    }
  }

  // Handle first aid and emergencies
  if (intent.category === INTENT_CATEGORIES.FIRST_AID || 
      intent.category === INTENT_CATEGORIES.EMERGENCY) {
    
    // Find the most relevant first aid response
    for (const [key, value] of Object.entries(FIRST_AID_RESPONSES)) {
      if (value.keywords.some(kw => lowerMessage.includes(kw))) {
        return value.response;
      }
    }
  }

  // Fallback response for unknown intents
  return generateFallbackResponse(lowerMessage);
};

// ============================================================================
// FALLBACK RESPONSE
// ============================================================================

const generateFallbackResponse = (message) => {
  // Try to provide helpful guidance even for unknown queries
  
  if (message.includes('pain') || message.includes('hurt') || message.includes('ache')) {
    return `I understand you're experiencing discomfort. While I can provide general first aid guidance, pain can have many causes that require professional evaluation.

**General Advice:**
• Rest the affected area
• Apply ice for acute injuries (first 48 hours)
• Take over-the-counter pain relief as directed
• Avoid activities that worsen the pain

**When to See a Doctor:**
• Severe or worsening pain
• Pain lasting more than a few days
• Pain accompanied by fever, swelling, or redness
• Pain after an injury or accident

${MEDICAL_DISCLAIMER}`;
  }

  if (message.includes('sick') || message.includes('ill') || message.includes('not feeling well')) {
    return `I'm sorry to hear you're not feeling well. While I can provide general guidance, it's important to consult with a healthcare professional for proper diagnosis and treatment.

**General Self-Care:**
• Get plenty of rest
• Stay hydrated
• Eat light, nutritious meals
• Monitor your symptoms
• Take your temperature if you feel feverish

**When to See a Doctor:**
• Symptoms persist or worsen
• High fever (over 101.5°F / 38.6°C)
• Difficulty breathing
• Severe pain
• Unusual or concerning symptoms

You can book an appointment through the Appointments section of your dashboard.

${MEDICAL_DISCLAIMER}`;
  }

  if (message.includes('medicine') || message.includes('medication') || message.includes('drug') || message.includes('prescription')) {
    return `For questions about medications and prescriptions, please consult with your doctor directly.

**Important Notes:**
• Never take medications not prescribed to you
• Follow dosage instructions carefully
• Inform your doctor of all medications you're taking
• Report any side effects to your healthcare provider

**To Discuss Medications:**
• Book an appointment with your doctor
• Call the clinic during business hours
• Check your current prescriptions in your medical records

${MEDICAL_DISCLAIMER}`;
  }

  // Generic fallback
  return `Thank you for your question. I'm here to help with:

**Emergency First Aid:**
• Bleeding, burns, fractures, choking, allergic reactions, and more

**Clinic Services:**
• Booking appointments
• Accessing medical reports
• Doctor availability
• General health guidance

**For Specific Medical Advice:**
I recommend consulting with your healthcare provider for personalized medical guidance. You can book an appointment through your dashboard.

Is there something specific I can help you with?

${MEDICAL_DISCLAIMER}`;
};

// ============================================================================
// SAFETY CHECKS
// ============================================================================

const performSafetyCheck = (response) => {
  // Ensure response doesn't contain diagnostic language
  const diagnosticTerms = [
    'you have', 'you are diagnosed', 'this is definitely',
    'you need to take', 'prescription', 'diagnosis'
  ];

  const lowerResponse = response.toLowerCase();
  const hasDiagnosticLanguage = diagnosticTerms.some(term => 
    lowerResponse.includes(term)
  );

  if (hasDiagnosticLanguage) {
    console.warn('⚠️ Response contains diagnostic language - review needed');
  }

  // Ensure medical disclaimer is present for medical advice
  if (!response.includes(MEDICAL_DISCLAIMER) && 
      (response.includes('first aid') || response.includes('emergency'))) {
    response += MEDICAL_DISCLAIMER;
  }

  return response;
};

// ============================================================================
// MAIN CHATBOT FUNCTION
// ============================================================================

const processMessage = (message) => {
  try {
    // Validate input
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return {
        success: false,
        error: 'Invalid message'
      };
    }

    // Detect intent
    const intent = detectIntent(message);

    // Generate response
    let response = generateResponse(message, intent);

    // Perform safety check
    response = performSafetyCheck(response);

    // Return structured response
    return {
      success: true,
      reply: response,
      intent: intent.category,
      priority: intent.priority,
      urgency: intent.urgency
    };

  } catch (error) {
    console.error('Chatbot processing error:', error);
    return {
      success: false,
      error: 'Failed to process message',
      reply: `I apologize, but I encountered an error processing your message. Please try again or contact our support team.

For medical emergencies, please call 911 immediately.`
    };
  }
};

module.exports = {
  processMessage,
  detectIntent,
  generateResponse,
  INTENT_CATEGORIES
};
