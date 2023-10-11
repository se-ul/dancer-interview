import { useCallback, useRef } from "react";
import { Camera } from "./components/Camera";

export const App: React.FC = () => {
  const lastUpdatedTimeRef = useRef<number>(Date.now());
  const lastExpressionRef = useRef<string>("");
  const expressionDurationMapRef = useRef<Record<string, number>>({});

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

  return (
    <main className="h-full flex flex-col space-y-4">
      <h1 className="text-3xl font-bold text-center">Dancer Interview</h1>
      <Camera
        className="flex-1 self-center"
        onExpressionDetection={handleExpressionDetection}
      />
    </main>
  );
};
