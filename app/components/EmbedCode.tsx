'use client';

import { useState, useEffect } from 'react';

interface EmbedCodeProps {
  botId: string;
}

export function EmbedCode({ botId }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const generateClientSecret = async () => {
      try {
        const response = await fetch(`/api/bots/${botId}/secret`, {
          credentials: 'include'
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error generating client secret:', error);
      }
    };

    generateClientSecret();
  }, [botId]);

  const embedCode = `<!-- AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.defer = true;
    script.setAttribute('data-bot-id', '${botId}');
    script.setAttribute('data-client-secret', '${clientSecret || ''}');
    script.setAttribute('data-base-url', '${window.location.origin}');
    document.head.appendChild(script);
  })();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!clientSecret) {
    return <div>Loading embed code...</div>;
  }

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
      <pre className="p-3 bg-gray-100 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
        {embedCode}
      </pre>
    </div>
  );
} 