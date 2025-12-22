import { useAuth } from "@/hooks";
import { Box, Loader } from "@mantine/core";
import { useRouter } from "next/router";
import { ComponentType, useEffect } from "react";

export function withoutAuth<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const UnauthenticatedComponent = (props: P) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && user) {
        router.push("/");
      }
    }, [isLoading, router, user]);

    if (isLoading)
      return (
        <Box sx={{ textAlign: "center" }}>
          <Loader sx={{ marginTop: "10rem" }} />
        </Box>
      );

    return !isLoading && !user && <WrappedComponent {...props} />;
  };

  UnauthenticatedComponent.displayName = `withoutAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return UnauthenticatedComponent;
}
