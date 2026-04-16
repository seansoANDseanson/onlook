'use client';

import type { AxeResults, Result } from 'axe-core';
import { useCallback, useState } from 'react';

export interface AuditIssue {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: number;
    tags: string[];
}

export interface AuditSummary {
    violations: AuditIssue[];
    passes: number;
    incomplete: number;
    timestamp: Date;
    score: number;
}

function mapResults(results: Result[]): AuditIssue[] {
    return results.map((r) => ({
        id: r.id,
        impact: (r.impact as AuditIssue['impact']) ?? 'minor',
        description: r.description,
        help: r.help,
        helpUrl: r.helpUrl,
        nodes: r.nodes.length,
        tags: r.tags,
    }));
}

function calculateScore(raw: AxeResults): number {
    const total = raw.violations.length + raw.passes.length;
    if (total === 0) {
        return 100;
    }
    return Math.round((raw.passes.length / total) * 100);
}

export function useAccessibilityAudit() {
    const [isAuditing, setIsAuditing] = useState(false);
    const [summary, setSummary] = useState<AuditSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    const runAudit = useCallback(async (target?: HTMLElement | Document) => {
        setIsAuditing(true);
        setError(null);

        try {
            const axe = await import('axe-core');
            const element = target ?? document;
            const results = await axe.default.run(element as any);

            const auditSummary: AuditSummary = {
                violations: mapResults(results.violations),
                passes: results.passes.length,
                incomplete: results.incomplete.length,
                timestamp: new Date(),
                score: calculateScore(results),
            };

            setSummary(auditSummary);
            return auditSummary;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Audit failed';
            setError(msg);
            return null;
        } finally {
            setIsAuditing(false);
        }
    }, []);

    const clearAudit = useCallback(() => {
        setSummary(null);
        setError(null);
    }, []);

    return {
        isAuditing,
        summary,
        error,
        runAudit,
        clearAudit,
    };
}
