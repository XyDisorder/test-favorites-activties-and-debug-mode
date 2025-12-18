import { useMutation } from "@apollo/client";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";
import ReorderFavorites from "@/graphql/mutations/favorite/reorderFavorites";
import {
  ReorderFavoritesMutation,
  ReorderFavoritesMutationVariables,
} from "@/graphql/generated/types";
import { useSnackbar } from "@/hooks";
import { FavoriteItem } from "@/components/FavoriteList/types";

export function useReorderFavorites(
  favorites: FavoriteItem[],
  onSuccess?: () => void
) {
  const snackbar = useSnackbar();
  
  const [reorderFavorites] = useMutation<
    ReorderFavoritesMutation,
    ReorderFavoritesMutationVariables
  >(ReorderFavorites as any, {
    onCompleted: () => {
      snackbar.success("Ordre des favoris mis à jour");
      onSuccess?.();
    },
    onError: () => {
      snackbar.error("Erreur lors de la mise à jour de l'ordre");
      onSuccess?.();
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = favorites.findIndex((f) => f.id === active.id);
    const newIndex = favorites.findIndex((f) => f.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(favorites, oldIndex, newIndex);

    reorderFavorites({
      variables: {
        reorderFavoritesInput: {
          favorites: newOrder.map((favorite, index) => ({
            favoriteId: favorite.id,
            order: index,
          })),
        },
      },
    });
  };

  return { handleDragEnd };
}

