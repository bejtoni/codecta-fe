import { api } from "@/lib/api";
import type { ConfigResponse, CreateConfigInput } from "@/types/config";

/**
 * Kreira novi logo config
 * POST /api/config
 */
export async function createConfig(
  input: CreateConfigInput
): Promise<ConfigResponse> {
  const fd = new FormData();
  fd.append("scaleDownPercent", String(input.scaleDown));
  fd.append("logoPosition", input.logoPosition);
  if (input.logoImage) fd.append("logoImage", input.logoImage);

  const res = await api.post("/api/config", fd);
  return res.data as ConfigResponse;
}

/**
 * Dohvati trenutni config korisnika
 * GET /api/config/me
 */
export async function getMyConfig(): Promise<ConfigResponse> {
  const res = await api.get("/api/config/me");
  return res.data as ConfigResponse;
}

/**
 * Ažuriraj trenutni config korisnika (parcijalno - sva polja opciona)
 * PUT /api/config/me (multipart)
 */
export async function updateMyConfig(input: {
  scaleDown: number;
  logoPosition: ConfigResponse["logoPosition"];
}): Promise<ConfigResponse> {
  const fd = new FormData();
  fd.append("scaleDownPercent", String(input.scaleDown));
  fd.append("position", input.logoPosition);

  const res = await api.put("/api/config/me", fd);
  return res.data as ConfigResponse;
}
