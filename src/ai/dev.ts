import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-events.ts';
import '@/ai/flows/extract-event-details.ts';