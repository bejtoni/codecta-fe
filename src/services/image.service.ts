import { api } from '@/lib/api'
import type { CropRect } from '@/types/image'

/**
 * - poziva /api/image/preview
 * - šalje multipart (file + meta JSON)
 * - vraća  image/png koji možemo direktno prikazati u <img>
 */
export async function previewImage(file: File, crop: CropRect): Promise<Blob> {
    const fd = new FormData()

    // 1) binarni sadržaj slike (samo PNG)
    fd.append('file', file)

    // 2) meta opis croppa kao JSON (BE očekuje {"crop":{...}})
    fd.append('meta', new Blob([JSON.stringify({ crop })], { type: 'application/json' }))

    // responseType: 'blob' da dobijemo image/png kao Blob
    const res = await api.post('/api/image/preview', fd, { responseType: 'blob' })
    return res.data
}
