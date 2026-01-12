import { FormPresetType } from "./FormPreset";

export interface IFormResponse {
  _id: string;
  formId: string;
  userId: string;
  submittedAt: string;
  sections: any[]; // Keeping it simple for now
  formTitle?: string;
  formType?: FormPresetType;
}
