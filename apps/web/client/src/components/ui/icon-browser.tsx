'use client';

import { cn } from '@onlook/ui/utils';
import { Button } from '@onlook/ui/button';
import { Input } from '@onlook/ui/input';
import { ScrollArea } from '@onlook/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@onlook/ui/tooltip';
import * as icons from '@icon-park/react';
import { useCallback, useMemo, useState } from 'react';

type IconComponent = React.ComponentType<{
    theme?: 'outline' | 'filled' | 'two-tone' | 'multi-color';
    size?: number | string;
    fill?: string | string[];
    strokeWidth?: number;
}>;

// Get all icon names from the package
const ALL_ICON_NAMES = Object.keys(icons).filter(
    (key) => key !== 'default' && key !== 'IconProvider' && typeof (icons as any)[key] === 'object',
);

interface IconBrowserProps {
    onSelect?: (iconName: string, svgString: string) => void;
    theme?: 'outline' | 'filled' | 'two-tone' | 'multi-color';
    size?: number;
    color?: string;
    className?: string;
    maxVisible?: number;
}

/**
 * Browsable icon picker with 2,400+ icons from ByteDance's IconPark.
 * Search, filter by theme, and click to select. Returns icon name and SVG.
 *
 * @example
 * ```tsx
 * <IconBrowser
 *   onSelect={(name, svg) => console.log(name, svg)}
 *   theme="outline"
 *   size={24}
 * />
 * ```
 */
export function IconBrowser({
    onSelect,
    theme = 'outline',
    size = 24,
    color = 'currentColor',
    className,
    maxVisible = 200,
}: IconBrowserProps) {
    const [search, setSearch] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(theme);

    const filteredIcons = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) {
            return ALL_ICON_NAMES.slice(0, maxVisible);
        }
        return ALL_ICON_NAMES.filter((name) =>
            name.toLowerCase().includes(query),
        ).slice(0, maxVisible);
    }, [search, maxVisible]);

    const handleSelect = useCallback(
        (iconName: string) => {
            if (!onSelect) {
                return;
            }
            // Generate a simple SVG placeholder string with the icon name
            onSelect(iconName, `<IconPark name="${iconName}" theme="${selectedTheme}" />`);
        },
        [onSelect, selectedTheme],
    );

    const themes: Array<'outline' | 'filled' | 'two-tone' | 'multi-color'> = [
        'outline',
        'filled',
        'two-tone',
        'multi-color',
    ];

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Input
                placeholder="Search 2,400+ icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-small"
            />
            <div className="flex gap-1">
                {themes.map((t) => (
                    <Button
                        key={t}
                        variant={selectedTheme === t ? 'default' : 'ghost'}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 capitalize"
                        onClick={() => setSelectedTheme(t)}
                    >
                        {t}
                    </Button>
                ))}
            </div>
            <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-8 gap-1 p-1">
                    {filteredIcons.map((iconName) => {
                        const IconComp = (icons as any)[iconName] as IconComponent | undefined;
                        if (!IconComp) {
                            return null;
                        }
                        return (
                            <Tooltip key={iconName}>
                                <TooltipTrigger asChild>
                                    <button
                                        className="flex items-center justify-center w-9 h-9 rounded hover:bg-background-secondary transition-colors cursor-pointer"
                                        onClick={() => handleSelect(iconName)}
                                    >
                                        <IconComp
                                            theme={selectedTheme}
                                            size={size}
                                            fill={color}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={4} hideArrow>
                                    {iconName}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
                {filteredIcons.length === 0 && (
                    <div className="text-center text-foreground-tertiary text-small py-8">
                        No icons found for &ldquo;{search}&rdquo;
                    </div>
                )}
            </ScrollArea>
            <div className="text-xs text-foreground-tertiary px-1">
                {filteredIcons.length} of {ALL_ICON_NAMES.length} icons
            </div>
        </div>
    );
}
