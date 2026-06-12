import { BroadcastMessageUseCase } from "@/lib/Whatsapp/application/use-cases/BroadcastMessageUseCase";
import { ReplyMessageUseCase } from "@/lib/Whatsapp/application/use-cases/ReplyMessageUseCase";
import { SendMessageUseCase } from "@/lib/Whatsapp/application/use-cases/SendMessageUseCase";
import { WhatsappService } from "@/lib/Whatsapp/infrastructure/services/WhatsappService";

export const createServicesContainer = () => {
  // services
  const whatsappService = new WhatsappService();

  return {
    whatsapp: {
      sendMessage: new SendMessageUseCase(whatsappService),
      replyMessage: new ReplyMessageUseCase(whatsappService),
      broadcastMessage: new BroadcastMessageUseCase(whatsappService),
    },
  };
};

export type ServicesContainer = ReturnType<typeof createServicesContainer>;
