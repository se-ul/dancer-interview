import { useState } from "react";
import { InterviewStep } from "./InterviewStep";
import { PracticalEvaluationStep } from "./PracticalEvaluationStep";
import { useKeyPress } from "./hooks/useKeyPress";

export const App: React.FC = () => {
  const [step, setStep] = useState("practical_evaluation");

  useKeyPress("-", () => {
    setStep("interview");
  });

  return step === "practical_evaluation" ? (
    <PracticalEvaluationStep />
  ) : (
    <InterviewStep />
  );
};
