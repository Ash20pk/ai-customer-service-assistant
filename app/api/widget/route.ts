import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get('botId');

  if (!botId) {
    return new NextResponse('Bot ID is required', { status: 400 });
  }

  const script = `
    (function() {
      // Create widget container
      const container = document.createElement('div');
      container.id = 'customer-support-widget';
      document.body.appendChild(container);

      // Load React and Next.js runtime
      const script = document.createElement('script');
      script.src = '${process.env.NEXT_PUBLIC_APP_URL}/widget/bundle.js';
      script.async = true;
      script.onload = function() {
        // Initialize widget with configuration
        window.CustomerSupportWidget.init({
          botId: '${botId}',
          primaryColor: '#000000',
          position: 'bottom-right',
        });
      };
      document.body.appendChild(script);

      // Load widget styles
      const styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.href = '${process.env.NEXT_PUBLIC_APP_URL}/widget/styles.css';
      document.head.appendChild(styles);
    })();
  `;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}