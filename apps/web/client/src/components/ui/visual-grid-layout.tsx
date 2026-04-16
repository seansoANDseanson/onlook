'use client';

import { cn } from '@onlook/ui/utils';
import { type ReactNode, useCallback } from 'react';
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import type { LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

export interface GridItemConfig {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
}

interface VisualGridLayoutProps {
    items: GridItemConfig[];
    onLayoutChange?: (items: GridItemConfig[]) => void;
    renderItem: (item: GridItemConfig) => ReactNode;
    cols?: number;
    rowHeight?: number;
    className?: string;
    isDraggable?: boolean;
    isResizable?: boolean;
}

function toLayoutItems(items: GridItemConfig[]): LayoutItem[] {
    return items.map((item) => ({
        i: item.id,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
        maxW: item.maxW,
        maxH: item.maxH,
        static: item.static,
    }));
}

function fromLayoutItems(
    layoutItems: readonly LayoutItem[],
    original: GridItemConfig[],
): GridItemConfig[] {
    return layoutItems.map((l) => {
        const orig = original.find((item) => item.id === l.i);
        return {
            id: l.i,
            x: l.x,
            y: l.y,
            w: l.w,
            h: l.h,
            minW: orig?.minW,
            minH: orig?.minH,
            maxW: orig?.maxW,
            maxH: orig?.maxH,
            static: l.static,
        };
    });
}

/**
 * Visual drag-and-drop grid layout powered by react-grid-layout.
 * Users can drag and resize items on a grid.
 *
 * @example
 * ```tsx
 * <VisualGridLayout
 *   items={widgets}
 *   onLayoutChange={setWidgets}
 *   renderItem={(item) => <WidgetCard widget={item} />}
 *   cols={12}
 *   rowHeight={60}
 * />
 * ```
 */
export function VisualGridLayout({
    items,
    onLayoutChange,
    renderItem,
    cols = 12,
    rowHeight = 60,
    className,
    isDraggable = true,
    isResizable = true,
}: VisualGridLayoutProps) {
    const { width, containerRef, mounted } = useContainerWidth();

    const handleLayoutChange = useCallback(
        (newLayout: readonly LayoutItem[]) => {
            onLayoutChange?.(fromLayoutItems(newLayout, items));
        },
        [items, onLayoutChange],
    );

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {mounted && (
                <GridLayout
                    layout={toLayoutItems(items)}
                    width={width}
                    gridConfig={{ cols, rowHeight }}
                    dragConfig={{ enabled: isDraggable }}
                    resizeConfig={{ enabled: isResizable }}
                    onLayoutChange={handleLayoutChange}
                >
                    {items.map((item) => (
                        <div key={item.id}>{renderItem(item)}</div>
                    ))}
                </GridLayout>
            )}
        </div>
    );
}
