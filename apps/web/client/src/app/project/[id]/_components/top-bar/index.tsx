'use client';

import { Hotkey } from '@/components/hotkey';
import { useEditorEngine } from '@/components/store/editor';
import { useStateManager } from '@/components/store/state';
import { CurrentUserAvatar } from '@/components/ui/avatar-dropdown';
import { SettingsTabValue } from '@/components/ui/settings-modal/helpers';
import { useAccessibilityAudit } from '@/hooks/use-accessibility-audit';
import { transKeys } from '@/i18n/keys';
import { Button } from '@onlook/ui/button';
import { HotkeyLabel } from '@onlook/ui/hotkey-label';
import { Icons } from '@onlook/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@onlook/ui/popover';
import { toast } from '@onlook/ui/sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@onlook/ui/tooltip';
import { cn } from '@onlook/ui/utils';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Members } from '../members';
import { BranchDisplay } from './branch';
import { ModeToggle } from './mode-toggle';
import { ProjectBreadcrumb } from './project-breadcrumb';
import { PublishButton } from './publish';

export const TopBar = observer(() => {
    const stateManager = useStateManager();
    const [isMembersPopoverOpen, setIsMembersPopoverOpen] = useState(false);
    const editorEngine = useEditorEngine();
    const t = useTranslations();

    const UNDO_REDO_BUTTONS = [
        {
            click: () => editorEngine.action.undo(),
            isDisabled: !editorEngine.history.canUndo || editorEngine.chat.isStreaming,
            hotkey: Hotkey.UNDO,
            icon: <Icons.Reset className="h-4 w-4 mr-1" />,
        },
        {
            click: () => editorEngine.action.redo(),
            isDisabled: !editorEngine.history.canRedo || editorEngine.chat.isStreaming,
            hotkey: Hotkey.REDO,
            icon: <Icons.Reset className="h-4 w-4 mr-1 scale-x-[-1]" />,
        },
    ];

    return (
        <div className="flex flex-row h-10 p-0 justify-center items-center bg-background-onlook/60 backdrop-blur-xl">
            <div className="flex flex-row flex-grow basis-0 justify-start items-center">
                <ProjectBreadcrumb />
                <span className="text-foreground-secondary/50 text-small">/</span>
                <BranchDisplay />
            </div>
            <ModeToggle />
            <div className="flex flex-grow basis-0 justify-end items-center gap-1.5 mr-2">
                <div className="flex items-center group">
                    <div className={`transition-all duration-200 ${isMembersPopoverOpen ? 'mr-2' : '-mr-2 group-hover:mr-2'}`}>
                        <Members onPopoverOpenChange={setIsMembersPopoverOpen} />
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center">
                                <CurrentUserAvatar className="size-8 cursor-pointer hover:border-foreground-primary" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="mt-1" hideArrow>
                            <p>Profile</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <motion.div
                    className="space-x-0 hidden lg:block -mr-1"
                    layout
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        delay: 0,
                    }}
                >
                    {UNDO_REDO_BUTTONS.map(({ click, hotkey, icon, isDisabled }) => (
                        <Tooltip key={hotkey.description}>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8"
                                        onClick={click}
                                        disabled={isDisabled}
                                    >
                                        {icon}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" hideArrow className="mt-2">
                                <HotkeyLabel hotkey={hotkey} />
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </motion.div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8"
                            onClick={() => {
                                stateManager.settingsTab = SettingsTabValue.VERSIONS;
                                stateManager.isSettingsModalOpen = true;
                            }}
                        >
                            <Icons.CounterClockwiseClock className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="mt-1" hideArrow>
                        {t(transKeys.editor.toolbar.versionHistory)}
                    </TooltipContent>
                </Tooltip>
                <AccessibilityAuditButton />
                <PublishButton />
            </div>
        </div>
    );
});

const IMPACT_COLORS: Record<string, string> = {
    critical: 'text-red-500',
    serious: 'text-orange-400',
    moderate: 'text-yellow-400',
    minor: 'text-blue-400',
};

const AccessibilityAuditButton = () => {
    const { isAuditing, summary, runAudit, clearAudit } = useAccessibilityAudit();
    const [open, setOpen] = useState(false);

    const handleRunAudit = async () => {
        const result = await runAudit(document);
        if (result) {
            setOpen(true);
            if (result.violations.length === 0) {
                toast.success(`Accessibility audit passed! Score: ${result.score}/100`);
            } else {
                toast.warning(
                    `Found ${result.violations.length} accessibility issue${result.violations.length > 1 ? 's' : ''}`,
                );
            }
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn('h-8', isAuditing && 'animate-pulse')}
                            onClick={() => {
                                if (!summary) {
                                    void handleRunAudit();
                                }
                            }}
                            disabled={isAuditing}
                        >
                            {isAuditing ? (
                                <Icons.LoadingSpinner className="h-4 w-4 animate-spin" />
                            ) : (
                                <Icons.MagicWand className="h-4 w-4" />
                            )}
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="mt-1" hideArrow>
                    Accessibility Audit
                </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-0" align="end" sideOffset={6}>
                {summary && (
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between p-3 border-b">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">A11y Audit</span>
                                <span
                                    className={cn(
                                        'text-xs font-mono px-1.5 py-0.5 rounded',
                                        summary.score >= 90
                                            ? 'bg-green-500/20 text-green-400'
                                            : summary.score >= 70
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-red-500/20 text-red-400',
                                    )}
                                >
                                    {summary.score}/100
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                    clearAudit();
                                    void handleRunAudit();
                                }}
                            >
                                Re-run
                            </Button>
                        </div>
                        <div className="flex gap-3 px-3 py-2 text-xs text-foreground-secondary border-b">
                            <span>{summary.passes} passed</span>
                            <span>{summary.violations.length} violations</span>
                            <span>{summary.incomplete} incomplete</span>
                        </div>
                        {summary.violations.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto">
                                {summary.violations.map((v) => (
                                    <div
                                        key={v.id}
                                        className="flex items-start gap-2 px-3 py-2 border-b last:border-0 hover:bg-background-secondary"
                                    >
                                        <span
                                            className={cn(
                                                'text-[10px] font-mono uppercase mt-0.5 flex-shrink-0',
                                                IMPACT_COLORS[v.impact] ?? 'text-foreground-tertiary',
                                            )}
                                        >
                                            {v.impact}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-foreground-primary truncate">
                                                {v.help}
                                            </p>
                                            <p className="text-[10px] text-foreground-tertiary">
                                                {v.nodes} element{v.nodes > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-xs text-green-400">
                                No accessibility violations found!
                            </div>
                        )}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};
