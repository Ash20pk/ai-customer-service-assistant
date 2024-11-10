'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { EmbedCode } from '../components/EmbedCode';

interface Bot {
  _id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchBots = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bots', {
          credentials: 'include',
        });
        const data = await response.json();
        setBots(data.bots || []);
      } catch (error) {
        console.error('Error fetching bots:', error);
        setBots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Chatbots</h1>
          <button 
            onClick={() => router.push('/create-bot')}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Create New Bot
          </button>
        </div>

        {bots && bots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bots.map((bot) => (
              <div 
                key={bot._id} 
                className="p-6 border border-gray-200 rounded-lg shadow-sm"
              >
                <h2 className="text-xl font-bold mb-2">{bot.name}</h2>
                <p className="text-gray-600 mb-4">{bot.description}</p>
                
                <div className="flex flex-col gap-2">
                  <button 
                    className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    onClick={() => router.push(`/bot/${bot._id}/playground?name=${bot.name}`)}
                  >
                    Open Playground
                  </button>

                  <button 
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => router.push(`/bot/${bot._id}`)}
                  >
                    Manage Bot
                  </button>

                  <EmbedCode botId={bot._id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">You haven&apos;t created any bots yet.</p>
            <button 
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              onClick={() => router.push('/create-bot')}
            >
              Create Your First Bot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
