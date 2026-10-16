import type { CurrentUserResponse, MockPersona } from "@/lib/types/navigation";
import { createMockJwt } from "@/lib/auth/cookies";

export function getMockUser(persona: MockPersona = "admin"): CurrentUserResponse {
  const personaMap: Record<
    MockPersona,
    { fullname: string; email: string; is_admin: boolean; initials: string }
  > = {
    admin: {
      fullname: "Admin User",
      email: "admin@nexone.internal",
      is_admin: true,
      initials: "AU",
    },
    inventory: {
      fullname: "Inventory Officer",
      email: "inventory@nexone.internal",
      is_admin: false,
      initials: "IO",
    },
    sales: {
      fullname: "Sales Executive",
      email: "sales@nexone.internal",
      is_admin: false,
      initials: "SE",
    },
  };

  const info = personaMap[persona] || personaMap.admin;

  return {
    username: persona,
    email: info.email,
    fullname: info.fullname,
    display_name: info.fullname,
    is_tenant_admin: info.is_admin,
    is_super_admin: info.is_admin,
    persona,
    initials: info.initials,
  };
}

export function generateMockTokenPair(persona: MockPersona = "admin") {
  const user = getMockUser(persona);
  const accessToken = createMockJwt(
    {
      sub: user.username,
      username: user.username,
      persona: user.persona,
      email: user.email,
      role: user.is_tenant_admin ? "admin" : "user",
    },
    3600 // 1 hour
  );

  const refreshToken = createMockJwt(
    {
      sub: user.username,
      type: "refresh",
      persona: user.persona,
    },
    86400 * 7 // 7 days
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: 3600,
    user,
  };
}
