'use client';

import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface SavedPrompt {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
    isBuiltin?: boolean;
    useCount?: number;
}

const STORAGE_KEY = 'onlook:prompt-library';

const STARTER_PROMPTS: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        title: 'Modernize the design',
        content:
            'Make this page look more modern. Use generous whitespace, softer shadows, rounded corners (rounded-xl or rounded-2xl), and a cleaner typographic hierarchy. Keep the existing functionality.',
        tags: ['style', 'modernize'],
        isBuiltin: true,
    },
    {
        title: 'Add a hero section',
        content:
            'Add a prominent hero section at the top of the page with a bold headline, supporting subheading, and a primary call-to-action button. Use strong visual hierarchy.',
        tags: ['section', 'hero'],
        isBuiltin: true,
    },
    {
        title: 'Make it responsive',
        content:
            'Make this layout fully responsive. Stack elements vertically on mobile, use a 2-column grid on tablet, and a 3+ column layout on desktop. Ensure text sizes scale appropriately.',
        tags: ['responsive', 'layout'],
        isBuiltin: true,
    },
    {
        title: 'Improve spacing and typography',
        content:
            'Improve the visual rhythm by adjusting spacing (padding, margins, gaps) and refining typography. Use consistent font sizes, line heights, and letter spacing. Create clearer visual hierarchy.',
        tags: ['typography', 'spacing'],
        isBuiltin: true,
    },
    {
        title: 'Add subtle animations',
        content:
            'Add subtle motion to this page: fade-in on load, smooth hover transitions on interactive elements, and gentle scroll-triggered animations. Keep them tasteful — no bouncing or over-the-top effects.',
        tags: ['animation', 'motion'],
        isBuiltin: true,
    },
    {
        title: 'Apply a dark theme',
        content:
            'Convert this to a dark theme. Use a deep background color, high-contrast text, and adjust colored elements to remain vibrant on the dark background. Ensure WCAG AA contrast compliance.',
        tags: ['theme', 'dark'],
        isBuiltin: true,
    },
    {
        title: 'Make buttons more prominent',
        content:
            'Redesign the primary buttons to be more visually prominent: larger padding, bolder text, a distinct background color, and a clear hover/active state. Secondary buttons should be more subdued.',
        tags: ['buttons', 'cta'],
        isBuiltin: true,
    },
    {
        title: 'Add loading and empty states',
        content:
            'Add polished loading skeletons for async data, and friendly empty states with an illustration or icon and a helpful message when there is nothing to show.',
        tags: ['ux', 'states'],
        isBuiltin: true,
    },
    {
        title: 'Improve accessibility',
        content:
            'Audit this page for accessibility. Add proper ARIA labels, ensure keyboard navigation works, fix any color contrast issues, add alt text to images, and use semantic HTML elements.',
        tags: ['a11y', 'accessibility'],
        isBuiltin: true,
    },
    {
        title: 'Simplify the layout',
        content:
            'This layout feels cluttered. Simplify it by removing redundant elements, consolidating related content, and using more whitespace. Focus on the primary user goal.',
        tags: ['simplify', 'layout'],
        isBuiltin: true,
    },
];

function loadPrompts(): SavedPrompt[] {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return seedStarterPrompts();
        }
        const parsed = JSON.parse(stored) as SavedPrompt[];
        if (!Array.isArray(parsed)) {
            return seedStarterPrompts();
        }
        return parsed;
    } catch {
        return seedStarterPrompts();
    }
}

function seedStarterPrompts(): SavedPrompt[] {
    const now = Date.now();
    const seeded: SavedPrompt[] = STARTER_PROMPTS.map((p) => ({
        ...p,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
    }));
    savePrompts(seeded);
    return seeded;
}

function savePrompts(prompts: SavedPrompt[]) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch (err) {
        console.error('Failed to save prompt library:', err);
    }
}

export function usePromptLibrary() {
    const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setPrompts(loadPrompts());
        setIsLoaded(true);
    }, []);

    const addPrompt = useCallback((title: string, content: string, tags: string[] = []) => {
        const now = Date.now();
        const newPrompt: SavedPrompt = {
            id: uuidv4(),
            title: title.trim(),
            content: content.trim(),
            tags: tags.map((t) => t.trim()).filter(Boolean),
            createdAt: now,
            updatedAt: now,
        };
        setPrompts((prev) => {
            const next = [newPrompt, ...prev];
            savePrompts(next);
            return next;
        });
        return newPrompt;
    }, []);

    const updatePrompt = useCallback(
        (id: string, updates: Partial<Pick<SavedPrompt, 'title' | 'content' | 'tags'>>) => {
            setPrompts((prev) => {
                const next = prev.map((p) =>
                    p.id === id
                        ? {
                            ...p,
                            ...updates,
                            tags: updates.tags ? updates.tags.map((t) => t.trim()).filter(Boolean) : p.tags,
                            updatedAt: Date.now(),
                        }
                        : p,
                );
                savePrompts(next);
                return next;
            });
        },
        [],
    );

    const deletePrompt = useCallback((id: string) => {
        setPrompts((prev) => {
            const target = prev.find((p) => p.id === id);
            if (target?.isBuiltin) {
                return prev;
            }
            const next = prev.filter((p) => p.id !== id);
            savePrompts(next);
            return next;
        });
    }, []);

    const incrementUseCount = useCallback((id: string) => {
        setPrompts((prev) => {
            const next = prev.map((p) =>
                p.id === id ? { ...p, useCount: (p.useCount ?? 0) + 1 } : p,
            );
            savePrompts(next);
            return next;
        });
    }, []);

    const resetToDefaults = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }
        localStorage.removeItem(STORAGE_KEY);
        setPrompts(seedStarterPrompts());
    }, []);

    return {
        prompts,
        isLoaded,
        addPrompt,
        updatePrompt,
        deletePrompt,
        incrementUseCount,
        resetToDefaults,
    };
}
