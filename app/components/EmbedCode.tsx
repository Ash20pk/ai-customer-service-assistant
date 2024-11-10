'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Code } from 'lucide-react';

interface EmbedCodeProps {
  botId: string;
}

export function EmbedCode({ botId }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateClientSecret = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/bots/${botId}/secret`, {
          credentials: 'include'
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error generating client secret:', error);
      } finally {
        setIsLoading(false);
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

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-gray-500" />
          <span>Embed Code</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Add this code to your website</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <pre className="max-h-48 overflow-y-auto rounded-md bg-white p-3 text-sm text-gray-800">
                  {embedCode}
                </pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}