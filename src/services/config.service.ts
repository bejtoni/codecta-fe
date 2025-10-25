import { api } from '@/lib/api'
import type { ConfigResponse, CreateConfigInput, UpdateConfigInput } from '@/types/config'

/**
 * Kreira novi logo config
 * POST /api/config
 */
export async function createConfig(input: CreateConfigInput): Promise<ConfigResponse> {
    const fd = new FormData()
    fd.append('scaleDown', String(input.scaleDown))
    fd.append('logoPosition', input.logoPosition)
    if (input.logoImage) fd.append('logoImage', input.logoImage)

    const res = await api.post('/api/config', fd)
    return res.data as ConfigResponse
}

/**
 * Dohvati jedan config po ID-u
 * GET /api/config/{id}
 */
export async function getConfig(id: number): Promise<ConfigResponse> {
    const res = await api.get(`/api/config/${id}`)
    return res.data as ConfigResponse
}

/**
 * Ažuriraj postojeći config
 * PUT /api/config/{id}
 * - možeš promijeniti scaleDown/position, i (opcionalno) uploadati novi logo
 */
export async function updateConfig(id: number, input: UpdateConfigInput): Promise<ConfigResponse> {
    const fd = new FormData()
    if (typeof input.scaleDown === 'number') fd.append('scaleDown', String(input.scaleDown))
    if (input.logoPosition) fd.append('logoPosition', input.logoPosition)
    if (input.logoImage) fd.append('logoImage', input.logoImage)

    const res = await api.put(`/api/config/${id}`, fd)
    return res.data as ConfigResponse
}

