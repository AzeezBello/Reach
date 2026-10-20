import "server-only";

export type PostgrestError = {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
};

export type PostgrestResponse<T = any> = {
  data: T;
  error: PostgrestError | null;
  count: number | null;
};

const PRIMARY_KEYS: Record<string, string[]> = {
  content_leaders: ["content_type", "content_id", "leader_id"],
  event_rsvps: ["event_id", "resident_id"],
  request_supports: ["request_id", "resident_id"],
  office_members: ["office_id", "user_id"],
  organization_members: ["organization_id", "user_id"],
};

const JSONB_COLUMNS: Record<string, Set<string>> = {
  leaders: new Set(["sources"]),
  jurisdictions: new Set(["boundary_geojson"]),
  audit_logs: new Set(["metadata", "details"]),
  "auth.users": new Set(["raw_app_meta_data", "raw_user_meta_data"]),
};

const EMBED_FK_MAP: Record<string, string> = {
  organizations: "organization_id",
  jurisdictions: "jurisdiction_id",
  offices: "office_id",
  leaders: "leader_id",
  notifications: "notification_id",
  profiles: "resident_id",
  requests: "request_id",
};

const SCALAR_RPCS = new Set([
  "event_rsvp_count",
  "request_support_count",
  "set_request_visibility",
  "toggle_request_support",
  "is_platform_admin",
  "is_office_staff",
  "is_leadership_admin",
]);

function getConnectionString(): string {
  const conn =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!conn) {
    throw new Error("Missing DATABASE_URL or POSTGRES_URL for Neon DB connection.");
  }

  return conn;
}

export async function neonSql<T = Record<string, any>>(
  query: string,
  params: unknown[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const connStr = getConnectionString();
  const hostname = new URL(connStr).hostname;
  const endpoint = `https://${hostname}/sql`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Neon-Connection-String": connStr,
    },
    body: JSON.stringify({ query, params }),
  });

  if (!response.ok) {
    let errPayload: any = null;
    const text = await response.text();
    try {
      errPayload = JSON.parse(text);
    } catch {
      errPayload = { message: text };
    }
    const err = new Error(errPayload?.message || `Neon HTTP ${response.status}`);
    (err as any).code = errPayload?.code || String(response.status);
    (err as any).details = errPayload?.detail || null;
    (err as any).hint = errPayload?.hint || null;
    throw err;
  }

  const json = await response.json();
  return {
    rows: (json.rows ?? []) as T[],
    rowCount: typeof json.rowCount === "number" ? json.rowCount : (json.rows ?? []).length,
  };
}

function quoteIdent(ident: string): string {
  if (ident === "*") return "*";
  if (ident.includes(".")) {
    return ident
      .split(".")
      .map((part) => (part === "*" ? "*" : `"${part.replace(/"/g, '""')}"`))
      .join(".");
  }
  return `"${ident.replace(/"/g, '""')}"`;
}

type ParsedSelectItem =
  | { kind: "column"; name: string }
  | {
      kind: "embed";
      alias: string;
      targetTable: string;
      fkColumn: string;
      columns: string[];
    };

/**
 * Splits a PostgREST select string at top-level commas (ignoring commas inside parentheses).
 */
function parseSelectClause(table: string, selectStr: string): ParsedSelectItem[] {
  const trimmed = selectStr.trim();
  if (!trimmed || trimmed === "*") {
    return [{ kind: "column", name: "*" }];
  }

  const tokens: string[] = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);

    if (ch === "," && depth === 0) {
      if (current.trim()) tokens.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) tokens.push(current.trim());

  return tokens.map((token) => {
    const embedMatch = token.match(/^(?:([a-zA-Z0-9_]+)\s*:\s*)?([a-zA-Z0-9_]+)\s*\(([\s\S]*)\)$/);
    if (embedMatch) {
      const alias = embedMatch[1] || embedMatch[2];
      const targetTable = embedMatch[2];
      const innerCols = embedMatch[3]
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      let fkColumn = EMBED_FK_MAP[targetTable] || `${targetTable.replace(/s$/, "")}_id`;
      if (table === "requests" && targetTable === "offices") {
        fkColumn = "assigned_office_id";
      }

      return {
        kind: "embed",
        alias,
        targetTable,
        fkColumn,
        columns: innerCols,
      };
    }

    return { kind: "column", name: token.trim() };
  });
}

function buildSelectProjections(table: string, selectStr: string): string {
  const items = parseSelectClause(table, selectStr);
  return items
    .map((item) => {
      if (item.kind === "column") {
        return item.name === "*" ? "_t.*" : `_t.${quoteIdent(item.name)}`;
      }
      const subCols = item.columns.map((c) => quoteIdent(c)).join(", ");
      return `(SELECT row_to_json(_sub) FROM (SELECT ${subCols} FROM public.${quoteIdent(
        item.targetTable
      )} WHERE "id" = _t.${quoteIdent(item.fkColumn)}) _sub) AS ${quoteIdent(item.alias)}`;
    })
    .join(", ");
}

type FilterCondition =
  | { type: "eq"; col: string; val: unknown }
  | { type: "neq"; col: string; val: unknown }
  | { type: "in"; col: string; vals: unknown[] }
  | { type: "ilike"; col: string; val: string }
  | { type: "is"; col: string; val: unknown }
  | { type: "gt" | "gte" | "lt" | "lte"; col: string; val: unknown }
  | { type: "or"; expr: string };

type OrderSpec = {
  col: string;
  ascending: boolean;
  nullsFirst?: boolean;
};

class NeonQueryBuilder<T = any[]> implements PromiseLike<PostgrestResponse<T>> {
  private table: string;
  private operation: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private selectColumns = "*";
  private returningSelect: string | null = null;
  private countMode: "exact" | "planned" | "estimated" | null = null;
  private isHead = false;
  private payload: any = null;
  private upsertOptions: { onConflict?: string; ignoreDuplicates?: boolean } = {};
  private filters: FilterCondition[] = [];
  private orders: OrderSpec[] = [];
  private limitCount: number | null = null;
  private rowMode: "many" | "single" | "maybeSingle" = "many";

  constructor(table: string) {
    this.table = table;
  }

  select(
    columns = "*",
    options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }
  ): this {
    if (this.operation === "select") {
      this.selectColumns = columns || "*";
      if (options?.count) this.countMode = options.count;
      if (options?.head) this.isHead = true;
    } else {
      this.returningSelect = columns || "*";
    }
    return this;
  }

  insert(values: Record<string, any> | Record<string, any>[]): this {
    this.operation = "insert";
    this.payload = values;
    return this;
  }

  update(values: Record<string, any>): this {
    this.operation = "update";
    this.payload = values;
    return this;
  }

  upsert(
    values: Record<string, any> | Record<string, any>[],
    options?: { onConflict?: string; ignoreDuplicates?: boolean }
  ): this {
    this.operation = "upsert";
    this.payload = values;
    this.upsertOptions = options ?? {};
    return this;
  }

  delete(): this {
    this.operation = "delete";
    return this;
  }

  eq(col: string, val: unknown): this {
    this.filters.push({ type: "eq", col, val });
    return this;
  }

  neq(col: string, val: unknown): this {
    this.filters.push({ type: "neq", col, val });
    return this;
  }

  in(col: string, vals: readonly unknown[]): this {
    this.filters.push({ type: "in", col, vals: [...vals] });
    return this;
  }

  ilike(col: string, pattern: string): this {
    this.filters.push({ type: "ilike", col, val: pattern });
    return this;
  }

  is(col: string, val: unknown): this {
    this.filters.push({ type: "is", col, val });
    return this;
  }

  gt(col: string, val: unknown): this {
    this.filters.push({ type: "gt", col, val });
    return this;
  }

  gte(col: string, val: unknown): this {
    this.filters.push({ type: "gte", col, val });
    return this;
  }

  lt(col: string, val: unknown): this {
    this.filters.push({ type: "lt", col, val });
    return this;
  }

  lte(col: string, val: unknown): this {
    this.filters.push({ type: "lte", col, val });
    return this;
  }

  or(expr: string): this {
    this.filters.push({ type: "or", expr });
    return this;
  }

  order(col: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this.orders.push({
      col,
      ascending: options?.ascending ?? true,
      nullsFirst: options?.nullsFirst,
    });
    return this;
  }

  limit(n: number): this {
    this.limitCount = n;
    return this;
  }

  single(): NeonQueryBuilder<any> {
    this.rowMode = "single";
    if (this.limitCount === null) this.limitCount = 2;
    return this as unknown as NeonQueryBuilder<any>;
  }

  maybeSingle(): NeonQueryBuilder<any> {
    this.rowMode = "maybeSingle";
    if (this.limitCount === null) this.limitCount = 2;
    return this as unknown as NeonQueryBuilder<any>;
  }

  private buildWhereClause(alias: string, params: unknown[]): string {
    if (this.filters.length === 0) return "";
    const prefix = alias ? `${alias}.` : "";
    const parts: string[] = [];

    for (const f of this.filters) {
      if (f.type === "eq") {
        if (f.val === null) {
          parts.push(`${prefix}${quoteIdent(f.col)} IS NULL`);
        } else {
          params.push(f.val);
          parts.push(`${prefix}${quoteIdent(f.col)} = $${params.length}`);
        }
      } else if (f.type === "neq") {
        if (f.val === null) {
          parts.push(`${prefix}${quoteIdent(f.col)} IS NOT NULL`);
        } else {
          params.push(f.val);
          parts.push(`${prefix}${quoteIdent(f.col)} <> $${params.length}`);
        }
      } else if (f.type === "in") {
        if (f.vals.length === 0) {
          parts.push("FALSE");
        } else {
          const placeholders = f.vals.map((v) => {
            params.push(v);
            return `$${params.length}`;
          });
          parts.push(`${prefix}${quoteIdent(f.col)} IN (${placeholders.join(", ")})`);
        }
      } else if (f.type === "ilike") {
        params.push(f.val);
        parts.push(`${prefix}${quoteIdent(f.col)} ILIKE $${params.length}`);
      } else if (f.type === "is") {
        if (f.val === null) {
          parts.push(`${prefix}${quoteIdent(f.col)} IS NULL`);
        } else if (f.val === true) {
          parts.push(`${prefix}${quoteIdent(f.col)} IS TRUE`);
        } else if (f.val === false) {
          parts.push(`${prefix}${quoteIdent(f.col)} IS FALSE`);
        }
      } else if (f.type === "gt" || f.type === "gte" || f.type === "lt" || f.type === "lte") {
        const opMap = { gt: ">", gte: ">=", lt: "<", lte: "<=" };
        params.push(f.val);
        parts.push(`${prefix}${quoteIdent(f.col)} ${opMap[f.type]} $${params.length}`);
      } else if (f.type === "or") {
        const subExprs = f.expr.split(",").map((s) => s.trim()).filter(Boolean);
        const orParts: string[] = [];
        for (const sub of subExprs) {
          const m = sub.match(/^([a-zA-Z0-9_]+)\.(eq|neq|ilike|like|is|gt|gte|lt|lte)\.([\s\S]*)$/);
          if (!m) continue;
          const [, col, op, rawVal] = m;
          if (op === "is" && rawVal === "null") {
            orParts.push(`${prefix}${quoteIdent(col)} IS NULL`);
          } else if (op === "ilike") {
            params.push(rawVal);
            orParts.push(`${prefix}${quoteIdent(col)}::text ILIKE $${params.length}`);
          } else if (op === "eq") {
            params.push(rawVal);
            orParts.push(`${prefix}${quoteIdent(col)} = $${params.length}`);
          }
        }
        if (orParts.length > 0) {
          parts.push(`(${orParts.join(" OR ")})`);
        }
      }
    }

    return parts.length > 0 ? ` WHERE ${parts.join(" AND ")}` : "";
  }

  private isJsonbCol(col: string): boolean {
    return Boolean(JSONB_COLUMNS[this.table]?.has(col));
  }

  async execute(): Promise<PostgrestResponse<T>> {
    try {
      const tableRef = `public.${quoteIdent(this.table)}`;

      if (this.operation === "select") {
        const params: unknown[] = [];
        const whereSql = this.buildWhereClause("_t", params);

        let totalCount: number | null = null;
        if (this.countMode) {
          const countRes = await neonSql<{ cnt: number }>(
            `SELECT count(*)::int AS cnt FROM ${tableRef} _t${whereSql}`,
            params
          );
          totalCount = countRes.rows[0]?.cnt ?? 0;
          if (this.isHead) {
            return { data: null as unknown as T, error: null, count: totalCount };
          }
        }

        const projections = buildSelectProjections(this.table, this.selectColumns);
        let sql = `SELECT ${projections} FROM ${tableRef} _t${whereSql}`;

        if (this.orders.length > 0) {
          const orderClauses = this.orders.map((o) => {
            const dir = o.ascending ? "ASC" : "DESC";
            const nulls =
              o.nullsFirst === true
                ? " NULLS FIRST"
                : o.nullsFirst === false
                ? " NULLS LAST"
                : "";
            return `_t.${quoteIdent(o.col)} ${dir}${nulls}`;
          });
          sql += ` ORDER BY ${orderClauses.join(", ")}`;
        }

        if (this.limitCount !== null) {
          sql += ` LIMIT ${Number(this.limitCount)}`;
        }

        const { rows } = await neonSql(sql, params);
        return this.formatResult(rows, totalCount);
      }

      if (this.operation === "insert" || this.operation === "upsert") {
        const rowsInput: Record<string, any>[] = Array.isArray(this.payload)
          ? this.payload
          : [this.payload];

        if (rowsInput.length === 0) {
          return { data: ([] as unknown) as T, error: null, count: 0 };
        }

        const cols = Array.from(
          new Set(rowsInput.flatMap((r) => Object.keys(r).filter((k) => r[k] !== undefined)))
        );

        const params: unknown[] = [];
        const tuples: string[] = [];

        for (const row of rowsInput) {
          const placeholders = cols.map((col) => {
            const val = row[col] === undefined ? null : row[col];
            if (this.isJsonbCol(col) && val !== null) {
              params.push(typeof val === "string" ? val : JSON.stringify(val));
              return `$${params.length}::jsonb`;
            }
            params.push(val);
            return `$${params.length}`;
          });
          tuples.push(`(${placeholders.join(", ")})`);
        }

        let sql = `INSERT INTO ${tableRef} (${cols.map((c) => quoteIdent(c)).join(", ")}) VALUES ${tuples.join(", ")}`;

        if (this.operation === "upsert") {
          const conflictCols = this.upsertOptions.onConflict
            ? this.upsertOptions.onConflict
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : PRIMARY_KEYS[this.table] ?? ["id"];

          const conflictTarget = conflictCols.map((c) => quoteIdent(c)).join(", ");
          const updateCols = cols.filter((c) => !conflictCols.includes(c));

          if (this.upsertOptions.ignoreDuplicates || updateCols.length === 0) {
            sql += ` ON CONFLICT (${conflictTarget}) DO NOTHING`;
          } else {
            const updateSet = updateCols
              .map((c) => `${quoteIdent(c)} = EXCLUDED.${quoteIdent(c)}`)
              .join(", ");
            sql += ` ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updateSet}`;
          }
        }

        if (this.returningSelect) {
          const retCols =
            this.returningSelect === "*"
              ? "*"
              : this.returningSelect
                  .split(",")
                  .map((c) => quoteIdent(c.trim()))
                  .join(", ");
          sql += ` RETURNING ${retCols}`;
          const { rows, rowCount } = await neonSql(sql, params);
          return this.formatResult(rows, rowCount);
        }

        const { rowCount } = await neonSql(sql, params);
        return { data: null as unknown as T, error: null, count: rowCount };
      }

      if (this.operation === "update") {
        const row = this.payload ?? {};
        const cols = Object.keys(row).filter((k) => row[k] !== undefined);
        const params: unknown[] = [];

        const setClauses = cols.map((col) => {
          const val = row[col];
          if (this.isJsonbCol(col) && val !== null) {
            params.push(typeof val === "string" ? val : JSON.stringify(val));
            return `${quoteIdent(col)} = $${params.length}::jsonb`;
          }
          params.push(val);
          return `${quoteIdent(col)} = $${params.length}`;
        });

        const whereSql = this.buildWhereClause("_t", params);
        let sql = `UPDATE ${tableRef} _t SET ${setClauses.join(", ")}${whereSql}`;

        if (this.returningSelect) {
          const retCols =
            this.returningSelect === "*"
              ? "*"
              : this.returningSelect
                  .split(",")
                  .map((c) => quoteIdent(c.trim()))
                  .join(", ");
          sql += ` RETURNING ${retCols}`;
          const { rows, rowCount } = await neonSql(sql, params);
          return this.formatResult(rows, rowCount);
        }

        const { rowCount } = await neonSql(sql, params);
        return { data: null as unknown as T, error: null, count: rowCount };
      }

      if (this.operation === "delete") {
        const params: unknown[] = [];
        const whereSql = this.buildWhereClause("_t", params);
        let sql = `DELETE FROM ${tableRef} _t${whereSql}`;

        if (this.returningSelect) {
          const retCols =
            this.returningSelect === "*"
              ? "*"
              : this.returningSelect
                  .split(",")
                  .map((c) => quoteIdent(c.trim()))
                  .join(", ");
          sql += ` RETURNING ${retCols}`;
          const { rows, rowCount } = await neonSql(sql, params);
          return this.formatResult(rows, rowCount);
        }

        const { rowCount } = await neonSql(sql, params);
        return { data: null as unknown as T, error: null, count: rowCount };
      }

      return { data: null as unknown as T, error: null, count: null };
    } catch (err: any) {
      if (err?.digest === "DYNAMIC_SERVER_USAGE") {
        throw err;
      }
      return {
        data: null as unknown as T,
        error: {
          message: err?.message || "Database error",
          details: err?.details || null,
          hint: err?.hint || null,
          code: err?.code || "ERROR",
        },
        count: null,
      };
    }
  }

  private formatResult(rows: any[], count: number | null): PostgrestResponse<T> {
    if (this.rowMode === "single") {
      if (rows.length === 0) {
        return {
          data: null as unknown as T,
          error: {
            message: "JSON object requested, multiple (or no) rows returned",
            details: "The result contains 0 rows",
            hint: null,
            code: "PGRST116",
          },
          count,
        };
      }
      return { data: rows[0] as T, error: null, count };
    }

    if (this.rowMode === "maybeSingle") {
      return { data: (rows[0] ?? null) as T, error: null, count };
    }

    return { data: rows as unknown as T, error: null, count };
  }

  then<TResult1 = PostgrestResponse<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: PostgrestResponse<T>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export async function executeNeonRpc<T = any>(
  fnName: string,
  args: Record<string, any> = {},
  userId?: string | null
): Promise<PostgrestResponse<T>> {
  try {
    const entries = Object.entries(args).filter(([, v]) => v !== undefined);
    const params: unknown[] = [];

    let claimFrom = "";
    if (userId) {
      params.push(userId);
      claimFrom = `(SELECT set_config('request.jwt.claim.sub', $${params.length}, true)) _claims`;
    }

    const namedArgs = entries.map(([k, v]) => {
      params.push(v);
      return `${quoteIdent(k)} := $${params.length}`;
    });

    const fnCall = `public.${quoteIdent(fnName)}(${namedArgs.join(", ")})`;

    if (SCALAR_RPCS.has(fnName)) {
      const sql = claimFrom
        ? `SELECT ${fnCall} AS result FROM ${claimFrom}`
        : `SELECT ${fnCall} AS result`;
      const { rows } = await neonSql<{ result: T }>(sql, params);
      return {
        data: (rows[0]?.result ?? null) as T,
        error: null,
        count: null,
      };
    }

    const sql = claimFrom
      ? `SELECT _r.* FROM ${claimFrom} CROSS JOIN LATERAL ${fnCall} _r`
      : `SELECT * FROM ${fnCall}`;
    const { rows } = await neonSql<any>(sql, params);
    return {
      data: rows as unknown as T,
      error: null,
      count: rows.length,
    };
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    return {
      data: null as unknown as T,
      error: {
        message: err?.message || "RPC error",
        details: err?.details || null,
        hint: err?.hint || null,
        code: err?.code || "ERROR",
      },
      count: null,
    };
  }
}

export async function syncAuthUserToNeon(user: {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}) {
  if (!user?.id) return;
  try {
    await neonSql(
      `INSERT INTO auth.users (
        id, email, email_confirmed_at, confirmed_at, last_sign_in_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $3, $4, $5::jsonb, $6::jsonb, coalesce($7::timestamptz, now()), now()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = coalesce(EXCLUDED.email, auth.users.email),
        email_confirmed_at = coalesce(EXCLUDED.email_confirmed_at, auth.users.email_confirmed_at),
        last_sign_in_at = coalesce(EXCLUDED.last_sign_in_at, auth.users.last_sign_in_at),
        raw_user_meta_data = coalesce(EXCLUDED.raw_user_meta_data, auth.users.raw_user_meta_data),
        updated_at = now()`,
      [
        user.id,
        user.email ?? null,
        user.email_confirmed_at ?? null,
        user.last_sign_in_at ?? new Date().toISOString(),
        JSON.stringify(user.app_metadata ?? {}),
        JSON.stringify(user.user_metadata ?? {}),
        user.created_at ?? null,
      ]
    );
  } catch (err) {
    console.error("[REACH][Neon] Failed to sync auth user:", err);
  }
}

export function createNeonDataClient(options?: {
  getUserId?: () => Promise<string | null>;
}) {
  return {
    from<T = any[]>(table: string) {
      return new NeonQueryBuilder<T>(table);
    },
    async rpc<T = any>(fnName: string, args: Record<string, any> = {}) {
      const userId = options?.getUserId ? await options.getUserId() : null;
      return executeNeonRpc<T>(fnName, args, userId);
    },
  };
}
