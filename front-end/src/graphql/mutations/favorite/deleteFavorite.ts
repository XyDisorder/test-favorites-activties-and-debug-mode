import gql from "graphql-tag";

const DeleteFavorite = gql`
  mutation DeleteFavorite($activityId: ID!) {
    deleteFavorite(activityId: $activityId)
  }
`;

export default DeleteFavorite;

