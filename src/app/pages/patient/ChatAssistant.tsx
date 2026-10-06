import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendMessage, getChatHistory } from '../../../services/chatbotService';

interface ChatAssistantProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
  isError?: boolean;
}

const WELCOME: Message = {
  id: 'welcome',
  type: 'bot',
  text: "Hello! I'm your AI healthcare assistant. I can help with first aid guidance and general health questions. How can I help you today?",
  timestamp: new Date().toISOString(),
};

const QUICK_QUESTIONS = [
  'How do I treat a minor burn?',
  'What should I do for a fever?',
  'How do I prepare for a blood test?',
];

const MAX_LENGTH = 1000;

const formatTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

const ChatAssistant = ({ open, onClose }: ChatAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || historyLoaded) return;
    getChatHistory()
      .then((history) => {
        if (history.length === 0) return;
        setMessages(history.flatMap((chat) => [
          { id: `user-${chat._id}`, type: 'user' as const, text: chat.message, timestamp: chat.timestamp },
          { id: `bot-${chat._id}`, type: 'bot' as const, text: chat.reply, timestamp: chat.timestamp },
        ]));
      })
      .catch(() => {
        // Keep the welcome message; history is non-essential.
      })
      .finally(() => setHistoryLoaded(true));
  }, [open, historyLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendMessage(trimmed);
      setMessages((prev) => [...prev, {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: response.reply,
        timestamp: response.timestamp,
      }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        type: 'bot',
        text: `${error.message || 'Failed to send message.'} If this is a medical emergency, call your local emergency number immediately.`,
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-4 shadow-lg d-flex flex-column overflow-hidden"
            style={{ width: '92%', maxWidth: '600px', height: '80vh', maxHeight: '700px' }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="AI Health Assistant"
          >
            <div
              className="p-3 d-flex justify-content-between align-items-center"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-white p-2">
                  <Bot size={24} style={{ color: '#667eea' }} />
                </div>
                <div className="text-white">
                  <h6 className="mb-0">AI Health Assistant</h6>
                  <small className="opacity-75">First aid guidance — not a diagnosis</small>
                </div>
              </div>
              <button className="btn btn-link text-white p-0" onClick={onClose} aria-label="Close chat">
                <X size={22} />
              </button>
            </div>

            <div className="p-3 overflow-auto flex-grow-1" aria-live="polite">
              {messages.map((msg) => (
                <div key={msg.id} className={`mb-3 d-flex ${msg.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div style={{ maxWidth: '80%' }}>
                    <div
                      className={`p-3 rounded-3 ${
                        msg.type === 'user' ? 'bg-primary text-white' : msg.isError ? 'bg-danger-subtle' : 'bg-light'
                      }`}
                    >
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</p>
                    </div>
                    <small className="text-muted d-block mt-1">{formatTime(msg.timestamp)}</small>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="mb-3">
                  <div className="p-3 rounded-3 bg-light d-inline-flex gap-1" aria-label="Assistant is typing">
                    <span className="spinner-grow spinner-grow-sm" />
                    <span className="spinner-grow spinner-grow-sm" />
                    <span className="spinner-grow spinner-grow-sm" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="px-3 pb-2 d-flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button key={q} className="btn btn-sm btn-outline-primary" onClick={() => send(q)} disabled={isTyping}>
                  {q}
                </button>
              ))}
            </div>

            <form
              className="p-3 border-top d-flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={input}
                maxLength={MAX_LENGTH}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Message"
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={!input.trim() || isTyping} aria-label="Send">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatAssistant;
