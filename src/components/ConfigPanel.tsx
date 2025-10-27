import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { LogoPosition } from "@/types/image";
import {
  createConfig,
  getMyConfig,
  updateMyConfig,
} from "@/services/config.service";
import type { ConfigResponse } from "@/types/config";

/**
 * UI za kreiranje/snimanje logo konfiguracije.
 * - On mount: GET /api/config/me (200 → prefill, 404 → create mode)
 * - Save: ako mijenjaš logo → POST /api/config (multipart UPSERT)
 * - Save: ako ne mijenjaš logo → PUT /api/config/me (JSON)
 */
export default function ConfigPanel({
  onSaved,
}: {
  onSaved: (id: number) => void;
}) {
  const [logo, setLogo] = useState<File | null>(null);
  const [position, setPosition] = useState<LogoPosition>("TOP_RIGHT");
  const [scale, setScale] = useState<number>(0.15); // 15%
  const [busy, setBusy] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ConfigResponse | null>(
    null
  );
  const [hasLogo, setHasLogo] = useState(false);
  const [logoChanged, setLogoChanged] = useState(false);

  // Fetch existing config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getMyConfig();
        setCurrentConfig(config);
        setPosition(config.logoPosition);
        setScale(config.scaleDown);
        setHasLogo(!!config.logoPath);
        onSaved(config.id);
      } catch (error) {
        // 404 or other error - create mode
        console.log("No existing config found, entering create mode");
      }
    };

    fetchConfig();
  }, [onSaved]);

  // Handle logo file selection with validation
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogo(null);
      setLogoChanged(false);
      return;
    }

    // Validate PNG file type
    if (file.type !== "image/png") {
      alert("Please select a PNG file");
      e.target.value = ""; // Clear the input
      return;
    }

    setLogo(file);
    setLogoChanged(true);
  };

  // Validate slider range
  const handleScaleChange = (value: number[]) => {
    const newScale = value[0];
    if (newScale >= 0.01 && newScale <= 0.25) {
      setScale(newScale);
    }
  };

  const save = async () => {
    // Validation
    if (!currentConfig && !logo) {
      alert("Upload logo (PNG) to create config");
      return;
    }

    if (scale < 0.01 || scale > 0.25) {
      alert("Scale must be between 1% and 25%");
      return;
    }

    try {
      setBusy(true);
      let config: ConfigResponse;

      if (logoChanged || !currentConfig) {
        // Upload new logo or create new config
        if (!logo) {
          alert("Logo file is required");
          return;
        }
        config = await createConfig({
          logoImage: logo,
          logoPosition: position,
          scaleDown: scale,
        });
      } else {
        // Update existing config without changing logo
        config = await updateMyConfig({
          logoPosition: position,
          scaleDown: scale,
        });
      }

      setCurrentConfig(config);
      setHasLogo(!!config.logoPath);
      setLogoChanged(false);
      onSaved(config.id);

      // Show success message
      const action = logoChanged || !currentConfig ? "created" : "updated";
      alert(`Config ${action} successfully (ID: ${config.id})`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Logo Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            hasLogo ? "bg-green-500" : "bg-gray-300"
          }`}
        ></div>
        <span className="text-sm text-muted-foreground">
          {hasLogo ? "Logo configured" : "No logo"}
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo (PNG)</Label>
        <Input
          id="logo"
          type="file"
          accept="image/png"
          onChange={handleLogoChange}
        />
        {logoChanged && (
          <p className="text-xs text-blue-600">New logo selected</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Logo position</Label>
        <Select
          value={position}
          onValueChange={(v) => setPosition(v as LogoPosition)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
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
        <Slider
          value={[scale]}
          min={0.01}
          max={0.25}
          step={0.01}
          onValueChange={handleScaleChange}
        />
        <p className="text-xs text-muted-foreground">
          Current: {(scale * 100).toFixed(0)}%
        </p>
      </div>

      <Button variant="secondary" onClick={save} disabled={busy}>
        {busy ? "Saving…" : currentConfig ? "Update Config" : "Create Config"}
      </Button>

      {currentConfig && (
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Active config ID: {currentConfig.id}</p>
          <p>Position: {currentConfig.logoPosition}</p>
          <p>Scale: {(currentConfig.scaleDown * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  );
}
