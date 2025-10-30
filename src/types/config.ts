// Šta backend vraća kad pročita/kreira config
export type ConfigResponse = {
  id: number;
  scaleDown: number; // 0.01–0.25
  logoPosition:
    | "TOP_LEFT"
    | "TOP_RIGHT"
    | "BOTTOM_LEFT"
    | "BOTTOM_RIGHT"
    | "CENTER";
  hasLogo: boolean;
};

// Za kreiranje (multipart: scaleDown, logoPosition, logoImage?)
export type CreateConfigInput = {
  scaleDown: number;
  logoPosition: ConfigResponse["logoPosition"];
  logoImage: File;
};

// Za ažuriranje (multipart: scaleDown, logoPosition, logoImage?)
export type UpdateConfigInput = {
  scaleDown?: number;
  logoPosition?: ConfigResponse["logoPosition"];
  logoImage?: File;
};
