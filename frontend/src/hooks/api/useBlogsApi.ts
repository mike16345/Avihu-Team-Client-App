import { fetchData, updateItem } from "@/API/api";
import { IBlog, IBlogCount } from "@/interfaces/IBlog";
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

  const getPostCountByGroup = async () =>
    fetchData<ApiResponse<IBlogCount[]>>(`${BLOGS_API_ENDPOINT}/count`).then((res) => res.data);

  const changeLikedStatus = async (id: string, userId: string) =>
    await updateItem<ApiResponse<IBlog>>(`${BLOGS_API_ENDPOINT}/one/like`, { id, userId }).then(
      (res) => res.data
    );

  const addViewer = async (id: string, userId: string) =>
    await updateItem<ApiResponse<IBlog>>(`${BLOGS_API_ENDPOINT}/one/viewer`, { id, userId }).then(
      (res) => res.data
    );

  return { getPaginatedPosts, getPostCountByGroup, changeLikedStatus, addViewer };
};
