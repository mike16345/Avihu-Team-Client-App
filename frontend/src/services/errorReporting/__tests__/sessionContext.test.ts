import { expect, it, vi } from "vitest";
import { useUserStore } from "@/store/userStore";
const users: unknown[] = [];
vi.mock("@sentry/react-native", () => ({ setUser: (user: unknown) => users.push(user) }));
vi.mock("@/services/authSession", () => ({
  getAccessToken: () => "ACCESS_PRIVATE",
  getRefreshToken: () => "REFRESH_PRIVATE",
  subscribeAuthSession: () => () => {},
}));
vi.mock("@/services/apiKey", () => ({ getApiKey: () => "API_PRIVATE" }));
it("hydrates identity, replaces it on account switch, and clears it on logout", async () => {
  const { subscribeReportingUser } = await import("../sessionContext");
  useUserStore.setState({ currentUser: { _id: "first" } as any });
  const unsubscribe = subscribeReportingUser();
  useUserStore.setState({ currentUser: { _id: "second" } as any });
  useUserStore.setState({ currentUser: null });
  expect(users).toEqual([{ id: "first" }, { id: "second" }, null]);
  unsubscribe();
});
