import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect, useCallback, useRef } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare,
  Quote, Code, Code2,
  Link as LinkIcon, Unlink,
  Undo2, Redo2,
  Minus, Highlighter, AlignLeft,
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const ToolbarButton = ({ onClick, active, title, children, disabled }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      disabled={disabled}
      className={`toolbar-btn ${active ? 'active' : ''}`}
      title={title}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
  );

  return (
    <div className="flex items-center flex-wrap gap-0.5 p-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={15} />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={15} />
      </ToolbarButton>

      <Divider />

      {/* Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter size={15} />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive('taskList')}
        title="Task List"
      >
        <CheckSquare size={15} />
      </ToolbarButton>

      <Divider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Inline Code"
      >
        <Code size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <Code2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={15} />
      </ToolbarButton>

      <Divider />

      {/* Link */}
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive('link')}
        title="Add Link"
      >
        <LinkIcon size={15} />
      </ToolbarButton>
      {editor.isActive('link') && (
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove Link"
        >
          <Unlink size={15} />
        </ToolbarButton>
      )}

      {/* Word count */}
      <div className="ml-auto flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 pr-1 shrink-0">
        <span>{editor.storage.characterCount.words()} words</span>
        <span>{editor.storage.characterCount.characters()} chars</span>
      </div>
    </div>
  );
};

const Editor = ({
  content,
  onChange,
  onTyping,
  editable = true,
  placeholder = 'Start writing your document...',
}) => {
  const isRemoteUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100 },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Highlight.configure({ multicolor: false }),
      TextStyle,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      if (isRemoteUpdate.current) return;
      const html = editor.getHTML();
      onChange?.(html, {
        words: editor.storage.characterCount.words(),
        characters: editor.storage.characterCount.characters(),
      });
      onTyping?.(true);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
        spellcheck: 'true',
      },
    },
  });

  // Update content when remote changes arrive
  useEffect(() => {
    if (!editor || !content) return;
    const currentContent = editor.getHTML();
    if (content !== currentContent) {
      isRemoteUpdate.current = true;
      editor.commands.setContent(content, false);
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {editable && <MenuBar editor={editor} />}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
