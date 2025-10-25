import { api } from '@/lib/api'
import type { CropRect } from '@/types/image'

/**
 * - poziva /api/image/preview
 * - šalje multipart (file + meta JSON)
 * - vraća  image/png koji možemo direktno prikazati u <img>
 */
export async function previewImage(file: File, rect: CropRect): Promise<Blob> {
    const fd = new FormData()

    // 1) binarni sadržaj slike (samo PNG)
    fd.append('file', file)

    // 2) meta opis croppa kao JSON (BE očekuje {"crop":{...}})
    fd.append('meta', new Blob([JSON.stringify({ rect })], { type: 'application/json' }))

    // responseType: 'blob' da dobijemo image/png kao Blob
    const res = await api.post('/api/image/preview', fd, { responseType: 'blob' })
    return res.data
}

/**
 * poziva /api/image/generate
 * Šalje file + meta JSON (crop + opcionalno configId).
 * Backend vraća full-quality cropped PNG kao Blob.
 */
export async function generateImage(
    file: File,
    meta: { rect: CropRect; configId?: number }
): Promise<Blob> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append(
        "meta",
        new Blob([JSON.stringify(meta)], { type: "application/json" })
    );

    // responseType: 'blob' jer backend vraća image/png binary
    const res = await api.post("/api/image/generate", fd, { responseType: "blob" });
    return res.data;
}
