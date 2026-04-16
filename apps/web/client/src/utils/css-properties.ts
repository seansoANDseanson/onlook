/**
 * CSS property metadata and utilities for building visual property inspectors.
 * Maps CSS properties to their valid values, types, and UI control types.
 */

export type CSSControlType =
    | 'color'
    | 'length'
    | 'select'
    | 'number'
    | 'text'
    | 'slider'
    | 'toggle'
    | 'font'
    | 'shadow'
    | 'gradient';

export interface CSSPropertyMeta {
    name: string;
    controlType: CSSControlType;
    defaultValue: string;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    category: CSSCategory;
}

export type CSSCategory =
    | 'layout'
    | 'spacing'
    | 'sizing'
    | 'typography'
    | 'background'
    | 'border'
    | 'effects'
    | 'position'
    | 'flex'
    | 'grid';

/**
 * Comprehensive metadata for commonly edited CSS properties.
 * Each entry maps to the right control type for a visual inspector.
 */
export const CSS_PROPERTIES: Record<string, CSSPropertyMeta> = {
    // Layout
    display: {
        name: 'Display',
        controlType: 'select',
        defaultValue: 'block',
        options: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none', 'contents'],
        category: 'layout',
    },
    position: {
        name: 'Position',
        controlType: 'select',
        defaultValue: 'static',
        options: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
        category: 'position',
    },
    overflow: {
        name: 'Overflow',
        controlType: 'select',
        defaultValue: 'visible',
        options: ['visible', 'hidden', 'scroll', 'auto', 'clip'],
        category: 'layout',
    },
    zIndex: {
        name: 'Z-Index',
        controlType: 'number',
        defaultValue: 'auto',
        min: -9999,
        max: 9999,
        category: 'position',
    },

    // Spacing
    margin: { name: 'Margin', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    marginTop: { name: 'Margin Top', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    marginRight: { name: 'Margin Right', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    marginBottom: { name: 'Margin Bottom', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    marginLeft: { name: 'Margin Left', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    padding: { name: 'Padding', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    paddingTop: { name: 'Padding Top', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    paddingRight: { name: 'Padding Right', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    paddingBottom: { name: 'Padding Bottom', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    paddingLeft: { name: 'Padding Left', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },
    gap: { name: 'Gap', controlType: 'length', defaultValue: '0', unit: 'px', category: 'spacing' },

    // Sizing
    width: { name: 'Width', controlType: 'length', defaultValue: 'auto', unit: 'px', category: 'sizing' },
    height: { name: 'Height', controlType: 'length', defaultValue: 'auto', unit: 'px', category: 'sizing' },
    minWidth: { name: 'Min Width', controlType: 'length', defaultValue: '0', unit: 'px', category: 'sizing' },
    maxWidth: { name: 'Max Width', controlType: 'length', defaultValue: 'none', unit: 'px', category: 'sizing' },
    minHeight: { name: 'Min Height', controlType: 'length', defaultValue: '0', unit: 'px', category: 'sizing' },
    maxHeight: { name: 'Max Height', controlType: 'length', defaultValue: 'none', unit: 'px', category: 'sizing' },

    // Typography
    fontFamily: { name: 'Font Family', controlType: 'font', defaultValue: 'inherit', category: 'typography' },
    fontSize: { name: 'Font Size', controlType: 'length', defaultValue: '16px', unit: 'px', category: 'typography' },
    fontWeight: {
        name: 'Font Weight',
        controlType: 'select',
        defaultValue: '400',
        options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
        category: 'typography',
    },
    lineHeight: { name: 'Line Height', controlType: 'number', defaultValue: '1.5', step: 0.1, category: 'typography' },
    letterSpacing: { name: 'Letter Spacing', controlType: 'length', defaultValue: 'normal', unit: 'em', category: 'typography' },
    textAlign: {
        name: 'Text Align',
        controlType: 'select',
        defaultValue: 'left',
        options: ['left', 'center', 'right', 'justify'],
        category: 'typography',
    },
    textDecoration: {
        name: 'Text Decoration',
        controlType: 'select',
        defaultValue: 'none',
        options: ['none', 'underline', 'overline', 'line-through'],
        category: 'typography',
    },
    textTransform: {
        name: 'Text Transform',
        controlType: 'select',
        defaultValue: 'none',
        options: ['none', 'uppercase', 'lowercase', 'capitalize'],
        category: 'typography',
    },
    color: { name: 'Color', controlType: 'color', defaultValue: 'inherit', category: 'typography' },

    // Background
    backgroundColor: { name: 'Background', controlType: 'color', defaultValue: 'transparent', category: 'background' },
    backgroundImage: { name: 'Background Image', controlType: 'gradient', defaultValue: 'none', category: 'background' },

    // Border
    borderWidth: { name: 'Border Width', controlType: 'length', defaultValue: '0', unit: 'px', category: 'border' },
    borderStyle: {
        name: 'Border Style',
        controlType: 'select',
        defaultValue: 'none',
        options: ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'],
        category: 'border',
    },
    borderColor: { name: 'Border Color', controlType: 'color', defaultValue: 'currentColor', category: 'border' },
    borderRadius: { name: 'Border Radius', controlType: 'length', defaultValue: '0', unit: 'px', category: 'border' },

    // Effects
    opacity: { name: 'Opacity', controlType: 'slider', defaultValue: '1', min: 0, max: 1, step: 0.01, category: 'effects' },
    boxShadow: { name: 'Box Shadow', controlType: 'shadow', defaultValue: 'none', category: 'effects' },
    cursor: {
        name: 'Cursor',
        controlType: 'select',
        defaultValue: 'auto',
        options: ['auto', 'default', 'pointer', 'text', 'move', 'not-allowed', 'grab', 'crosshair'],
        category: 'effects',
    },

    // Flex
    flexDirection: {
        name: 'Direction',
        controlType: 'select',
        defaultValue: 'row',
        options: ['row', 'row-reverse', 'column', 'column-reverse'],
        category: 'flex',
    },
    flexWrap: {
        name: 'Wrap',
        controlType: 'select',
        defaultValue: 'nowrap',
        options: ['nowrap', 'wrap', 'wrap-reverse'],
        category: 'flex',
    },
    justifyContent: {
        name: 'Justify',
        controlType: 'select',
        defaultValue: 'flex-start',
        options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
        category: 'flex',
    },
    alignItems: {
        name: 'Align Items',
        controlType: 'select',
        defaultValue: 'stretch',
        options: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
        category: 'flex',
    },
    flexGrow: { name: 'Grow', controlType: 'number', defaultValue: '0', min: 0, max: 10, category: 'flex' },
    flexShrink: { name: 'Shrink', controlType: 'number', defaultValue: '1', min: 0, max: 10, category: 'flex' },
};

/**
 * Get properties grouped by category.
 */
export function getPropertiesByCategory(): Record<CSSCategory, CSSPropertyMeta[]> {
    const categories: Record<CSSCategory, CSSPropertyMeta[]> = {
        layout: [],
        spacing: [],
        sizing: [],
        typography: [],
        background: [],
        border: [],
        effects: [],
        position: [],
        flex: [],
        grid: [],
    };

    for (const prop of Object.values(CSS_PROPERTIES)) {
        categories[prop.category].push(prop);
    }

    return categories;
}

/**
 * Map a CSS property value to a Tailwind class.
 */
export function cssToTailwind(property: string, value: string): string | null {
    const mapping: Record<string, Record<string, string>> = {
        display: { block: 'block', flex: 'flex', grid: 'grid', none: 'hidden', 'inline-block': 'inline-block', 'inline-flex': 'inline-flex' },
        position: { relative: 'relative', absolute: 'absolute', fixed: 'fixed', sticky: 'sticky' },
        textAlign: { left: 'text-left', center: 'text-center', right: 'text-right', justify: 'text-justify' },
        flexDirection: { row: 'flex-row', column: 'flex-col', 'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse' },
        flexWrap: { wrap: 'flex-wrap', nowrap: 'flex-nowrap' },
        justifyContent: { 'flex-start': 'justify-start', 'flex-end': 'justify-end', center: 'justify-center', 'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly' },
        alignItems: { 'flex-start': 'items-start', 'flex-end': 'items-end', center: 'items-center', stretch: 'items-stretch', baseline: 'items-baseline' },
        overflow: { hidden: 'overflow-hidden', scroll: 'overflow-scroll', auto: 'overflow-auto', visible: 'overflow-visible' },
    };

    return mapping[property]?.[value] ?? null;
}
