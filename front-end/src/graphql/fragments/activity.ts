import gql from "graphql-tag";
import OwnerFragment from "./owner";

const ActivityFragment = gql`
  fragment Activity on Activity {
    id
    city
    description
    name
    price
    isFavorite
    owner {
      ...Owner
    }
  }
  ${OwnerFragment}
`;

export default ActivityFragment;
