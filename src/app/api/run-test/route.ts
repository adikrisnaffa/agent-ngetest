import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

// This is a simplified function to handle different action types
// We will expand this to be more robust
const executeStep = async (page: any, step: any) => {
  switch (step.type) {
    case 'Navigate':
      await page.goto(step.actions[0].target);
      break;
    case 'Click':
      await page.click(step.actions[0].target);
      break;
    case 'Type':
      await page.fill(step.actions[0].target, step.actions[0].value);
      break;
    case 'Assert':
       // For now, we'll just check if the element is visible.
       // We can make the assertion logic more complex later.
      await page.waitForSelector(step.actions[0].target, { state: 'visible' });
      break;
    default:
      throw new Error(`Unsupported step type: ${step.type}`);
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
