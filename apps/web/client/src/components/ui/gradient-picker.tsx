'use client';

import { cn } from '@onlook/ui/utils';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

const ColorPicker = dynamic(
    () => import('react-best-gradient-color-picker').then((mod) => ({ default: mod.default })),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-[300px] text-foreground-tertiary text-small">
                Loading picker...
            </div>
        ),
    },
);

interface GradientPickerProps {
    value?: string;
    onChange?: (value: string) => void;
    width?: number;
    height?: number;
    className?: string;
}

/**
 * Full-featured gradient + color picker powered by react-best-gradient-color-picker.
 * Supports solid colors, linear/radial gradients, gradient stops, and eyedropper.
 */
export function GradientPicker({
    value = 'linear-gradient(90deg, rgba(96,93,93,1) 0%, rgba(255,255,255,1) 100%)',
    onChange,
    width = 220,
    height = 300,
    className,
}: GradientPickerProps) {
    const [color, setColor] = useState(value);

    const handleChange = useCallback(
        (newColor: string) => {
            setColor(newColor);
            onChange?.(newColor);
        },
        [onChange],
    );

    return (
        <div className={cn('rounded-lg overflow-hidden', className)}>
            <ColorPicker value={color} onChange={handleChange} width={width} height={height} />
        </div>
    );
}
