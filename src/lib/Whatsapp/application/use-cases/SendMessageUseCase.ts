import { Message } from "@/lib/Whatsapp/domain/model/Message";
import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";
import { ChatId } from "@/lib/Whatsapp/domain/value-objects/ChatId";
import { MessageContent } from "@/lib/Whatsapp/domain/value-objects/MessageContent";

export class SendMessageUseCase {
  constructor(private readonly repository: WhatsappRepository) {}

  async run(number: string, content: string) {
    const message = new Message(
      new ChatId(number),
      new MessageContent(content),
    );

    await this.repository.sendMessage(message);
  }
}
