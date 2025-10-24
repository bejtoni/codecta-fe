import type { CropRect } from '@/types/image';

/**
 * Pretvara crop iz prikazanih (rendered) px u prirodne (original) px dimenzije slike.
 * - display: crop sa ekrana (react-image-crop)
 * - naturalW/H: originalne dimenzije slike (img.naturalWidth/Height)
 * - renderedW/H: stvarne dimenzije elementa na ekranu (img.clientWidth/Height)
 */
export function toNaturalCrop(
    display: CropRect, naturalW: number, naturalH: number, renderedW: number, renderedH: number
): CropRect {
    const sx = naturalW / Math.max(1, renderedW);
    const sy = naturalH / Math.max(1, renderedH);
    return {
        x: Math.round(display.x * sx),
        y: Math.round(display.y * sy),
        width: Math.round(display.width * sx),
        height: Math.round(display.height * sy),
    };
}
