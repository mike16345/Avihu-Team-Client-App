export interface IToast {
  id?: string;
  title?: string;
  message?: string;
  type: "success" | "error";
  duration?: number;
  isModalToast?: boolean;
}
