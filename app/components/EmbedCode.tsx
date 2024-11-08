'use client';

import { useState } from 'react';

interface EmbedCodeProps {
  botId: string;
}

export function EmbedCode({ botId }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  // Create a more robust embed code that works across different domains
  const embedCode = `<!-- AI Chat Widget -->
<div id="ai-chat-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.defer = true;
    script.setAttribute('data-bot-id', '${botId}');
    script.setAttribute('data-base-url', '${window.location.origin}');
    document.head.appendChild(script);
  })();
</script>`;

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
      <pre className="p-3 bg-gray-100 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
        {embedCode}
      </pre>
    </div>
  );
} 