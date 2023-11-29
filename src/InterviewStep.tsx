import { cva } from "cva";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaceCamera } from "./components/FaceCamera";
import { useInterviewAI } from "./hooks/useInterviewAI";
import { generateSpeechMP3 } from "./utils/generateSpeechMP3";

const caption = cva({
  base: "max-w-4xl text-3xl break-keep",
  variants: {
    type: {
      default: "mt-12",
      longText: "absolute bottom-20 bg-black bg-opacity-70",
    },
  },
  defaultVariants: {
    type: "default",
  },
});

export const InterviewStep: React.FC = () => {
  const { messages, submitAnswer } = useInterviewAI();
  const [lastAnswer, setLastAnswer] = useState<string>("");
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
      <h1 className="text-3xl mb-1">수험번호: 87</h1>
      <div className="flex flex-col space-y-4">
        <FaceCamera
          className="flex-1 self-center"
          onExpressionDetection={handleExpressionDetection}
        />
      </div>
      <p
        className={caption({
          type: assistantMessage.length > 150 ? "longText" : "default",
        })}
      >
        {assistantMessage && `(면접관) ${assistantMessage}`}
      </p>
      <form
        className="absolute bottom-0 left-0 flex flex-row space-x-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (answer === "") {
            submitAnswer(lastAnswer);
          } else {
            submitAnswer(answer);
            setLastAnswer(answer);
            setAnswer("");
          }
        }}
      >
        <input
          className="flex-1 self-center outline-none caret-gray-400 bg-black text-gray-600"
          type="text"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
          }}
        />
      </form>
      <audio ref={audioRef} className="hidden"></audio>
    </main>
  );
};

export default InterviewStep;
