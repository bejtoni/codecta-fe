import { api } from "@/lib/api";
import type {
  ConfigResponse,
  CreateConfigInput,
  UpdateConfigInput,
} from "@/types/config";

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
export async function updateMyConfig(
  input: UpdateConfigInput
): Promise<ConfigResponse> {
  const fd = new FormData();
  if (input.scaleDown !== undefined) {
    fd.append("scaleDownPercent", String(input.scaleDown));
  }
  if (input.logoPosition) {
    fd.append("logoPosition", input.logoPosition);
  }
  if (input.logoImage) {
    fd.append("logoImage", input.logoImage);
  }

  const res = await api.put("/api/config/me", fd);
  return res.data as ConfigResponse;
}
