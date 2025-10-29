export function withCORS(resp, origin = "*") {
  const headers = new Headers(resp.headers)
  headers.set("Access-Control-Allow-Origin", origin)
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return new Response(resp.body, { status: resp.status, headers })
}

export function preflight(request, origin = "*") {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    })
  }
  return null
}
