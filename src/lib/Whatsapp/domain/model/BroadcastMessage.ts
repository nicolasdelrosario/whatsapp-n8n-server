import type { ChatId } from "@/lib/Whatsapp/domain/value-objects/ChatId";
import type { MessageContent } from "@/lib/Whatsapp/domain/value-objects/MessageContent";

export class BroadcastMessage {
  chatIds: ChatId[];
  message: MessageContent;

  constructor(chatIds: ChatId[], message: MessageContent) {
    this.chatIds = chatIds;
    this.message = message;
  }

  public toPrimitives() {
    return {
      chatIds: this.chatIds.map((id) => id.value),
      message: this.message.value,
    };
  }
}
