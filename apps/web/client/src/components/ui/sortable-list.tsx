'use client';

import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@onlook/ui/utils';
import { type CSSProperties, type ReactNode, useCallback, useState } from 'react';

interface SortableItemProps {
    id: string;
    children: ReactNode;
    className?: string;
    handle?: boolean;
}

/**
 * Wrapper for individual sortable items. Use inside a SortableList.
 */
export function SortableItem({ id, children, className, handle = false }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const dragProps = handle ? {} : { ...attributes, ...listeners };

    return (
        <div ref={setNodeRef} style={style} className={cn(className)} {...dragProps}>
            {children}
        </div>
    );
}

/**
 * Drag handle component — attach to a child element inside SortableItem
 * when using handle mode.
 */
export function DragHandle({
    id,
    children,
    className,
}: {
    id: string;
    children: ReactNode;
    className?: string;
}) {
    const { attributes, listeners } = useSortable({ id });

    return (
        <button className={cn('cursor-grab active:cursor-grabbing', className)} {...attributes} {...listeners}>
            {children}
        </button>
    );
}

interface SortableListProps<T extends { id: string }> {
    items: T[];
    onReorder: (items: T[]) => void;
    renderItem: (item: T, index: number) => ReactNode;
    renderOverlay?: (item: T) => ReactNode;
    className?: string;
}

/**
 * A generic sortable list powered by dnd-kit.
 *
 * @example
 * ```tsx
 * <SortableList
 *   items={layers}
 *   onReorder={setLayers}
 *   renderItem={(layer) => (
 *     <SortableItem id={layer.id}>
 *       <LayerRow layer={layer} />
 *     </SortableItem>
 *   )}
 * />
 * ```
 */
export function SortableList<T extends { id: string }>({
    items,
    onReorder,
    renderItem,
    renderOverlay,
    className,
}: SortableListProps<T>) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveId(null);
            const { active, over } = event;
            if (!over || active.id === over.id) {
                return;
            }

            const oldIndex = items.findIndex((item) => item.id === String(active.id));
            const newIndex = items.findIndex((item) => item.id === String(over.id));

            if (oldIndex === -1 || newIndex === -1) {
                return;
            }

            const newItems = [...items];
            const [removed] = newItems.splice(oldIndex, 1);
            if (removed) {
                newItems.splice(newIndex, 0, removed);
            }
            onReorder(newItems);
        },
        [items, onReorder],
    );

    const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className={cn(className)}>
                    {items.map((item, index) => renderItem(item, index))}
                </div>
            </SortableContext>
            <DragOverlay>
                {activeItem && renderOverlay ? renderOverlay(activeItem) : null}
            </DragOverlay>
        </DndContext>
    );
}
