export interface IToast {
  title: string;
  message: string;
  type: "success" | "error";
  duration?: number;
}
