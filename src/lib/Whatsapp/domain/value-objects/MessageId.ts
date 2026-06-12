export class MessageId {
  public readonly value: string;

  constructor(value: string) {
    this.validateMessageId(value);
    this.value = value;
  }

  private validateMessageId(id: string): void {
    if (!id || id.trim().length === 0)
      throw new Error("MessageId cannot be empty");
  }
}
