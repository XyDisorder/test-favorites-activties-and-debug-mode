import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetActivities = gql`
  query GetActivities($page: Int, $limit: Int) {
    getActivities(page: $page, limit: $limit) {
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

export default GetActivities;
