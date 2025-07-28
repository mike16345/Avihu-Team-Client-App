import { View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Calendar, LocaleConfig, DateData } from "react-native-calendars";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "../Icon/Icon";
import { Text } from "../ui/Text";
import moment from "moment";
import { ConditionalRender } from "../ui/ConditionalRender";

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

interface CustomCalendarProps {
  selectedDate?: string;
  onSelect: (date: string) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ onSelect, selectedDate }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const [currentDate, setCurrentDate] = useState(selectedDate || moment().format("YYYY-MM-DD"));
  const [selected, setSelected] = useState(selectedDate || moment().format("YYYY-MM-DD"));
  const [showMonths, setShowMonths] = useState(false);

  const today = moment().format("YYYY-MM-DD");
  const month = moment(currentDate).month();
  const year = moment(currentDate).year();

  const isActiveMonth = (index: number) => month === index;

  const handleSelect = (day: DateData) => {
    const date = day.dateString;

    setSelected(date);
    onSelect(date);
  };

  const goToNextMonth = () => {
    const next = moment(currentDate).add(1, "month").format("YYYY-MM-DD");
    setCurrentDate(next);
  };

  const goToPreviousMonth = () => {
    const prev = moment(currentDate).subtract(1, "month").format("YYYY-MM-DD");
    setCurrentDate(prev);
  };

  return (
    <View style={[{ position: "relative" }, common.rounded]}>
      <ConditionalRender condition={!showMonths}>
        <Calendar
          style={[common.rounded]}
          key={currentDate}
          current={currentDate}
          onDayPress={handleSelect}
          markingType="custom"
          markedDates={{
            [selected]: {
              customStyles: {
                container: {
                  backgroundColor: colors.backgroundSuccessContainer.backgroundColor,
                  borderRadius: common.rounded.borderRadius,
                },
                text: {
                  color: colors.textPrimary.color,
                },
              },
              disableTouchEvent: true,
              selected: true,
            },
            [today]: {
              customStyles: {
                container: {
                  backgroundColor: colors.backgroundPrimary.backgroundColor,
                  borderRadius: common.rounded.borderRadius,
                },
                text: {
                  color: colors.textOnPrimary.color,
                },
              },
            },
          }}
          renderHeader={() => (
            <View
              style={[
                layout.flexRow,
                layout.justifyBetween,
                layout.itemsCenter,
                layout.widthFull,
                spacing.pdVerticalDefault,
              ]}
            >
              <TouchableOpacity
                style={[layout.flexRow, spacing.gapXs, layout.itemsCenter]}
                onPress={() => setShowMonths(true)}
              >
                <Text style={fonts.lg}>
                  {LocaleConfig.locales["il"].monthNames[month]} {moment(currentDate).year()}
                </Text>
                <Icon name="chevronLeftSoft" height={18} width={25} />
              </TouchableOpacity>

              <View style={[layout.flexRow, spacing.gapDefault]}>
                <TouchableOpacity onPress={goToPreviousMonth}>
                  <Icon name="chevronRightSoft" height={18} width={18} />
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextMonth}>
                  <Icon name="chevronLeftSoft" height={18} width={18} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          hideArrows
        />
      </ConditionalRender>

      <ConditionalRender condition={showMonths}>
        <View
          style={[
            { position: "absolute", top: 0, right: 0 },
            layout.flex1,
            colors.backgroundSurface,
            common.rounded,
          ]}
        >
          <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter, spacing.pdLg]}>
            <Text>חודשים</Text>
            <TouchableOpacity onPress={() => setShowMonths(false)}>
              <Icon name="close" />
            </TouchableOpacity>
          </View>

          <View style={[layout.flexRow, layout.wrap, layout.center]}>
            {LocaleConfig.locales["il"].monthNames.map((month: string, i: number) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setCurrentDate(moment().year(year).month(i).date(1).format("YYYY-MM-DD"));
                  setShowMonths(false);
                }}
                style={[
                  spacing.pdDefault,
                  common.rounded,
                  { width: 90 },
                  isActiveMonth(i) && colors.backgroundPrimary,
                ]}
              >
                <Text
                  style={[text.textBold, text.textCenter, isActiveMonth(i) && colors.textOnPrimary]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ConditionalRender>
    </View>
  );
};

export default CustomCalendar;
