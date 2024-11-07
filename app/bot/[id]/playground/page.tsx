'use client';

import Chat from '@/app/components/Chat';
import { useParams } from 'next/navigation';

export default function BotPlayground() {
  const { id } = useParams();
  return <Chat botId={id as string} />;
}