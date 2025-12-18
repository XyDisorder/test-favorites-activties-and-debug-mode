import gql from "graphql-tag";

const GetAllFavorites = gql`
  query GetAllFavorites {
    getAllFavoritesByUserId {
      id
      activityId
      order
    }
  }
`;

export default GetAllFavorites;

