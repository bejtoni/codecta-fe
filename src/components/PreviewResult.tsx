/**
 * Jednostavan prikaz PNG Blob-a iz BE.
 * URL.createObjectURL se automatski revoke-a poslije onLoad.
 */
export default function PreviewResult({ blob }: { blob: Blob | null }) {
    if (!blob) return null
    const url = URL.createObjectURL(blob)
    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Preview (5%)</p>
            <img
                src={url}
                alt="preview"
                className="rounded-md border"
                // revokeObjectURL briše privremeni URL iz memorije kad se slika učita - sprječava curenje memorije
                onLoad={() => URL.revokeObjectURL(url)}
            />
        </div>
    )
}
