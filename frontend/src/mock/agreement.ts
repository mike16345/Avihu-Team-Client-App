import { FormQuestion } from "@/interfaces/FormPreset";

export interface IAgreement {
  agreementId: string;
  version: number;
  pdfUrl: string;
  questions: FormQuestion[];
}

export const mockAgreement: IAgreement = {
  agreementId: "AG-123",
  version: 1,
  pdfUrl: "https://www.irs.gov/pub/irs-pdf/f1040.pdf", // A dummy pdf
  questions: [
    {
      _id: "q1",
      type: "radio",
      question: "האם אתה מעל גיל 18",
      required: true,
      options: ["Yes", "No"],
    },
    {
      _id: "q2",
      type: "text",
      question: "שם מלא",
      required: true,
    },
    {
      _id: "q3",
      type: "textarea",
      question: "האם יש לך בעיות רפואיות?",
      required: false,
      description: "נא להציג תרופות או בעיות",
    },
    {
      _id: "q4",
      type: "text",
      question: "מספר טלפון למקרה חירום",
      required: true,
    },
    {
      _id: "q5",
      type: "drop-down",
      question: "מהי מטרת התהליך עבורך",
      required: true,
      options: ["Weight Loss", "Muscle Gain", "General Health", "Sport-specific Training"],
    },
    {
      _id: "q6",
      type: "checkboxes",
      question: "באילו ימים את/ה זמין להתאמן",
      required: true,
      options: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    {
      _id: "q7",
      type: "text",
      question: "תאריך של היום",
      required: true,
      description: "Please use DD/MM/YYYY format.",
    },
  ],
};
