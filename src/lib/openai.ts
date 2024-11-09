import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}

export function getOpenAIClient() {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please provide an API key.');
  }
  return openaiClient;
}