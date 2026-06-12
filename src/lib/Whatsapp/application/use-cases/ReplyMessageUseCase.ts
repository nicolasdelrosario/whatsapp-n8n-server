import { ReplyMessage } from "@/lib/Whatsapp/domain/model/ReplyMessage";
import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";
import { ChatId } from "@/lib/Whatsapp/domain/value-objects/ChatId";
import { MessageContent } from "@/lib/Whatsapp/domain/value-objects/MessageContent";
import { MessageId } from "@/lib/Whatsapp/domain/value-objects/MessageId";

export class ReplyMessageUseCase {
  constructor(private readonly repository: WhatsappRepository) {}

  async run(chatId: string, messageId: string, message: string) {
    const replyToMessage = new ReplyMessage(
      new ChatId(chatId),
      new MessageId(messageId),
      new MessageContent(message),
    );

    await this.repository.replyMessage(replyToMessage);
  }
}
