import React from 'react';
import Chat from '../../components/Chat';

interface ChatPageProps {
  params: {
    botId: string;
  };
}

const ChatPage: React.FC<ChatPageProps> = async ({ params }) => {
  const bot = await fetch(`/api/bots`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const botData = await bot.json();
  const botName = botData.name;

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-2xl">Chat with Bot</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <Chat botId={params.botId} botName={botName} />
      </main>
    </div>
  );
};

export default ChatPage;
