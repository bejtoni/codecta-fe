import { useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import {type Crop, ReactCrop} from "react-image-crop";

type Props = {
    imgUrl: string;
    onNaturalReady: (w:number, h:number)=>void;
    onDisplayCropChange: (crop:{x:number;y:number;width:number;height:number})=>void;
};

export default function Cropper({ imgUrl, onNaturalReady, onDisplayCropChange }: Props) {
    const [crop, setCrop] = useState<Crop>({ unit:"px", x:20, y:20, width:200, height:200 });

    return (
        <div className="rounded-md border overflow-auto">
            <ReactCrop crop={crop} onChange={(_, p)=>{
                setCrop(p);
                onDisplayCropChange({
                    x: p.x ?? 0, y: p.y ?? 0, width: p.width ?? 0, height: p.height ?? 0
                });
            }}>
                <img
                    src={imgUrl}
                    className="max-w-full h-auto"
                    alt="source"
                    onLoad={(e)=>onNaturalReady(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                />
            </ReactCrop>
        </div>
    );
}
