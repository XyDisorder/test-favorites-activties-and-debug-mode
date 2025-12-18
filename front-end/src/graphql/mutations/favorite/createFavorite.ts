import gql from "graphql-tag";

const CreateFavorite = gql`
  mutation CreateFavorite($createFavoriteInput: CreateFavoriteInput!) {
    createFavorite(createFavoriteInput: $createFavoriteInput) {
      id
      activityId
      order
    }
  }
`;

export default CreateFavorite;

