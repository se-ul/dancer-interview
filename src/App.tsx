import { lazy } from "react";

const PracticalEvaluationStep = lazy(() => import("./PracticalEvaluationStep"));
const InterviewStep = lazy(() => import("./InterviewStep"));

export const App: React.FC = () => {
  const isPracticalEvaluation = window.location.search.includes("practical");

  return isPracticalEvaluation ? (
    <PracticalEvaluationStep />
  ) : (
    <InterviewStep />
  );
};
