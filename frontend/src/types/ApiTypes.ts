export type UpdateDocumentResponse = {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId: string | null;
  upsertedCount: number;
  matchedCount: number;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
};
