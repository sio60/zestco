import { preflight, withCORS } from "./utils/cors.js";
import { requireAdmin } from "./utils/auth.js";
import { handleContent } from "./routes/content.js";

export default {
  async fetch(request, env, ctx) {
    const pf = preflight(request, "*");
    if (pf) return pf;

    const url = new URL(request.url);

    // 헬스체크
    if (url.pathname === "/health") {
      return withCORS(new Response("ok", { status: 200 }));
    }

    // 루트 확인용(선택)
    if (url.pathname === "/") {
      return withCORS(new Response("zestco backend 살아있당", { status: 200 }));
    }

    // ---------- Products ----------
    if (url.pathname.startsWith("/api/products")) {
      // 공개 조회는 GET만 허용
      if (request.method === "GET") {
        const resp = await handleContent(request, { ...env, CONTENT_TABLE: "products" });
        return withCORS(resp);
      }
      // 그 외 메서드는 관리자 전용
      const auth = await requireAdmin(request, env);
      if (!auth.ok) {
        return withCORS(new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { "content-type": "application/json" }
        }));
      }
      const resp = await handleContent(request, { ...env, CONTENT_TABLE: "products" });
      return withCORS(resp);
    }

    // ---------- 기존 content(필요 시 유지) ----------
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
          status: 401, headers: { "content-type": "application/json" }
        }));
      }
      const resp = await handleContent(request, env);
      return withCORS(resp);
    }

    return withCORS(new Response("Not Found", { status: 404 }));
  }
};
