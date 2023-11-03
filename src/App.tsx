import { useCallback, useRef, useState } from "react";
import { Camera } from "./components/Camera";
import { useInterval } from "./hooks/useInterval";
import { getDanceProbability } from "./utils/getDanceProbability ";

export const App: React.FC = () => {
  // const { messages, submitAnswer } = useInterviewAI();
  // const [answer, setAnswer] = useState<string>("");
  const lastUpdatedTimeRef = useRef<number>(Date.now());
  const lastExpressionRef = useRef<string>("");
  const expressionDurationMapRef = useRef<Record<string, number>>({});
  const [currentDanceProbability, setCurrentDanceProbability] = useState(-1);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  const refreshDanceProbability = useCallback(async () => {
    const current = await getDanceProbability();
    setCurrentDanceProbability(current.result);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  useInterval(refreshDanceProbability, 300);

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

    if (currentDanceProbability >= 0) {
      setScore((score) => (score += currentDanceProbability * delta));
      setMaxScore((maxScore) => (maxScore += 100 * delta));
    }
  }, []);

  // useSpeech((result) => {
  //   setAnswer(result);
  // });

  const tintColor = `rgba(${Math.floor(
    255 - currentDanceProbability * 255
  )},${Math.floor(currentDanceProbability * 255)},0,1)`;
  const resultScore = (score / Math.max(1, maxScore)) * 100;

  return (
    <main className="h-full flex flex-col items-center space-y-4 py-8">
      <div className="flex flex-col space-y-4">
        <div
          className="relative"
          style={{
            width: 640,
            height: 480,
            border: `1px solid ${tintColor}`,
          }}
        >
          <Camera
            className="flex-1 self-center"
            onExpressionDetection={handleExpressionDetection}
          />
          <div
            className="absolute top-1 right-2 text-2xl"
            style={{ color: tintColor }}
          >
            {(currentDanceProbability * 100).toFixed(0)}%
          </div>
        </div>
        <div className="flex flex-row border border-solid border-white">
          <div
            className="bg-white h-2"
            style={{ width: `${resultScore}%` }}
          ></div>
          <div className="flex-1"></div>
        </div>
        <div className="flex flex-row justify-between">
          <span>0.0</span>
          <span>100.0</span>
        </div>
        <div className="text-5xl flex flex-row justify-center">
          {resultScore.toFixed(1)}점
        </div>
      </div>
      {/* <div className="flex-1 self-center">{answer}</div>
      <button
        onClick={() => {
          void submitAnswer(answer);
        }}
      >
        답변하기
      </button>
      {messages.slice(1).map((message, index) => (
        <div key={index}>
          <div>{message.role}</div>
          <div>{message.content}</div>
        </div>
      ))} */}
    </main>
  );
};
