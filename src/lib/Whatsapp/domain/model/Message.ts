import { InvalidMessageDataError } from "@/lib/Whatsapp/domain/exceptions/InvalidMessageDataError";
import type { ChatId } from "@/lib/Whatsapp/domain/value-objects/ChatId";
import type { MessageContent } from "@/lib/Whatsapp/domain/value-objects/MessageContent";

export class Message {
  chatId: ChatId;
  message: MessageContent;

  constructor(chatId: ChatId, message: MessageContent) {
    this.chatId = chatId;
    this.message = message;
    this.validateMessage();
  }

  private validateMessage() {
    if (!this.chatId || !this.message)
      throw new InvalidMessageDataError("Invalid message data");
  }

  public toPrimitives() {
    return {
      chatId: this.chatId.value,
      message: this.message.value,
    };
  }
}
