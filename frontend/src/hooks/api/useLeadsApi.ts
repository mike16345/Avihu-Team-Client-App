import { sendData } from "@/API/api";
import { CreateLeadBody, Lead, LeadResponse } from "@/interfaces/ILead";

export function useLeadsApi() {
  const base = "leads";

  const create = async (body: CreateLeadBody): Promise<Lead> => {
    const response = await sendData<LeadResponse>(base, body);
    return response.data;
  };

  return {
    create,
  };
}
