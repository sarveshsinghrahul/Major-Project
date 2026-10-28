import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { tokens } from "../api/client";
import { AuthProvider } from "../store/auth";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

const PROFILE = {
  goal: null,
  weekly_hours_available: 5,
  preferred_days: [0, 1, 2, 3, 4],
  preferred_formats: [],
  self_rated_familiarity: 0,
  level: null,
  level_score: null,
  level_reason: null,
  onboarding_step: 0,
};

function renderLoggedIn(level: string | null, role = "student") {
  tokens.set({ access_token: "a", refresh_token: "r" });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.endsWith("/auth/me")) return jsonResponse({ id: 1, name: "Asha", email: "a@example.com", role, level });
      if (url.endsWith("/onboarding/profile")) return jsonResponse(PROFILE);
      return jsonResponse([]);
    }),
  );
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("onboarding redirect", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends a student without a level to the goals step", async () => {
    renderLoggedIn(null);
    expect(await screen.findByText("What do you want to achieve?")).toBeInTheDocument();
  });

  it("lets an onboarded student reach the dashboard", async () => {
    renderLoggedIn("intermediate");
    expect(await screen.findByRole("heading", { name: "Welcome back, Asha" })).toBeInTheDocument();
  });

  it("does not force instructors through onboarding", async () => {
    renderLoggedIn(null, "instructor");
    expect(await screen.findByRole("heading", { name: "Welcome back, Asha" })).toBeInTheDocument();
  });
});
