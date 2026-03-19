import type { TextareaState, FormatResult, ToolbarActionConfig } from './types';
import { toolbarActions, tableTemplate } from './actions';

/** Insert text at cursor position, replacing any selection */
export function insertTextAtCursor(
    state: TextareaState,
    text: string,
    cursorOffset?: number,
): FormatResult {
    const before = state.value.substring(0, state.selectionStart);
    const after = state.value.substring(state.selectionEnd);
    const newValue = before + text + after;
    const newPos = cursorOffset !== undefined
        ? state.selectionStart + cursorOffset
        : state.selectionStart + text.length;
    return { newValue, cursorStart: newPos, cursorEnd: newPos };
}

/** Apply a toolbar formatting action. Returns a FormatResult or a signal for special handlers. */
export function applyFormatAction(
    state: TextareaState,
    action: ToolbarActionConfig,
): FormatResult | { handler: 'image' } | { handler: 'table'; result: FormatResult } {
    if (action.handler === 'image') {
        return { handler: 'image' };
    }

    if (action.handler === 'table') {
        const before = state.value.substring(0, state.selectionStart);
        const needsNewline = before.length > 0 && !before.endsWith('\n');
        const text = (needsNewline ? '\n\n' : '') + tableTemplate + '\n';
        return {
            handler: 'table',
            result: insertTextAtCursor(state, text, needsNewline ? 2 : 0),
        };
    }

    return applyInlineOrBlockFormat(state, action);
}

function applyInlineOrBlockFormat(
    state: TextareaState,
    action: ToolbarActionConfig,
): FormatResult {
    const { selectionStart: start, selectionEnd: end, value } = state;
    const selectedText = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    let newValue: string;
    let cursorPos: number;

    if (action.block) {
        if (selectedText) {
            const lines = selectedText.split('\n');
            const formatted = lines.map(line => action.prefix + line + action.suffix).join('\n');
            newValue = before + formatted + after;
            cursorPos = start + formatted.length;
        } else {
            newValue = before + action.prefix + action.suffix + after;
            cursorPos = start + action.prefix.length;
        }
    } else {
        if (selectedText) {
            newValue = before + action.prefix + selectedText + action.suffix + after;
            cursorPos = end + action.prefix.length + action.suffix.length;
        } else {
            newValue = before + action.prefix + action.suffix + after;
            cursorPos = start + action.prefix.length;
        }
    }

    return { newValue, cursorStart: cursorPos, cursorEnd: cursorPos };
}

/** Handle keyboard shortcut. Returns result if a shortcut matched, null otherwise. */
export function handleShortcut(
    state: TextareaState,
    key: string,
): FormatResult | { handler: 'image' } | { handler: 'table'; result: FormatResult } | null {
    const entry = Object.entries(toolbarActions).find(([, a]) => a.shortcut === key);
    if (!entry) return null;
    return applyFormatAction(state, entry[1]);
}

/** Handle Tab/Shift+Tab for indentation */
export function handleTab(
    state: TextareaState,
    shiftKey: boolean,
): FormatResult | null {
    const { selectionStart: start, selectionEnd: end, value } = state;

    if (shiftKey) {
        const before = value.substring(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        if (value.substring(lineStart, start).startsWith('  ')) {
            const newValue = value.substring(0, lineStart) + value.substring(lineStart + 2);
            return {
                newValue,
                cursorStart: Math.max(start - 2, lineStart),
                cursorEnd: Math.max(end - 2, lineStart),
            };
        }
        return null;
    }

    const newValue = value.substring(0, start) + '  ' + value.substring(end);
    return { newValue, cursorStart: start + 2, cursorEnd: start + 2 };
}

/** Build markdown image syntax */
export function buildImageMarkdown(fileName: string, url?: string): string {
    return url ? `![${fileName}](${url})` : `![${fileName}]()`;
}
