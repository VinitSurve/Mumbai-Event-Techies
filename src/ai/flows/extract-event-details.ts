'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically extracting event details from WhatsApp messages.
 *
 * It uses a large language model to identify and extract key information such as event title, description, date, time, location, and URLs.
 *
 * @module extract-event-details
 * @exports extractEventDetails - An async function that takes a WhatsApp message as input and returns the extracted event details.
 * @exports ExtractEventDetailsInput - The input type for the extractEventDetails function.
 * @exports ExtractEventDetailsOutput - The output type for the extractEventDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEventDetailsInputSchema = z.object({
  message: z
    .string()
    .describe('The WhatsApp message content to extract event details from.'),
});

export type ExtractEventDetailsInput = z.infer<typeof ExtractEventDetailsInputSchema>;

const ExtractEventDetailsOutputSchema = z.object({
  title: z.string().describe('The title of the event.'),
  description: z.string().describe('A detailed description of the event.'),
  event_date: z
    .string()
    .describe('The date and time of the event in ISO 8601 format.'),
  location: z.string().describe('The location of the event.'),
  urls: z.array(z.string().url()).describe('An array of URLs related to the event.'),
  image_url: z.string().url().optional().describe('The URL of an image associated with the event.'),
  category: z.string().describe('The category of the event (e.g., Tech Talk, Workshop, Conference, Meetup, Hackathon).'),
});

export type ExtractEventDetailsOutput = z.infer<typeof ExtractEventDetailsOutputSchema>;

export async function extractEventDetails(input: ExtractEventDetailsInput): Promise<ExtractEventDetailsOutput> {
  return extractEventDetailsFlow(input);
}

const extractEventDetailsPrompt = ai.definePrompt({
  name: 'extractEventDetailsPrompt',
  input: {schema: ExtractEventDetailsInputSchema},
  output: {schema: ExtractEventDetailsOutputSchema},
  prompt: `You are an AI assistant tasked with extracting event details from WhatsApp messages.

  Analyze the following message and extract the event title, description, date, time, location, URLs, image URL (if available), and category.
  The output should be a JSON object.

  WhatsApp Message:
  {{message}}
  `,
});

const extractEventDetailsFlow = ai.defineFlow(
  {
    name: 'extractEventDetailsFlow',
    inputSchema: ExtractEventDetailsInputSchema,
    outputSchema: ExtractEventDetailsOutputSchema,
  },
  async input => {
    const {output} = await extractEventDetailsPrompt(input);
    return output!;
  }
);
