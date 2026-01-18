export type FormPresetType = "onboarding" | "monthly" | "general";

export type FormQuestionType =
  | "text"
  | "textarea"
  | "radio"
  | "range"
  | "file-upload"
  | "checkboxes"
  | "drop-down"
  | "yes-no";

export interface FormQuestion {
  _id: string;
  type: FormQuestionType;
  question: string;
  description?: string;
  required: boolean;
  options?: string[];
}

export interface FormSection {
  _id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
}

export interface FormPreset {
  _id: string;
  name: string;
  type: FormPresetType;
  showOn?: string;
  repeatMonthly: boolean;
  sections: FormSection[];
  createdAt: string;
  updatedAt: string;
}

export interface FormResponseQuestionPayload {
  _id: string;
  type: FormQuestionType;
  question: string;
  answer: unknown;
}

export interface FormResponseSectionPayload {
  _id: string;
  title: string;
  questions: FormResponseQuestionPayload[];
}

export interface FormResponsePayload {
  formId: string;
  userId: string;
  submittedAt: string;
  sections: FormResponseSectionPayload[];
}
