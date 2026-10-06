import { apiRequest } from './api';

export interface ChatMessage {
  _id?: string;
  message: string;
  reply: string;
  timestamp: string;
  isEmergency?: boolean;
}

export const sendMessage = async (message: string): Promise<ChatMessage> => {
  const response = await apiRequest('/chatbot/send', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  return {
    message: response.message,
    reply: response.reply,
    timestamp: response.timestamp,
    isEmergency: response.isEmergency,
  };
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  const response = await apiRequest('/chatbot/history');
  return response.chats || [];
};
