import * as React from 'react';
import Markdown from 'react-markdown';
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    Link,
    Code,
    List,
    ListOrdered,
    Quote,
    Eye,
    EyeOff,
    Minus,
} from 'lucide-react';

// Simple cn utility (classnames merge)
function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

export type ToolbarItem =
    | 'bold'
    | 'italic'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'link'
    | 'code'
    | 'codeblock'
    | 'ul'
    | 'ol'
    | 'quote'
    | 'hr'
    | 'preview';

export interface MarkdownEditorProps {
    /** Current markdown content */
    value: string;
    /** Callback when content changes */
    onChange: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Additional CSS classes for the container */
    className?: string;
    /** Minimum height of the editor area */
    minHeight?: string;
    /** Preview mode: false (off), true (preview only), 'split' (side by side) */
    preview?: boolean | 'split';
    /** Disable the editor */
    disabled?: boolean;
    /** Toolbar items to show */
    toolbar?: ToolbarItem[];
    /** Custom class for the toolbar */
    toolbarClassName?: string;
    /** Custom class for the textarea */
    textareaClassName?: string;
    /** Custom class for the preview area */
    previewClassName?: string;
}

interface ToolbarAction {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    prefix: string;
    suffix: string;
    block?: boolean;
    shortcut?: string;
}

const defaultToolbar: ToolbarItem[] = [
    'bold',
    'italic',
    'h2',
    'h3',
    'link',
    'code',
    'codeblock',
    'ul',
    'ol',
    'quote',
    'hr',
    'preview',
];

const toolbarActions: Record<string, ToolbarAction> = {
    bold: { icon: Bold, label: 'Bold (⌘B)', prefix: '**', suffix: '**', shortcut: 'b' },
    italic: { icon: Italic, label: 'Italic (⌘I)', prefix: '_', suffix: '_', shortcut: 'i' },
    h1: { icon: Heading1, label: 'Heading 1', prefix: '# ', suffix: '', block: true },
    h2: { icon: Heading2, label: 'Heading 2', prefix: '## ', suffix: '', block: true },
    h3: { icon: Heading3, label: 'Heading 3', prefix: '### ', suffix: '', block: true },
    link: { icon: Link, label: 'Link (⌘K)', prefix: '[', suffix: '](url)', shortcut: 'k' },
    code: { icon: Code, label: 'Inline Code', prefix: '`', suffix: '`' },
    codeblock: { icon: Code, label: 'Code Block', prefix: '```\n', suffix: '\n```', block: true },
    ul: { icon: List, label: 'Bullet List', prefix: '- ', suffix: '', block: true },
    ol: { icon: ListOrdered, label: 'Numbered List', prefix: '1. ', suffix: '', block: true },
    quote: { icon: Quote, label: 'Quote', prefix: '> ', suffix: '', block: true },
    hr: { icon: Minus, label: 'Horizontal Rule', prefix: '\n---\n', suffix: '', block: true },
};

// Default styles (can be overridden via className props)
const defaultStyles = {
    container: 'rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900',
    toolbar: 'flex items-center gap-0.5 border-b border-gray-300 dark:border-gray-700 px-2 py-1.5 flex-wrap',
    button: 'h-7 w-7 p-0 inline-flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonActive: 'bg-gray-200 dark:bg-gray-700',
    textarea: 'w-full resize-none bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono',
    preview: 'flex-1 px-3 py-2 prose prose-sm dark:prose-invert max-w-none overflow-auto',
    previewEmpty: 'text-gray-400 italic',
};

export function MarkdownEditor({
    value,
    onChange,
    placeholder = 'Write here... (Markdown supported)',
    className,
    minHeight = '150px',
    preview: initialPreview = false,
    disabled = false,
    toolbar = defaultToolbar,
    toolbarClassName,
    textareaClassName,
    previewClassName,
}: MarkdownEditorProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [showPreview, setShowPreview] = React.useState(
        initialPreview === true || initialPreview === 'split'
    );
    const [isSplit, setIsSplit] = React.useState(initialPreview === 'split');

    const applyFormat = React.useCallback(
        (action: ToolbarAction) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = value.substring(start, end);
            const beforeText = value.substring(0, start);
            const afterText = value.substring(end);

            let newText: string;
            let newCursorPos: number;

            if (action.block) {
                if (selectedText) {
                    const lines = selectedText.split('\n');
                    const formattedLines = lines.map(line => action.prefix + line + action.suffix);
                    newText = beforeText + formattedLines.join('\n') + afterText;
                    newCursorPos = start + formattedLines.join('\n').length;
                } else {
                    newText = beforeText + action.prefix + action.suffix + afterText;
                    newCursorPos = start + action.prefix.length;
                }
            } else {
                if (selectedText) {
                    newText = beforeText + action.prefix + selectedText + action.suffix + afterText;
                    newCursorPos = end + action.prefix.length + action.suffix.length;
                } else {
                    newText = beforeText + action.prefix + action.suffix + afterText;
                    newCursorPos = start + action.prefix.length;
                }
            }

            onChange(newText);

            requestAnimationFrame(() => {
                textarea.focus();
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            });
        },
        [value, onChange]
    );

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.metaKey || e.ctrlKey) {
                const key = e.key.toLowerCase();
                const action = Object.entries(toolbarActions).find(
                    ([, a]) => a.shortcut === key
                );
                if (action) {
                    e.preventDefault();
                    applyFormat(action[1]);
                }
            }

            // Tab handling
            if (e.key === 'Tab') {
                e.preventDefault();
                const textarea = textareaRef.current;
                if (!textarea) return;

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;

                if (e.shiftKey) {
                    const beforeText = value.substring(0, start);
                    const lineStart = beforeText.lastIndexOf('\n') + 1;
                    
                    if (value.substring(lineStart, start).startsWith('  ')) {
                        const newText = value.substring(0, lineStart) + value.substring(lineStart + 2);
                        onChange(newText);
                        requestAnimationFrame(() => {
                            textarea.setSelectionRange(Math.max(start - 2, lineStart), Math.max(end - 2, lineStart));
                        });
                    }
                } else {
                    const newText = value.substring(0, start) + '  ' + value.substring(end);
                    onChange(newText);
                    requestAnimationFrame(() => {
                        textarea.setSelectionRange(start + 2, start + 2);
                    });
                }
            }
        },
        [value, onChange, applyFormat]
    );

    const togglePreview = () => {
        if (showPreview && isSplit) {
            setIsSplit(false);
        } else if (showPreview) {
            setShowPreview(false);
        } else {
            setShowPreview(true);
            setIsSplit(true);
        }
    };

    return (
        <div className={cn(defaultStyles.container, className)}>
            {/* Toolbar */}
            <div className={cn(defaultStyles.toolbar, toolbarClassName)}>
                {toolbar.map((item) => {
                    if (item === 'preview') {
                        return (
                            <button
                                key={item}
                                type="button"
                                className={cn(
                                    defaultStyles.button,
                                    showPreview && defaultStyles.buttonActive
                                )}
                                onClick={togglePreview}
                                disabled={disabled}
                                title={showPreview ? 'Hide Preview' : 'Show Preview'}
                            >
                                {showPreview ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        );
                    }

                    const action = toolbarActions[item];
                    if (!action) return null;

                    const Icon = action.icon;
                    return (
                        <button
                            key={item}
                            type="button"
                            className={defaultStyles.button}
                            onClick={() => applyFormat(action)}
                            disabled={disabled}
                            title={action.label}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    );
                })}
            </div>

            {/* Editor Area */}
            <div className={cn('flex', isSplit && showPreview && 'divide-x divide-gray-300 dark:divide-gray-700')}>
                {/* Textarea */}
                {(!showPreview || isSplit) && (
                    <div className={cn('flex-1', isSplit && 'w-1/2')}>
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={cn(defaultStyles.textarea, textareaClassName)}
                            style={{ minHeight }}
                        />
                    </div>
                )}

                {/* Preview */}
                {showPreview && (
                    <div
                        className={cn(
                            defaultStyles.preview,
                            isSplit && 'w-1/2',
                            previewClassName
                        )}
                        style={{ minHeight }}
                    >
                        {value ? (
                            <Markdown>{value}</Markdown>
                        ) : (
                            <p className={defaultStyles.previewEmpty}>
                                Preview will appear here...
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MarkdownEditor;
