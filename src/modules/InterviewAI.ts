import type { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { getOpenAI } from "../utils/getOpenAI";

const systemPrompt =
  '1. 당신은 현대무용수를 평가하는 면접관입니다.\n2. 지원자의 현대무용 역량을 판단하기 위해 아래 """ """ 안에 제공된 질문을 해야합니다.\n3. 지원자가 얼마나 현대무용에 관심이 있는지, 충분한 전문성이 있는지 평가해야합니다.\n4. 지원자의 답변이 너무 짧아서 평가하기에 부족할 경우, 제공된 질문 외에 추가적인 질문을 이어나가세요.\n5. 질문이 모두 끝나면 "밝은 표정으로 면접에 임해주어서 감사하다"는 말과 함께 면접을 마무리하는 인사를 한 뒤 면접 전체에 대한 점수와 그 이유를 말하세요. 점수는 100점 만점입니다. 점수를 말한 뒤, "면접을 마무리하기 전에, 혹시 스스로 만족했던 그 개인적인 춤을 보여주실 수 있나요?" 라고 말하세요.\n6. 지원자의 답변에 해설을 하지 마세요.\n7. 답변은 중립적인 느낌으로 짧게 하세요.\n8. 지원자가 인사를 하면 춤 잘 봤다는 인사와 함께 첫 질문으로 면접을 시작하세요.\n9. 두 번째 질문을 하기 전에 면접을 시작한다는 말을 하세요.\n\n"""\n- 먼저, 지원자의 이름을 알려주세요.\n- 본인이 생각하는 예술이란 어떤 것인지 설명해 주십시오.\n- 본인이 생각하는 현대무용이란 어떤 것인지 설명해 주십시오.\n- 최근 현대무용을 통해 어떤 연구나 학습을 진행하고 있는지 알려주세요.\n- 본인은 본인이 생각하는 무용수로서의 장단점이 무엇이라고 생각하십니까?\n- 좋아하는 예술가는 누구인가요?\n- 예술이 표현이라고 하셨는데, 좀 전에 추신 춤은 무엇을 표현한 것인가요?\n- 그럼 혹시 본인이 스스로 만족했던 춤이 있나요?"""';

export class InterviewAI {
  public messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
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
      model: "gpt-4-1106-preview",
      messages: this.messages,
      temperature: 0.39,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0,
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
    this.onMessagesChangeListners.forEach((l) => {
      l(this.messages);
    });
  }
}
