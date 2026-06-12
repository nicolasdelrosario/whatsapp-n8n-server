import { BroadcastMessage } from "@/lib/Whatsapp/domain/model/BroadcastMessage";
import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";
import { ChatId } from "@/lib/Whatsapp/domain/value-objects/ChatId";
import { MessageContent } from "@/lib/Whatsapp/domain/value-objects/MessageContent";

export class BroadcastMessageUseCase {
  constructor(private readonly repository: WhatsappRepository) {}

  async run(chatIds: string[], message: string, delay: number) {
    const chatIdObjects = chatIds.map((id) => new ChatId(id));

    const broadcastMessage = new BroadcastMessage(
      chatIdObjects,
      new MessageContent(message),
    );

    await this.repository.broadcastMessage(broadcastMessage, delay);
  }
}
