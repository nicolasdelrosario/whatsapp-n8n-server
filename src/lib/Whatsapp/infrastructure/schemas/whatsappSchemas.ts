import { z } from "zod";

const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, "chatId is required")
  .regex(/^\+?[1-9]\d{1,14}$/, "chatId must be a valid phone number");

const messageSchema = z.string().trim().min(1, "message is required");

export const sendMessageSchema = z.object({
  chatId: phoneNumberSchema,
  message: messageSchema,
});

export const replyMessageSchema = z.object({
  chatId: phoneNumberSchema,
  messageId: z.string().trim().min(1, "messageId is required"),
  message: messageSchema,
});

export const broadcastMessageSchema = z.object({
  chatIds: z
    .array(phoneNumberSchema)
    .min(1, "chatIds must contain at least one recipient"),
  message: messageSchema,
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ReplyMessageInput = z.infer<typeof replyMessageSchema>;
export type BroadcastMessageInput = z.infer<typeof broadcastMessageSchema>;
