import { apiRequest } from './api';

export interface ChatMessage {
  _id?: string;
  userId?: string;
  message: string;
  reply: string;
  timestamp: Date | string;
}

// Send message to chatbot
export const sendMessage = async (message: string): Promise<ChatMessage> => {
  try {
    const response = await apiRequest('/chatbot/send', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to send message');
    }
    
    return {
      message: response.message,
      reply: response.reply,
      timestamp: response.timestamp,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send message');
  }
};

// Get chat history
export const getChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const response = await apiRequest('/chatbot/history', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load chat history');
    }
    
    return response.chats || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load chat history');
  }
};

export default {
  sendMessage,
  getChatHistory,
};
