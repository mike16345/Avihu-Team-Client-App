import { fetchData, updateItem } from "@/API/api";
import { IArticle, IArticleCount } from "@/interfaces/IArticle";
import { PaginationParams, PaginationResult } from "@/interfaces/IPagination";
import { ApiResponse } from "@/types/ApiTypes";

const BLOGS_API_ENDPOINT = "blogs";

export const useArticleApi = () => {
  const getPaginatedPosts = async (pagination: PaginationParams) => {
    const response = await fetchData<ApiResponse<PaginationResult<IArticle>>>(
      `${BLOGS_API_ENDPOINT}/paginate?page=${pagination.page}&limit=${
        pagination.limit
      }&query=${JSON.stringify(pagination.query)}`
    );

    return response.data;
  };

  const getPostCountByGroup = async () =>
    fetchData<ApiResponse<IArticleCount[]>>(`${BLOGS_API_ENDPOINT}/count`).then((res) => res.data);

  const changeLikedStatus = async (id: string, userId: string) =>
    await updateItem<ApiResponse<IArticle>>(`${BLOGS_API_ENDPOINT}/one/like`, { id, userId }).then(
      (res) => res.data
    );

  const addViewer = async (id: string, userId: string) =>
    await updateItem<ApiResponse<IArticle>>(`${BLOGS_API_ENDPOINT}/one/viewer`, {
      id,
      userId,
    }).then((res) => res.data);

  return { getPaginatedPosts, getPostCountByGroup, changeLikedStatus, addViewer };
};
