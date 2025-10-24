import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "@/components/ImageUploader";
import Cropper from "@/components/Cropper";
import type { CropRect } from "@/types/image";

export default function ImageCropperPage() {
    const fileRef = useRef<File | null>(null);
    const [imgUrl, setImgUrl] = useState("");
    const [naturalW, setNaturalW] = useState(0);
    const [naturalH, setNaturalH] = useState(0);
    const [displayCrop, setDisplayCrop] = useState<CropRect>({ x:0, y:0, width:0, height:0 });

    const onPick = (file: File, url: string) => {
        fileRef.current = file;
        setImgUrl(url);
    };

    return (
        <div className="container mx-auto max-w-4xl p-6">
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

                    {/* 2) Crop */}
                    <section className="space-y-3">
                        <h3 className="font-semibold">2) Crop</h3>
                        {imgUrl ? (
                            <>
                                <Cropper
                                    imgUrl={imgUrl}
                                    onNaturalReady={(w,h)=>{ setNaturalW(w); setNaturalH(h); }}
                                    onDisplayCropChange={setDisplayCrop}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Crop (display px): {displayCrop.width}×{displayCrop.height} @ {displayCrop.x},{displayCrop.y}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">Upload an image first.</p>
                        )}
                    </section>

                    <Separator />

                    {/* 3) Preview result (placeholder) */}
                    <section className="space-y-3">
                        <h3 className="font-semibold">3) Preview (5%)</h3>
                        <p className="text-sm text-muted-foreground">
                            Coming next: button to call backend and render preview PNG here.
                        </p>
                    </section>

                    <Separator />

                    {/* 4) Config + 5) Generate (placeholder) */}
                    <section className="space-y-1">
                        <h3 className="font-semibold">4) Config (optional) & 5) Generate</h3>
                        <p className="text-sm text-muted-foreground">
                            After preview, we’ll add config form (logo/position/scale) and Generate button.
                        </p>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
}
