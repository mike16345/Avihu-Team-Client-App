import { FormPresetType, FormQuestion, FormSection } from "./FormPreset";

export interface IFormResponse {
  _id: string;
  formId: string;
  userId: string;
  submittedAt: string;
  sections: FormSection[]; // Keeping it simple for now
  formTitle?: string;
  formType?: FormPresetType;
}

export interface IAgreement {
  agreementId: string;
  version: string;
  pdfUrl: string;
  questions: FormQuestion[];
}
