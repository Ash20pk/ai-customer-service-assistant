'use client';

import { useEffect, useState } from 'react';
import ChatWidget from '@/app/components/ChatWidget';

interface Bot {
  _id: string;
  name: string;
  description: string;
  assistantId: string;
}

export default function Widget({ params }: { params: { id: string } }) {
  const [bot, setBot] = useState<Bot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBot = async () => {
      try {
        const response = await fetch(`/api/widget/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bot');
        }
        const data = await response.json();
        setBot(data.bot);
      } catch (error) {
        setError('Error loading chat widget');
      }
    };

    fetchBot();
  }, [params.id]);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!bot) return <div className="p-4">Loading...</div>;

  return (
    <div className="h-screen p-4">
      <ChatWidget botId={bot._id} />
    </div>
  );
} 