import type { Context, TypedResponse } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import type {
  Controller,
  ControllerResponse,
} from "@/lib/Shared/infrastructure/controllers/Controller";
import { getConnectionStatus, getQrCode } from "../WhatsappClient";

export class QRCodeController implements Controller {
  async run(
    c: Context,
  ): Promise<Response & TypedResponse<ControllerResponse, StatusCode, "json">> {
    try {
      const status = getConnectionStatus();

      if (status === "ready")
        return c.json(
          {
            message: "Whatsapp is already connected",
            status: "ready",
          },
          HttpStatusCodes.OK,
        );

      const qrCode = getQrCode();

      if (!qrCode)
        return c.json(
          {
            message: "QR code not available yet. Please try again.",
            status: status,
          },
          HttpStatusCodes.ACCEPTED,
        );

      return c.json(
        {
          message: "Scan this QR code with WhatsApp",
          status: status,
          qrCode: qrCode,
        },
        HttpStatusCodes.OK,
      );
    } catch (error) {
      return c.json(
        {
          message: "Failed to get QR code",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
