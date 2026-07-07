import type { Context, TypedResponse } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import type {
  Controller,
  ControllerResponse,
} from "@/lib/Shared/infrastructure/controllers/Controller";
import { getConnectionStatus } from "../WhatsappClient";

export class WhatsappStatusController implements Controller {
  async run(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    return c.json(
      {
        status: getConnectionStatus(),
        service: "whatsapp",
        timestamp: new Date().toISOString(),
      },
      HttpStatusCodes.OK,
    );
  }
}
