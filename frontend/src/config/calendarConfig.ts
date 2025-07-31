import { LocaleConfig } from "react-native-calendars";

export const monthNames = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

export const monthNamesShort = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יונ",
  "יול",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצ",
];
export const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
export const dayNamesShort = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
export const today = "היום";

export const setupCalendarLocale = () => {
  LocaleConfig.locales["he"] = {
    monthNames,
    monthNamesShort,
    dayNames,
    dayNamesShort,
    today,
  };

  LocaleConfig.defaultLocale = "he";
};
