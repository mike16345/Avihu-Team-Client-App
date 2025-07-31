import { IconName } from "@/constants/iconMap";

interface IIndicator {
  name: string;
  icon: IconName;
}

export const indicators: IIndicator[] = [
  { name: "אימונים", icon: "dumbbell" },
  { name: 'צ"אט', icon: "chat" },
  { name: "דף הבית", icon: "home" },
  { name: "ארוחות", icon: "chefHat" },
  { name: "מאמרים", icon: "sideBar" },
];
