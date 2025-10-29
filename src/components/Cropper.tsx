import { useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import { type Crop, ReactCrop } from "react-image-crop";

type Props = {
  imgUrl: string;
  onNaturalReady: (w: number, h: number) => void;
  onDisplayCropChange: (crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
};

export default function Cropper({
  imgUrl,
  onNaturalReady,
  onDisplayCropChange,
}: Props) {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 20,
    y: 20,
    width: 200,
    height: 200,
  });
  const [isPortrait, setIsPortrait] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Provjeri da li je slika portretna (viša nego što je široka)
    setIsPortrait(naturalHeight > naturalWidth);

    onNaturalReady(naturalWidth, naturalHeight);
  };

  // FIX: Solution is working - try to optimize later

  return (
    <div className="rounded-md border overflow-none">
      <ReactCrop
        crop={crop}
        onChange={(_, p) => {
          setCrop(p);

          // Convert percentage coordinates to pixel coordinates if needed
          const imgEl =
            document.querySelector<HTMLImageElement>('img[alt="source"]');
          if (imgEl && p.unit === "%") {
            const imgWidth = imgEl.clientWidth;
            const imgHeight = imgEl.clientHeight;

            const pixelCrop = {
              x: ((p.x ?? 0) / 100) * imgWidth,
              y: ((p.y ?? 0) / 100) * imgHeight,
              width: ((p.width ?? 0) / 100) * imgWidth,
              height: ((p.height ?? 0) / 100) * imgHeight,
            };

            onDisplayCropChange(pixelCrop);
          } else {
            // If ReactCrop returns pixels, use them directly
            onDisplayCropChange({
              x: p.x ?? 0,
              y: p.y ?? 0,
              width: p.width ?? 0,
              height: p.height ?? 0,
            });
          }
        }}
      >
        <img
          src={imgUrl}
          className={
            isPortrait ? "h-[90vh] w-auto object-contain" : "max-w-full h-auto"
          }
          alt="source"
          onLoad={handleImageLoad}
        />
      </ReactCrop>
    </div>
  );
}
