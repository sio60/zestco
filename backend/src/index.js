import { preflight, withCORS } from "./utils/cors.js";
import { requireAdmin } from "./utils/auth.js";
import { handleContent } from "./routes/content.js";

export default {
  async fetch(request, env, ctx) {
    // CORS Preflight
    const pf = preflight(request, "*");
    if (pf) return pf;

    const url = new URL(request.url);

    // 헬스체크
    if (url.pathname === "/health") {
      return withCORS(new Response("ok", { status: 200 }));
    }

    // 공개 조회(READ)만 허용: GET /api/content, GET /api/content/:id
    if (url.pathname === "/api/content" && request.method === "GET") {
      const resp = await handleContent(request, env);
      return withCORS(resp);
    }
    if (url.pathname.startsWith("/api/content/") && request.method === "GET") {
      const resp = await handleContent(request, env);
      return withCORS(resp);
    }
    if (url.pathname === "/") {
      return withCORS(new Response("zestco backend 살아있당", { status: 200 }));
    }

    // 관리자 권한 필요: POST/PATCH/DELETE /api/content(/:id)
    if (url.pathname.startsWith("/api/content")) {
      const auth = await requireAdmin(request, env);
      if (!auth.ok) {
        return withCORS(
          new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          })
        );
      }
      const resp = await handleContent(request, env);
      return withCORS(resp);
    }

    // 그 외 404
    return withCORS(new Response("Not Found", { status: 404 }));
  },
};
