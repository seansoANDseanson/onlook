'use client';

import { cn } from '@onlook/ui/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SVGEditorProps {
    initialSvg?: string;
    width?: number;
    height?: number;
    onChange?: (svgString: string) => void;
    className?: string;
}

/**
 * Lightweight SVG editor component powered by @svgedit/svgcanvas.
 * Lazily loads the SVG canvas to avoid SSR issues and keep bundle small.
 *
 * @example
 * ```tsx
 * <SVGEditor
 *   initialSvg='<svg><circle cx="50" cy="50" r="40" fill="red"/></svg>'
 *   width={400}
 *   height={300}
 *   onChange={(svg) => console.log('Updated SVG:', svg)}
 * />
 * ```
 */
export function SVGEditor({
    initialSvg,
    width = 400,
    height = 300,
    onChange,
    className,
}: SVGEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvasRef = useRef<any>(null);

    useEffect(() => {
        let mounted = true;

        async function initCanvas() {
            if (!containerRef.current) {
                return;
            }

            try {
                const svgcanvas = await import('@svgedit/svgcanvas');

                if (!mounted || !containerRef.current) {
                    return;
                }

                // Clear existing content
                containerRef.current.innerHTML = '';

                // Create SVG canvas container
                const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgEl.setAttribute('width', String(width));
                svgEl.setAttribute('height', String(height));
                svgEl.id = 'svgcanvas';
                containerRef.current.appendChild(svgEl);

                // Initialize the canvas
                const canvas = new svgcanvas.default(svgEl as unknown as HTMLElement, {
                    canvas_expansion: 1,
                    dimensions: [width, height],
                    initFill: { color: '000000', opacity: 1 },
                    initStroke: { color: '000000', opacity: 1, width: 2 },
                    imgPath: '',
                });

                canvasRef.current = canvas;

                if (initialSvg) {
                    canvas.setSvgString(initialSvg);
                }

                setIsLoaded(true);
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load SVG editor');
                }
            }
        }

        void initCanvas();

        return () => {
            mounted = false;
        };
    }, [width, height, initialSvg]);

    const getSvgString = useCallback((): string | null => {
        if (!canvasRef.current) {
            return null;
        }
        try {
            const svg = canvasRef.current.getSvgString();
            onChange?.(svg);
            return svg;
        } catch {
            return null;
        }
    }, [onChange]);

    if (error) {
        return (
            <div className={cn('flex items-center justify-center border border-border rounded-lg bg-background-secondary text-foreground-tertiary text-small', className)} style={{ width, height }}>
                SVG Editor unavailable: {error}
            </div>
        );
    }

    return (
        <div className={cn('relative border border-border rounded-lg overflow-hidden', className)}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background-secondary text-foreground-tertiary text-small">
                    Loading SVG editor...
                </div>
            )}
            <div
                ref={containerRef}
                style={{ width, height }}
                className="bg-white"
            />
            {isLoaded && (
                <div className="flex gap-1 p-1 border-t border-border bg-background-secondary">
                    <button
                        onClick={getSvgString}
                        className="px-2 py-1 text-xs rounded hover:bg-background-tertiary text-foreground-secondary hover:text-foreground-primary transition-colors"
                    >
                        Export SVG
                    </button>
                </div>
            )}
        </div>
    );
}
