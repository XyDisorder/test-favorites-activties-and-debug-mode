import { useSnackbar, useAuth } from "@/hooks";
import CreateFavorite from "@/graphql/mutations/favorite/createFavorite";
import DeleteFavorite from "@/graphql/mutations/favorite/deleteFavorite";
import GetAllFavorites from "@/graphql/queries/favorite/getAllFavorites";
import {
  CreateFavoriteMutation,
  CreateFavoriteMutationVariables,
  DeleteFavoriteMutation,
  DeleteFavoriteMutationVariables,
} from "@/graphql/generated/types";
import { useMutation } from "@apollo/client";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { ActionIcon, Loader } from "@mantine/core";
import { useState, useEffect } from "react";
import { useFavoriteStore } from "@/stores/favoriteStore";

interface FavoriteButtonProps {
  activityId: string;
  isFavorite: boolean | null | undefined;
}

export function FavoriteButton({ activityId, isFavorite }: FavoriteButtonProps) {
  const { user } = useAuth();
  const snackbar = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const favorites = useFavoriteStore((state) => state.favorites);
  const setFavorite = useFavoriteStore((state) => state.setFavorite);
  const [isMounted, setIsMounted] = useState(false);

  // Only use store after mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize store with prop value if not already set
  useEffect(() => {
    if (isMounted) {
      const storeValue = favorites[activityId];
      if (storeValue === undefined && isFavorite !== null && isFavorite !== undefined) {
        setFavorite(activityId, isFavorite);
      }
    }
  }, [activityId, isFavorite, isMounted, favorites, setFavorite]);

  // Get favorite state from store, fallback to prop (only after mount)
  const storeFavorite = isMounted ? favorites[activityId] : undefined;
  const displayFavorite = storeFavorite !== undefined ? storeFavorite : (isFavorite ?? false);

  const [createFavorite] = useMutation<
    CreateFavoriteMutation,
    CreateFavoriteMutationVariables
  >(CreateFavorite as any, {
    refetchQueries: [GetAllFavorites],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setFavorite(activityId, true);
      snackbar.success("Activité ajoutée aux favoris");
    },
    onError: () => {
      setFavorite(activityId, displayFavorite);
      snackbar.error("Erreur lors de l'ajout aux favoris");
    },
  });

  const [deleteFavorite] = useMutation<
    DeleteFavoriteMutation,
    DeleteFavoriteMutationVariables
  >(DeleteFavorite as any, {
    refetchQueries: [GetAllFavorites],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setFavorite(activityId, false);
      snackbar.success("Activité retirée des favoris");
    },
    onError: () => {
      setFavorite(activityId, displayFavorite);
      snackbar.error("Erreur lors de la suppression des favoris");
    },
  });

  const handleToggleFavorite = async () => {
    if (!user) {
      snackbar.error("Vous devez être connecté pour ajouter aux favoris");
      return;
    }

    // Optimistic update in store
    setFavorite(activityId, !displayFavorite);
    setIsLoading(true);

    try {
      if (displayFavorite) {
        await deleteFavorite({ variables: { activityId } });
      } else {
        await createFavorite({
          variables: {
            createFavoriteInput: { activityId },
          },
        });
      }
    } catch (error) {
      // Error handled in onError callbacks
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ActionIcon
      variant="subtle"
      color={displayFavorite ? "red" : "gray"}
      onClick={handleToggleFavorite}
      loading={isLoading}
      disabled={isLoading}
      aria-label={displayFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {isLoading ? (
        <Loader size="sm" />
      ) : displayFavorite ? (
        <IconHeartFilled size={20} />
      ) : (
        <IconHeart size={20} />
      )}
    </ActionIcon>
  );
}
