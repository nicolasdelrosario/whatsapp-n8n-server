import assert from "node:assert/strict";
import { test } from "node:test";
import { BroadcastMessage } from "../src/lib/Whatsapp/domain/model/BroadcastMessage";
import { Message } from "../src/lib/Whatsapp/domain/model/Message";
import { ReplyMessage } from "../src/lib/Whatsapp/domain/model/ReplyMessage";
import { ChatId } from "../src/lib/Whatsapp/domain/value-objects/ChatId";
import { MessageContent } from "../src/lib/Whatsapp/domain/value-objects/MessageContent";
import { MessageId } from "../src/lib/Whatsapp/domain/value-objects/MessageId";

test("ChatId trims and validates phone numbers", () => {
  const chatId = new ChatId(" 51987654321 ");

  assert.equal(chatId.value, "51987654321");
});

test("ChatId rejects invalid phone numbers", () => {
  assert.throws(() => new ChatId("abc"), {
    message: "ChatId must be valid",
  });
});

test("MessageContent trims and rejects empty content", () => {
  const content = new MessageContent("  hello  ");

  assert.equal(content.value, "hello");
  assert.throws(() => new MessageContent("   "), {
    message: "Message must be at least 1 characters long",
  });
});

test("MessageId rejects empty values", () => {
  assert.equal(new MessageId("message-1").value, "message-1");

  assert.throws(() => new MessageId("   "), {
    message: "MessageId cannot be empty",
  });
});

test("Message serializes to primitives", () => {
  const message = new Message(
    new ChatId("51987654321"),
    new MessageContent("Hello"),
  );

  assert.deepEqual(message.toPrimitives(), {
    chatId: "51987654321",
    message: "Hello",
  });
});

test("ReplyMessage serializes to primitives", () => {
  const replyMessage = new ReplyMessage(
    new ChatId("51987654321"),
    new MessageId("abc-123"),
    new MessageContent("Hello"),
  );

  assert.deepEqual(replyMessage.toPrimitives(), {
    chatId: "51987654321",
    messageId: "abc-123",
    message: "Hello",
  });
});

test("BroadcastMessage serializes to primitives", () => {
  const broadcastMessage = new BroadcastMessage(
    [new ChatId("51987654321"), new ChatId("51987654322")],
    new MessageContent("Hello everyone"),
  );

  assert.deepEqual(broadcastMessage.toPrimitives(), {
    chatIds: ["51987654321", "51987654322"],
    message: "Hello everyone",
  });
});
