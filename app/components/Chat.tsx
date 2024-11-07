'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Add this interface
interface ChatProps {
  botId: string;
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

const TypingIndicator = () => (
  <div className="flex items-center mt-2">
    <span className="text-xl text-gray-500">•</span>
    {[0, 1].map((index) => (
      <span
        key={index}
        className="text-xl text-gray-500 ml-1 animate-[typing-indicator_1.4s_infinite_ease-in-out]"
        style={{ animationDelay: `${index * 0.2}s` }}
      >
        •
      </span>
    ))}
  </div>
);

// Update the component definition
export default function Chat({ botId }: ChatProps) {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      if (conversation.length === 0) {
        setConversation([
          { 
            role: 'assistant', 
            content: 'Hi! I am Sam, how can I help you?' 
          }
        ]);
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setConversation(prev => [...prev, { role: 'user', content: input }]);
      const currentInput = input;
      setInput('');
      setIsLoading(true);
      setIsStreaming(true);

      const encodedInput = encodeURIComponent(currentInput);
      const eventSource = new EventSource(`/api/chat?message=${encodedInput}&token=${user?.token}&botId=${botId}`);

      // Initialize the assistant's response
      setConversation(prev => [...prev, { role: 'assistant', content: '' }]);

      eventSource.onmessage = (event) => {
        try {
          setIsLoading(false);
          const data = JSON.parse(event.data);
          
          if (data.content === "[DONE]") {
            eventSource.close();
            setIsStreaming(false);
          } else {
            setConversation(prev => {
              const newConv = [...prev];
              const lastMessage = newConv[newConv.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                const currentWords = lastMessage.content?.split(' ') || [];
                const newWord = data.content.trim();
                
                // Only add the new word if it's different from the last word
                if (!currentWords.length || currentWords[currentWords.length - 1] !== newWord) {
                  lastMessage.content = (lastMessage.content ? lastMessage.content + ' ' : '') + newWord;
                }
              }
              return newConv;
            });
          }
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
        setIsStreaming(false);
        alert("Connection Error: Failed to connect to the server. Please try again.");
      };

    } catch (error) {
      console.error('Error getting advice:', error);
      setIsStreaming(false);
      alert("Error: An error occurred while getting advice. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-[92vh] bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-stretch max-w-3xl mx-auto w-full">
          {conversation.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message} 
              isStreaming={isStreaming && index === conversation.length - 1}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            className="flex-1 mr-2 px-4 py-2 text-lg rounded-full border border-gray-300 disabled:opacity-50"
            disabled={isLoading || isStreaming}
          />
          <button
            type="submit"
            className="text-black border-2 border-black px-4 py-2 text-lg rounded-full disabled:opacity-50"
            disabled={isLoading || isStreaming}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}