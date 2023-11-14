import { useCallback, useState } from "react";
import { InterviewAI } from "../modules/InterviewAI";

const interviewAI = new InterviewAI();

export function useInterviewAI() {
  const [messages, setMessages] = useState(interviewAI.messages);

  const submitAnswer = useCallback((answer: string) => {
    interviewAI
      .submitAnswer(answer)
      .then(() => {
        setMessages([...interviewAI.messages]);
      })
      .catch(() => {
        // Do nothing
      });
  }, []);

  return {
    messages,
    submitAnswer,
  };
}
