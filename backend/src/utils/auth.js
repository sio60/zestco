// 아주 심플한 예: Bearer 토큰에 사전 공유한 관리자 토큰을 쓰거나,
// Supabase JWT를 검증하고 프로필 role을 확인하도록 확장 가능.

export async function requireAdmin(request, env) {
  const auth = request.headers.get("Authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null

  // 1) 간단 모드: JWT_SECRET과 동일한 토큰이면 관리자
  if (token && env.JWT_SECRET && token === env.JWT_SECRET) {
    return { ok: true, user: { role: "admin" } }
  }

  // 2) 확장: Supabase JWT 검증 + profiles.role 확인 로직(필요 시)
  // - Supabase Auth의 jwks로 검증하거나, /auth/v1/user 호출 후 DB에서 role 체크
  // 여기선 간단화: 실패 처리
  return { ok: false, error: "UNAUTHORIZED" }
}
