import OpenAI from "openai";

let openaiInstance: OpenAI | undefined;

export function getOpenAI() {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      // FIXME: Using api key on browser is not safe. Use a proxy server instead.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-assignment
      apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiInstance;
}
