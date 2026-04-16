'use client';

import { cn } from '@onlook/ui/utils';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center p-4 text-foreground-tertiary text-small">
            Loading diff...
        </div>
    ),
});

interface CodeDiffViewerProps {
    oldCode: string;
    newCode: string;
    fileName?: string;
    splitView?: boolean;
    className?: string;
}

const darkTheme = {
    variables: {
        dark: {
            diffViewerBackground: 'transparent',
            diffViewerColor: '#e5e7eb',
            addedBackground: '#16a34a1a',
            addedColor: '#4ade80',
            removedBackground: '#dc26261a',
            removedColor: '#f87171',
            wordAddedBackground: '#16a34a33',
            wordRemovedBackground: '#dc262633',
            addedGutterBackground: '#16a34a0d',
            removedGutterBackground: '#dc26260d',
            gutterBackground: 'transparent',
            gutterBackgroundDark: 'transparent',
            highlightBackground: '#ffffff0a',
            highlightGutterBackground: '#ffffff0a',
            codeFoldGutterBackground: 'transparent',
            codeFoldBackground: 'transparent',
            emptyLineBackground: 'transparent',
            codeFoldContentColor: '#6b7280',
        },
    },
    line: {
        fontSize: '12px',
        fontFamily: 'ui-monospace, monospace',
    },
};

export function CodeDiffViewer({
    oldCode,
    newCode,
    fileName,
    splitView = false,
    className,
}: CodeDiffViewerProps) {
    const hasChanges = useMemo(() => oldCode !== newCode, [oldCode, newCode]);

    if (!hasChanges) {
        return (
            <div className="p-3 text-foreground-tertiary text-small text-center">
                No changes detected
            </div>
        );
    }

    return (
        <div className={cn('overflow-auto rounded-md border border-border text-xs', className)}>
            {fileName && (
                <div className="border-b border-border px-3 py-1.5 text-foreground-secondary text-small font-mono">
                    {fileName}
                </div>
            )}
            <ReactDiffViewer
                oldValue={oldCode}
                newValue={newCode}
                splitView={splitView}
                useDarkTheme={true}
                styles={darkTheme}
                hideLineNumbers={false}
            />
        </div>
    );
}
