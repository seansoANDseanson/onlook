'use client';

import { cn } from '@onlook/ui/utils';
import dynamic from 'next/dynamic';

const FontPicker = dynamic(
    () => import('react-fontpicker-ts-lite').then((mod) => ({ default: mod.default })),
    {
        ssr: false,
        loading: () => (
            <div className="h-9 w-full rounded border border-border bg-background-secondary animate-pulse" />
        ),
    },
);

interface FontPickerWrapperProps {
    value?: string;
    onChange?: (font: string) => void;
    className?: string;
    defaultValue?: string;
}

/**
 * Google Fonts picker with 1,600+ fonts, offline SVG previews, and zero API keys.
 * Powered by react-fontpicker-ts-lite.
 *
 * @example
 * ```tsx
 * <FontPickerWrapper
 *   value={selectedFont}
 *   onChange={(font) => setSelectedFont(font)}
 *   defaultValue="Inter"
 * />
 * ```
 */
export function FontPickerWrapper({
    value,
    onChange,
    className,
    defaultValue = 'Inter',
}: FontPickerWrapperProps) {
    return (
        <div className={cn('font-picker-wrapper', className)}>
            <FontPicker
                defaultValue={value ?? defaultValue}
                value={(font: string) => onChange?.(font)}
            />
        </div>
    );
}
