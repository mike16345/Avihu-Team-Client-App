import { fetchData } from "@/API/api";
import { IBlog } from "@/interfaces/IBlog";
import { PaginationParams, PaginationResult } from "@/interfaces/IPagination";
import { ApiResponse } from "@/types/ApiTypes";

const BLOGS_API_ENDPOINT = "blogs";

export const useBlogsApi = () => {
  const getPaginatedPosts = async (pagination: PaginationParams) => {
    const response = await fetchData<ApiResponse<PaginationResult<IBlog>>>(
      `${BLOGS_API_ENDPOINT}/paginate?_page=${pagination.page}&_limit=${pagination.limit}`
    );

    return response.data;
  };

  return { getPaginatedPosts };
};
