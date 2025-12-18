import { create } from "zustand";

interface FavoriteStore {
  // Map of activityId -> isFavorite
  favorites: Record<string, boolean>;
  setFavorite: (activityId: string, isFavorite: boolean) => void;
  getFavorite: (activityId: string) => boolean | null;
  clear: () => void;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: {},
  setFavorite: (activityId, isFavorite) =>
    set((state) => ({
      favorites: { ...state.favorites, [activityId]: isFavorite },
    })),
  getFavorite: (activityId) => {
    const state = get();
    return state.favorites[activityId] ?? null;
  },
  clear: () => set({ favorites: {} }),
}));

