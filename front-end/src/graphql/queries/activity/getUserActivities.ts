import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetUserActivities = gql`
  query GetUserActivities($page: Int, $limit: Int) {
    getActivitiesByUser(page: $page, limit: $limit) {
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

export default GetUserActivities;
