export type MonthlyFormStatusResponse =
  | {
      shouldShowMonthlyForm: false;
      reason:
        | "MONTHLY_FORM_ALREADY_SUBMITTED"
        | "NO_MONTHLY_FORM_PRESET"
        | "MISSING_USER";
    }
  | {
      shouldShowMonthlyForm: true;
      presetId: string;
      occurrenceKey: string;
      reason: "MONTHLY_FORM_NOT_SUBMITTED";
    };
