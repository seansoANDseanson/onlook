/**
 * Design token utilities powered by Style Dictionary.
 * Converts visual editor properties into structured, exportable design tokens.
 *
 * These functions generate token objects compatible with Style Dictionary's format,
 * which can then be transformed into CSS variables, Tailwind config, SCSS, etc.
 */

export interface DesignToken {
    value: string | number;
    type: string;
    description?: string;
}

export interface DesignTokenGroup {
    [key: string]: DesignToken | DesignTokenGroup;
}

/**
 * Create a color token group from a color palette.
 */
export function createColorTokens(
    name: string,
    colors: Record<string, string>,
): DesignTokenGroup {
    const group: DesignTokenGroup = {};
    for (const [shade, hex] of Object.entries(colors)) {
        group[shade] = {
            value: hex,
            type: 'color',
            description: `${name} ${shade}`,
        };
    }
    return { [name]: group };
}

/**
 * Create spacing tokens from a scale.
 */
export function createSpacingTokens(
    scale: Record<string, string | number>,
): DesignTokenGroup {
    const group: DesignTokenGroup = {};
    for (const [name, value] of Object.entries(scale)) {
        group[name] = {
            value: typeof value === 'number' ? `${value}px` : value,
            type: 'dimension',
            description: `Spacing ${name}`,
        };
    }
    return { spacing: group };
}

/**
 * Create typography tokens.
 */
export function createTypographyTokens(config: {
    fontFamily: string;
    sizes: Record<string, { fontSize: string; lineHeight: string; fontWeight?: string }>;
}): DesignTokenGroup {
    const sizes: DesignTokenGroup = {};
    for (const [name, props] of Object.entries(config.sizes)) {
        sizes[name] = {
            fontSize: { value: props.fontSize, type: 'dimension' },
            lineHeight: { value: props.lineHeight, type: 'dimension' },
            ...(props.fontWeight
                ? { fontWeight: { value: props.fontWeight, type: 'fontWeight' } }
                : {}),
        } as DesignTokenGroup;
    }

    return {
        typography: {
            fontFamily: {
                value: config.fontFamily,
                type: 'fontFamily',
                description: 'Primary font family',
            },
            ...sizes,
        },
    };
}

/**
 * Create shadow tokens.
 */
export function createShadowTokens(
    shadows: Record<string, string>,
): DesignTokenGroup {
    const group: DesignTokenGroup = {};
    for (const [name, value] of Object.entries(shadows)) {
        group[name] = {
            value,
            type: 'shadow',
            description: `Shadow ${name}`,
        };
    }
    return { shadow: group };
}

/**
 * Create border radius tokens.
 */
export function createRadiusTokens(
    radii: Record<string, string>,
): DesignTokenGroup {
    const group: DesignTokenGroup = {};
    for (const [name, value] of Object.entries(radii)) {
        group[name] = {
            value,
            type: 'dimension',
            description: `Border radius ${name}`,
        };
    }
    return { radius: group };
}

/**
 * Merge multiple token groups into a single token file structure.
 */
export function mergeTokenGroups(...groups: DesignTokenGroup[]): DesignTokenGroup {
    return Object.assign({}, ...groups);
}

/**
 * Export tokens as a JSON string (Style Dictionary compatible format).
 */
export function exportTokensAsJSON(tokens: DesignTokenGroup): string {
    return JSON.stringify(tokens, null, 2);
}

/**
 * Convert tokens to CSS custom properties.
 */
export function tokensToCSSVariables(
    tokens: DesignTokenGroup,
    prefix = '--',
    path: string[] = [],
): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(tokens)) {
        const currentPath = [...path, key];

        if ('value' in value && 'type' in value) {
            const varName = `${prefix}${currentPath.join('-')}`;
            lines.push(`  ${varName}: ${value.value};`);
        } else {
            lines.push(tokensToCSSVariables(value as DesignTokenGroup, prefix, currentPath));
        }
    }

    if (path.length === 0) {
        return `:root {\n${lines.join('\n')}\n}`;
    }
    return lines.join('\n');
}

/**
 * Convert tokens to a Tailwind theme extend config object.
 */
export function tokensToTailwindConfig(tokens: DesignTokenGroup): Record<string, any> {
    const config: Record<string, any> = {};

    for (const [key, value] of Object.entries(tokens)) {
        if ('value' in value && 'type' in value) {
            config[key] = (value as DesignToken).value;
        } else {
            config[key] = tokensToTailwindConfig(value as DesignTokenGroup);
        }
    }

    return config;
}
