'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface ChatWidgetProps {
  botId: string;
  botName?: string;
}

const ChatMessage = ({ message, isStreaming }: { 
  message: { role: string; content: string };
  isStreaming?: boolean;
}) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`w-full py-3 flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[70%] flex items-start px-4 py-3 rounded-lg
          ${isAssistant ? '' : 'bg-black text-white'}
          ${isStreaming ? 'animate-pulse' : ''}`}
      >
        <p>{message.content}</p>
      </div>
    </div>
  );
};

const TypingIndicator = ({ botName = 'Bot' }: { botName?: string }) => (
  <div className="flex items-center mt-2 text-gray-500 text-sm">
    <span className="italic">{botName} typing</span>
    <span className="ml-1">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="inline-block animate-[typing-indicator_1.4s_infinite_ease-in-out]"
          style={{ 
            animationDelay: `${dot * 0.2}s`,
            marginLeft: '2px'
          }}
        >
          .
        </span>
      ))}
    </span>
  </div>
);

export default function ChatWidget({ botId, botName = 'Assistant' }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: `Hi! I'm ${botName}. How can I help you?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setIsStreaming(true);
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch(`/api/chat?botId=${botId}&message=${encodeURIComponent(userMessage)}&widget=true`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(5));
            if (data.content === '[DONE]') {
              setIsStreaming(false);
            } else if (data.content) {
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  const currentWords = lastMessage.content?.split(' ') || [];
                  const newWord = data.content.trim();
                  if (!currentWords.length || currentWords[currentWords.length - 1] !== newWord) {
                    lastMessage.content = (lastMessage.content ? lastMessage.content + ' ' : '') + newWord;
                  }
                }
                return newMessages;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-stretch w-full">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message} 
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))}
          {isLoading && !isStreaming && (
            <div className="flex justify-start">
              <TypingIndicator botName={botName} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 text-lg rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            disabled={isLoading || isStreaming}
          />
          <button
            type="submit"
            className="text-black border-2 border-black px-4 py-2 text-lg rounded-full disabled:opacity-50 hover:bg-black hover:text-white transition-colors"
            disabled={isLoading || isStreaming}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
