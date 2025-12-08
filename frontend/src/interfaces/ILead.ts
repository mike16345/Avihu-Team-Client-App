import { ApiResponse } from "@/types/ApiTypes";

export type CreateLeadBody = {
  fullName: string;
  email: string;
  phone?: string;
  deviceId?: string;
  registeredAt?: string;
};

export type Lead = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  deviceId?: string;
  ip?: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadResponse = ApiResponse<Lead>;
