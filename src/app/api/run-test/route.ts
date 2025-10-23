
import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

// This is a simplified function to handle different action types
const executeStep = async (page: any, step: any) => {
  // A step can have multiple actions, but for now we'll process them sequentially.
  for (const action of step.actions) {
    switch (action.type) {
      case 'Navigate':
        // For Navigate, the URL is in the 'value' property.
        await page.goto(action.value);
        break;
      case 'Click':
        // For Click, the selector is in the 'target' property.
        await page.click(action.target);
        break;
      case 'Type':
        // For Type, we use target selector and value to type.
        await page.fill(action.target, action.value);
        break;
      case 'Assert':
         // For Assert, we check if the element is visible.
         // 'value' can be used for more complex assertions later.
        await page.waitForSelector(action.target, { state: 'visible' });
        break;
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }
};

export async function POST(req: NextRequest) {
  const { steps } = await req.json();

  if (!steps || steps.length === 0) {
    return NextResponse.json({ error: 'No steps provided' }, { status: 400 });
  }

  const results: { stepId: number; status: 'success' | 'error'; error?: string }[] = [];
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    for (const step of steps) {
      try {
        await executeStep(page, step);
        results.push({ stepId: step.id, status: 'success' });
      } catch (e: any) {
        results.push({ stepId: step.id, status: 'error', error: e.message });
        // Stop execution on first error
        break; 
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to launch browser or run test', details: e.message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return NextResponse.json({ results });
}
