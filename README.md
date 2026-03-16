# @peppermint-digital/react-markdown-editor

A customizable Markdown editor component for React with toolbar, keyboard shortcuts, and live preview.

## Features

- 📝 **Toolbar** with formatting buttons (Bold, Italic, Headings, Links, Code, Lists, etc.)
- ⌨️ **Keyboard Shortcuts** (⌘B bold, ⌘I italic, ⌘K link)
- 👁️ **Live Preview** with split-view or toggle mode
- 🎨 **Fully Customizable** styling via className props
- 🌙 **Dark Mode** support out of the box
- 📦 **Lightweight** with minimal dependencies
- 🔧 **TypeScript** support

## Installation

```bash
npm install @peppermint-digital/react-markdown-editor
```

### Peer Dependencies

Make sure you have these installed:

```bash
npm install react react-dom react-markdown lucide-react
```

## Usage

```tsx
import { MarkdownEditor } from '@peppermint-digital/react-markdown-editor';
import { useState } from 'react';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      placeholder="Write something..."
      preview="split"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Current markdown content |
| `onChange` | `(value: string) => void` | required | Callback when content changes |
| `placeholder` | `string` | `'Write here...'` | Placeholder text |
| `className` | `string` | - | Additional CSS classes for container |
| `minHeight` | `string` | `'150px'` | Minimum height of editor area |
| `preview` | `boolean \| 'split'` | `false` | Preview mode |
| `disabled` | `boolean` | `false` | Disable the editor |
| `toolbar` | `ToolbarItem[]` | See below | Toolbar items to show |
| `toolbarClassName` | `string` | - | Custom class for toolbar |
| `textareaClassName` | `string` | - | Custom class for textarea |
| `previewClassName` | `string` | - | Custom class for preview area |

### Default Toolbar

```ts
['bold', 'italic', 'h2', 'h3', 'link', 'code', 'codeblock', 'ul', 'ol', 'quote', 'hr', 'preview']
```

### Available Toolbar Items

- `bold` - Bold text (⌘B)
- `italic` - Italic text (⌘I)
- `h1`, `h2`, `h3` - Headings
- `link` - Insert link (⌘K)
- `code` - Inline code
- `codeblock` - Code block
- `ul` - Bullet list
- `ol` - Numbered list
- `quote` - Blockquote
- `hr` - Horizontal rule
- `preview` - Toggle preview

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘B` / `Ctrl+B` | Bold |
| `⌘I` / `Ctrl+I` | Italic |
| `⌘K` / `Ctrl+K` | Insert Link |
| `Tab` | Indent |
| `Shift+Tab` | Outdent |

## Styling

The component uses sensible defaults that work with Tailwind CSS. You can override any styles:

```tsx
<MarkdownEditor
  value={content}
  onChange={setContent}
  className="border-blue-500"
  toolbarClassName="bg-gray-100"
  textareaClassName="text-lg"
  previewClassName="prose-lg"
/>
```

### With Tailwind CSS

The component works great with Tailwind. For the preview area, we recommend using `@tailwindcss/typography`:

```bash
npm install @tailwindcss/typography
```

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT © Peppermint Digital
