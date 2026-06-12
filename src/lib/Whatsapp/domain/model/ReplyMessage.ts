import type { ChatId } from "@/lib/Whatsapp/domain/value-objects/ChatId";
import type { MessageContent } from "@/lib/Whatsapp/domain/value-objects/MessageContent";
import type { MessageId } from "@/lib/Whatsapp/domain/value-objects/MessageId";

export class ReplyMessage {
  chatId: ChatId;
  messageId: MessageId;
  message: MessageContent;

  constructor(chatId: ChatId, messageId: MessageId, message: MessageContent) {
    this.chatId = chatId;
    this.messageId = messageId;
    this.message = message;
  }

  public toPrimitives() {
    return {
      chatId: this.chatId.value,
      messageId: this.messageId.value,
      message: this.message.value,
    };
  }
}
