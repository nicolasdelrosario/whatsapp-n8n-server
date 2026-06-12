import type { Context, TypedResponse } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import * as HttpStatusPhrases from "@/lib/Shared/common/HttpStatusPhrases";
import { env } from "@/lib/Shared/infrastructure/config/env";
import type {
  Controller,
  ControllerResponse,
} from "@/lib/Shared/infrastructure/controllers/Controller";
import type { ServicesContainer } from "@/lib/Shared/infrastructure/services/createServicesContainer";
import { EmptyMessageContentError } from "@/lib/Whatsapp/domain/exceptions/EmptyMessageContentError";
import { InvalidMessageDataError } from "@/lib/Whatsapp/domain/exceptions/InvalidMessageDataError";
import { InvalidPhoneNumberError } from "@/lib/Whatsapp/domain/exceptions/InvalidPhoneNumberError";
import { RecipientNotFoundError } from "@/lib/Whatsapp/domain/exceptions/RecipientNotFoundError";
import { broadcastMessageSchema } from "@/lib/Whatsapp/infrastructure/schemas/whatsappSchemas";

export class BroadcastMessageController implements Controller {
  async run(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    try {
      const services = c.get("services") as ServicesContainer;
      const payload = broadcastMessageSchema.parse(await c.req.json());

      await services.whatsapp.broadcastMessage.run(
        payload.chatIds,
        payload.message,
        env.BROADCAST_DELAY_MS,
      );

      return c.json(
        {
          status: HttpStatusPhrases.OK,
          message: "Broadcast message sent successfully",
          data: payload,
        },
        HttpStatusCodes.OK,
      );
    } catch (error) {
      if (
        error instanceof InvalidPhoneNumberError ||
        error instanceof InvalidMessageDataError ||
        error instanceof EmptyMessageContentError
      ) {
        return c.json(
          { status: HttpStatusPhrases.BAD_REQUEST, message: error.message },
          HttpStatusCodes.BAD_REQUEST,
        );
      }

      if (error instanceof RecipientNotFoundError) {
        return c.json(
          { status: HttpStatusPhrases.NOT_FOUND, message: error.message },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      if (error instanceof Error && error.name === "ZodError") {
        return c.json(
          { status: HttpStatusPhrases.BAD_REQUEST, message: error.message },
          HttpStatusCodes.BAD_REQUEST,
        );
      }

      throw error;
    }
  }
}
