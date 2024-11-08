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
  `;

  // Set iframe styles
  iframe.style.cssText = `
    border: none;
    width: 400px;
    height: 600px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: white;
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
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
    width: 30px;
    height: 30px;
    border-radius: 15px;
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
  iframe.src = `${baseUrl}/widget/${botId}`;

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
    iframe.style.opacity = '1';
    iframe.style.visibility = 'visible';
    iframe.style.transform = 'translateY(0)';
    chatButton.style.opacity = '0';
    chatButton.style.visibility = 'hidden';
    closeButton.style.opacity = '1';
    closeButton.style.visibility = 'visible';
  }

  function closeWidget() {
    iframe.style.opacity = '0';
    iframe.style.visibility = 'hidden';
    iframe.style.transform = 'translateY(20px)';
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
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
      iframe.style.borderRadius = '0';
    } else {
      iframe.style.width = '400px';
      iframe.style.height = '600px';
      iframe.style.borderRadius = '10px';
    }
  }

  window.addEventListener('resize', adjustForMobile);
  adjustForMobile();
})(); 