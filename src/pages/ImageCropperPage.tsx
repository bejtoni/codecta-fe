import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "@/components/ImageUploader";
import Cropper from "@/components/Cropper";
import PreviewResult from "@/components/PreviewResult";
import type { CropRect } from "@/types/image";
import { toNaturalCrop } from "@/lib/scale";
import { generateImage, previewImage } from "@/services/image.service";
import { Button } from "@/components/ui/button";
import ConfigPanel from "@/components/ConfigPanel.tsx";
import { useAuthStore } from "@/stores/auth.store";

export default function ImageCropperPage() {
  const { user, logout } = useAuthStore();

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

  // Rezultat generate-a (Blob iz BE)
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

  // Loading indikator za dugme
  const [busy, setBusy] = useState<boolean>(false);
  const [genBusy, setGenBusy] = useState(false); // odvojen loading za Generate

  // Upload handler — čuva fajl i prikazuje ga
  const onPick = (file: File, url: string) => {
    fileRef.current = file;
    setImgUrl(url);
    setPreviewBlob(null); // reset ranijeg preview-a na novi upload
  };

  // Izračunaj proporcije crop-a u odnosu na natural dimenzije
  const getCropProportions = () => {
    if (
      displayCrop.width <= 0 ||
      displayCrop.height <= 0 ||
      naturalW <= 0 ||
      naturalH <= 0
    ) {
      return null;
    }

    const imgEl = document.querySelector<HTMLImageElement>('img[alt="source"]');
    if (!imgEl) {
      return null;
    }

    const renderedW = imgEl.clientWidth;
    const renderedH = imgEl.clientHeight;

    if (renderedW <= 0 || renderedH <= 0) {
      return null;
    }

    // Konvertuj display crop u natural crop
    const naturalCrop = toNaturalCrop(
      displayCrop,
      naturalW,
      naturalH,
      renderedW,
      renderedH
    );

    // Izračunaj proporcije u odnosu na natural dimenzije
    return {
      width: (naturalCrop.width / naturalW).toFixed(2),
      height: (naturalCrop.height / naturalH).toFixed(2),
      x: (naturalCrop.x / naturalW).toFixed(2),
      y: (naturalCrop.y / naturalH).toFixed(2),
    };
  };

  /**
   * Helper: izračuna natural crop iz display crop-a koristeći trenutne render dimenzije <img>.
   * Vraća natural crop ili null ako validacija ne prođe (nema fajla/slika/crop-a).
   */
  const getNaturalCrop = (): CropRect | null => {
    if (!fileRef.current) return null;

    const imgEl = document.querySelector<HTMLImageElement>('img[alt="source"]');
    const renderedW = imgEl?.clientWidth ?? 0;
    const renderedH = imgEl?.clientHeight ?? 0;
    if (renderedW <= 0 || renderedH <= 0) return null;

    const nat = toNaturalCrop(
      displayCrop,
      naturalW,
      naturalH,
      renderedW,
      renderedH
    );
    if (nat.width <= 0 || nat.height <= 0) return null;
    return nat;
  };

  /**
   * Klik na "Preview (5%)"
   * - mjerimo render dimenzije <img> (clientWidth/Height)
   * - pretvaramo display crop → natural crop
   * - šaljemo na BE i prikažemo vraćeni PNG (Blob)
   */
  const doPreview = async () => {
    const nat = getNaturalCrop();
    if (!nat) {
      alert(!fileRef.current ? "Upload PNG first" : "Select a crop area");
      return;
    }

    try {
      setBusy(true);
      const blob = await previewImage(fileRef.current!, nat);
      setPreviewBlob(blob);
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
    const nat = getNaturalCrop();
    if (!nat) {
      alert(!fileRef.current ? "Upload PNG first" : "Select a crop area");
      return;
    }

    try {
      setGenBusy(true);
      // BE automatski koristi "me" config za logo overlay
      const blob = await generateImage(fileRef.current!, nat);

      // Spremi rezultat za prikaz
      setGeneratedBlob(blob);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      alert(msg);
    } finally {
      setGenBusy(false);
    }
  };

  return (
    <div className="container mx-auto min-w-xl p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
          <CardTitle className="text-3xl">ImageCropper</CardTitle>
          <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 1) Upload */}
          <section className="space-y-3">
            <h3 className="font-semibold text-xl">1) Upload</h3>
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
            <h3 className="font-semibold text-xl">2) Crop</h3>
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
                  Crop (proportional to natural size):{" "}
                  {(() => {
                    const proportions = getCropProportions();
                    if (proportions) {
                      return (
                        <>
                          {proportions.width}×{proportions.height} @{" "}
                          {proportions.x}, {proportions.y}
                        </>
                      );
                    }
                    return `${displayCrop.width}×${displayCrop.height} @ ${displayCrop.x}, ${displayCrop.y}`;
                  })()}
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
            <h3 className="font-semibold text-xl">3) Preview (5%)</h3>
            <Button
              variant="secondary"
              onClick={doPreview}
              disabled={busy || !imgUrl}
            >
              {busy
                ? "Previewing…" // dok se učitava
                : imgUrl
                ? "Click to preview (5%)" // kad je uploadana slika
                : "Upload image first"}{" "}
            </Button>
            {/* Prikaz vraćenog PNG-a */}
            <div className="w-[300px] mx-auto">
              <PreviewResult blob={previewBlob} />
            </div>
          </section>

          <Separator />

          {/* 4) Config (optional) */}
          <section className="space-y-3">
            <h3 className="font-semibold text-xl">4) Config (optional logo)</h3>
            <ConfigPanel />
          </section>

          <Separator />

          {/* 5) Generate (full quality) */}
          <section className="space-y-3">
            <h3 className="font-semibold text-xl">
              5) Generate (full quality)
            </h3>
            <Button
              variant="outline"
              onClick={doGenerate}
              disabled={genBusy || !imgUrl}
              className={`transition-all ${
                imgUrl ? "opacity-100" : "opacity-60 cursor-not-allowed"
              }`}
            >
              {genBusy
                ? "Generating…"
                : !imgUrl
                ? "Upload image first"
                : "Generate PNG"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Backend automatski koristi trenutni config za logo overlay.
            </p>

            {/* Prikaz generisanog PNG-a */}
            <PreviewResult
              blob={generatedBlob}
              title="Generated Result (Full Quality)"
              showDownload={true}
            />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
