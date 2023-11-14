import { getOpenAI } from "./getOpenAI";

export async function generateSpeechMP3(text: string): Promise<string> {
  const openAI = getOpenAI();

  const mp3 = await openAI.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  const buffer = await mp3.arrayBuffer();
  const blob = new Blob([buffer], { type: "audio/mp3" });
  const url = URL.createObjectURL(blob);

  return url;
}
