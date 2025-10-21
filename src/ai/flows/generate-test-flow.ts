'use server';
/**
 * @fileOverview A flow for generating test automation scripts from a series of steps.
 *
 * - generateTest - A function that handles the test script generation.
 */

import { ai } from '@/ai/genkit';
import { GenerateTestInputSchema, GenerateTestOutputSchema, type GenerateTestInput } from './schemas';

export async function generateTest(input: GenerateTestInput) {
  return generateTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestPrompt',
  input: { schema: GenerateTestInputSchema },
  output: { schema: GenerateTestOutputSchema },
  prompt: `You are an expert test automation engineer. Your task is to generate a test script for the specified framework based on a list of steps.

Framework: {{{target}}}
Base URL: {{{url}}}

The user has defined the following test flow:
{{#each steps}}
- Step: {{title}}
  {{#each actions}}
  - Action: {{type}} "{{{detail}}}"
  {{/each}}
{{/each}}

Please generate a complete, runnable test script based on these steps. The script should be well-structured and follow best practices for the '{{target}}' framework.
The script should include necessary imports, a test block, and use the provided Base URL.
For assertions, use appropriate 'expect' calls. For example, 'Assert URL is /dashboard' should become something like 'await expect(page).toHaveURL('${"{{{url}}}"}/dashboard');'.
For actions like 'Type "text" in "selector"', generate code to locate the element by a plausible selector and type the text.
The final output should be only the code, enclosed in a single markdown code block.
`,
});

const generateTestFlow = ai.defineFlow(
  {
    name: 'generateTestFlow',
    inputSchema: GenerateTestInputSchema,
    outputSchema: GenerateTestOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      return { code: "// Failed to generate test script." };
    }

    // Clean up the output to remove the markdown block
    const cleanedCode = output.code.replace(/```(typescript|javascript)?/g, '').replace(/```$/, '').trim();

    return {
      code: cleanedCode
    };
  }
);
