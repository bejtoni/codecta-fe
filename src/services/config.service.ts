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
  console.log(input.scaleDown);
  fd.append("logoPosition", input.logoPosition);
  console.log(input.logoPosition);
  if (input.logoImage) fd.append("logoImage", input.logoImage);

  const res = await api.post("/api/config", fd);
  return res.data as ConfigResponse;
}

/**s
 * Dohvati jedan config po ID-u
 * GET /api/config/{id}
 */
export async function getConfig(id: number): Promise<ConfigResponse> {
  const res = await api.get(`/api/config/${id}`);
  return res.data as ConfigResponse;
}

/**
 * Ažuriraj postojeći config
 * PUT /api/config/{id}
 * - možeš promijeniti scaleDown/position, i (opcionalno) uploadati novi logo
 */
export async function updateConfig(
  id: number,
  input: UpdateConfigInput
): Promise<ConfigResponse> {
  const fd = new FormData();
  if (typeof input.scaleDown === "number")
    fd.append("scaleDown", String(input.scaleDown));
  if (input.logoPosition) fd.append("logoPosition", input.logoPosition);
  if (input.logoImage) fd.append("logoImage", input.logoImage);

  const res = await api.put(`/api/config/${id}`, fd);
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
 * Ažuriraj trenutni config korisnika (bez novog logo-a)
 * PUT /api/config/me
 */
export async function updateMyConfig(input: {
  scaleDown: number;
  logoPosition: ConfigResponse["logoPosition"];
}): Promise<ConfigResponse> {
  const res = await api.put("/api/config/me", input);
  return res.data as ConfigResponse;
}
