export async function handleContent(request, env) {
  const url = new URL(request.url);
  const table = env.CONTENT_TABLE || "content";

  const pathParts = url.pathname.split("/").filter(Boolean); // ["api","<table>",":id?"]
  const maybeId = pathParts.length >= 3 ? pathParts[2] : null;

  try {
    switch (request.method) {
      case "GET": {
        if (maybeId) {
          // 슬러그/UUID 둘 다 지원
          const isUuid = /^[0-9a-fA-F-]{36}$/.test(maybeId);
          const key = isUuid ? "id" : "slug";
          const res = await fromSupabase(env, table, {
            method: "GET",
            search: new URLSearchParams({
              select: "*",
              [key]: `eq.${maybeId}`,
              limit: "1",
            }),
            service: false,
          });
          const data = await res.json().catch(() => null);
          const item = Array.isArray(data) ? data[0] : null;
          if (!item) return json({ error: "Not Found" }, 404);
          return json(item, 200);
        } else {
          // 목록 조회
          const page = toInt(url.searchParams.get("page"), 1);
          const pageSize = clamp(toInt(url.searchParams.get("page_size"), 20), 1, 200);
          const sort = url.searchParams.get("sort") || "newest"; // newest|oldest
          const order = sort === "oldest" ? "asc" : "desc";

          const search = new URLSearchParams({
            select: "*",
            limit: String(pageSize),
            offset: String((page - 1) * pageSize),
          });

          // 🔎 공통 정렬 컬럼 결정
          // products면 sort_order 우선 → created_at 보조
          if (table === "products") {
            search.set("order", `sort_order.desc,created_at.${order}`);
          } else {
            search.set("order", `created_at.${order}`);
          }

          // 🔎 가시성 필터 (기본 true)
          const visibleParam = url.searchParams.get("visible");
          if (visibleParam === null && table === "products") {
            search.append("visible", "eq.true");
          } else if (visibleParam !== null) {
            search.append("visible", `eq.${visibleParam}`);
          }

          // 🔎 상태(status) 필터 (한글/영문 모두 허용)
          const rawStatus = url.searchParams.get("status");
          if (rawStatus) {
            const mapped = mapStatus(rawStatus); // '판매중' → 'for_sale'
            if (mapped) search.append("status", `eq.${mapped}`);
          }

          // 🔎 슬러그 검색(옵션)
          const slug = url.searchParams.get("slug");
          if (slug) search.append("slug", `eq.${slug}`);

          const res = await fromSupabase(env, table, {
            method: "GET",
            search,
            service: false,
          });
          const items = await res.json().catch(() => []);

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
        const body = await safeJson(request);
        if (!body || typeof body !== "object") return json({ error: "Invalid JSON" }, 400);

        const res = await fromSupabase(env, table, {
          method: "POST",
          body,
          service: true,
          headers: { Prefer: "return=representation" },
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) return json(data || { error: "Insert failed" }, res.status);
        return json(data, 201);
      }

      case "PATCH": {
        if (!maybeId) return json({ error: "Missing id" }, 400);
        const body = await safeJson(request);
        if (!body || typeof body !== "object") return json({ error: "Invalid JSON" }, 400);

        // 슬러그/UUID 둘 다 허용
        const isUuid = /^[0-9a-fA-F-]{36}$/.test(maybeId);
        const key = isUuid ? "id" : "slug";

        const res = await fromSupabase(env, table, {
          method: "PATCH",
          search: new URLSearchParams({ [key]: `eq.${maybeId}` }),
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
        if (!maybeId) return json({ error: "Missing id" }, 400);

        const isUuid = /^[0-9a-fA-F-]{36}$/.test(maybeId);
        const key = isUuid ? "id" : "slug";

        const res = await fromSupabase(env, table, {
          method: "DELETE",
          search: new URLSearchParams({ [key]: `eq.${maybeId}` }),
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

/* -------- helpers -------- */

function mapStatus(s) {
  const v = String(s).toLowerCase();
  if (["for_sale", "sale", "판매", "판매중", "onsale"].includes(v)) return "for_sale";
  if (["discontinued", "종료", "판매종료", "단종"].includes(v)) return "discontinued";
  return null;
}
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}
function toInt(v, d) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
async function safeJson(request) { try { return await request.json(); } catch { return null; } }

async function fromSupabase(env, table, opts) {
  const base = env.SUPABASE_URL?.replace(/\/+$/, "");
  if (!base) throw new Error("Missing SUPABASE_URL");
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

  const init = { method: opts.method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  return fetch(url, init);
}
