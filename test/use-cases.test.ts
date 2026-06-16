import assert from "node:assert/strict";
import { test } from "node:test";
import { BroadcastMessageUseCase } from "../src/lib/Whatsapp/application/use-cases/BroadcastMessageUseCase";
import { ReplyMessageUseCase } from "../src/lib/Whatsapp/application/use-cases/ReplyMessageUseCase";
import { SendMessageUseCase } from "../src/lib/Whatsapp/application/use-cases/SendMessageUseCase";
import type { BroadcastMessage } from "../src/lib/Whatsapp/domain/model/BroadcastMessage";
import type { Message } from "../src/lib/Whatsapp/domain/model/Message";
import type { ReplyMessage } from "../src/lib/Whatsapp/domain/model/ReplyMessage";
import type { WhatsappRepository } from "../src/lib/Whatsapp/domain/repository/WhatsappRepository";

function createRepositorySpy() {
  const calls = {
    sendMessage: [] as Message[],
    replyMessage: [] as ReplyMessage[],
    broadcastMessage: [] as Array<{ message: BroadcastMessage; delay: number }>,
  };

  const repository: WhatsappRepository = {
    sendMessage: async (message) => {
      calls.sendMessage.push(message);
    },
    replyMessage: async (message) => {
      calls.replyMessage.push(message);
    },
    broadcastMessage: async (message, delay) => {
      calls.broadcastMessage.push({ message, delay });
    },
  };

  return { calls, repository };
}

test("SendMessageUseCase builds a message model and delegates to the repository", async () => {
  const { calls, repository } = createRepositorySpy();
  const useCase = new SendMessageUseCase(repository);

  await useCase.run("51987654321", "Hello");

  assert.equal(calls.sendMessage.length, 1);
  assert.equal(calls.sendMessage[0]?.toPrimitives().chatId, "51987654321");
  assert.equal(calls.sendMessage[0]?.toPrimitives().message, "Hello");
});

test("SendMessageUseCase throws when chatId is invalid", async () => {
  const { repository } = createRepositorySpy();
  const useCase = new SendMessageUseCase(repository);

  await assert.rejects(() => useCase.run("abc", "Hello"), {
    message: "ChatId must be valid",
  });
});

test("SendMessageUseCase throws when message content is empty", async () => {
  const { repository } = createRepositorySpy();
  const useCase = new SendMessageUseCase(repository);

  await assert.rejects(() => useCase.run("51987654321", "   "), {
    message: "Message must be at least 1 characters long",
  });
});

test("ReplyMessageUseCase builds a reply model and delegates to the repository", async () => {
  const { calls, repository } = createRepositorySpy();
  const useCase = new ReplyMessageUseCase(repository);

  await useCase.run("51987654321", "msg-1", "Reply");

  assert.equal(calls.replyMessage.length, 1);
  assert.deepEqual(calls.replyMessage[0]?.toPrimitives(), {
    chatId: "51987654321",
    messageId: "msg-1",
    message: "Reply",
  });
});

test("ReplyMessageUseCase throws when messageId is empty", async () => {
  const { repository } = createRepositorySpy();
  const useCase = new ReplyMessageUseCase(repository);

  await assert.rejects(() => useCase.run("51987654321", "   ", "Reply"), {
    message: "MessageId cannot be empty",
  });
});

test("BroadcastMessageUseCase builds the broadcast model and forwards the delay", async () => {
  const { calls, repository } = createRepositorySpy();
  const useCase = new BroadcastMessageUseCase(repository);

  await useCase.run(["51987654321", "51987654322"], "Group update", 750);

  assert.equal(calls.broadcastMessage.length, 1);
  assert.deepEqual(calls.broadcastMessage[0]?.message.toPrimitives(), {
    chatIds: ["51987654321", "51987654322"],
    message: "Group update",
  });
  assert.equal(calls.broadcastMessage[0]?.delay, 750);
});

test("BroadcastMessageUseCase throws when a chatId in the array is invalid", async () => {
  const { repository } = createRepositorySpy();
  const useCase = new BroadcastMessageUseCase(repository);

  await assert.rejects(
    () => useCase.run(["51987654321", "abc"], "Group update", 750),
    { message: "ChatId must be valid" },
  );
});

test("BroadcastMessageUseCase throws when message content is empty", async () => {
  const { repository } = createRepositorySpy();
  const useCase = new BroadcastMessageUseCase(repository);

  await assert.rejects(
    () => useCase.run(["51987654321"], "   ", 750),
    { message: "Message must be at least 1 characters long" },
  );
});
