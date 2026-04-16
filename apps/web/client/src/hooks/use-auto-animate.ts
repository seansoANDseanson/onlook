'use client';

import autoAnimate from '@formkit/auto-animate';
import type { AutoAnimateOptions, AutoAnimationPlugin } from '@formkit/auto-animate';
import { useCallback, useEffect, useRef, useState } from 'react';

type AutoAnimateConfig = Partial<AutoAnimateOptions> | AutoAnimationPlugin;

/**
 * Hook that provides automatic animations for list additions, removals, and reorders.
 * Attach the returned ref to a parent element — its children will animate automatically.
 *
 * @example
 * ```tsx
 * const [parentRef, enable] = useAutoAnimate({ duration: 250 });
 * return <ul ref={parentRef}>{items.map(...)}</ul>;
 * ```
 */
export function useAutoAnimate<T extends HTMLElement = HTMLElement>(
    config?: AutoAnimateConfig,
): [React.RefCallback<T>, (enabled: boolean) => void] {
    const [enabled, setEnabled] = useState(true);
    const controllerRef = useRef<ReturnType<typeof autoAnimate> | null>(null);

    const ref = useCallback(
        (node: T | null) => {
            if (controllerRef.current) {
                controllerRef.current.disable();
                controllerRef.current = null;
            }

            if (node && enabled) {
                controllerRef.current = autoAnimate(node, config ?? {});
            }
        },
        [enabled, config],
    );

    useEffect(() => {
        if (controllerRef.current) {
            if (enabled) {
                controllerRef.current.enable();
            } else {
                controllerRef.current.disable();
            }
        }
    }, [enabled]);

    return [ref, setEnabled];
}
