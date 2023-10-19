import type { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { getOpenAI } from "../utils/getOpenAI";

const systemPrompt = `I want you to act as an interviewer. I will be the candidate and you will ask me the interview questions for 현대무용수 position in 국립현대무용단. I want you to only reply as the interviewer. Do not write all the conservation at once. I want you to only do the interview with me. Ask me the questions and wait for my answers. Do not write explanations. Ask me the questions one by one like an interviewer does and wait for my answers. After asking seven questions, wrap up the interview and rate the candidate out of 100. If a candidate's answer isn't perfect, deduct points and add the reason at the end of the answer. You must speak only in Korean.`;

export class InterviewAI {
  public messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content:
        "안녕하세요. 이번에 현대무용수로 지원한 지원자입니다. 면접을 시작해주세요.",
    },
  ];
  private onMessagesChangeListners: ((
    messages: ChatCompletionMessageParam[]
  ) => void)[] = [];

  async submitAnswer(answer: string): Promise<ChatCompletionMessageParam> {
    this.messages.push({ role: "user", content: answer });
    this.notifyOnMessagesChangeListeners();
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: this.messages,
    });

    const message = response.choices[0].message;
    this.messages.push(message);
    this.notifyOnMessagesChangeListeners();
    return message;
  }

  public addOnMessagesChangeListener(
    listener: (messages: ChatCompletionMessageParam[]) => void
  ) {
    this.onMessagesChangeListners.push(listener);
  }

  public removeOnMessagesChangeListener(
    listener: (messages: ChatCompletionMessageParam[]) => void
  ) {
    this.onMessagesChangeListners = this.onMessagesChangeListners.filter(
      (l) => l !== listener
    );
  }

  private notifyOnMessagesChangeListeners() {
    console.log(this.messages);
    this.onMessagesChangeListners.forEach((l) => {
      l(this.messages);
    });
  }
}
