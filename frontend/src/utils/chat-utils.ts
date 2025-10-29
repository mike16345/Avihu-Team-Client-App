import { IChatMessage } from "@/interfaces/chat";
import { IUser } from "@/interfaces/User";

export const greetUser = (user: IUser | null, message: IChatMessage) => {
  if (!user) return "Hello";

  return message.language == "en"
    ? `Hi ${user.firstName} what can I help you with today?`
    : `שלום ${user.firstName} איך אפשר לעזור לך היום?`;
};
