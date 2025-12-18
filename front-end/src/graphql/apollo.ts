import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: "http://localhost:3000/graphql",
  credentials: "include",
});

const authLink = setContext((_, { headers = {} }) => {
  // Client-side: get token from localStorage and send in header
  // Server-side: don't send jwt header, let backend read from httpOnly cookie 'jwt'
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return {
      headers: {
        ...headers,
        ...(token && { jwt: token }),
      },
    };
  }
  
  // Server-side: don't add jwt header, backend will read from cookie
  return { headers };
});

export const graphqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
  ssrMode: typeof window === "undefined",
});
