import { useState } from "react";
import { PoseCamera } from "./components/PoseCamera";
import { useInterval } from "./hooks/useInterval";
import { getDanceProbability } from "./utils/getDanceProbability ";
import { scoreToColor } from "./utils/scoreToColor";

export const PracticalEvaluationStep: React.FC = () => {
  const [currentDanceProbability, setCurrentDanceProbability] = useState(-1);
  const [score, setScore] = useState(0.5);

  const refreshDanceProbability = async () => {
    const current = await getDanceProbability();

    setCurrentDanceProbability(current.result);

    if (currentDanceProbability >= 0) {
      setScore((score) => (score * 9 + currentDanceProbability) / 10);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  useInterval(refreshDanceProbability, 600);

  const tintColor = scoreToColor(currentDanceProbability * 100);
  const resultScore = score * 100;

  return (
    <main className="h-full flex flex-col items-center space-y-4 py-8">
      <div className="flex flex-col space-y-4">
        <div
          className="relative"
          style={{
            width: 640,
            height: 480,
            border: `5px solid ${tintColor}`,
          }}
        >
          <PoseCamera className="flex-1 self-center" />
          <div
            className="absolute top-1 right-2 text-9xl"
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
          {resultScore.toFixed(0)}점
        </div>
      </div>
      <div>{score}</div>
    </main>
  );
};

export default PracticalEvaluationStep;
