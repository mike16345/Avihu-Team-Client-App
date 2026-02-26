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
  version: number;
  pdfUrl: string;
  questions: FormQuestion[];
}

export interface ISignedAgreement {
  agreementId: string;
  agreementVersion: number;
  answers: IAgreementAnswer[];
  signaturePngBase64: string;
  userId: string;
  groupId?: string;
  userDisplayName?: string;
}

export type AgreementAnswerValue = string | number | boolean | string[] | null;

export interface IAgreementAnswer {
  questionId: string;
  value: AgreementAnswerValue;
}
