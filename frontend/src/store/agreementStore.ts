import { IAgreement } from "@/interfaces/IFormResponse";
import { create } from "zustand";

interface IAgreementStore {
  currentAgreement: IAgreement | null;
  setCurrentAgreement: (agreement: IAgreement | null) => void;
}

export const useCurrentAgreementStore = create<IAgreementStore>((set) => ({
  currentAgreement: null,
  setCurrentAgreement: (currentAgreement: IAgreement | null) => set({ currentAgreement }),
}));
