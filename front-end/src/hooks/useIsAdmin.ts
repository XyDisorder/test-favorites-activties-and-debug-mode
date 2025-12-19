import { useAuth } from "./useAuth";

/**
 * Hook to check if the current user is an admin
 * @returns true if the user is authenticated and has admin role, false otherwise
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "admin";
}

