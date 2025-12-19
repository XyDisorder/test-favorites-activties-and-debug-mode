import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Activity } from "./Activity";
import { useIsAdmin } from "@/hooks";

// Mock the hooks
vi.mock("@/hooks", () => ({
  useIsAdmin: vi.fn(),
}));

vi.mock("@/utils", () => ({
  useGlobalStyles: () => ({
    classes: {
      ellipsis: "ellipsis",
      link: "link",
    },
  }),
}));

vi.mock("./FavoriteButton", () => ({
  FavoriteButton: () => <div data-testid="favorite-button">Favorite</div>,
}));

const mockActivity = {
  id: "1",
  name: "Test Activity",
  city: "Paris",
  description: "Test description",
  price: 50,
  isFavorite: false,
  createdAt: "2024-01-15T10:30:00.000Z",
  owner: {
    firstName: "John",
    lastName: "Doe",
  },
};

describe("Activity", () => {
  it("should display debug info when user is admin", () => {
    vi.mocked(useIsAdmin).mockReturnValue(true);

    render(<Activity activity={mockActivity} />);

    expect(screen.getByText(/Créé le:/i)).toBeInTheDocument();
  });

  it("should not display debug info when user is not admin", () => {
    vi.mocked(useIsAdmin).mockReturnValue(false);

    render(<Activity activity={mockActivity} />);

    expect(screen.queryByText(/Créé le:/i)).not.toBeInTheDocument();
  });

  it("should display activity information", () => {
    vi.mocked(useIsAdmin).mockReturnValue(false);

    render(<Activity activity={mockActivity} />);

    expect(screen.getByText("Test Activity")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("50€/j")).toBeInTheDocument();
  });
});

