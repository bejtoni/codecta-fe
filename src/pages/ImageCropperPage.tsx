import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "@/components/ImageUploader";
import Cropper from "@/components/Cropper";
import PreviewResult from "@/components/PreviewResult";
import type { CropRect } from "@/types/image";
import { toNaturalCrop } from "@/lib/scale";
import {generateImage, previewImage} from "@/services/image.service";
import { Button } from "@/components/ui/button";
import ConfigPanel from "@/components/ConfigPanel.tsx";
// import ConfigPanel from "@/components/ConfigPanel";

export default function ImageCropperPage() {
  // Držimo referencu na fajl da ga možemo slati ka BE
  const fileRef = useRef<File | null>(null);

  // Frontend state: putanja do prikaza slike i dimenzije
  const [imgUrl, setImgUrl] = useState("");
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  // Crop koordinat e u "display" pikselima (kako korisnik vidi na ekranu)
  const [displayCrop, setDisplayCrop] = useState<CropRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Rezultat preview-a (Blob iz BE)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  // Loading indikator za dugme
  const [busy, setBusy] = useState<boolean>(false);
  const [genBusy, setGenBusy] = useState(false) // odvojen loading za Generate

  // State za configId
  const [configId, setConfigId] = useState<number | undefined>(undefined)


  // Upload handler — čuva fajl i prikazuje ga
  const onPick = (file: File, url: string) => {
    fileRef.current = file;
    setImgUrl(url);
    setPreviewBlob(null); // reset ranijeg preview-a na novi upload
  };

  /**
   * Klik na "Preview (5%)"
   * - mjerimo render dimenzije <img> (clientWidth/Height)
   * - pretvaramo display crop → natural crop
   * - šaljemo na BE i prikažemo vraćeni PNG (Blob)
   */
  const doPreview = async () => {
    if (!fileRef.current) {
      alert("Upload PNG first");
      return;
    }

    // Dohvati trenutno renderovani <img> (iz Cropper-a) da uzmemo "rendered" dimenzije
    const imgEl = document.querySelector<HTMLImageElement>('img[alt="source"]');
    const renderedW = imgEl?.clientWidth ?? 0;
    const renderedH = imgEl?.clientHeight ?? 0;

    // Pretvori display → original (natural) px
    const nat = toNaturalCrop(
      displayCrop,
      naturalW,
      naturalH,
      renderedW,
      renderedH
    );
    if (nat.width <= 0 || nat.height <= 0) {
      alert("Select a crop area");
      return;
    }



    try {
      setBusy(true);
      const blob = await previewImage(fileRef.current, nat);
      setPreviewBlob(blob);

      // DEBUG : provjeri u clg sta je vratio window i popup slike u novom prozoru
      // console.log("[preview] blob type/size:", blob.type, blob.size);
      // const tmp = URL.createObjectURL(blob);
      // window.open(tmp, "_blank");

    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  /**
   * Klik na "Generate PNG"
   * - isti mapping kao kod preview-a (display → natural)
   * - šaljemo /api/image/generate (sa ili bez configId)
   * - BE vraća full-quality PNG → automatski download
   */
  const doGenerate = async () => {
    if (!fileRef.current) {
      alert("Upload PNG first");
      return;
    }

    const imgEl = document.querySelector<HTMLImageElement>('img[alt="source"]');
    const renderedW = imgEl?.clientWidth ?? 0;
    const renderedH = imgEl?.clientHeight ?? 0;

    const nat = toNaturalCrop(displayCrop, naturalW, naturalH, renderedW, renderedH);
    if (nat.width <= 0 || nat.height <= 0) {
      alert("Select a crop area");
      return;
    }

    try {
      setGenBusy(true);
      // ⚙️ Ako configId postoji → BE će primijeniti logo overlay
      const blob = await generateImage(fileRef.current, { rect: nat, configId });

      // Automatski download rezultata
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cropped.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      alert(msg);
    } finally {
      setGenBusy(false);
    }
  };



  return (
    <div className="container mx-auto max-w-6xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>ImageCropper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 1) Upload */}
          <section className="space-y-3">
            <h3 className="font-semibold">1) Upload</h3>
            <ImageUploader onPick={onPick} />
            {imgUrl && (
              <p className="text-xs text-muted-foreground">
                Natural image size: {naturalW} × {naturalH}px
              </p>
            )}
          </section>

          <Separator />

          {/* 2) Crop  - FIX: selected size ! od natural size, jer je skaliran na kontejner, nadi fix*/}
          <section className="space-y-3">
            <h3 className="font-semibold">2) Crop</h3>
            {imgUrl ? (
              <>
                <Cropper
                  imgUrl={imgUrl}
                  onNaturalReady={(w, h) => {
                    setNaturalW(w);
                    setNaturalH(h);
                  }}
                  onDisplayCropChange={setDisplayCrop}
                />
                <p className="text-xs text-muted-foreground">
                  Crop (display in % of the picture): {displayCrop.width}×{displayCrop.height} @{" "}
                  {displayCrop.x},{displayCrop.y}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Upload an image first.
              </p>
            )}
          </section>

          <Separator />

          {/* 3) Preview (5%) */}
          <section className="space-y-3">
            <h3 className="font-semibold">3) Preview (5%)</h3>
            <Button variant="secondary" onClick={doPreview} disabled={busy || !imgUrl}>
              {busy
                ? "Previewing…" // dok se učitava
                : imgUrl
                ? "Click to preview (5%)" // kad je uploadana slika
                : "Upload image first"}{" "}
            </Button>
            {/* Prikaz vraćenog PNG-a */}
            <PreviewResult blob={previewBlob} />
          </section>

          <Separator />

          {/* 4) Config (optional) */}
          <section className="space-y-3">
            <h3 className="font-semibold">4) Config (optional logo)</h3>
            <ConfigPanel onSaved={(id) => setConfigId(id)} />
            <p className="text-xs text-muted-foreground">
              Current config ID: {configId ?? "none"}
            </p>
          </section>

          <Separator />

          {/* 5) Generate (full quality) */}
          <section className="space-y-3">
            <h3 className="font-semibold">5) Generate (full quality)</h3>
            <Button
                variant="outline"
                onClick={doGenerate}
                disabled={genBusy || !imgUrl}
                className={`transition-all ${imgUrl ? "opacity-100" : "opacity-60 cursor-not-allowed"}`}
            >
              {genBusy
                  ? "Generating…"
                  : !imgUrl
                      ? "Upload image first"
                      : configId
                          ? "Generate PNG (with logo)"
                          : "Generate PNG"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {configId
                  ? "Logo overlay će biti primijenjen (active config)."
                  : "Logo overlay nije postavljen (no config)."}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
