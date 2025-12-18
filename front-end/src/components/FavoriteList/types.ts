export interface FavoriteItem {
  id: string;
  activityId: string;
  order: number;
  activity?: {
    id: string;
    name: string;
    city: string;
    description: string;
    price: number;
    isFavorite: boolean | null;
  };
}

