// src/ai/flows/categorize-events.ts
'use server';

/**
 * @fileOverview A flow to categorize events based on their descriptions using AI.
 *
 * - categorizeEvent - A function that categorizes an event based on its description.
 * - CategorizeEventInput - The input type for the categorizeEvent function.
 * - CategorizeEventOutput - The return type for the categorizeEvent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeEventInputSchema = z.object({
  description: z.string().describe('The description of the event.'),
});

export type CategorizeEventInput = z.infer<typeof CategorizeEventInputSchema>;

const CategorizeEventOutputSchema = z.object({
  category: z.string().describe('The category of the event.'),
});

export type CategorizeEventOutput = z.infer<typeof CategorizeEventOutputSchema>;

export async function categorizeEvent(input: CategorizeEventInput): Promise<CategorizeEventOutput> {
  return categorizeEventFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeEventPrompt',
  input: {schema: CategorizeEventInputSchema},
  output: {schema: CategorizeEventOutputSchema},
  prompt: `You are an expert event categorizer.

  Given the following event description, determine the most appropriate category for the event.
  The category should be a single word.
  The possible categories are: Tech talks, Workshops, Conferences, Meetups, Hackathons.

  Description: {{{description}}}
  `,
});

const categorizeEventFlow = ai.defineFlow(
  {
    name: 'categorizeEventFlow',
    inputSchema: CategorizeEventInputSchema,
    outputSchema: CategorizeEventOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
