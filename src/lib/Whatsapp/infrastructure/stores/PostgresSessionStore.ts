import fs from "node:fs/promises";
import path from "node:path";
import { Pool, type QueryResult } from "pg";
import type { Store } from "whatsapp-web.js";

const TABLE_NAME = "wwebjs_sessions";

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    session_id TEXT PRIMARY KEY,
    session_archive BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

type Queryable = {
  query: <T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ) => Promise<QueryResult<T>>;
};

type Closable = {
  end: () => Promise<void>;
};

type PostgresSessionStoreOptions = {
  pool?: Queryable & Partial<Closable>;
};

type SessionArchiveRow = {
  session_archive: Buffer;
};

export class PostgresSessionStore implements Store {
  private readonly pool: Queryable & Partial<Closable>;
  private readonly ready: Promise<void>;

  constructor(
    connectionString: string,
    options: PostgresSessionStoreOptions = {},
  ) {
    this.pool =
      options.pool ??
      new Pool({
        connectionString,
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
      });

    this.ready = this.pool.query(CREATE_TABLE_SQL).then(() => undefined);
  }

  async sessionExists({ session }: { session: string }): Promise<boolean> {
    await this.ready;

    const result = await this.pool.query<{ session_id: string }>(
      `SELECT session_id FROM ${TABLE_NAME} WHERE session_id = $1 LIMIT 1`,
      [this.normalizeSessionId(session)],
    );

    return (result.rowCount ?? 0) > 0;
  }

  async save({ session }: { session: string }): Promise<void> {
    await this.ready;

    const sessionId = this.normalizeSessionId(session);
    const archive = await fs.readFile(`${session}.zip`);

    await this.pool.query(
      `INSERT INTO ${TABLE_NAME} (session_id, session_archive, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (session_id)
       DO UPDATE SET
         session_archive = EXCLUDED.session_archive,
         updated_at = NOW()`,
      [sessionId, archive],
    );
  }

  async extract({
    session,
    path: archivePath,
  }: {
    session: string;
    path: string;
  }): Promise<void> {
    await this.ready;

    const result = await this.pool.query<SessionArchiveRow>(
      `SELECT session_archive FROM ${TABLE_NAME} WHERE session_id = $1`,
      [this.normalizeSessionId(session)],
    );
    const archive = result.rows[0]?.session_archive;

    if (!archive) {
      throw new Error(`Session "${session}" was not found in PostgreSQL`);
    }

    await fs.writeFile(archivePath, archive);
  }

  async delete({ session }: { session: string }): Promise<void> {
    await this.ready;

    await this.pool.query(`DELETE FROM ${TABLE_NAME} WHERE session_id = $1`, [
      this.normalizeSessionId(session),
    ]);
  }

  async close(): Promise<void> {
    await this.pool.end?.();
  }

  private normalizeSessionId(session: string): string {
    return path.basename(session);
  }
}
