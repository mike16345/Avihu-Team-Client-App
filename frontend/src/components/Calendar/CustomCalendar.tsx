import { View, Text } from "react-native";
import React from "react";
import { Calendar, CalendarProvider, LocaleConfig } from "react-native-calendars";

LocaleConfig.locales["il"] = {
  monthNames: [
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
  ],
  monthNamesShort: [
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
    "דצמ",
  ],
  dayNames: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
  dayNamesShort: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"],
  today: "היום",
};

LocaleConfig.defaultLocale = "il";
const CustomCalendar = () => {
  return (
    <View>
      <Text>CustomCalendar</Text>
      <Calendar enableSwipeMonths />
    </View>
  );
};

export default CustomCalendar;
