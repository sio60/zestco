var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/utils/cors.js
function withCORS(resp, origin = "*") {
  const headers = new Headers(resp.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(resp.body, { status: resp.status, headers });
}
__name(withCORS, "withCORS");
function preflight(request, origin = "*") {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  return null;
}
__name(preflight, "preflight");

// src/utils/auth.js
async function requireAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (token && env.JWT_SECRET && token === env.JWT_SECRET) {
    return { ok: true, user: { role: "admin" } };
  }
  return { ok: false, error: "UNAUTHORIZED" };
}
__name(requireAdmin, "requireAdmin");

// src/routes/content.js
async function handleContent(request, env) {
  const url = new URL(request.url);
  const table = env.CONTENT_TABLE || "content";
  const pathParts = url.pathname.split("/").filter(Boolean);
  const maybeId = pathParts.length >= 3 ? pathParts[2] : null;
  try {
    switch (request.method) {
      case "GET": {
        if (maybeId) {
          const isUuid = /^[0-9a-fA-F-]{36}$/.test(maybeId);
          const key = isUuid ? "id" : "slug";
          const res = await fromSupabase(env, table, {
            method: "GET",
            search: new URLSearchParams({
              select: "*",
              [key]: `eq.${maybeId}`,
              limit: "1"
            }),
            service: false
          });
          const data = await res.json().catch(() => null);
          const item = Array.isArray(data) ? data[0] : null;
          if (!item) return json({ error: "Not Found" }, 404);
          return json(item, 200);
        } else {
          const page = toInt(url.searchParams.get("page"), 1);
          const pageSize = clamp(toInt(url.searchParams.get("page_size"), 20), 1, 200);
          const sort = url.searchParams.get("sort") || "newest";
          const order = sort === "oldest" ? "asc" : "desc";
          const search = new URLSearchParams({
            select: "*",
            limit: String(pageSize),
            offset: String((page - 1) * pageSize)
          });
          if (table === "products") {
            search.set("order", `sort_order.desc,created_at.${order}`);
          } else {
            search.set("order", `created_at.${order}`);
          }
          const visibleParam = url.searchParams.get("visible");
          if (visibleParam === null && table === "products") {
            search.append("visible", "eq.true");
          } else if (visibleParam !== null) {
            search.append("visible", `eq.${visibleParam}`);
          }
          const rawStatus = url.searchParams.get("status");
          if (rawStatus) {
            const mapped = mapStatus(rawStatus);
            if (mapped) search.append("status", `eq.${mapped}`);
          }
          const slug = url.searchParams.get("slug");
          if (slug) search.append("slug", `eq.${slug}`);
          const res = await fromSupabase(env, table, {
            method: "GET",
            search,
            service: false
          });
          const items = await res.json().catch(() => []);
          return json(
            {
              page,
              page_size: pageSize,
              sort,
              items,
              total: items.length < pageSize && page === 1 ? items.length : void 0
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
          headers: { Prefer: "return=representation" }
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) return json(data || { error: "Insert failed" }, res.status);
        return json(data, 201);
      }
      case "PATCH": {
        if (!maybeId) return json({ error: "Missing id" }, 400);
        const body = await safeJson(request);
        if (!body || typeof body !== "object") return json({ error: "Invalid JSON" }, 400);
        const isUuid = /^[0-9a-fA-F-]{36}$/.test(maybeId);
        const key = isUuid ? "id" : "slug";
        const res = await fromSupabase(env, table, {
          method: "PATCH",
          search: new URLSearchParams({ [key]: `eq.${maybeId}` }),
          body,
          service: true,
          headers: { Prefer: "return=representation" }
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
          headers: { Prefer: "return=minimal" }
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
__name(handleContent, "handleContent");
function mapStatus(s) {
  const v = String(s).toLowerCase();
  if (["for_sale", "sale", "\uD310\uB9E4", "\uD310\uB9E4\uC911", "onsale"].includes(v)) return "for_sale";
  if (["discontinued", "\uC885\uB8CC", "\uD310\uB9E4\uC885\uB8CC", "\uB2E8\uC885"].includes(v)) return "discontinued";
  return null;
}
__name(mapStatus, "mapStatus");
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders }
  });
}
__name(json, "json");
function toInt(v, d) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
}
__name(toInt, "toInt");
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
__name(clamp, "clamp");
async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(safeJson, "safeJson");
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
    ...opts.headers
  };
  const init = { method: opts.method, headers };
  if (opts.body !== void 0) init.body = JSON.stringify(opts.body);
  return fetch(url, init);
}
__name(fromSupabase, "fromSupabase");

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const pf = preflight(request, "*");
    if (pf) return pf;
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return withCORS(new Response("ok", { status: 200 }));
    }
    if (url.pathname === "/") {
      return withCORS(new Response("zestco backend \uC0B4\uC544\uC788\uB2F9", { status: 200 }));
    }
    if (url.pathname.startsWith("/api/products")) {
      if (request.method === "GET") {
        const resp2 = await handleContent(request, { ...env, CONTENT_TABLE: "products" });
        return withCORS(resp2);
      }
      const auth = await requireAdmin(request, env);
      if (!auth.ok) {
        return withCORS(new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "content-type": "application/json" }
        }));
      }
      const resp = await handleContent(request, { ...env, CONTENT_TABLE: "products" });
      return withCORS(resp);
    }
    if (url.pathname === "/api/content" && request.method === "GET") {
      const resp = await handleContent(request, env);
      return withCORS(resp);
    }
    if (url.pathname.startsWith("/api/content/") && request.method === "GET") {
      const resp = await handleContent(request, env);
      return withCORS(resp);
    }
    if (url.pathname.startsWith("/api/content")) {
      const auth = await requireAdmin(request, env);
      if (!auth.ok) {
        return withCORS(new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "content-type": "application/json" }
        }));
      }
      const resp = await handleContent(request, env);
      return withCORS(resp);
    }
    return withCORS(new Response("Not Found", { status: 404 }));
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-LJ4GOk/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-LJ4GOk/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
