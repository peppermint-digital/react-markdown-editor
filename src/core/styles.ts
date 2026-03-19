/** Simple classnames merge utility */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

/** shadcn/ui compatible styles (CSS variables) */
export const baseStyles = {
    container: 'rounded-md border bg-background text-foreground',
    toolbar: 'flex items-center gap-0.5 border-b px-2 py-1.5 flex-wrap',
    button: 'h-7 w-7 p-0 inline-flex items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none',
    buttonActive: 'bg-accent text-accent-foreground',
    textarea: 'w-full resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono',
    preview: 'flex-1 px-3 py-2 prose prose-sm dark:prose-invert max-w-none overflow-auto',
    previewEmpty: 'text-muted-foreground italic',
    divider: 'divide-x',
};

/** Fallback styles for non-shadcn projects */
export const fallbackStyles = {
    container: 'rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900',
    toolbar: 'flex items-center gap-0.5 border-b border-gray-300 dark:border-gray-700 px-2 py-1.5 flex-wrap',
    button: 'h-7 w-7 p-0 inline-flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonActive: 'bg-gray-200 dark:bg-gray-700',
    textarea: 'w-full resize-none bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono',
    preview: 'flex-1 px-3 py-2 prose prose-sm dark:prose-invert max-w-none overflow-auto',
    previewEmpty: 'text-gray-400 italic',
    divider: 'divide-x divide-gray-300 dark:divide-gray-700',
};

export type EditorStyles = typeof baseStyles;
