'use client';

interface EmbedCodeProps {
  botId: string;
}

export function EmbedCode({ botId }: EmbedCodeProps) {
  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL}/api/widget?botId=${botId}"></script>`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      // You could add a toast notification here if you want
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="p-4 rounded-md border border-gray-200 mt-4">
      <h3 className="font-bold mb-2">
        Embed your chatbot
      </h3>
      <p className="text-sm mb-4 text-gray-600">
        Add this code to your website to display the chat widget:
      </p>
      <div className="relative">
        <pre className="p-4 bg-gray-50 rounded-md overflow-x-auto text-sm">
          <code>{embedCode}</code>
        </pre>
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1 text-sm bg-black text-white rounded-md hover:bg-gray-800"
        >
          Copy
        </button>
      </div>
    </div>
  );
} 