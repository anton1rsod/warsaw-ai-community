// tests/unit/notion-client.test.ts
import { describe, it, expect } from "vitest";
import { makeClient, resolveDataSourceId } from "../../lib/notion/client.js";

describe("makeClient", () => {
  it("constructs a client exposing dataSources + pages", () => {
    const c = makeClient("secret_x") as unknown as { dataSources: unknown; pages: unknown };
    expect(c.dataSources).toBeDefined();
    expect(c.pages).toBeDefined();
  });
});

describe("resolveDataSourceId", () => {
  it("returns the single data source id", async () => {
    const client = { databases: { retrieve: async () => ({ data_sources: [{ id: "ds_1" }] }) } };
    expect(await resolveDataSourceId(client, "db_1")).toBe("ds_1");
  });
  it("throws when a database has zero or multiple data sources (L4 guard)", async () => {
    const none = { databases: { retrieve: async () => ({ data_sources: [] }) } };
    const two = { databases: { retrieve: async () => ({ data_sources: [{ id: "a" }, { id: "b" }] }) } };
    await expect(resolveDataSourceId(none, "db")).rejects.toThrow(/exactly one/i);
    await expect(resolveDataSourceId(two, "db")).rejects.toThrow(/exactly one/i);
  });
});
