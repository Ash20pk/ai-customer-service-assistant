'use client';

import { useState } from 'react';
import styles from './ChatWidget.module.css';

interface ChatWidgetProps {
  botId: string;
}

export default function ChatWidget({ botId }: ChatWidgetProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, `User: ${userMessage}`]);

    try {
      const response = await fetch(`/api/chat?botId=${botId}&message=${encodeURIComponent(userMessage)}&widget=true`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      let botResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(5));
            if (data.content === '[DONE]') {
              setMessages(prev => [...prev, `Bot: ${botResponse}`]);
              botResponse = '';
            } else if (data.content) {
              botResponse += data.content;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, 'Error: Failed to get response']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.widget}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.message}>
            {msg}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>...</div>}
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className={styles.input}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
}
