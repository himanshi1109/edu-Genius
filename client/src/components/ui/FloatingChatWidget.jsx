import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, MessageSquare } from 'lucide-react';
import api from '@/services/api';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isAiTyping) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiTyping(true);

    try {
      const response = await api.post('/ai/landing-chat', {
        prompt: userMsg,
      });
      
      setChatHistory(prev => [...prev, { role: 'model', text: response.data.data.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Oops! I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[350px] h-[500px] glass-card shadow-2xl flex flex-col overflow-hidden border border-[var(--border)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5" />
                <span className="font-heading font-bold text-sm">EduGenius AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-primary)]/40">
              {chatHistory.length === 0 ? (
                <div className="text-center mt-10">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-3 border border-[var(--accent-blue)]/20">
                    <Bot className="w-6 h-6 text-[var(--accent-blue)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Hi! I'm your EduGenius guide.</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Ask me about the app or for course recommendations!</p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-xl max-w-[85%] text-xs shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[var(--accent-blue)] text-white rounded-tr-sm' 
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-sm border border-[var(--border)]'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-tl-sm text-xs shadow-sm">
                    <div className="flex gap-1 py-1">
                      <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-primary)] relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Ask a question..."
                className="w-full input-glass text-xs py-3 pl-4 pr-12 focus:bg-[var(--bg-secondary)]/80 transition-colors"
                disabled={isAiTyping}
              />
              <button 
                onClick={handleChatSubmit}
                disabled={isAiTyping || !chatInput.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-xl shadow-[var(--accent-blue)]/30 flex items-center justify-center relative z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default FloatingChatWidget;
