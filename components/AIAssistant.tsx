

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { askAIAssistant } from '../services/geminiService';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string | null;
}

const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <p className="whitespace-pre-wrap">
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </p>
    );
};


const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
        if (initialMessage) {
          const userMessage: ChatMessage = { role: 'user', text: initialMessage };
          setMessages([userMessage]);
          setIsLoading(true);
          try {
            const { text, sources } = await askAIAssistant([], initialMessage);
            const modelMessage: ChatMessage = { role: 'model', text, sources };
            setMessages(prev => [...prev, modelMessage]);
          } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I couldn\'t get a response. Please check your connection or API key.' };
            setMessages(prev => [...prev, errorMessage]);
          } finally {
            setIsLoading(false);
          }
        } else {
          const welcomeMessage: ChatMessage = { role: 'model', text: "Hello! I'm your AI assistant. How can I help you with your diagnostic reasoning today?" };
          setMessages([welcomeMessage]);
        }
    };
    
    if (isOpen) {
        initializeChat();
    }
  // This effect should only run when the component becomes visible (isOpen) or when a new consultation is started (initialMessage changes).
  // As the component unmounts on close, this effectively runs on each open.
  }, [isOpen, initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await askAIAssistant(messages, input);
      const modelMessage: ChatMessage = { role: 'model', text, sources };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I couldn\'t get a response. Please check your connection or API key.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-stone-200 dark:bg-stone-800 rounded-lg shadow-2xl w-full max-w-lg h-[80vh] flex flex-col mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-stone-300 dark:border-stone-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">AI Assistant</h3>
          <button onClick={onClose} className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200'}`}>
                <FormattedMessage text={msg.text} />
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-stone-400 dark:border-stone-600">
                        <h5 className="text-xs font-bold mb-1">Sources:</h5>
                        <ul className="space-y-1">
                            {msg.sources.map((source, i) => (
                                <li key={i} className="text-xs">
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center gap-2 text-orange-700 dark:text-orange-400 hover:underline"
                                        title={source.title}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                        </svg>
                                        <span className="truncate">{source.title || source.uri}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-stone-500 dark:bg-stone-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-stone-500 dark:bg-stone-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-stone-500 dark:bg-stone-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-stone-300 dark:border-stone-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-stone-100 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2 px-4 text-stone-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || input.trim() === ''}
              className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;