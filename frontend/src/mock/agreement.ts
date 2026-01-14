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
  pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // A dummy pdf
  questions: [
    {
      _id: "q1",
      type: "radio",
      question: "Are you over 18 years old?",
      required: true,
      options: ["Yes", "No"],
    },
    {
      _id: "q2",
      type: "text",
      question: "What is your full name?",
      required: true,
    },
    {
      _id: "q3",
      type: "textarea",
      question: "Do you have any medical conditions we should be aware of?",
      required: false,
      description: "Please list any conditions or medications.",
    },
    {
      _id: "q4",
      type: "text", // Using 'text' and will suggest numeric keyboard
      question: "What is your emergency contact number?",
      required: true,
    },
    {
      _id: "q5",
      type: "drop-down",
      question: "What is your primary fitness goal?",
      required: true,
      options: ["Weight Loss", "Muscle Gain", "General Health", "Sport-specific Training"],
    },
    {
      _id: "q6",
      type: "checkboxes",
      question: "Which days of the week are you available to train?",
      required: true,
      options: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    {
        _id: "q7",
        type: "text",
        question: "What is today's date?",
        required: true,
        description: "Please use DD/MM/YYYY format."
    }
  ],
};
