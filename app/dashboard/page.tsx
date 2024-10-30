'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Bot {
  _id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      fetchBots();
    }
  }, [user]);

  const fetchBots = async () => {
    const response = await fetch('/api/bots', {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setBots(data.bots);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Bots</h2>
        <Link href="/create-bot" className="bg-green-500 text-white px-4 py-2 rounded inline-block mb-4">
          Create New Bot
        </Link>
        {bots.map((bot) => (
          <div key={bot._id} className="border p-4 mb-4 rounded">
            <h3 className="text-xl font-bold">{bot.name}</h3>
            <p>{bot.description}</p>
            <Link href={`/bot/${bot._id}`} className="text-blue-500 hover:underline">
              Manage Bot
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
