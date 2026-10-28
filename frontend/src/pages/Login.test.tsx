import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { AuthProvider } from "../store/auth";

function renderAt(path: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("login flow", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("redirects anonymous users to the login page", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument();
  });

  it("shows the API error on bad credentials", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(401, { detail: "Incorrect email or password" })));
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-pass" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect email or password");
  });

  it("logs in and shows the welcome page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/auth/login")) return jsonResponse(200, { access_token: "a", refresh_token: "r" });
        if (url.endsWith("/auth/me"))
          return jsonResponse(200, { id: 1, name: "Asha", email: "a@example.com", role: "student", level: "beginner" });
        return jsonResponse(200, []);
      }),
    );
    renderAt("/login");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "s3cret-pass" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByRole("heading", { name: "Welcome back, Asha" })).toBeInTheDocument();
  });
});
