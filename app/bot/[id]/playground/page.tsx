'use client';

import Chat from '@/app/components/Chat';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function BotPlayground() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)]">
        <Chat botId={id as string} botName={name || ''} />
      </div>
      <Footer />
    </>
  );
}
