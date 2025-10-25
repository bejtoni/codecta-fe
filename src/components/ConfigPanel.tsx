import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import type { LogoPosition } from "@/types/image"
import {createConfig} from "@/services/config.service.ts";

/**
 * UI za kreiranje/snimanje logo konfiguracije.
 * - šalje PNG logo + position + scaleDown na BE
 * - po uspjehu vraća id (spremamo i u localStorage, radi praktičnosti)
 */
export default function ConfigPanel({ onSaved }:{ onSaved:(id:number)=>void }) {
    const [logo, setLogo] = useState<File | null>(null)
    const [position, setPosition] = useState<LogoPosition>("TOP_RIGHT")
    const [scale, setScale] = useState<number>(0.15) // 15%
    const [busy, setBusy] = useState(false)
    const [lastSavedId, setLastSavedId] = useState<number | null>(null);

    // Ako postoji ranije spremljen configId — korisno za reload
    useEffect(()=>{
        const saved = localStorage.getItem("configId")
        if (saved) onSaved(Number(saved))
    }, [onSaved])

    const save = async () => {
        if (!logo) return alert("Upload logo (PNG)");
        try {
            setBusy(true);
            const cfg = await createConfig({
                logoImage: logo,
                logoPosition: position,
                scaleDown: scale,
            });
            setLastSavedId(cfg.id);
            localStorage.setItem("configId", String(cfg.id));
            onSaved(cfg.id);
            alert(`Config saved (ID: ${cfg.id})`);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unexpected error";
            alert(msg);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="logo">Logo (PNG)</Label>
                <Input id="logo" type="file" accept="image/png" onChange={(e)=>setLogo(e.target.files?.[0]??null)} />
            </div>

            <div className="space-y-2">
                <Label>Logo position</Label>
                <Select value={position} onValueChange={(v)=>setPosition(v as LogoPosition)}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="TOP_LEFT">TOP_LEFT</SelectItem>
                        <SelectItem value="TOP_RIGHT">TOP_RIGHT</SelectItem>
                        <SelectItem value="BOTTOM_LEFT">BOTTOM_LEFT</SelectItem>
                        <SelectItem value="BOTTOM_RIGHT">BOTTOM_RIGHT</SelectItem>
                        <SelectItem value="CENTER">CENTER</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>scaleDown (1–25%)</Label>
                {/* BE očekuje 0.01–0.25 (1–25%) */}
                <Slider value={[scale]} min={0.01} max={0.25} step={0.01} onValueChange={(v)=>setScale(v[0])} />
                <p className="text-xs text-muted-foreground">Current: {(scale*100).toFixed(0)}%</p>
            </div>

            <Button variant="secondary" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save Config"}
            </Button>

            {lastSavedId && (
                <p className="text-xs text-muted-foreground text-center">
                    Active config ID: {lastSavedId}
                </p>
            )}
        </div>
    )
}
