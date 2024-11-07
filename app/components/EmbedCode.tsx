'use client';

import { useState } from 'react';

interface EmbedCodeProps {
  botId: string;
}

export function EmbedCode({ botId }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe
  src="${window.location.origin}/widget/${botId}"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">Embed Code</label>
        <button
          onClick={handleCopy}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 bg-gray-100 rounded-md text-sm overflow-x-auto">
        {embedCode}
      </pre>
    </div>
  );
} 