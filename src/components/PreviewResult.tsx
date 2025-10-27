import { Button } from "@/components/ui/button";
import { useEffect, useMemo } from "react";

/**
 * Prikaz PNG Blob-a iz BE.
 * URL.createObjectURL se automatski revoke-a poslije onLoad.
 */
export default function PreviewResult({
  blob,
  showDownload = false,
}: {
  blob: Blob | null;
  title?: string;
  showDownload?: boolean;
}) {
  // URL se kreira SAMO kada se blob promijeni
  const url = useMemo(() => {
    return blob ? URL.createObjectURL(blob) : null;
  }, [blob]);

  // Cleanup kada se komponenta unmounta
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!blob || !url) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "cropped.png";
    a.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-center">
        <img src={url} alt="result" className="rounded-md border w-full" />
      </div>
      {showDownload && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            Download
          </Button>
        </div>
      )}
    </div>
  );
}
