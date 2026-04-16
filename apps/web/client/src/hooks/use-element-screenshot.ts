'use client';

import { useCallback, useState } from 'react';
import { toBlob, toJpeg, toPng, toSvg } from 'html-to-image';

type ImageFormat = 'png' | 'jpeg' | 'svg' | 'blob';

interface ScreenshotOptions {
    quality?: number;
    pixelRatio?: number;
    backgroundColor?: string;
    filter?: (node: HTMLElement) => boolean;
}

interface UseElementScreenshotReturn {
    isCapturing: boolean;
    captureElement: (
        element: HTMLElement,
        format?: ImageFormat,
        options?: ScreenshotOptions,
    ) => Promise<string | Blob | null>;
    downloadScreenshot: (
        element: HTMLElement,
        fileName?: string,
        format?: Exclude<ImageFormat, 'blob'>,
        options?: ScreenshotOptions,
    ) => Promise<void>;
    copyToClipboard: (element: HTMLElement, options?: ScreenshotOptions) => Promise<boolean>;
}

export function useElementScreenshot(): UseElementScreenshotReturn {
    const [isCapturing, setIsCapturing] = useState(false);

    const captureElement = useCallback(
        async (
            element: HTMLElement,
            format: ImageFormat = 'png',
            options: ScreenshotOptions = {},
        ): Promise<string | Blob | null> => {
            setIsCapturing(true);
            try {
                const opts = {
                    quality: options.quality ?? 0.95,
                    pixelRatio: options.pixelRatio ?? 2,
                    backgroundColor: options.backgroundColor,
                    filter: options.filter,
                };

                switch (format) {
                    case 'png':
                        return await toPng(element, opts);
                    case 'jpeg':
                        return await toJpeg(element, opts);
                    case 'svg':
                        return await toSvg(element, opts);
                    case 'blob':
                        return await toBlob(element, opts);
                    default:
                        return await toPng(element, opts);
                }
            } catch (err) {
                console.error('Screenshot capture failed:', err);
                return null;
            } finally {
                setIsCapturing(false);
            }
        },
        [],
    );

    const downloadScreenshot = useCallback(
        async (
            element: HTMLElement,
            fileName = 'screenshot',
            format: Exclude<ImageFormat, 'blob'> = 'png',
            options: ScreenshotOptions = {},
        ) => {
            const dataUrl = (await captureElement(element, format, options)) as string | null;
            if (!dataUrl) {
                return;
            }

            const link = document.createElement('a');
            link.download = `${fileName}.${format}`;
            link.href = dataUrl;
            link.click();
        },
        [captureElement],
    );

    const copyToClipboard = useCallback(
        async (element: HTMLElement, options: ScreenshotOptions = {}): Promise<boolean> => {
            const blob = (await captureElement(element, 'blob', options)) as Blob | null;
            if (!blob) {
                return false;
            }

            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob }),
                ]);
                return true;
            } catch {
                console.error('Failed to copy screenshot to clipboard');
                return false;
            }
        },
        [captureElement],
    );

    return {
        isCapturing,
        captureElement,
        downloadScreenshot,
        copyToClipboard,
    };
}
