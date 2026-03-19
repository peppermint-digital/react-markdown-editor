import {
    defineComponent,
    ref,
    computed,
    nextTick,
    h,
    type PropType,
} from 'vue';
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
} from 'lucide-vue-next';
import MarkdownIt from 'markdown-it';

import type { ToolbarItem, FormatResult } from '../core/types';
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

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
});

// Enable GFM-like features built into markdown-it
md.enable(['table', 'strikethrough']);

const iconMap: Record<string, ReturnType<typeof defineComponent>> = {
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
    nextTick(() => {
        textarea.focus();
        textarea.setSelectionRange(result.cursorStart, result.cursorEnd);
    });
}

export const MarkdownEditor = defineComponent({
    name: 'MarkdownEditor',

    props: {
        modelValue: { type: String, default: '' },
        placeholder: { type: String, default: 'Write here... (Markdown supported)' },
        className: { type: String, default: undefined },
        minHeight: { type: String, default: '150px' },
        preview: { type: [Boolean, String] as PropType<boolean | 'split'>, default: false },
        disabled: { type: Boolean, default: false },
        toolbar: {
            type: Array as PropType<ToolbarItem[]>,
            default: () => defaultToolbar,
        },
        toolbarClassName: { type: String, default: undefined },
        textareaClassName: { type: String, default: undefined },
        previewClassName: { type: String, default: undefined },
        buttonClassName: { type: String, default: undefined },
        buttonActiveClassName: { type: String, default: undefined },
        onImageUpload: {
            type: Function as PropType<(file: File) => Promise<string>>,
            default: undefined,
        },
        variant: {
            type: String as PropType<'default' | 'shadcn'>,
            default: 'shadcn',
        },
    },

    emits: ['update:modelValue'],

    setup(props, { emit }) {
        const textareaRef = ref<HTMLTextAreaElement | null>(null);
        const fileInputRef = ref<HTMLInputElement | null>(null);
        const showPreview = ref(props.preview === true || props.preview === 'split');
        const isSplit = ref(props.preview === 'split');
        const isUploading = ref(false);

        const styles = computed(() =>
            props.variant === 'shadcn' ? baseStyles : fallbackStyles
        );

        const renderedMarkdown = computed(() =>
            props.modelValue ? md.render(props.modelValue) : ''
        );

        function updateValue(newValue: string) {
            emit('update:modelValue', newValue);
        }

        async function handleImageUpload(file: File) {
            const textarea = textareaRef.value;
            if (!textarea) return;

            if (!props.onImageUpload) {
                const state = getTextareaState(textarea, props.modelValue);
                const result = insertTextAtCursor(state, buildImageMarkdown(file.name));
                updateValue(result.newValue);
                applyCursor(textarea, result);
                return;
            }

            isUploading.value = true;
            try {
                const url = await props.onImageUpload(file);
                const state = getTextareaState(textarea, props.modelValue);
                const result = insertTextAtCursor(state, buildImageMarkdown(file.name, url));
                updateValue(result.newValue);
                applyCursor(textarea, result);
            } catch (error) {
                console.error('Image upload failed:', error);
                const state = getTextareaState(textarea, props.modelValue);
                const result = insertTextAtCursor(state, `![${file.name}](upload-failed)`);
                updateValue(result.newValue);
                applyCursor(textarea, result);
            } finally {
                isUploading.value = false;
            }
        }

        function handleFileSelect(e: Event) {
            const input = e.target as HTMLInputElement;
            const file = input.files?.[0];
            if (file) handleImageUpload(file);
            input.value = '';
        }

        function applyFormat(item: string) {
            const textarea = textareaRef.value;
            if (!textarea) return;

            const action = toolbarActions[item];
            if (!action) return;

            const state = getTextareaState(textarea, props.modelValue);
            const result = applyFormatAction(state, action);

            if ('handler' in result && result.handler === 'image') {
                if (props.onImageUpload) {
                    fileInputRef.value?.click();
                } else {
                    const insertResult = insertTextAtCursor(state, '![alt text](image-url)', 2);
                    updateValue(insertResult.newValue);
                    applyCursor(textarea, insertResult);
                }
                return;
            }

            const formatResult = 'handler' in result ? result.result : result;
            updateValue(formatResult.newValue);
            applyCursor(textarea, formatResult);
        }

        function handleKeyDown(e: KeyboardEvent) {
            const textarea = textareaRef.value;
            if (!textarea) return;

            if (e.metaKey || e.ctrlKey) {
                const state = getTextareaState(textarea, props.modelValue);
                const result = handleShortcut(state, e.key.toLowerCase());
                if (result) {
                    e.preventDefault();
                    if ('handler' in result) return;
                    updateValue(result.newValue);
                    applyCursor(textarea, result);
                }
            }

            if (e.key === 'Tab') {
                e.preventDefault();
                const state = getTextareaState(textarea, props.modelValue);
                const result = handleTab(state, e.shiftKey);
                if (result) {
                    updateValue(result.newValue);
                    applyCursor(textarea, result);
                }
            }
        }

        function handlePaste(e: ClipboardEvent) {
            const items = e.clipboardData?.items;
            if (!items || !props.onImageUpload) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) handleImageUpload(file);
                    return;
                }
            }
        }

        function handleDrop(e: DragEvent) {
            if (!props.onImageUpload) return;
            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) return;

            const file = files[0];
            if (file.type.startsWith('image/')) {
                e.preventDefault();
                handleImageUpload(file);
            }
        }

        function togglePreview() {
            if (showPreview.value && isSplit.value) {
                isSplit.value = false;
            } else if (showPreview.value) {
                showPreview.value = false;
            } else {
                showPreview.value = true;
                isSplit.value = true;
            }
        }

        return () => {
            const s = styles.value;

            // Hidden file input
            const fileInput = h('input', {
                ref: fileInputRef,
                type: 'file',
                accept: 'image/*',
                onChange: handleFileSelect,
                class: 'hidden',
            });

            // Toolbar buttons
            const toolbarButtons = props.toolbar.map((item: ToolbarItem) => {
                if (item === 'preview') {
                    const PreviewIcon = showPreview.value ? EyeOff : Eye;
                    return h(
                        'button',
                        {
                            key: item,
                            type: 'button',
                            class: cn(
                                s.button,
                                props.buttonClassName,
                                showPreview.value && (props.buttonActiveClassName || s.buttonActive)
                            ),
                            onClick: togglePreview,
                            disabled: props.disabled,
                            title: showPreview.value ? 'Hide Preview' : 'Show Preview',
                        },
                        [h(PreviewIcon, { class: 'h-4 w-4' })]
                    );
                }

                const Icon = iconMap[item];
                if (!Icon) return null;

                const action = toolbarActions[item];
                const uploading = item === 'image' && isUploading.value;

                return h(
                    'button',
                    {
                        key: item,
                        type: 'button',
                        class: cn(s.button, props.buttonClassName),
                        onClick: () => applyFormat(item),
                        disabled: props.disabled || uploading,
                        title: action?.label,
                    },
                    [h(Icon, { class: cn('h-4 w-4', uploading && 'animate-pulse') })]
                );
            });

            const toolbarEl = h(
                'div',
                { class: cn(s.toolbar, props.toolbarClassName) },
                toolbarButtons
            );

            // Textarea
            const textareaEl = (!showPreview.value || isSplit.value)
                ? h(
                    'div',
                    { class: cn('flex-1 flex', isSplit.value && 'w-1/2') },
                    [
                        h('textarea', {
                            ref: textareaRef,
                            value: props.modelValue,
                            onInput: (e: Event) => updateValue((e.target as HTMLTextAreaElement).value),
                            onKeydown: handleKeyDown,
                            onPaste: handlePaste,
                            onDrop: handleDrop,
                            onDragover: (e: Event) => e.preventDefault(),
                            placeholder: props.placeholder,
                            disabled: props.disabled,
                            class: cn(s.textarea, 'flex-1', props.textareaClassName),
                            style: { minHeight: props.minHeight },
                        }),
                    ]
                )
                : null;

            // Preview
            const previewEl = showPreview.value
                ? h(
                    'div',
                    {
                        class: cn(s.preview, isSplit.value && 'w-1/2', props.previewClassName),
                        style: { minHeight: props.minHeight },
                    },
                    props.modelValue
                        ? [h('div', { innerHTML: renderedMarkdown.value })]
                        : [h('p', { class: s.previewEmpty }, 'Preview will appear here...')]
                )
                : null;

            // Editor area
            const editorArea = h(
                'div',
                { class: cn('flex items-stretch', isSplit.value && showPreview.value && s.divider) },
                [textareaEl, previewEl]
            );

            return h(
                'div',
                { class: cn(s.container, props.className) },
                [fileInput, toolbarEl, editorArea]
            );
        };
    },
});

export default MarkdownEditor;
