export type Timezone =
  | "UTC"
  | "America/New_York"
  | "America/Los_Angeles"
  | "Europe/London"
  | "Europe/Paris"
  | "Asia/Tokyo"
  | "Asia/Jerusalem"
  | "Australia/Sydney";

export type DateAndValue = { date: Date; value: any };
export type DateFormatType =
  | "YYYY-MM-DD"
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "MM/YYYY"
  | "DD/MM"
  | "YYYY"
  | "MMMM"
  | "MM"
  | "YY"
  | "DD";

export type DateRanges = "hours" | "days" | "weeks" | "months" | "years";
export type ItemsInDateRangeParams<T> = {
  items: T[];
  dateKey: keyof T;
  n: number;
  range: DateRanges;
};
