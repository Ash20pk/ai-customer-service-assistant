'use client';

import { useEffect, useState } from 'react';
import ChatWidget from '@/app/components/ChatWidget';
import { useSearchParams } from 'next/navigation';

interface Bot {
  _id: string;
  name: string;
  description: string;
  assistantId: string;
}

export default function Widget({ params }: { params: { id: string } }) {
  const [bot, setBot] = useState<Bot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('clientSecret');

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
        setError(`Error loading chat widget, ${error}`);
      }
    };

    fetchBot();
  }, [params.id]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!bot) return <div>Loading...</div>;
  if (!clientSecret) return <div>Error: Missing client secret</div>;

  return (
    <div className="h-full">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
      <ChatWidget botId={bot._id} botName={bot.name} clientSecret={clientSecret} />
    </div>
  );
} 