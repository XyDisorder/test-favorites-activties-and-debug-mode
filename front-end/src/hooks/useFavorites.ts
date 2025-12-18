import { useQuery } from "@apollo/client";
import { useEffect, useState, useMemo } from "react";
import GetAllFavorites from "@/graphql/queries/favorite/getAllFavorites";
import GetActivity from "@/graphql/queries/activity/getActivity";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetAllFavoritesQuery,
  GetActivityQuery,
  GetActivityQueryVariables,
} from "@/graphql/generated/types";
import { FavoriteItem } from "@/components/FavoriteList/types";

export function useFavorites() {
  const { data, loading, refetch } = useQuery<GetAllFavoritesQuery>(GetAllFavorites, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  
  const favorites = useMemo(
    () => data?.getAllFavoritesByUserId || [],
    [data?.getAllFavoritesByUserId]
  );
  
  const sortedFavorites = useMemo(
    () => [...favorites].sort((a, b) => a.order - b.order),
    [favorites]
  );
  
  const favoritesKey = useMemo(
    () => sortedFavorites.map((f) => `${f.id}:${f.order}`).join(","),
    [sortedFavorites]
  );

  const [favoritesWithActivities, setFavoritesWithActivities] = useState<
    FavoriteItem[]
  >([]);

  useEffect(() => {
    // Reset state when favorites change
    setFavoritesWithActivities([]);
    
    const fetchActivities = async () => {
      const favoritesWithData = await Promise.all(
        sortedFavorites.map(async (favorite) => {
          try {
            const { data: activityData } = await graphqlClient.query<
              GetActivityQuery,
              GetActivityQueryVariables
            >({
              query: GetActivity,
              variables: { id: favorite.activityId },
              fetchPolicy: "cache-first",
            });
            return {
              ...favorite,
              activity: activityData?.getActivity
                ? {
                    id: activityData.getActivity.id,
                    name: activityData.getActivity.name,
                    city: activityData.getActivity.city,
                    description: activityData.getActivity.description,
                    price: activityData.getActivity.price,
                    isFavorite: activityData.getActivity.isFavorite ?? null,
                  }
                : undefined,
            };
          } catch (error) {
            return { ...favorite, activity: undefined };
          }
        })
      );
      setFavoritesWithActivities(favoritesWithData);
    };

    if (sortedFavorites.length > 0) {
      fetchActivities();
    } else {
      setFavoritesWithActivities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoritesKey]);

  return {
    favorites: favoritesWithActivities,
    loading,
    refetch,
  };
}

