import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetActivitiesByCity = gql`
  query GetActivitiesByCity(
    $city: String!
    $page: Int
    $limit: Int
    $activity: String
    $price: Int
  ) {
    getActivitiesByCity(
      city: $city
      page: $page
      limit: $limit
      activity: $activity
      price: $price
    ) {
      items {
        ...Activity
      }
      total
      page
      limit
      totalPages
    }
  }
  ${ActivityFragment}
`;

export default GetActivitiesByCity;
