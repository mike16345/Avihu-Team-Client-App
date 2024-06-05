import moment from "moment-timezone";
import type {
  DateAndValue,
  DateFormatType,
  DateRanges,
  ItemsInDateRangeParams,
  Timezone,
} from "../types/dateTypes";

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

  static formatDate(date: Date, formatType: DateFormatType = "DD/MM/YYYY"): string {
    return moment(date).format(formatType);
  }

  static getCurrentDate(formatType: DateFormatType, timezone: Timezone = "Asia/Jerusalem"): string {
    return moment().tz(timezone).format(formatType);
  }

  static get(date: Date, dateAspect: "day" | "month" | "year"): string {
    return moment(date).format(dateAspect);
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

  static getItemsInRange<T>(data: ItemsInDateRangeParams<T>): T[] {
    const { items, dateKey, n, range } = data;
    const now = new Date();
    let pastDate: Date;

    switch (range) {
      case "weeks":
        pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - n * 7);
        break;
      case "months":
        pastDate = new Date(now.getFullYear(), now.getMonth() - n, now.getDate());
        break;
      case "years":
        pastDate = new Date(now.getFullYear() - n, now.getMonth(), now.getDate());
        break;
      default:
        throw new Error("Invalid range. Use 'weeks', 'months', or 'years'.");
    }

    return items.filter((item) => {
      let itemDate = item[dateKey] as any;

      if (!(itemDate instanceof Date)) {
        itemDate = new Date(itemDate);
      }

      if (isNaN(itemDate.getTime())) {
        throw new Error(`'${String(dateKey)}' is not a valid date`);
      }

      return itemDate >= pastDate && itemDate <= now;
    });
  }

  static extractLabels<T>(data: ItemsInDateRangeParams<T>) {
    switch (data.range) {
      case "weeks":
        return this.extractDayLabels(data);
      case "months":
        return this.extractMonthLabels(data);
      case "years":
        return this.extractYearLabels(data);
      default:
        throw new Error("Invalid range. Use  'days','months', or 'years'.");
    }
  }

  private static extractDayLabels<T>(data: ItemsInDateRangeParams<T>): string[] {
    const { items, dateKey, n, range } = data;
    const labelsSet: Set<string> = new Set();

    const currentDate = new Date();
    const endDate = new Date(currentDate.getTime() - n * this.getMillisecondsFromRange(range));

    for (const item of items) {
      const itemDate = new Date(item[dateKey] as any); // Assuming dateKey is of type Date

      if (itemDate >= endDate && itemDate <= currentDate) {
        const label = this.formatDate(itemDate, "DD/MM");
        labelsSet.add(label);
      }
    }
    return Array.from(labelsSet);
  }

  private static getMillisecondsFromRange(range: DateRanges): number {
    switch (range) {
      case "hours":
        return 3600 * 1000;
      case "days":
        return 24 * 3600 * 1000;
      case "weeks":
        return 7 * 24 * 3600 * 1000;
      case "months":
        return 30 * 24 * 3600 * 1000; // Approximation for a month
      case "years":
        return 365 * 24 * 3600 * 1000; // Approximation for a year
      default:
        throw new Error("Invalid range");
    }
  }

  private static extractMonthLabels<T>(data: ItemsInDateRangeParams<T>): string[] {
    const labels: string[] = [];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Find the first date of the current month
    const firstDateOfMonth = new Date(currentYear, currentMonth, 1);

    for (let i = 0; i < 5; i++) {
      const weekStartDate = new Date(
        firstDateOfMonth.getTime() + i * this.getMillisecondsFromRange("weeks")
      );
      const label = this.formatDate(weekStartDate, "DD/MM");
      labels.push(label);
    }

    return labels;
  }
  private static extractYearLabels<T>(data: ItemsInDateRangeParams<T>): string[] {
    const currentYear = new Date().getFullYear();
    const { items, dateKey, n } = data;

    let labels: string[] = [];

    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentYear, month, 1);
      const monthName = this.formatDate(monthDate, "MMMM");
      labels.push(monthName);
    }

    labels = labels.filter((month) => {
      let found = false;

      for (const item of items) {
        if (this.formatDate(item[dateKey] as Date, "MMMM") === month) {
          found = true;
          break;
        }
      }
      return found;
    });

    return labels.length > 5 ? labels.map((label) => label.slice(0, 3)) : labels;
  }

  static convertToDate(date: string): Date {
    return new Date(date);
  }
}

export default DateUtils;
