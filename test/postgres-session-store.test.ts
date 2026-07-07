import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import type { QueryResult } from "pg";
import { PostgresSessionStore } from "../src/lib/Whatsapp/infrastructure/stores/PostgresSessionStore";

type QueryCall = {
  text: string;
  values?: unknown[];
};

class FakePool {
  readonly calls: QueryCall[] = [];
  private readonly results: QueryResult[];

  constructor(results: QueryResult[] = []) {
    this.results = results;
  }

  async query(text: string, values?: unknown[]) {
    this.calls.push({ text, values });

    return (
      this.results.shift() ?? {
        command: "",
        oid: 0,
        rowCount: 0,
        rows: [],
        fields: [],
      }
    );
  }

  async end() {
    this.calls.push({ text: "end" });
  }
}

const createQueryResult = (rows: Record<string, unknown>[] = []): QueryResult => ({
  command: "",
  oid: 0,
  rowCount: rows.length,
  rows,
  fields: [],
});

test("PostgresSessionStore initializes the sessions table before querying", async () => {
  const pool = new FakePool([createQueryResult(), createQueryResult()]);
  const store = new PostgresSessionStore("postgres://user:pass@localhost/db", {
    pool,
  });

  const exists = await store.sessionExists({ session: "RemoteAuth-test" });

  assert.equal(exists, false);
  assert.match(pool.calls[0]?.text ?? "", /CREATE TABLE IF NOT EXISTS/);
  assert.match(pool.calls[1]?.text ?? "", /SELECT session_id/);
});

test("PostgresSessionStore normalizes path-like sessions when saving", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "wwebjs-store-"));
  const sessionPath = path.join(tempDir, "RemoteAuth-whatsapp-n8n-server");
  const archive = Buffer.from("zip-content");
  await fs.writeFile(`${sessionPath}.zip`, archive);

  const pool = new FakePool([createQueryResult(), createQueryResult()]);
  const store = new PostgresSessionStore("postgres://user:pass@localhost/db", {
    pool,
  });

  await store.save({ session: sessionPath });

  assert.equal(pool.calls[1]?.values?.[0], "RemoteAuth-whatsapp-n8n-server");
  assert.deepEqual(pool.calls[1]?.values?.[1], archive);

  await fs.rm(tempDir, { recursive: true, force: true });
});

test("PostgresSessionStore writes extracted archive to RemoteAuth path", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "wwebjs-store-"));
  const archivePath = path.join(tempDir, "RemoteAuth-whatsapp-n8n-server.zip");
  const archive = Buffer.from("restored-zip");
  const pool = new FakePool([
    createQueryResult(),
    createQueryResult([{ session_archive: archive }]),
  ]);
  const store = new PostgresSessionStore("postgres://user:pass@localhost/db", {
    pool,
  });

  await store.extract({
    session: "RemoteAuth-whatsapp-n8n-server",
    path: archivePath,
  });

  assert.deepEqual(await fs.readFile(archivePath), archive);

  await fs.rm(tempDir, { recursive: true, force: true });
});

test("PostgresSessionStore normalizes sessions when deleting", async () => {
  const pool = new FakePool([createQueryResult(), createQueryResult()]);
  const store = new PostgresSessionStore("postgres://user:pass@localhost/db", {
    pool,
  });

  await store.delete({
    session: "/app/.wwebjs_auth/RemoteAuth-whatsapp-n8n-server",
  });

  assert.match(pool.calls[1]?.text ?? "", /DELETE FROM/);
  assert.equal(pool.calls[1]?.values?.[0], "RemoteAuth-whatsapp-n8n-server");
});
