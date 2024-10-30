'use client';

import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to AI Chat
        </p>
        <div className="fixed right-0 top-0 flex justify-center space-x-4 border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <section className="container mx-auto py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Elevate Your Customer Service</h2>
        <p className="text-xl text-gray-700 mb-8">AI-powered assistant that learns and adapts to your business</p>
        <Link href="/dashboard" className="bg-black text-white px-8 py-3 rounded-full text-lg hover:bg-gray-800 transition">
          Get Started
        </Link>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-500">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-500">One-Time Learning</h3>
              <p className="text-gray-700">Initial setup allows for comprehensive data input, creating a knowledge base tailored to your business.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-500">24/7 Availability</h3>
              <p className="text-gray-700">Provide instant support to your customers around the clock with our AI assistant.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-500">Seamless Integration</h3>
              <p className="text-gray-700">Easy to integrate with any website using our simple embed code.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
