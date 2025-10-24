import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ImageUploader({ onPick }: { onPick:(file:File, url:string)=>void }) {
    return (
        <div className="space-y-2">
            <Label htmlFor="png">Upload PNG</Label>
            <Input
                id="png"
                type="file"
                accept="image/png"
                onChange={(e)=>{
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.type !== "image/png") { alert("Only PNG"); return; }
                    onPick(f, URL.createObjectURL(f));
                }}
            />
            <p className="text-xs text-muted-foreground">Max 20MB · PNG only</p>
        </div>
    );
}
