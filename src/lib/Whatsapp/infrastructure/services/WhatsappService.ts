import { RecipientNotFoundError } from "@/lib/Whatsapp/domain/exceptions/RecipientNotFoundError";
import type { BroadcastMessage } from "@/lib/Whatsapp/domain/model/BroadcastMessage";
import type { Message } from "@/lib/Whatsapp/domain/model/Message";
import type { ReplyMessage } from "@/lib/Whatsapp/domain/model/ReplyMessage";
import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";
import { getWhatsAppClient } from "@/lib/Whatsapp/infrastructure/WhatsappClient";
import { WhatsappClientIsNotReadyError } from "../../domain/exceptions/WhatsappClientIsNotReadyError";

const WHATSAPP_SUFFIX = "@c.us";

export class WhatsappService implements WhatsappRepository {
  private async getReadyClient() {
    const client = await getWhatsAppClient();

    if (!client) {
      throw new WhatsappClientIsNotReadyError(
        "Client not ready or disconnected",
      );
    }

    return client;
  }

  async sendMessage(message: Message): Promise<void> {
    const { chatId, message: text } = message.toPrimitives();

    if (!chatId || !text) {
      throw new Error("chatId and message are required");
    }

    const client = await this.getReadyClient();
    await client.sendMessage(`${chatId}${WHATSAPP_SUFFIX}`, text);
  }

  async replyMessage(replyMessage: ReplyMessage): Promise<void> {
    const { chatId, messageId, message } = replyMessage.toPrimitives();

    if (!chatId || !message) {
      throw new Error("chatId and message are required");
    }

    const client = await this.getReadyClient();

    if (messageId) {
      const targetMessage = await client.getMessageById(messageId);

      if (!targetMessage) {
        throw new RecipientNotFoundError("Target message not found");
      }

      await targetMessage.reply(message);
      return;
    }

    await client.sendMessage(`${chatId}${WHATSAPP_SUFFIX}`, message);
  }

  async broadcastMessage(
    broadcastMessage: BroadcastMessage,
    delay: number,
  ): Promise<void> {
    const { chatIds, message } = broadcastMessage.toPrimitives();

    if (!chatIds || !message) {
      throw new Error("chatIds and message are required");
    }

    const client = await this.getReadyClient();

    for (const chatId of chatIds) {
      await client.sendMessage(`${chatId}${WHATSAPP_SUFFIX}`, message);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
