/**
 * REST 스타일:
 * GET    /api/content              -> 목록 조회 (page, page_size, sort)
 * GET    /api/content/:id          -> 단건 조회
 * POST   /api/content              -> 생성 (관리자)
 * PATCH  /api/content/:id          -> 수정 (관리자)
 * DELETE /api/content/:id          -> 삭제 (관리자)
 *
 * ENV:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_KEY
 * - CONTENT_TABLE (옵션, 기본 "content")
 */

export async function handleContent(request, env) {
  const url = new URL(request.url);
  const table = env.CONTENT_TABLE || "content";

  const pathParts = url.pathname.split("/").filter(Boolean); // ["api","content",":id?"]
  const maybeId = pathParts.length >= 3 ? pathParts[2] : null;

  try {
    switch (request.method) {
      case "GET": {
        if (maybeId) {
          // 단건 조회
          const res = await fromSupabase(env, table, {
            method: "GET",
            search: new URLSearchParams({
              select: "*",
              id: `eq.${maybeId}`,
              limit: "1",
            }),
            // anon key로 조회
            service: false,
          });
          const data = await res.json().catch(() => null);
          const item = Array.isArray(data) ? data[0] : null;
          if (!item) {
            return json({ error: "Not Found" }, 404);
          }
          return json(item, 200);
        } else {
          // 목록 조회 (페이지네이션/정렬)
          const page = toInt(url.searchParams.get("page"), 1);
          const pageSize = clamp(toInt(url.searchParams.get("page_size"), 20), 1, 200);
          const sort = url.searchParams.get("sort") || "newest"; // newest | oldest
          const order = sort === "oldest" ? "asc" : "desc";

          // 필터링 확장 여지: title, status 등 쿼리 추가 가능
          const search = new URLSearchParams({
            select: "*",
            order: `created_at.${order}`,
            limit: String(pageSize),
            offset: String((page - 1) * pageSize),
          });

          const res = await fromSupabase(env, table, {
            method: "GET",
            search,
            service: false, // anon key
          });
          const items = await res.json().catch(() => []);

          // total 추정(간단 버전): count 정확도가 필요하면 `Prefer: count=exact` + Content-Range 사용하도록 확장 가능
          return json(
            {
              page,
              page_size: pageSize,
              sort,
              items,
              total: items.length < pageSize && page === 1 ? items.length : undefined,
            },
            200
          );
        }
      }

      case "POST": {
        // 생성 (관리자 only) - service key 사용
        const body = await safeJson(request);
        if (!body || typeof body !== "object") return json({ error: "Invalid JSON" }, 400);

        const res = await fromSupabase(env, table, {
          method: "POST",
          body,
          service: true,
          // 단건 반환을 원하면 `Prefer: return=representation` 헤더를 아래 headers에 추가
          headers: { Prefer: "return=representation" },
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) return json(data || { error: "Insert failed" }, res.status);
        return json(data, 201);
      }

      case "PATCH": {
        // 수정 (관리자 only)
        if (!maybeId) return json({ error: "Missing id" }, 400);
        const body = await safeJson(request);
        if (!body || typeof body !== "object") return json({ error: "Invalid JSON" }, 400);

        const res = await fromSupabase(env, table, {
          method: "PATCH",
          search: new URLSearchParams({ id: `eq.${maybeId}` }),
          body,
          service: true,
          headers: { Prefer: "return=representation" },
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) return json(data || { error: "Update failed" }, res.status);
        if (!Array.isArray(data) || !data[0]) return json({ error: "Not Found" }, 404);
        return json(data[0], 200);
      }

      case "DELETE": {
        // 삭제 (관리자 only)
        if (!maybeId) return json({ error: "Missing id" }, 400);

        const res = await fromSupabase(env, table, {
          method: "DELETE",
          search: new URLSearchParams({ id: `eq.${maybeId}` }),
          service: true,
          headers: { Prefer: "return=minimal" },
        });

        if (res.status === 204) return json({ ok: true }, 200);
        const data = await res.json().catch(() => null);
        if (!res.ok) return json(data || { error: "Delete failed" }, res.status);
        return json({ ok: true }, 200);
      }

      default:
        return json({ error: "Method Not Allowed" }, 405);
    }
  } catch (err) {
    return json({ error: err?.message || "Server Error" }, 500);
  }
}

/* ------------------------- helpers ------------------------- */

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

function toInt(v, d) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Supabase REST 호출
 * @param {Env} env
 * @param {string} table
 * @param {{method: string, search?: URLSearchParams, body?: any, service?: boolean, headers?: Record<string,string>}} opts
 */
async function fromSupabase(env, table, opts) {
  const base = env.SUPABASE_URL?.replace(/\/+$/, "");
  if (!base) throw new Error("Missing SUPABASE_URL");
  const method = opts.method;
  const token = opts.service ? env.SUPABASE_SERVICE_KEY : env.SUPABASE_ANON_KEY;
  if (!token) throw new Error(opts.service ? "Missing SUPABASE_SERVICE_KEY" : "Missing SUPABASE_ANON_KEY");

  const qs = opts.search ? `?${opts.search.toString()}` : "";
  const url = `${base}/rest/v1/${encodeURIComponent(table)}${qs}`;

  const headers = {
    apikey: token,
    Authorization: `Bearer ${token}`,
    "content-type": "application/json",
    ...opts.headers,
  };

  const init = { method, headers };
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, init);
  return res;
}
