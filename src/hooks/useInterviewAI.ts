import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { useEffect, useRef, useState } from "react";
import { InterviewAI } from "../modules/InterviewAI";

export function useInterviewAI() {
  const interviewAIRef = useRef<InterviewAI>(new InterviewAI());
  const [messages, setMessages] = useState(interviewAIRef.current.messages);

  useEffect(() => {
    const onMessagesChange = (messages: ChatCompletionMessageParam[]) => {
      setMessages(messages);
    };
    const interviewAI = interviewAIRef.current;
    interviewAI.addOnMessagesChangeListener(onMessagesChange);
    return () => {
      interviewAI.removeOnMessagesChangeListener(onMessagesChange);
    };
  }, []);

  return {
    messages,
    submitAnswer: interviewAIRef.current.submitAnswer.bind(
      interviewAIRef.current
    ),
  };
}
