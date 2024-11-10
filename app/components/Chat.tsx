'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ChatProps {
  botId: string;
  botName?: string;
}

interface Message {
  role: string;
  content: string;
  status?: 'sent' | 'seen';
}

const ChatMessage = ({ message, isStreaming }: { 
  message: Message;
  isStreaming?: boolean;
}) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`w-full py-3 flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[70%] flex items-start px-4 py-3 rounded-lg relative
          ${isAssistant ? '' : 'bg-black text-white'}
          ${isStreaming ? 'animate-pulse' : ''}`}
      >
        <p>{message.content}</p>
        {!isAssistant && message.status && (
          <div className="absolute -bottom-5 right-1 text-xs text-gray-500 flex items-center">
            {message.status === 'sent' ? (
              <Check className="w-3 h-3" />
            ) : (
              <div className="flex">
                <Check className="w-3 h-3" />
                <Check className="w-3 h-3 -ml-1" />
              </div>
            )}
            <span className="ml-1">{message.status}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = ({ botName = 'Assistant' }: { botName?: string }) => (
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

export default function Chat({ botId, botName = 'Assistant' }: ChatProps) {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [seen, setSeen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isTyping]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      if (conversation.length === 0) {
        setConversation([
          { 
            role: 'assistant', 
            content: `Hi! I am ${botName}, how can I help you?` 
          }
        ]);
      }
    }
  }, [user, router, botName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      // Reset states
      setSeen(false);
      setIsTyping(false);
      
      // Add user message with 'sent' status
      setConversation(prev => [...prev, { role: 'user', content: input, status: 'sent' }]);
      const currentInput = input;
      setInput('');
      setIsLoading(true);

      // Start both the API call and the UI animations immediately
      const encodedInput = encodeURIComponent(currentInput);
      const eventSourcePromise = new Promise<EventSource>((resolve) => {
        const es = new EventSource(`/api/chat?message=${encodedInput}&token=${user?.token}&botId=${botId}`);
        resolve(es);
      });

      // Handle UI animations in parallel with API call
      const uiAnimationPromise = (async () => {
        // Random delay for "seen" status (1-3 seconds)
        const randomDelay = Math.floor(Math.random() * 2000) + 1000;
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        
        // Update to "seen"
        setConversation(prev => 
          prev.map((msg, idx) => 
            idx === prev.length - 1 ? { ...msg, status: 'seen' } : msg
          )
        );
        setSeen(true);
      })();

      // Wait for both the API connection and UI animation to complete
      const [eventSource] = await Promise.all([
        eventSourcePromise,
        uiAnimationPromise
      ]);

      // Show typing indicator after seen
      setIsTyping(true);

      // Initialize the assistant's response
      setConversation(prev => [...prev, { role: 'assistant', content: '' }]);

      let isFirstMessage = true;

      eventSource.onmessage = (event) => {
        try {
          setIsLoading(false);
          const data = JSON.parse(event.data);
          
          if (data.content === "[DONE]") {
            eventSource.close();
            setIsStreaming(false);
          } else {
            // Stop typing animation on first message
            if (isFirstMessage) {
              setIsTyping(false);
              setIsStreaming(true);
              isFirstMessage = false;
            }

            setConversation(prev => {
              const newConv = [...prev];
              const lastMessage = newConv[newConv.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                const currentWords = lastMessage.content?.split(' ') || [];
                const newWord = data.content.trim();
                
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
        setIsTyping(false);
        setSeen(false);
        alert("Connection Error: Failed to connect to the server. Please try again.");
      };

    } catch (error) {
      console.error('Error getting advice:', error);
      setIsStreaming(false);
      setIsTyping(false);
      setSeen(false);
      alert("Error: An error occurred while getting advice. Please try again.");
    }
  };

  // Remove the useEffect for typing animation since we're handling it in the event stream
  useEffect(() => {
    if (seen) {
      setIsTyping(true);
    }
  }, [seen]);

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
          {isTyping && (
            <div className="flex justify-start">
              <TypingIndicator botName={botName} />
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