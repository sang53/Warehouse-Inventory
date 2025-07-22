export interface Message {
  user: string;
  text: string;
  added?: Date;
}

export const messages: Message[] = [
  {
    text: "Hi there!",
    user: "Amando",
    added: new Date(),
  },
  {
    text: "Hello World!",
    user: "Charles",
    added: new Date(),
  },
];
