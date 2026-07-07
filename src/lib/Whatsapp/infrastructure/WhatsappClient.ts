import qrcode from "qrcode-terminal";
import type { Client as WhatsAppWebClient } from "whatsapp-web.js";
import pkg from "whatsapp-web.js";
import { env } from "@/lib/Shared/infrastructure/config/env";
import { WhatsappClientIsNotReadyError } from "@/lib/Whatsapp/domain/exceptions/WhatsappClientIsNotReadyError";
import { PostgresSessionStore } from "./stores/PostgresSessionStore";

const { Client, LocalAuth, RemoteAuth } = pkg;

const CLIENT_ID = "whatsapp-n8n-server";
const AUTH_DATA_PATH = "./.wwebjs_auth";
const REMOTE_AUTH_BACKUP_SYNC_INTERVAL_MS = 300_000;
const PUPPETEER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-accelerated-2d-canvas",
  "--no-first-run",
  "--no-zygote",
  "--disable-gpu",
];

let client: WhatsAppWebClient;
let isReady = false;
let initializationPromise: Promise<void> | null = null;
let currentQrCode: string | null = null;
let postgresSessionStore: PostgresSessionStore | null = null;
let shutdownHandlersRegistered = false;
let connectionStatus:
  | "initializing"
  | "qr"
  | "authenticating"
  | "ready"
  | "disconnected" = "disconnected";

const registerPostgresStoreShutdown = (store: PostgresSessionStore): void => {
  if (shutdownHandlersRegistered) return;

  const closeStore = async () => {
    await store.close().catch((error) => {
      console.error("Failed to close PostgreSQL session store:", error);
    });
  };

  process.once("beforeExit", () => {
    void closeStore();
  });
  process.once("SIGINT", async () => {
    await closeStore();
    process.exit(0);
  });
  process.once("SIGTERM", async () => {
    await closeStore();
    process.exit(0);
  });

  shutdownHandlersRegistered = true;
};

const buildAuthStrategy = () => {
  if (!env.POSTGRES_URL) {
    return new LocalAuth({
      clientId: CLIENT_ID,
      dataPath: AUTH_DATA_PATH,
    });
  }

  postgresSessionStore ??= new PostgresSessionStore(env.POSTGRES_URL);
  registerPostgresStoreShutdown(postgresSessionStore);

  return new RemoteAuth({
    clientId: CLIENT_ID,
    dataPath: AUTH_DATA_PATH,
    store: postgresSessionStore,
    backupSyncIntervalMs: REMOTE_AUTH_BACKUP_SYNC_INTERVAL_MS,
  });
};

export const getWhatsAppClient = async (): Promise<
  InstanceType<typeof Client>
> => {
  if (!initializationPromise) {
    initializationPromise = new Promise<void>((resolve) => {
      connectionStatus = "initializing";

      client = new Client({
        authStrategy: buildAuthStrategy(),
        puppeteer: {
          args: PUPPETEER_ARGS,
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
