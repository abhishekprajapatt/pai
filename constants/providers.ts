export const AI_PROVIDERS = [
  'anthropic',
  'deepseek',
  'openai',
  'gemini',
] as const;

export type AIProvider = (typeof AI_PROVIDERS)[number];
export const VOICE_PROVIDERS = ['voicebox', 'openai', 'google'] as const;
export type VoiceProvider = (typeof VOICE_PROVIDERS)[number];