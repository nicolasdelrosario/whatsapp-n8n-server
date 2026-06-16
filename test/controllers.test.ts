import assert from "node:assert/strict";
import { test } from "node:test";
import { BroadcastMessageController } from "../src/lib/Whatsapp/infrastructure/controllers/BroadcastMessageController";
import { QRCodeController } from "../src/lib/Whatsapp/infrastructure/controllers/QRCodeController";
import { ReplyMessageController } from "../src/lib/Whatsapp/infrastructure/controllers/ReplyMessageController";
import { SendMessageController } from "../src/lib/Whatsapp/infrastructure/controllers/SendMessageController";
import { EmptyMessageContentError } from "../src/lib/Whatsapp/domain/exceptions/EmptyMessageContentError";
import { InvalidMessageDataError } from "../src/lib/Whatsapp/domain/exceptions/InvalidMessageDataError";
import { InvalidPhoneNumberError } from "../src/lib/Whatsapp/domain/exceptions/InvalidPhoneNumberError";
import { RecipientNotFoundError } from "../src/lib/Whatsapp/domain/exceptions/RecipientNotFoundError";
import { env } from "../src/lib/Shared/infrastructure/config/env";
import type { ServicesContainer } from "../src/lib/Shared/infrastructure/services/createServicesContainer";
import { createContext, readJsonResponse } from "./helpers";

function createServices(overrides?: Partial<ServicesContainer["whatsapp"]>) {
  const calls = {
    sendMessage: [] as Array<[string, string]>,
    replyMessage: [] as Array<[string, string, string]>,
    broadcastMessage: [] as Array<[string[], string, number]>,
  };

  const defaults = {
    sendMessage: {
      run: async (chatId: string, message: string) => {
        calls.sendMessage.push([chatId, message]);
      },
    },
    replyMessage: {
      run: async (chatId: string, messageId: string, message: string) => {
        calls.replyMessage.push([chatId, messageId, message]);
      },
    },
    broadcastMessage: {
      run: async (chatIds: string[], message: string, delay: number) => {
        calls.broadcastMessage.push([chatIds, message, delay]);
      },
    },
  };

  const merged = { ...defaults, ...overrides };

  const services: ServicesContainer = {
    whatsapp: merged as ServicesContainer["whatsapp"],
  };

  return { calls, services };
}

test("SendMessageController returns 200 for a valid payload", async () => {
  const { calls, services } = createServices();
  const controller = new SendMessageController();
  const context = createContext({
    body: {
      chatId: "51987654321",
      message: "Hello",
    },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: "OK",
    message: "Message sent successfully",
    data: {
      chatId: "51987654321",
      message: "Hello",
    },
  });
  assert.deepEqual(calls.sendMessage, [["51987654321", "Hello"]]);
});

test("SendMessageController returns 400 for invalid payloads", async () => {
  const { services } = createServices();
  const controller = new SendMessageController();
  const context = createContext({
    body: {
      chatId: "invalid",
      message: "Hello",
    },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.match(String(body.message), /chatId/i);
});

test("SendMessageController returns 400 for InvalidMessageDataError", async () => {
  const { services } = createServices({
    sendMessage: {
      run: async () => {
        throw new InvalidMessageDataError("Invalid message data");
      },
    },
  });
  const controller = new SendMessageController();
  const context = createContext({
    body: { chatId: "51987654321", message: "Hello" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Invalid message data");
});

test("SendMessageController returns 400 for InvalidPhoneNumberError", async () => {
  const { services } = createServices({
    sendMessage: {
      run: async () => {
        throw new InvalidPhoneNumberError("Invalid phone number");
      },
    },
  });
  const controller = new SendMessageController();
  const context = createContext({
    body: { chatId: "51987654321", message: "Hello" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Invalid phone number");
});

test("SendMessageController returns 400 for EmptyMessageContentError", async () => {
  const { services } = createServices({
    sendMessage: {
      run: async () => {
        throw new EmptyMessageContentError("Message content cannot be empty");
      },
    },
  });
  const controller = new SendMessageController();
  const context = createContext({
    body: { chatId: "51987654321", message: "Hello" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Message content cannot be empty");
});

test("SendMessageController returns 404 for RecipientNotFoundError", async () => {
  const { services } = createServices({
    sendMessage: {
      run: async () => {
        throw new RecipientNotFoundError("Recipient not found");
      },
    },
  });
  const controller = new SendMessageController();
  const context = createContext({
    body: { chatId: "51987654321", message: "Hello" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 404);
  assert.equal(body.status, "Not Found");
  assert.equal(body.message, "Recipient not found");
});

test("ReplyMessageController returns 200 for a valid payload", async () => {
  const { calls, services } = createServices();
  const controller = new ReplyMessageController();
  const context = createContext({
    body: {
      chatId: "51987654321",
      messageId: "msg-1",
      message: "Reply",
    },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: "OK",
    message: "Message replied successfully",
    data: {
      chatId: "51987654321",
      messageId: "msg-1",
      message: "Reply",
    },
  });
  assert.deepEqual(calls.replyMessage, [["51987654321", "msg-1", "Reply"]]);
});

test("ReplyMessageController returns 400 for invalid payloads", async () => {
  const { services } = createServices();
  const controller = new ReplyMessageController();
  const context = createContext({
    body: {
      chatId: "51987654321",
      messageId: "msg-1",
      message: "",
    },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.match(String(body.message), /message/i);
});

test("ReplyMessageController returns 400 for InvalidMessageDataError", async () => {
  const { services } = createServices({
    replyMessage: {
      run: async () => {
        throw new InvalidMessageDataError("Invalid reply data");
      },
    },
  });
  const controller = new ReplyMessageController();
  const context = createContext({
    body: { chatId: "51987654321", messageId: "msg-1", message: "Reply" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Invalid reply data");
});

test("ReplyMessageController returns 400 for InvalidPhoneNumberError", async () => {
  const { services } = createServices({
    replyMessage: {
      run: async () => {
        throw new InvalidPhoneNumberError("Invalid phone");
      },
    },
  });
  const controller = new ReplyMessageController();
  const context = createContext({
    body: { chatId: "51987654321", messageId: "msg-1", message: "Reply" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Invalid phone");
});

test("ReplyMessageController returns 400 for EmptyMessageContentError", async () => {
  const { services } = createServices({
    replyMessage: {
      run: async () => {
        throw new EmptyMessageContentError("Empty reply content");
      },
    },
  });
  const controller = new ReplyMessageController();
  const context = createContext({
    body: { chatId: "51987654321", messageId: "msg-1", message: "Reply" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Empty reply content");
});

test("ReplyMessageController maps missing target messages to 404", async () => {
  const { services } = createServices({
    replyMessage: {
      run: async () => {
        throw new RecipientNotFoundError("Target message not found");
      },
    },
  });
  const controller = new ReplyMessageController();
  const context = createContext({
    body: {
      chatId: "51987654321",
      messageId: "msg-1",
      message: "Reply",
    },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    status: "Not Found",
    message: "Target message not found",
  });
});

test("BroadcastMessageController returns 200 for a valid payload", async () => {
  const { calls, services } = createServices();
  const controller = new BroadcastMessageController();
  const context = createContext({
    body: {
      chatIds: ["51987654321", "51987654322"],
      message: "Group update",
    },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: "OK",
    message: "Broadcast message sent successfully",
    data: {
      chatIds: ["51987654321", "51987654322"],
      message: "Group update",
    },
  });
  assert.deepEqual(calls.broadcastMessage, [
    [["51987654321", "51987654322"], "Group update", env.BROADCAST_DELAY_MS],
  ]);
});

test("BroadcastMessageController returns 400 for invalid payloads", async () => {
  const { services } = createServices();
  const controller = new BroadcastMessageController();
  const context = createContext({
    body: {
      chatIds: [],
      message: "Group update",
    },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.match(String(body.message), /chatIds/i);
});

test("BroadcastMessageController returns 400 for InvalidMessageDataError", async () => {
  const { services } = createServices({
    broadcastMessage: {
      run: async () => {
        throw new InvalidMessageDataError("Invalid broadcast data");
      },
    },
  });
  const controller = new BroadcastMessageController();
  const context = createContext({
    body: { chatIds: ["51987654321"], message: "Hello" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Invalid broadcast data");
});

test("BroadcastMessageController returns 400 for InvalidPhoneNumberError", async () => {
  const { services } = createServices({
    broadcastMessage: {
      run: async () => {
        throw new InvalidPhoneNumberError("Invalid number");
      },
    },
  });
  const controller = new BroadcastMessageController();
  const context = createContext({
    body: { chatIds: ["51987654321"], message: "Hello" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Invalid number");
});

test("BroadcastMessageController returns 400 for EmptyMessageContentError", async () => {
  const { services } = createServices({
    broadcastMessage: {
      run: async () => {
        throw new EmptyMessageContentError("Empty broadcast content");
      },
    },
  });
  const controller = new BroadcastMessageController();
  const context = createContext({
    body: { chatIds: ["51987654321"], message: "Hello" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 400);
  assert.equal(body.status, "Bad Request");
  assert.equal(body.message, "Empty broadcast content");
});

test("BroadcastMessageController returns 404 for RecipientNotFoundError", async () => {
  const { services } = createServices({
    broadcastMessage: {
      run: async () => {
        throw new RecipientNotFoundError("Recipient not found");
      },
    },
  });
  const controller = new BroadcastMessageController();
  const context = createContext({
    body: { chatIds: ["51987654321"], message: "Hello" },
    services,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 404);
  assert.equal(body.status, "Not Found");
  assert.equal(body.message, "Recipient not found");
});

test("QRCodeController returns 202 when the QR code is not available yet", async () => {
  const controller = new QRCodeController();
  const context = createContext({
    body: {},
    services: {} as ServicesContainer,
  });

  const response = await controller.run(context);
  const body = await readJsonResponse(response);

  assert.equal(response.status, 202);
  assert.deepEqual(body, {
    message: "QR code not available yet. Please try again.",
    status: "disconnected",
  });
});

// QRCodeController additional states (ready, qr available, error) require
// module-level mocking not available in Node.js 18. They should be added
// when upgrading to Node.js 22+ where mock.module() is supported.
