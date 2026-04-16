'use client';

/**
 * Re-exports of @assistant-ui/react primitives for building enhanced AI chat UIs.
 *
 * These composable components provide production-ready building blocks for
 * streaming AI responses, auto-scrolling, markdown rendering, and more.
 * They can be used alongside or as replacements for existing chat components.
 *
 * @see https://www.assistant-ui.com/docs
 *
 * @example
 * ```tsx
 * import {
 *   AssistantRuntimeProvider,
 *   ThreadPrimitive,
 *   MessagePrimitive,
 *   ComposerPrimitive,
 * } from '@/components/ui/assistant-ui-primitives';
 *
 * // Use ThreadPrimitive.Root, MessagePrimitive.Content, etc.
 * // to build custom chat layouts with built-in streaming and scroll behavior.
 * ```
 */

export {
    AssistantRuntimeProvider,
    useAssistantRuntime,
    useThread,
    useMessage,
    useComposer,
} from '@assistant-ui/react';

export {
    ThreadPrimitive,
    MessagePrimitive,
    ComposerPrimitive,
    BranchPickerPrimitive,
    ActionBarPrimitive,
} from '@assistant-ui/react';
