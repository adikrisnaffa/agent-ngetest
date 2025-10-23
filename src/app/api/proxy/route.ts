
import { NextRequest, NextResponse } from 'next/server';

function getForwardedHeaders(request: NextRequest) {
    const headers = new Headers();
    // Copy essential headers from the original request to the proxy request
    // This helps in mimicking the browser's request more closely
    const headersToForward = [
        'accept',
        'accept-language',
        'user-agent',
        'sec-ch-ua',
        'sec-ch-ua-mobile',
        'sec-ch-ua-platform',
        'sec-fetch-dest',
        'sec-fetch-mode',
        'sec-fetch-site',
        'sec-fetch-user',
    ];

    headersToForward.forEach(headerName => {
        const headerValue = request.headers.get(headerName);
        if (headerValue) {
            headers.set(headerName, headerValue);
        }
    });

    return headers;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse(JSON.stringify({ message: 'URL parameter is missing' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const forwardedHeaders = getForwardedHeaders(request);
    
    // Perform the actual fetch to the target URL
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: forwardedHeaders,
      redirect: 'follow' // Important for handling redirects from sites like Google
    });

    const body = await response.text();
    const responseHeaders = new Headers(response.headers);

    // Ensure the content type is correctly passed back
    responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'text/html');

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[PROXY_ERROR] for ${targetUrl}:`, error);
    let errorMessage = 'An internal server error occurred while trying to proxy the request.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new NextResponse(JSON.stringify({ message: errorMessage }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
    });
  }
}
