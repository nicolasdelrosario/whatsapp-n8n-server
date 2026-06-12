export class ReplyMessage {
  public readonly value: string;

  constructor(value: string) {
    this.validateMessage(value);
    this.value = value;
  }

  private validateMessage(value: string) {
    if (value.length < 1)
      throw new Error("Message must be at least 1 characters long");
  }
}
