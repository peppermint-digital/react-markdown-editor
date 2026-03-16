# @peppermint-digital/react-markdown-editor

A customizable Markdown editor component for React with toolbar, keyboard shortcuts, and live preview. **Built for shadcn/ui projects** but works anywhere.

## Features

- 📝 **Full Toolbar** - Bold, Italic, Headings, Links, Code, Lists, Tables, Checklists, Images
- ⌨️ **Keyboard Shortcuts** - ⌘B bold, ⌘I italic, ⌘K link
- 👁️ **Live Preview** - Split-view or toggle mode with GFM support
- 🎨 **shadcn/ui Compatible** - Uses CSS variables, works out of the box
- 📸 **Image Support** - Upload, paste, or drag & drop images
- ✅ **GFM Support** - Tables, checklists, strikethrough via remark-gfm
- 🌙 **Dark Mode** - Automatic support
- 🔧 **TypeScript** - Full type support

## Installation

```bash
npm install @peppermint-digital/react-markdown-editor
```

### Peer Dependencies

```bash
npm install react react-dom react-markdown remark-gfm lucide-react
```

## Usage

### Basic Usage

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

### With Image Upload

```tsx
import { MarkdownEditor } from '@peppermint-digital/react-markdown-editor';

function MyComponent() {
  const [content, setContent] = useState('');

  const handleImageUpload = async (file: File): Promise<string> => {
    // Upload to your backend/S3/etc.
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const { url } = await response.json();
    return url;
  };

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      onImageUpload={handleImageUpload}
      preview="split"
    />
  );
}
```

### shadcn/ui Integration

The editor automatically uses shadcn/ui CSS variables when `variant="shadcn"` (default):

```tsx
<MarkdownEditor
  value={content}
  onChange={setContent}
  variant="shadcn"  // Uses --background, --border, --accent, etc.
/>
```

For non-shadcn projects, use `variant="default"` for built-in styles:

```tsx
<MarkdownEditor
  value={content}
  onChange={setContent}
  variant="default"
/>
```

### Custom Styling

Override any part with className props:

```tsx
<MarkdownEditor
  value={content}
  onChange={setContent}
  className="border-2 border-blue-500"
  toolbarClassName="bg-blue-50"
  buttonClassName="hover:bg-blue-100"
  textareaClassName="text-lg"
  previewClassName="prose-lg"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Current markdown content |
| `onChange` | `(value: string) => void` | required | Callback when content changes |
| `placeholder` | `string` | `'Write here...'` | Placeholder text |
| `className` | `string` | - | Container classes |
| `minHeight` | `string` | `'150px'` | Minimum editor height |
| `preview` | `boolean \| 'split'` | `false` | Preview mode |
| `disabled` | `boolean` | `false` | Disable editor |
| `toolbar` | `ToolbarItem[]` | See below | Toolbar items |
| `variant` | `'shadcn' \| 'default'` | `'shadcn'` | Styling variant |
| `onImageUpload` | `(file: File) => Promise<string>` | - | Image upload handler |
| `toolbarClassName` | `string` | - | Toolbar classes |
| `textareaClassName` | `string` | - | Textarea classes |
| `previewClassName` | `string` | - | Preview area classes |
| `buttonClassName` | `string` | - | Toolbar button classes |
| `buttonActiveClassName` | `string` | - | Active button classes |

### Default Toolbar

```ts
['bold', 'italic', 'h2', 'h3', 'link', 'code', 'codeblock', 'ul', 'ol', 'checklist', 'quote', 'table', 'image', 'hr', 'preview']
```

### Available Toolbar Items

| Item | Description | Shortcut |
|------|-------------|----------|
| `bold` | Bold text | ⌘B |
| `italic` | Italic text | ⌘I |
| `h1`, `h2`, `h3` | Headings | - |
| `link` | Insert link | ⌘K |
| `code` | Inline code | - |
| `codeblock` | Code block | - |
| `ul` | Bullet list | - |
| `ol` | Numbered list | - |
| `checklist` | Task list `- [ ]` | - |
| `quote` | Blockquote | - |
| `table` | Insert table | - |
| `image` | Insert/upload image | - |
| `hr` | Horizontal rule | - |
| `preview` | Toggle preview | - |

## Image Handling

The editor supports three ways to add images:

1. **Toolbar button** - Click the image icon
2. **Paste** - Paste an image from clipboard (Ctrl/⌘+V)
3. **Drag & Drop** - Drag an image file onto the editor

When `onImageUpload` is provided, images are uploaded automatically. Without it, a placeholder is inserted.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘B` / `Ctrl+B` | Bold |
| `⌘I` / `Ctrl+I` | Italic |
| `⌘K` / `Ctrl+K` | Insert Link |
| `Tab` | Indent |
| `Shift+Tab` | Outdent |

## GFM Support

The editor uses `remark-gfm` for GitHub Flavored Markdown:

- ✅ Tables
- ✅ Task lists / Checklists
- ✅ Strikethrough (`~~text~~`)
- ✅ Autolinks

## Tailwind CSS Typography

For the best preview rendering, install `@tailwindcss/typography`:

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
npm install
npm run build
npm run dev  # Watch mode
```

## License

MIT © Peppermint Digital
