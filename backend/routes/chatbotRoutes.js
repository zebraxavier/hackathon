const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/authMiddleware');
const { getAIResponse } = require('../services/aiService');

// ============================================================================
// AI-POWERED MEDICAL CHATBOT WITH SECURE BACKEND PROXY
// API Key secured in backend - NEVER exposed to frontend
// Medical-safe responses with doctor recommendations
// ============================================================================

// POST /api/chatbot/send - Send message to AI chatbot
router.post('/send', protect, async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Get AI response through secure backend proxy
    const aiResponse = await getAIResponse(message, req.user._id);

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process message',
        reply: 'I apologize, but I encountered an error. Please try again or contact support. For medical emergencies, call 911 immediately.'
      });
    }

    // Save chat to database
    const chat = await Chat.create({
      userId: req.user._id,
      message: message.trim(),
      reply: aiResponse.reply
    });

    // Log emergency intents for monitoring
    if (aiResponse.isEmergency) {
      console.log(`⚠️ EMERGENCY INTENT DETECTED - User: ${req.user._id}`);
    }

    // Return response (maintaining existing format for frontend compatibility)
    res.status(200).json({
      success: true,
      message: chat.message,
      reply: chat.reply,
      timestamp: chat.timestamp,
      // Additional metadata (optional, frontend can ignore)
      isEmergency: aiResponse.isEmergency,
      aiPowered: aiResponse.aiUsed
    });

  } catch (error) {
    console.error('Chatbot send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      reply: 'I apologize, but I encountered an error. Please try again or contact support. For medical emergencies, call 911 immediately.'
    });
  }
});

// GET /api/chatbot/history - Get chat history
router.get('/history', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ timestamp: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
});

module.exports = router;
