import { Topbar } from "@/components";
import { SnackbarProvider } from "@/contexts";
import { routes } from "@/routes";
import { graphqlClient } from "@/graphql/apollo";
import { mantineTheme } from "@/utils";
import { ApolloProvider } from "@apollo/client";
import { Container, MantineProvider } from "@mantine/core";
import dynamic from "next/dynamic";
import type { AppProps } from "next/app";

// AuthProvider uses useRouter() which requires client-side only
const AuthProvider = dynamic(
  () => import("@/contexts/authContext").then((mod) => ({ default: mod.AuthProvider })),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme}>
      <SnackbarProvider>
        <ApolloProvider client={graphqlClient}>
          <AuthProvider>
            <Topbar routes={routes} />
            <Container>
              <Component {...pageProps} />
            </Container>
          </AuthProvider>
        </ApolloProvider>
      </SnackbarProvider>
    </MantineProvider>
  );
}
