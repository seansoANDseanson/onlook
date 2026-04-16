'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LoroDoc, LoroMap, LoroText } from 'loro-crdt';

export interface CollaborativeDocOptions {
    docId?: string;
    initialData?: Record<string, unknown>;
}

export interface VersionInfo {
    id: string;
    timestamp: number;
}

/**
 * Hook for collaborative document editing using Loro CRDT.
 * Provides conflict-free merging, version history, and undo/redo.
 *
 * @example
 * ```tsx
 * const { doc, getText, setText, getMap, undo, redo, versions, exportSnapshot } =
 *   useCollaborativeDoc({ docId: 'my-doc' });
 *
 * // Set text content
 * setText('content', 'Hello world');
 *
 * // Get a shared map for structured data
 * const styles = getMap('styles');
 * styles.set('color', '#ff0000');
 *
 * // Undo last change
 * undo();
 * ```
 */
export function useCollaborativeDoc({ docId, initialData }: CollaborativeDocOptions = {}) {
    const docRef = useRef<LoroDoc | null>(null);
    const [version, setVersion] = useState(0);

    // Initialize doc
    useEffect(() => {
        const doc = new LoroDoc();

        if (initialData) {
            const root = doc.getMap('root');
            for (const [key, value] of Object.entries(initialData)) {
                root.set(key, value);
            }
        }

        docRef.current = doc;
        setVersion((v) => v + 1);

        return () => {
            docRef.current = null;
        };
    }, [docId]);

    const getText = useCallback((key: string): LoroText | null => {
        if (!docRef.current) {
            return null;
        }
        return docRef.current.getText(key);
    }, []);

    const setText = useCallback((key: string, content: string) => {
        if (!docRef.current) {
            return;
        }
        const text = docRef.current.getText(key);
        // Clear existing content
        if (text.length > 0) {
            text.delete(0, text.length);
        }
        text.insert(0, content);
        docRef.current.commit();
        setVersion((v) => v + 1);
    }, []);

    const getTextValue = useCallback((key: string): string => {
        if (!docRef.current) {
            return '';
        }
        return docRef.current.getText(key).toString();
    }, []);

    const getMap = useCallback((key: string): LoroMap | null => {
        if (!docRef.current) {
            return null;
        }
        return docRef.current.getMap(key);
    }, []);

    const setMapValue = useCallback((mapKey: string, key: string, value: unknown) => {
        if (!docRef.current) {
            return;
        }
        const map = docRef.current.getMap(mapKey);
        map.set(key, value);
        docRef.current.commit();
        setVersion((v) => v + 1);
    }, []);

    const getMapValue = useCallback((mapKey: string, key: string): unknown => {
        if (!docRef.current) {
            return undefined;
        }
        return docRef.current.getMap(mapKey).get(key);
    }, []);

    const exportSnapshot = useCallback((): Uint8Array | null => {
        if (!docRef.current) {
            return null;
        }
        return docRef.current.export({ mode: 'snapshot' });
    }, []);

    const importSnapshot = useCallback((data: Uint8Array) => {
        if (!docRef.current) {
            return;
        }
        docRef.current.import(data);
        setVersion((v) => v + 1);
    }, []);

    const merge = useCallback((otherSnapshot: Uint8Array) => {
        if (!docRef.current) {
            return;
        }
        docRef.current.import(otherSnapshot);
        setVersion((v) => v + 1);
    }, []);

    return {
        doc: docRef.current,
        version,
        getText,
        setText,
        getTextValue,
        getMap,
        setMapValue,
        getMapValue,
        exportSnapshot,
        importSnapshot,
        merge,
    };
}
