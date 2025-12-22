import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/graphql",
    credentials: "include",
  }),
  ssrMode: typeof window === "undefined",
});
