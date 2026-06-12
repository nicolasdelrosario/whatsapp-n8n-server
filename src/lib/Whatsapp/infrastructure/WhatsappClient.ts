import qrcode from "qrcode-terminal";
import type { Client as WhatsAppWebClient } from "whatsapp-web.js";
import pkg from "whatsapp-web.js";
import { WhatsappClientIsNotReadyError } from "@/lib/Whatsapp/domain/exceptions/WhatsappClientIsNotReadyError";

const { Client, LocalAuth } = pkg;

let client: WhatsAppWebClient;
let isReady = false;
let initializationPromise: Promise<void> | null = null;
let currentQrCode: string | null = null;
let connectionStatus:
  | "initializing"
  | "qr"
  | "authenticating"
  | "ready"
  | "disconnected" = "disconnected";

export const getWhatsAppClient = async (): Promise<
  InstanceType<typeof Client>
> => {
  if (!initializationPromise) {
    initializationPromise = new Promise<void>((resolve) => {
      client = new Client({
        authStrategy: new LocalAuth({
          clientId: "whatsapp-n8n-server",
          dataPath: "./.wwebjs_auth",
        }),
        puppeteer: {
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
          ],
        },
      });

      client.on("qr", (qr) => {
        console.log("Scan the QR code to log in:");
        qrcode.generate(qr, { small: true });

        currentQrCode = qr;
        connectionStatus = "qr";
      });

      client.on("ready", () => {
        console.log("WhatsApp client is ready!");

        try {
          client.setBackgroundSync(true);
        } catch (syncError) {
          console.warn(
            "Failed to sync chat history: ",
            syncError instanceof Error ? syncError.message : String(syncError),
          );
        }

        isReady = true;
        currentQrCode = null;
        connectionStatus = "ready";

        resolve();
      });

      client.on("authenticated", () => {
        console.log("Client authenticated!");
        connectionStatus = "authenticating";
      });

      client.on("disconnected", async (reason) => {
        console.log("Client was disconnected:", reason);
        isReady = false;
        currentQrCode = null;
        connectionStatus = "disconnected";
        initializationPromise = null;
      });

      client.on("auth_failure", (msg) => {
        console.error("Authentication failure:", msg);
        isReady = false;
        currentQrCode = null;
        connectionStatus = "disconnected";
        initializationPromise = null;
      });

      client.initialize();
    });
  }

  await initializationPromise;

  if (!isReady)
    throw new WhatsappClientIsNotReadyError("WhatsApp client is not ready");

  return client;
};

export const getQrCode = (): string | null => {
  return currentQrCode;
};

export const getConnectionStatus = (): string => {
  return connectionStatus;
};

export const initializeClient = (): void => {
  if (!initializationPromise) getWhatsAppClient().catch(console.error);
};
