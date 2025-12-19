import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, AuthContextType } from "@/contexts/authContext";
import { useIsAdmin } from "./useIsAdmin";
import React from "react";

const createWrapper = (contextValue: AuthContextType) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("useIsAdmin", () => {
  it("should return true when user is admin", () => {
    const contextValue: AuthContextType = {
      user: {
        id: "1",
        email: "admin@test.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      } as AuthContextType["user"] & { role: string },
      isLoading: false,
      handleSignin: vi.fn(),
      handleSignup: vi.fn(),
      handleLogout: vi.fn(),
    };

    const { result } = renderHook(() => useIsAdmin(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current).toBe(true);
  });

  it("should return false when user is not admin", () => {
    const contextValue: AuthContextType = {
      user: {
        id: "1",
        email: "user@test.com",
        firstName: "Regular",
        lastName: "User",
        role: "user",
      } as AuthContextType["user"] & { role: string },
      isLoading: false,
      handleSignin: vi.fn(),
      handleSignup: vi.fn(),
      handleLogout: vi.fn(),
    };

    const { result } = renderHook(() => useIsAdmin(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current).toBe(false);
  });

  it("should return false when user is not authenticated", () => {
    const contextValue: AuthContextType = {
      user: null,
      isLoading: false,
      handleSignin: vi.fn(),
      handleSignup: vi.fn(),
      handleLogout: vi.fn(),
    };

    const { result } = renderHook(() => useIsAdmin(), {
      wrapper: createWrapper(contextValue),
    });

    expect(result.current).toBe(false);
  });
});

