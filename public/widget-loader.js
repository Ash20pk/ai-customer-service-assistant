(function() {
  // Create a style element
  const style = document.createElement('style');
  style.textContent = `
    .ai-chat-widget-frame {
      position: fixed;
      bottom: 20px;
      right: 20px;
      border: none;
      width: 400px;
      height: 600px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      z-index: 999999;
    }
    .ai-chat-widget-frame.open {
      opacity: 1;
      visibility: visible;
    }
  `;
  document.head.appendChild(style);

  // Initialize widget
  window.aiChat = function(action, botId) {
    if (action === 'init') {
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = `${window.location.origin}/widget/${botId}`;
      iframe.className = 'ai-chat-widget-frame';
      iframe.id = 'ai-chat-widget-frame';
      document.body.appendChild(iframe);

      // Add message listener for iframe communication
      window.addEventListener('message', function(event) {
        if (event.data.type === 'ai-chat-widget') {
          const iframe = document.getElementById('ai-chat-widget-frame');
          if (iframe) {
            if (event.data.action === 'open') {
              iframe.classList.add('open');
            } else if (event.data.action === 'close') {
              iframe.classList.remove('open');
            }
          }
        }
      });
    }
  };
})(); 