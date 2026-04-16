'use client';

import { usePromptLibrary, type SavedPrompt } from '@/hooks/use-prompt-library';
import { Button } from '@onlook/ui/button';
import { Icons } from '@onlook/ui/icons';
import { Input } from '@onlook/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@onlook/ui/popover';
import { ScrollArea } from '@onlook/ui/scroll-area';
import { toast } from '@onlook/ui/sonner';
import { Textarea } from '@onlook/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@onlook/ui/tooltip';
import { cn } from '@onlook/ui/utils';
import { useMemo, useState } from 'react';

interface PromptLibraryProps {
    onInsert: (content: string) => void;
}

type ViewMode = 'list' | 'add' | 'edit';

export function PromptLibrary({ onInsert }: PromptLibraryProps) {
    const { prompts, addPrompt, updatePrompt, deletePrompt, incrementUseCount } =
        usePromptLibrary();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<ViewMode>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formTags, setFormTags] = useState('');

    const filteredPrompts = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) {
            return [...prompts].sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0));
        }
        return prompts.filter(
            (p) =>
                p.title.toLowerCase().includes(query) ||
                p.content.toLowerCase().includes(query) ||
                p.tags.some((tag) => tag.toLowerCase().includes(query)),
        );
    }, [prompts, search]);

    const resetForm = () => {
        setFormTitle('');
        setFormContent('');
        setFormTags('');
        setEditingId(null);
    };

    const handleSave = () => {
        if (!formTitle.trim() || !formContent.trim()) {
            toast.error('Title and content are required');
            return;
        }
        const tags = formTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

        if (view === 'edit' && editingId) {
            updatePrompt(editingId, { title: formTitle, content: formContent, tags });
            toast.success('Prompt updated');
        } else {
            addPrompt(formTitle, formContent, tags);
            toast.success('Prompt saved');
        }
        resetForm();
        setView('list');
    };

    const handleEdit = (prompt: SavedPrompt) => {
        if (prompt.isBuiltin) {
            toast.info('Built-in prompts cannot be edited. Duplicate it to customize.');
            return;
        }
        setEditingId(prompt.id);
        setFormTitle(prompt.title);
        setFormContent(prompt.content);
        setFormTags(prompt.tags.join(', '));
        setView('edit');
    };

    const handleDuplicate = (prompt: SavedPrompt) => {
        setFormTitle(`${prompt.title} (copy)`);
        setFormContent(prompt.content);
        setFormTags(prompt.tags.join(', '));
        setEditingId(null);
        setView('add');
    };

    const handleInsert = (prompt: SavedPrompt) => {
        onInsert(prompt.content);
        incrementUseCount(prompt.id);
        setOpen(false);
    };

    const handleDelete = (prompt: SavedPrompt) => {
        if (prompt.isBuiltin) {
            toast.info('Built-in prompts cannot be deleted');
            return;
        }
        deletePrompt(prompt.id);
        toast.success('Prompt deleted');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-9 h-9 text-foreground-tertiary hover:bg-transparent group cursor-pointer"
                            onMouseDown={(e) => {
                                e.currentTarget.blur();
                            }}
                        >
                            <Icons.ListBullet className="w-5 h-5 group-hover:text-foreground" />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6} hideArrow>
                    Prompt library
                </TooltipContent>
            </Tooltip>
            <PopoverContent
                className="w-96 p-0 overflow-hidden"
                align="end"
                side="top"
                sideOffset={6}
            >
                {view === 'list' ? (
                    <div className="flex flex-col max-h-[480px]">
                        <div className="flex items-center gap-2 p-2 border-b">
                            <div className="relative flex-1">
                                <Icons.MagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-tertiary" />
                                <Input
                                    placeholder="Search prompts..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-7 h-8 text-xs"
                                />
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs gap-1"
                                onClick={() => {
                                    resetForm();
                                    setView('add');
                                }}
                            >
                                <Icons.Plus className="h-3.5 w-3.5" />
                                New
                            </Button>
                        </div>

                        <ScrollArea className="flex-1">
                            {filteredPrompts.length === 0 ? (
                                <div className="p-6 text-center text-xs text-foreground-tertiary">
                                    {search
                                        ? `No prompts match "${search}"`
                                        : 'No prompts saved yet'}
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {filteredPrompts.map((prompt) => (
                                        <PromptRow
                                            key={prompt.id}
                                            prompt={prompt}
                                            onInsert={() => handleInsert(prompt)}
                                            onEdit={() => handleEdit(prompt)}
                                            onDuplicate={() => handleDuplicate(prompt)}
                                            onDelete={() => handleDelete(prompt)}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        <div className="px-3 py-1.5 border-t text-[10px] text-foreground-tertiary bg-background-secondary/50">
                            {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} \u2022 click
                            to insert
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col max-h-[480px]">
                        <div className="flex items-center justify-between p-2 border-b">
                            <span className="text-xs font-medium">
                                {view === 'edit' ? 'Edit prompt' : 'New prompt'}
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => {
                                    resetForm();
                                    setView('list');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2 p-3 flex-1 overflow-auto">
                            <Input
                                placeholder="Title (e.g. Make it more modern)"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="h-8 text-xs"
                            />
                            <Textarea
                                placeholder="Prompt content..."
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                rows={6}
                                className="text-xs resize-none"
                            />
                            <Input
                                placeholder="Tags (comma separated)"
                                value={formTags}
                                onChange={(e) => setFormTags(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>

                        <div className="flex justify-end gap-2 p-2 border-t">
                            <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs"
                                onClick={handleSave}
                            >
                                {view === 'edit' ? 'Update' : 'Save'}
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

function PromptRow({
    prompt,
    onInsert,
    onEdit,
    onDuplicate,
    onDelete,
}: {
    prompt: SavedPrompt;
    onInsert: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="group flex items-start gap-2 px-3 py-2 border-b last:border-0 hover:bg-background-secondary transition-colors">
            <button
                className="flex-1 min-w-0 text-left cursor-pointer"
                onClick={onInsert}
                title="Click to insert into chat"
            >
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground-primary truncate">
                        {prompt.title}
                    </span>
                    {prompt.isBuiltin && (
                        <span className="text-[9px] text-foreground-tertiary border rounded px-1">
                            default
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-foreground-tertiary line-clamp-2 mt-0.5">
                    {prompt.content}
                </p>
                {prompt.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {prompt.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[9px] bg-background-tertiary text-foreground-secondary px-1.5 py-0.5 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </button>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate();
                            }}
                            className="p-1 hover:bg-background-tertiary rounded text-foreground-tertiary hover:text-foreground-primary transition-colors"
                        >
                            <Icons.Copy className="w-3 h-3" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4} hideArrow>
                        Duplicate
                    </TooltipContent>
                </Tooltip>
                {!prompt.isBuiltin && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                    className="p-1 hover:bg-background-tertiary rounded text-foreground-tertiary hover:text-foreground-primary transition-colors"
                                >
                                    <Icons.Pencil className="w-3 h-3" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={4} hideArrow>
                                Edit
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className={cn(
                                        'p-1 hover:bg-red-500/20 rounded transition-colors',
                                        'text-foreground-tertiary hover:text-red-400',
                                    )}
                                >
                                    <Icons.Trash className="w-3 h-3" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={4} hideArrow>
                                Delete
                            </TooltipContent>
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    );
}
