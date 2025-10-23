
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('URL parameter is missing', { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const body = await response.text();
    const headers = new Headers(response.headers);
    headers.set('Content-Type', response.headers.get('Content-Type') || 'text/html');

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error(`Proxy error for ${targetUrl}:`, error);
    if (error instanceof Error) {
        return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
    }
    return new NextResponse('An internal server error occurred.', { status: 500 });
  }
}
