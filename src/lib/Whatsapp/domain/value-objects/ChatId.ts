export class ChatId {
  public readonly value: string;

  constructor(value: string) {
    this.validateChatId(value);
    this.value = value.trim();
  }

  private validateChatId(chatId: string): void {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (!phoneRegex.test(chatId.trim())) {
      throw new Error("ChatId must be valid");
    }
  }
}
