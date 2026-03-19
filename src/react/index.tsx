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

import type { MarkdownEditorProps, FormatResult } from '../core/types';
import { defaultToolbar, toolbarActions } from '../core/actions';
import { cn, baseStyles, fallbackStyles } from '../core/styles';
import {
    applyFormatAction,
    handleShortcut,
    handleTab,
    insertTextAtCursor,
    buildImageMarkdown,
} from '../core/formatting';

export type { MarkdownEditorProps, ToolbarItem } from '../core/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    bold: Bold,
    italic: Italic,
    h1: Heading1,
    h2: Heading2,
    h3: Heading3,
    link: Link,
    code: Code,
    codeblock: Code,
    ul: List,
    ol: ListOrdered,
    checklist: CheckSquare,
    quote: Quote,
    hr: Minus,
    table: Table,
    image: Image,
};

function getTextareaState(textarea: HTMLTextAreaElement, value: string) {
    return {
        value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
    };
}

function applyCursor(textarea: HTMLTextAreaElement, result: FormatResult) {
    requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(result.cursorStart, result.cursorEnd);
    });
}

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

    const handleImageUpload = React.useCallback(
        async (file: File) => {
            if (!onImageUpload) {
                const textarea = textareaRef.current;
                if (!textarea) return;
                const state = getTextareaState(textarea, value);
                const result = insertTextAtCursor(state, buildImageMarkdown(file.name));
                onChange(result.newValue);
                applyCursor(textarea, result);
                return;
            }

            setIsUploading(true);
            try {
                const url = await onImageUpload(file);
                const textarea = textareaRef.current;
                if (!textarea) return;
                const state = getTextareaState(textarea, value);
                const result = insertTextAtCursor(state, buildImageMarkdown(file.name, url));
                onChange(result.newValue);
                applyCursor(textarea, result);
            } catch (error) {
                console.error('Image upload failed:', error);
                const textarea = textareaRef.current;
                if (!textarea) return;
                const state = getTextareaState(textarea, value);
                const result = insertTextAtCursor(state, `![${file.name}](upload-failed)`);
                onChange(result.newValue);
                applyCursor(textarea, result);
            } finally {
                setIsUploading(false);
            }
        },
        [onImageUpload, value, onChange]
    );

    const handleFileSelect = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = '';
        },
        [handleImageUpload]
    );

    const applyFormat = React.useCallback(
        (item: string) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const action = toolbarActions[item];
            if (!action) return;

            const state = getTextareaState(textarea, value);
            const result = applyFormatAction(state, action);

            if ('handler' in result && result.handler === 'image') {
                if (onImageUpload) {
                    fileInputRef.current?.click();
                } else {
                    const insertResult = insertTextAtCursor(state, '![alt text](image-url)', 2);
                    onChange(insertResult.newValue);
                    applyCursor(textarea, insertResult);
                }
                return;
            }

            const formatResult = 'handler' in result ? result.result : result;
            onChange(formatResult.newValue);
            applyCursor(textarea, formatResult);
        },
        [value, onChange, onImageUpload]
    );

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (e.metaKey || e.ctrlKey) {
                const state = getTextareaState(textarea, value);
                const result = handleShortcut(state, e.key.toLowerCase());
                if (result) {
                    e.preventDefault();
                    if ('handler' in result) return;
                    onChange(result.newValue);
                    applyCursor(textarea, result);
                }
            }

            if (e.key === 'Tab') {
                e.preventDefault();
                const state = getTextareaState(textarea, value);
                const result = handleTab(state, e.shiftKey);
                if (result) {
                    onChange(result.newValue);
                    applyCursor(textarea, result);
                }
            }
        },
        [value, onChange]
    );

    const handlePaste = React.useCallback(
        (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
            const items = e.clipboardData?.items;
            if (!items || !onImageUpload) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) handleImageUpload(file);
                    return;
                }
            }
        },
        [onImageUpload, handleImageUpload]
    );

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
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

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

                    const Icon = iconMap[item];
                    if (!Icon) return null;

                    const action = toolbarActions[item];
                    const isImageUploading = item === 'image' && isUploading;

                    return (
                        <button
                            key={item}
                            type="button"
                            className={cn(styles.button, buttonClassName)}
                            onClick={() => applyFormat(item)}
                            disabled={disabled || isImageUploading}
                            title={action?.label}
                        >
                            <Icon className={cn('h-4 w-4', isImageUploading && 'animate-pulse')} />
                        </button>
                    );
                })}
            </div>

            <div className={cn('flex items-stretch', isSplit && showPreview && styles.divider)}>
                {(!showPreview || isSplit) && (
                    <div className={cn('flex-1 flex', isSplit && 'w-1/2')}>
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
                            className={cn(styles.textarea, 'flex-1', textareaClassName)}
                            style={{ minHeight }}
                        />
                    </div>
                )}

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
