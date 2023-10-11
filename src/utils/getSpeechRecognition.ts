export interface SpeechRecognition {
  interimResults: boolean;
  continuous: boolean;
  lang: string;

  readonly start: () => void;
  readonly stop: () => void;
  onnomatch: () => void;
  onresult: (event: { results: { transcript: string }[][] }) => void;
  onerror: (event: { error: Error }) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSpeechRecognition(): SpeechRecognition {
  /* eslint-disable */
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  /* eslint-enable */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return new SpeechRecognition() as SpeechRecognition;
}
