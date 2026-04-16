import chroma from 'chroma-js';

export interface PaletteColor {
    hex: string;
    name: string;
    contrast: {
        onWhite: number;
        onBlack: number;
    };
    wcag: {
        aaLarge: boolean;
        aaNormal: boolean;
        aaaLarge: boolean;
        aaaNormal: boolean;
    };
}

/**
 * Generate a Tailwind-style color scale (50-950) from a base color.
 */
export function generateTailwindScale(baseHex: string): Record<string, string> {
    const base = chroma(baseHex);
    const scale = chroma.scale(['white', base, chroma(baseHex).darken(3)]).mode('lab').colors(11);

    const names = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    const result: Record<string, string> = {};
    names.forEach((name, i) => {
        result[name] = scale[i] ?? baseHex;
    });
    return result;
}

/**
 * Check WCAG contrast ratios for a color against white and black backgrounds.
 */
export function getContrastInfo(hex: string): PaletteColor['contrast'] & PaletteColor['wcag'] {
    const onWhite = chroma.contrast(hex, 'white');
    const onBlack = chroma.contrast(hex, 'black');

    return {
        onWhite: Math.round(onWhite * 100) / 100,
        onBlack: Math.round(onBlack * 100) / 100,
        aaLarge: onWhite >= 3 || onBlack >= 3,
        aaNormal: onWhite >= 4.5 || onBlack >= 4.5,
        aaaLarge: onWhite >= 4.5 || onBlack >= 4.5,
        aaaNormal: onWhite >= 7 || onBlack >= 7,
    };
}

/**
 * Generate a harmonious palette from a base color.
 */
export function generateHarmoniousPalette(
    baseHex: string,
    type: 'complementary' | 'analogous' | 'triadic' | 'split-complementary' = 'analogous',
): string[] {
    const base = chroma(baseHex);
    const hsl = base.hsl();
    const hue = hsl[0] || 0;

    switch (type) {
        case 'complementary':
            return [baseHex, chroma.hsl((hue + 180) % 360, hsl[1], hsl[2]).hex()];
        case 'analogous':
            return [
                chroma.hsl((hue - 30 + 360) % 360, hsl[1], hsl[2]).hex(),
                baseHex,
                chroma.hsl((hue + 30) % 360, hsl[1], hsl[2]).hex(),
            ];
        case 'triadic':
            return [
                baseHex,
                chroma.hsl((hue + 120) % 360, hsl[1], hsl[2]).hex(),
                chroma.hsl((hue + 240) % 360, hsl[1], hsl[2]).hex(),
            ];
        case 'split-complementary':
            return [
                baseHex,
                chroma.hsl((hue + 150) % 360, hsl[1], hsl[2]).hex(),
                chroma.hsl((hue + 210) % 360, hsl[1], hsl[2]).hex(),
            ];
    }
}

/**
 * Suggest the best text color (black or white) for readability on a given background.
 */
export function getReadableTextColor(backgroundHex: string): string {
    const onWhite = chroma.contrast(backgroundHex, 'white');
    const onBlack = chroma.contrast(backgroundHex, 'black');
    return onWhite > onBlack ? '#ffffff' : '#000000';
}

/**
 * Blend two colors together with a given ratio.
 */
export function blendColors(color1: string, color2: string, ratio = 0.5): string {
    return chroma.mix(color1, color2, ratio, 'lab').hex();
}

/**
 * Check if a color combination meets WCAG AA contrast requirements.
 */
export function meetsContrastRequirement(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText = false,
): boolean {
    const ratio = chroma.contrast(foreground, background);
    if (level === 'AAA') {
        return isLargeText ? ratio >= 4.5 : ratio >= 7;
    }
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
