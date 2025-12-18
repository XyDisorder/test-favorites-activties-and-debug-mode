import gql from "graphql-tag";

const ReorderFavorites = gql`
  mutation ReorderFavorites($reorderFavoritesInput: ReorderFavoritesInput!) {
    reorderFavorites(reorderFavoritesInput: $reorderFavoritesInput) {
      id
      order
    }
  }
`;

export default ReorderFavorites;

