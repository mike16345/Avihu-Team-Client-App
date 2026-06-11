import { useArticleApi } from "@/hooks/api/useArticleApi";
import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { getArticleCountQueryOptions } from "@/hooks/queries/articles/useArticleCountQuery";
import { getDietPlanQueryOptions } from "@/hooks/queries/useDietPlanQuery";
import { getWorkoutPlanQueryOptions } from "@/hooks/queries/useWorkoutPlanQuery";
import { useUserStore } from "@/store/userStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const useStartupPrefetch = () => {
  const queryClient = useQueryClient();
  const currentUser = useUserStore((state) => state.currentUser);
  const { getWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { getDietPlanByUserId } = useDietPlanApi();
  const { getPostCountByGroup } = useArticleApi();

  const prefetchedUserDataRef = useRef<string | null>(null);
  const prefetchedArticleGroupsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUser?._id) return;
    if (prefetchedUserDataRef.current === currentUser._id) return;

    prefetchedUserDataRef.current = currentUser._id;

    let cancelled = false;

    const prefetchUserData = async () => {
      if (cancelled) return;

      const results = await Promise.allSettled([
        queryClient.prefetchQuery(
          getWorkoutPlanQueryOptions(currentUser._id, getWorkoutPlanByUserId)
        ),
        queryClient.prefetchQuery(getDietPlanQueryOptions(currentUser._id, getDietPlanByUserId)),
      ]);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const label = index === 0 ? "workout plan" : "diet plan";
          console.error(`Error prefetching ${label}:`, result.reason);
        }
      });
    };

    prefetchUserData();

    return () => {
      cancelled = true;
    };
  }, [currentUser?._id, getDietPlanByUserId, getWorkoutPlanByUserId, queryClient]);

  useEffect(() => {
    const userId = currentUser?._id;
    const planType = currentUser?.planType;

    if (!userId || !planType) return;

    const articleGroupKey = `${userId}:${planType}`;
    if (prefetchedArticleGroupsRef.current === articleGroupKey) return;

    prefetchedArticleGroupsRef.current = articleGroupKey;

    let cancelled = false;

    const prefetchArticleGroups = async () => {
      if (cancelled) return;

      try {
        await queryClient.prefetchQuery(getArticleCountQueryOptions(planType, getPostCountByGroup));
      } catch (error) {
        console.error("Error prefetching article groups:", error);
      }
    };

    prefetchArticleGroups();

    return () => {
      cancelled = true;
    };
  }, [currentUser?._id, currentUser?.planType, getPostCountByGroup, queryClient]);
};

export default useStartupPrefetch;
