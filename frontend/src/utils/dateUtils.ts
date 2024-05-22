import moment from "moment-timezone";
import { DateAndValue, Timezone } from "../types/dateTypes";

class DateUtils {
  static sortByDate(values: DateAndValue[], order: "asc" | "desc"): { date: Date; value: any }[] {
    return values.sort((a, b) => {
      if (order === "asc") {
        return a.date.getTime() - b.date.getTime();
      } else {
        return b.date.getTime() - a.date.getTime();
      }
    });
  }

  static formatDate(date: Date, formatType: string): string {
    return moment(date).format(formatType);
  }

  static getCurrentDate(formatType: string, timezone: Timezone = "Asia/Jerusalem"): string {
    return moment().tz(timezone).format(formatType);
  }

  static addDaysToDate(date: Date, days: number): Date {
    return moment(date).add(days, "days").toDate();
  }

  static subtractDaysFromDate(date: Date, days: number): Date {
    return moment(date).subtract(days, "days").toDate();
  }

  static getDaysDifference(startDate: Date, endDate: Date): number {
    return moment(endDate).diff(startDate, "days");
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return moment(date1).isSame(date2, "day");
  }
}

export default DateUtils;
