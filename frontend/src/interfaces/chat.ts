export interface IChatMessage {
  variant: "response" | "prompt";
  text: string;
}
