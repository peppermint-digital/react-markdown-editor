import * as React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    Table,
    CheckSquare,
    Image,
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
    | 'table'
    | 'checklist'
    | 'image'
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
    /** Custom class for toolbar buttons */
    buttonClassName?: string;
    /** Custom class for active toolbar buttons */
    buttonActiveClassName?: string;
    /** Callback for image upload - receives File, should return URL */
    onImageUpload?: (file: File) => Promise<string>;
    /** Use shadcn/ui compatible styling */
    variant?: 'default' | 'shadcn';
}

interface ToolbarAction {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    prefix: string;
    suffix: string;
    block?: boolean;
    shortcut?: string;
    handler?: 'default' | 'image' | 'table';
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
    'checklist',
    'quote',
    'table',
    'image',
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
    checklist: { icon: CheckSquare, label: 'Checklist', prefix: '- [ ] ', suffix: '', block: true },
    quote: { icon: Quote, label: 'Quote', prefix: '> ', suffix: '', block: true },
    hr: { icon: Minus, label: 'Horizontal Rule', prefix: '\n---\n', suffix: '', block: true },
    table: { icon: Table, label: 'Table', prefix: '', suffix: '', handler: 'table' },
    image: { icon: Image, label: 'Image', prefix: '![', suffix: '](url)', handler: 'image' },
};

// Default styles (shadcn-compatible CSS variables)
const baseStyles = {
    container: 'rounded-md border bg-background text-foreground',
    toolbar: 'flex items-center gap-0.5 border-b px-2 py-1.5 flex-wrap',
    button: 'h-7 w-7 p-0 inline-flex items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none',
    buttonActive: 'bg-accent text-accent-foreground',
    textarea: 'w-full resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono',
    preview: 'flex-1 px-3 py-2 prose prose-sm dark:prose-invert max-w-none overflow-auto',
    previewEmpty: 'text-muted-foreground italic',
    divider: 'divide-x',
};

// Fallback styles for non-shadcn projects
const fallbackStyles = {
    container: 'rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900',
    toolbar: 'flex items-center gap-0.5 border-b border-gray-300 dark:border-gray-700 px-2 py-1.5 flex-wrap',
    button: 'h-7 w-7 p-0 inline-flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonActive: 'bg-gray-200 dark:bg-gray-700',
    textarea: 'w-full resize-none bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono',
    preview: 'flex-1 px-3 py-2 prose prose-sm dark:prose-invert max-w-none overflow-auto',
    previewEmpty: 'text-gray-400 italic',
    divider: 'divide-x divide-gray-300 dark:divide-gray-700',
};

const tableTemplate = `| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;

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
    buttonClassName,
    buttonActiveClassName,
    onImageUpload,
    variant = 'shadcn',
}: MarkdownEditorProps) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showPreview, setShowPreview] = React.useState(
        initialPreview === true || initialPreview === 'split'
    );
    const [isSplit, setIsSplit] = React.useState(initialPreview === 'split');
    const [isUploading, setIsUploading] = React.useState(false);

    const styles = variant === 'shadcn' ? baseStyles : fallbackStyles;

    const insertText = React.useCallback(
        (text: string, cursorOffset?: number) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const beforeText = value.substring(0, start);
            const afterText = value.substring(end);

            const newText = beforeText + text + afterText;
            onChange(newText);

            const newPos = cursorOffset !== undefined ? start + cursorOffset : start + text.length;
            requestAnimationFrame(() => {
                textarea.focus();
                textarea.setSelectionRange(newPos, newPos);
            });
        },
        [value, onChange]
    );

    const handleImageUpload = React.useCallback(
        async (file: File) => {
            if (!onImageUpload) {
                // Fallback: insert placeholder
                insertText(`![${file.name}]()`);
                return;
            }

            setIsUploading(true);
            try {
                const url = await onImageUpload(file);
                insertText(`![${file.name}](${url})`);
            } catch (error) {
                console.error('Image upload failed:', error);
                insertText(`![${file.name}](upload-failed)`);
            } finally {
                setIsUploading(false);
            }
        },
        [onImageUpload, insertText]
    );

    const handleFileSelect = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleImageUpload(file);
            }
            // Reset input
            e.target.value = '';
        },
        [handleImageUpload]
    );

    const applyFormat = React.useCallback(
        (action: ToolbarAction) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            // Special handlers
            if (action.handler === 'table') {
                const start = textarea.selectionStart;
                const beforeText = value.substring(0, start);
                const needsNewline = beforeText.length > 0 && !beforeText.endsWith('\n');
                insertText((needsNewline ? '\n\n' : '') + tableTemplate + '\n', needsNewline ? 2 : 0);
                return;
            }

            if (action.handler === 'image') {
                if (onImageUpload) {
                    fileInputRef.current?.click();
                } else {
                    insertText('![alt text](image-url)', 2);
                }
                return;
            }

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
        [value, onChange, insertText, onImageUpload]
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

    // Handle paste for images
    const handlePaste = React.useCallback(
        (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
            const items = e.clipboardData?.items;
            if (!items || !onImageUpload) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        handleImageUpload(file);
                    }
                    return;
                }
            }
        },
        [onImageUpload, handleImageUpload]
    );

    // Handle drag and drop for images
    const handleDrop = React.useCallback(
        (e: React.DragEvent<HTMLTextAreaElement>) => {
            if (!onImageUpload) return;

            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) return;

            const file = files[0];
            if (file.type.startsWith('image/')) {
                e.preventDefault();
                handleImageUpload(file);
            }
        },
        [onImageUpload, handleImageUpload]
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
        <div className={cn(styles.container, className)}>
            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Toolbar */}
            <div className={cn(styles.toolbar, toolbarClassName)}>
                {toolbar.map((item) => {
                    if (item === 'preview') {
                        return (
                            <button
                                key={item}
                                type="button"
                                className={cn(
                                    styles.button,
                                    buttonClassName,
                                    showPreview && (buttonActiveClassName || styles.buttonActive)
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
                    const isImageUploading = item === 'image' && isUploading;

                    return (
                        <button
                            key={item}
                            type="button"
                            className={cn(styles.button, buttonClassName)}
                            onClick={() => applyFormat(action)}
                            disabled={disabled || isImageUploading}
                            title={action.label}
                        >
                            <Icon className={cn('h-4 w-4', isImageUploading && 'animate-pulse')} />
                        </button>
                    );
                })}
            </div>

            {/* Editor Area */}
            <div className={cn('flex', isSplit && showPreview && styles.divider)}>
                {/* Textarea */}
                {(!showPreview || isSplit) && (
                    <div className={cn('flex-1', isSplit && 'w-1/2')}>
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={cn(styles.textarea, textareaClassName)}
                            style={{ minHeight }}
                        />
                    </div>
                )}

                {/* Preview */}
                {showPreview && (
                    <div
                        className={cn(
                            styles.preview,
                            isSplit && 'w-1/2',
                            previewClassName
                        )}
                        style={{ minHeight }}
                    >
                        {value ? (
                            <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
                        ) : (
                            <p className={styles.previewEmpty}>
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
