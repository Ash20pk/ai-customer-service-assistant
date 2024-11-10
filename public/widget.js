(function() {
  // Get the script element and configuration
  const script = document.currentScript;
  const botId = script.getAttribute('data-bot-id');
  const baseUrl = script.getAttribute('data-base-url');

  // Ensure we have the required configuration
  if (!botId || !baseUrl) {
    console.error('AI Chat Widget: Missing required configuration');
    return;
  }

  // Create container and iframe
  const container = document.createElement('div');
  const iframe = document.createElement('iframe');

  // Set container styles
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    width: 400px;
    height: 600px;
    transform: scale(0);
    opacity: 0;
    transform-origin: bottom right;
    transition: transform 0.3s ease, opacity 0.3s ease;
  `;

  // Set iframe styles
  iframe.style.cssText = `
    border: none;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: white;
  `;

  // Create toggle button
  const chatButton = document.createElement('button');
  chatButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background: black;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.style.cssText = `
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background: #f3f4f6;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
    z-index: 1000001;
    opacity: 0;
    visibility: hidden;
  `;

  // Set iframe source with the correct base URL
  iframe.src = `${baseUrl}/widget/${botId}?clientSecret=${script.getAttribute('data-client-secret')}`;

  // Add elements to DOM
  container.appendChild(iframe);
  container.appendChild(closeButton);
  document.body.appendChild(container);
  document.body.appendChild(chatButton);

  // Set initial button icons
  chatButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;

  // Add hover effects
  chatButton.addEventListener('mouseover', () => {
    chatButton.style.transform = 'scale(1.1)';
  });

  chatButton.addEventListener('mouseout', () => {
    chatButton.style.transform = 'scale(1)';
  });

  closeButton.addEventListener('mouseover', () => {
    closeButton.style.background = '#e5e7eb';
  });

  closeButton.addEventListener('mouseout', () => {
    closeButton.style.background = '#f3f4f6';
  });

  // Handle opening and closing
  function openWidget() {
    container.style.transform = 'scale(1)';
    container.style.opacity = '1';
    chatButton.style.opacity = '0';
    chatButton.style.visibility = 'hidden';
    closeButton.style.opacity = '1';
    closeButton.style.visibility = 'visible';
  }

  function closeWidget() {
    container.style.transform = 'scale(0)';
    container.style.opacity = '0';
    chatButton.style.opacity = '1';
    chatButton.style.visibility = 'visible';
    closeButton.style.opacity = '0';
    closeButton.style.visibility = 'hidden';
  }

  chatButton.addEventListener('click', openWidget);
  closeButton.addEventListener('click', closeWidget);

  // Handle mobile responsiveness
  function adjustForMobile() {
    if (window.innerWidth < 768) {
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.bottom = '0';
      container.style.right = '0';
      iframe.style.borderRadius = '0';
    } else {
      container.style.width = '400px';
      container.style.height = '600px';
      container.style.bottom = '20px';
      container.style.right = '20px';
      iframe.style.borderRadius = '10px';
    }
  }

  window.addEventListener('resize', adjustForMobile);
  adjustForMobile();
})(); 