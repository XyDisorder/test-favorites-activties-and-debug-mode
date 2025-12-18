import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Loader, Stack } from "@mantine/core";
import { useFavorites } from "@/hooks/useFavorites";
import { useReorderFavorites } from "@/hooks/useReorderFavorites";
import { SortableFavoriteItem } from "./SortableFavoriteItem";
import { EmptyState } from "./EmptyState";

export function FavoriteList() {
  const { favorites, loading, refetch } = useFavorites();
  const { handleDragEnd } = useReorderFavorites(favorites, () => refetch());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", padding: "2rem" }}>
        <Loader />
      </Box>
    );
  }

  if (favorites.length === 0) {
    return <EmptyState />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={favorites.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack>
          {favorites.map((favorite) => (
            <SortableFavoriteItem key={favorite.id} favorite={favorite} />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

