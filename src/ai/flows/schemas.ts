import { z } from 'zod';

const ActionSchema = z.object({
  type: z.string().describe('The type of action (e.g., Navigate, Type, Click, Assert)'),
  detail: z.string().describe('The specific details of the action (e.g., "to /login", "\'testuser\' in Username")'),
});

const StepSchema = z.object({
  title: z.string().describe('The title of the test step.'),
  actions: z.array(ActionSchema).describe('The list of actions within this step.'),
});

export const GenerateTestInputSchema = z.object({
  steps: z.array(StepSchema).describe('An array of test steps that make up the flow.'),
  target: z.enum(['playwright', 'cypress', 'selenium']).describe('The target testing framework.'),
  url: z.string().describe('The base URL for the test.')
});
export type GenerateTestInput = z.infer<typeof GenerateTestInputSchema>;

export const GenerateTestOutputSchema = z.object({
  code: z.string().describe('The generated test script code.'),
});
export type GenerateTestOutput = z.infer<typeof GenerateTestOutputSchema>;
