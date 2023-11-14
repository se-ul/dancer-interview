import { useCallback, useEffect, useRef, useState } from "react";
import { FaceCamera } from "./components/FaceCamera";
import { useInterviewAI } from "./hooks/useInterviewAI";
import { generateSpeechMP3 } from "./utils/generateSpeechMP3";

export const InterviewStep: React.FC = () => {
  const { messages, submitAnswer } = useInterviewAI();
  const [answer, setAnswer] = useState<string>("");
  const lastUpdatedTimeRef = useRef<number>(Date.now());
  const lastExpressionRef = useRef<string>("");
  const expressionDurationMapRef = useRef<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleExpressionDetection = useCallback((expression: string) => {
    const currentTime = Date.now();
    const delta = currentTime - lastUpdatedTimeRef.current;
    const lastExpression = lastExpressionRef.current;

    const expressionDurationMap = expressionDurationMapRef.current;
    if (!expressionDurationMap[lastExpression]) {
      expressionDurationMap[lastExpression] = 0;
    }
    expressionDurationMap[lastExpression] += delta;

    lastExpressionRef.current = expression;
    lastUpdatedTimeRef.current = currentTime;
  }, []);

  const assistantMessage = String(
    messages.filter((message) => message.role === "assistant").slice(-1)[0]
      ?.content ?? ""
  );

  useEffect(() => {
    if (assistantMessage === "") {
      return;
    }

    async function playMP3(): Promise<void> {
      if (audioRef.current === null) {
        return;
      }

      const url = await generateSpeechMP3(assistantMessage);
      audioRef.current.src = url;
      void audioRef.current.play();
    }

    void playMP3();
  }, [assistantMessage]);

  return (
    <main className="h-full flex flex-col items-center space-y-4 py-8">
      <div className="flex flex-col space-y-4">
        <FaceCamera
          className="flex-1 self-center"
          onExpressionDetection={handleExpressionDetection}
        />
      </div>
      <form
        className="flex flex-row space-x-4"
        onSubmit={(event) => {
          event.preventDefault();
          submitAnswer(answer);
          setAnswer("");
        }}
      >
        <input
          className="flex-1 self-center text-black"
          type="text"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
          }}
        />
        <button type="submit">답변하기</button>
      </form>
      <p className="mt-12 max-w-4xl text-3xl break-keep">
        (AI) {assistantMessage}
      </p>
      <audio ref={audioRef} className="hidden"></audio>
    </main>
  );
};
