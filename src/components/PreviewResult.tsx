import { Button } from "@/components/ui/button";

/**
 * Prikaz PNG Blob-a iz BE.
 * URL.createObjectURL se automatski revoke-a poslije onLoad.
 */
export default function PreviewResult({
  blob,
  title = "Preview (5%)",
  showDownload = false,
}: {
  blob: Blob | null;
  title?: string;
  showDownload?: boolean;
}) {
  if (!blob) return null;

  const url = URL.createObjectURL(blob);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "cropped.png";
    a.click();
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{title}</p>
      <img
        src={url}
        alt="result"
        className="rounded-md border w-[320px]"
        onLoad={() => URL.revokeObjectURL(url)}
      />
      {showDownload && (
        <Button variant="outline" size="sm" onClick={handleDownload}>
          Download
        </Button>
      )}
    </div>
  );
}
