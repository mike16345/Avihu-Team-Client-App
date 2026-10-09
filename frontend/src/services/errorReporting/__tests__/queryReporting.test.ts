import { beforeEach, expect, it } from "vitest";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { reportQueryFailure, reportMutationFailure } from "../queryReporting";
import { setErrorReporter } from "../reportError";
let captured: { error: Error; context: any }[];
beforeEach(() => {
  captured = [];
  setErrorReporter((error, context) => {
    captured.push({ error, context });
    return "event";
  });
});
it("captures only the final failure after retries", async () => {
  const client = new QueryClient({
    queryCache: new QueryCache({ onError: reportQueryFailure }),
    defaultOptions: { queries: { retry: 2, retryDelay: 0 } },
  });
  let attempts = 0;
  await expect(
    client.fetchQuery({
      queryKey: ["chat", "123"],
      queryFn: () => {
        attempts++;
        throw new Error("offline");
      },
    })
  ).rejects.toThrow("offline");
  expect(attempts).toBe(3);
  expect(captured).toHaveLength(1);
  expect(captured[0].context.diagnostics.queryKey).toEqual(["chat", "123"]);
  client.clear();
});
it("leaves feature-owned failures and documented expected statuses to their owner", async () => {
  const client = new QueryClient({
    queryCache: new QueryCache({ onError: reportQueryFailure }),
    defaultOptions: { queries: { retry: false } },
  });
  await client
    .fetchQuery({
      queryKey: ["form"],
      meta: { errorReporting: { owner: "feature" } },
      queryFn: () => {
        throw new Error("bad upload");
      },
    })
    .catch(() => {});
  await client
    .fetchQuery({
      queryKey: ["optional"],
      meta: { errorReporting: { owner: "query-cache", expectedStatuses: [404] } },
      queryFn: () => {
        throw Object.assign(new Error("missing"), { response: { status: 404 } });
      },
    })
    .catch(() => {});
  expect(captured).toHaveLength(0);
  client.clear();
});
it("captures mutation errors without uploading raw variables", async () => {
  const cache = new MutationCache({
    onError: (error, variables, _context, mutation) =>
      reportMutationFailure(error, variables, mutation),
  });
  const client = new QueryClient({ mutationCache: cache });
  const mutation = cache.build(client, {
    mutationFn: async () => {
      throw new Error("save failed");
    },
  });
  await mutation.execute({ password: "PRIVATE", answer: "sensitive" }).catch(() => {});
  expect(captured).toHaveLength(1);
  expect(JSON.stringify(captured)).not.toContain("PRIVATE");
  expect(JSON.stringify(captured)).not.toContain("sensitive");
});
