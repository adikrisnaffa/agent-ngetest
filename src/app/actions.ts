'use server';

export async function fetchUrlContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                // Mimic a browser user agent
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let html = await response.text();

        // Inject a <base> tag to correctly resolve relative URLs for assets (CSS, JS, images)
        const baseTag = `<base href="${new URL(url).origin}" />`;
        if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>${baseTag}`);
        } else {
            html = baseTag + html;
        }

        return html;
    } catch (error) {
        console.error('Failed to fetch URL content via proxy:', error);
        if (error instanceof Error) {
            return `<html><body><h1>Error fetching page</h1><p>${error.message}</p></body></html>`;
        }
        return '<html><body><h1>An unknown error occurred</h1></body></html>';
    }
}
