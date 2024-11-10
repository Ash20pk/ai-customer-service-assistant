'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

interface ChatProps {
  botId: string;
  botName?: string;
}

interface Message {
  role: string;
  content: string;
  status?: 'sent' | 'seen';
}

interface EventSourceData {
  sessionId?: string;
  content: string;
}

const ChatMessage = ({ message, isStreaming }: { 
  message: Message;
  isStreaming?: boolean;
}) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`w-full py-2 flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`
          max-w-[70%] flex items-start px-4 py-3 rounded-xl relative
          ${isAssistant ? 'bg-gray-100 text-gray-900' : 'bg-black text-white'}
          ${isStreaming ? 'animate-pulse' : ''}
        `}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
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
            <span className="ml-1 text-[10px] uppercase tracking-wider">{message.status}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="w-full py-2 flex justify-start">
    <div className="bg-gray-100 rounded-xl px-4 py-3.5 flex items-center">
      <div className="flex space-x-1.5">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }} />
      </div>
    </div>
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

      eventSource.onmessage = (event: MessageEvent) => {
        try {
          setIsLoading(false);
          const data: EventSourceData = JSON.parse(event.data);
          
          if (data.sessionId) {
            return;  // Skip processing this message since it's just the session ID
          }

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
                const newWord = data.content?.trim();
                
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

      eventSource.onerror = (error: Event) => {
        console.error('EventSource failed:', error);
        eventSource.close();
        setIsStreaming(false);
        setIsTyping(false);
        setSeen(false);
        alert("Connection Error: Failed to connect to the server. Please try again.");
      };

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting advice:', error.message);
      }
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
    <>
      <Navbar />
      <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex max-w-3xl mx-auto items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="mr-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-medium text-gray-900">{botName}</h1>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col items-stretch max-w-3xl mx-auto w-full space-y-2">
            {conversation.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                isStreaming={isStreaming && index === conversation.length - 1}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="flex max-w-3xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Type a message..."
              className="flex-1 mr-3 px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-gray-300 focus:ring-0 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
              disabled={isLoading || isStreaming}
            />
            <button
              type="submit"
              className="text-white bg-black px-5 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              disabled={isLoading || isStreaming || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}