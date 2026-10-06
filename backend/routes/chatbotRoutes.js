const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { getAIResponse, MAX_MESSAGE_LENGTH } = require('../services/aiService');

// ============================================================================
// AI-POWERED MEDICAL CHATBOT WITH SECURE BACKEND PROXY
// API Key secured in backend - NEVER exposed to frontend
// Medical-safe responses with doctor recommendations
// ============================================================================

// POST /api/chatbot/send - Send message to AI chatbot
router.post('/send', protect, asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Message cannot be empty'
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`
    });
  }

  const aiResponse = await getAIResponse(message);

  // Save chat to database
  const chat = await Chat.create({
    userId: req.user._id,
    message: message.trim(),
    reply: aiResponse.reply
  });

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

}));

// GET /api/chatbot/history - Get chat history
router.get('/history', protect, asyncHandler(async (req, res) => {
  // Latest 100 messages, returned oldest-first for display.
  const chats = (await Chat.find({ userId: req.user._id })
    .sort({ timestamp: -1 })
    .limit(100)).reverse();

  res.status(200).json({
    success: true,
    count: chats.length,
    chats
  });
}));

module.exports = router;
