import { EmptyMessageContentError } from "@/lib/Whatsapp/domain/exceptions/EmptyMessageContentError";

export class MessageContent {
  public readonly value: string;

  constructor(value: string) {
    this.validateContent(value);
    this.value = value.trim();
  }

  private validateContent(value: string) {
    if (value.trim().length < 1) {
      throw new EmptyMessageContentError(
        "Message must be at least 1 characters long",
      );
    }
  }
}
