import { config } from '../../config/env.js';
import { askGemini } from './gemini.js';
import { askOpenAI } from './openai.js';

const PROVIDERS = {
  gemini: askGemini,
  openai: askOpenAI,
};

export function getActiveProviderName() {
  return config.aiProvider;
}

export function isProviderConfigured() {
  if (config.aiProvider === 'gemini') return Boolean(config.gemini.apiKey);
  if (config.aiProvider === 'openai') return Boolean(config.openai.apiKey);
  return false;
}

/**
 * Calls whichever AI provider is configured via AI_PROVIDER in .env.
 * Throws if the provider is unknown or its API key is missing — callers
 * are expected to catch this and fall back to the local assistant.
 */
export async function askAi(payload) {
  const provider = PROVIDERS[config.aiProvider];
  if (!provider) {
    throw new Error(`Unknown AI_PROVIDER "${config.aiProvider}". Use "gemini" or "openai".`);
  }
  if (!isProviderConfigured()) {
    throw new Error(`${config.aiProvider} is selected but its API key is not set in .env.`);
  }
  const result = await provider(payload);
  return { ...result, provider: config.aiProvider, model: config[config.aiProvider].model };
}
