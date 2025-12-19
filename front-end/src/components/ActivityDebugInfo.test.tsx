import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityDebugInfo } from "./ActivityDebugInfo";

describe("ActivityDebugInfo", () => {
  it("should render formatted date when createdAt is provided", () => {
    const createdAt = "2024-01-15T10:30:00.000Z";
    render(<ActivityDebugInfo createdAt={createdAt} />);

    const text = screen.getByText(/Créé le:/i);
    expect(text).toBeInTheDocument();
    expect(text.textContent).toContain("Créé le:");
  });

  it("should not render anything when createdAt is null", () => {
    const { container } = render(<ActivityDebugInfo createdAt={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render anything when createdAt is undefined", () => {
    const { container } = render(<ActivityDebugInfo createdAt={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("should format date in French locale", () => {
    const createdAt = "2024-01-15T10:30:00.000Z";
    render(<ActivityDebugInfo createdAt={createdAt} />);

    const text = screen.getByText(/Créé le:/i);
    // The date should be formatted in French format (DD/MM/YYYY)
    expect(text.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("should not render anything when createdAt is invalid date string", () => {
    const { container } = render(<ActivityDebugInfo createdAt="invalid-date" />);
    expect(container.firstChild).toBeNull();
  });
});

