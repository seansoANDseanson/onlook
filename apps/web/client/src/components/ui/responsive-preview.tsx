'use client';

import { cn } from '@onlook/ui/utils';
import { Button } from '@onlook/ui/button';
import { Icons } from '@onlook/ui/icons';
import { useState } from 'react';

interface Viewport {
    name: string;
    width: number;
    height: number;
    icon: 'mobile' | 'tablet' | 'desktop';
}

const DEFAULT_VIEWPORTS: Viewport[] = [
    { name: 'Mobile', width: 375, height: 667, icon: 'mobile' },
    { name: 'Tablet', width: 768, height: 1024, icon: 'tablet' },
    { name: 'Desktop', width: 1280, height: 800, icon: 'desktop' },
    { name: 'Wide', width: 1536, height: 864, icon: 'desktop' },
];

const TAILWIND_BREAKPOINTS: Viewport[] = [
    { name: 'sm', width: 640, height: 800, icon: 'mobile' },
    { name: 'md', width: 768, height: 1024, icon: 'tablet' },
    { name: 'lg', width: 1024, height: 768, icon: 'desktop' },
    { name: 'xl', width: 1280, height: 800, icon: 'desktop' },
    { name: '2xl', width: 1536, height: 864, icon: 'desktop' },
];

interface ResponsivePreviewProps {
    url: string;
    viewports?: Viewport[];
    mode?: 'single' | 'multi';
    className?: string;
    useTailwindBreakpoints?: boolean;
}

const ICON_MAP = {
    mobile: Icons.Mobile,
    tablet: Icons.Laptop,
    desktop: Icons.Desktop,
};

/**
 * Responsive preview component showing content at multiple viewport sizes.
 * Supports single viewport with switcher, or simultaneous multi-viewport display.
 *
 * @example
 * ```tsx
 * // Single viewport with switcher
 * <ResponsivePreview url="http://localhost:3000" mode="single" />
 *
 * // All viewports at once
 * <ResponsivePreview url="http://localhost:3000" mode="multi" />
 *
 * // Tailwind breakpoints
 * <ResponsivePreview url="http://localhost:3000" mode="multi" useTailwindBreakpoints />
 * ```
 */
export function ResponsivePreview({
    url,
    viewports,
    mode = 'single',
    className,
    useTailwindBreakpoints = false,
}: ResponsivePreviewProps) {
    const activeViewports = viewports ?? (useTailwindBreakpoints ? TAILWIND_BREAKPOINTS : DEFAULT_VIEWPORTS);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (mode === 'multi') {
        return (
            <div className={cn('flex gap-4 overflow-x-auto p-4', className)}>
                {activeViewports.map((viewport) => (
                    <div key={viewport.name} className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                            {(() => {
                                const IconComp = ICON_MAP[viewport.icon];
                                return <IconComp className="w-3.5 h-3.5" />;
                            })()}
                            <span>{viewport.name}</span>
                            <span className="text-foreground-tertiary">
                                {viewport.width}x{viewport.height}
                            </span>
                        </div>
                        <div
                            className="border border-border rounded-lg overflow-hidden bg-white"
                            style={{ width: `${Math.min(viewport.width * 0.3, 400)}px` }}
                        >
                            <iframe
                                src={url}
                                title={`${viewport.name} preview`}
                                className="border-0"
                                style={{
                                    width: `${viewport.width}px`,
                                    height: `${viewport.height}px`,
                                    transform: `scale(${Math.min(400 / viewport.width, 0.3)})`,
                                    transformOrigin: 'top left',
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const current = activeViewports[selectedIndex] ?? activeViewports[0];
    if (!current) {
        return null;
    }

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            <div className="flex items-center justify-center gap-1">
                {activeViewports.map((viewport, index) => {
                    const IconComp = ICON_MAP[viewport.icon];
                    return (
                        <Button
                            key={viewport.name}
                            variant={selectedIndex === index ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 px-2.5 gap-1.5 text-xs"
                            onClick={() => setSelectedIndex(index)}
                        >
                            <IconComp className="w-3.5 h-3.5" />
                            {viewport.name}
                        </Button>
                    );
                })}
            </div>
            <div className="flex justify-center text-xs text-foreground-tertiary">
                {current.width} x {current.height}
            </div>
            <div className="flex justify-center">
                <div
                    className="border border-border rounded-lg overflow-hidden bg-white transition-all duration-300"
                    style={{
                        width: `${current.width}px`,
                        maxWidth: '100%',
                        height: `${current.height}px`,
                    }}
                >
                    <iframe
                        src={url}
                        title={`${current.name} preview`}
                        className="w-full h-full border-0"
                    />
                </div>
            </div>
        </div>
    );
}
