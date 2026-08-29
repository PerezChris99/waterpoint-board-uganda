import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the WaterPoint Board heading and disclaimer", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /waterpoint board uganda/i })).toBeInTheDocument();
    expect(
      screen.getByText(/does not certify water quality or drinking-water safety/i),
    ).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
