import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKitExt from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import PlaceholderExt from "@tiptap/extension-placeholder";
import UnderlineExt from "@tiptap/extension-underline";

/**
 * WYSIWYG body editor — Hindi / English newsroom style (TipTap).
 */
export default function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder,
  labelHint,
}) {
  const editor = useEditor({
    extensions: [
      StarterKitExt.configure({
        heading: { levels: [2, 3] },
      }),
      UnderlineExt,
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      PlaceholderExt.configure({
        placeholder: placeholder || "",
      }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || disabled === undefined) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const html = value || "";
    const cur = editor.getHTML();
    if (html === cur) return;
    if ((html || "").trim() === "" && (cur === "<p></p>" || cur === "")) return;
    editor.commands.setContent(html, false);
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[280px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      {!disabled && (
        <div className="flex flex-wrap gap-1 px-2 py-2 border-b border-slate-100 bg-slate-50/80">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            B
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            I
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            U
          </ToolbarBtn>
          <span className="w-px h-6 bg-slate-200 mx-1 self-center" />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            H2
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            •
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            1.
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => {
              const prev = window.prompt("Link URL");
              if (prev == null) return;
              const url = String(prev).trim();
              if (!url) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              editor.chain().focus().setLink({ href: url }).run();
            }}
          >
            Link
          </ToolbarBtn>
        </div>
      )}
      {labelHint && (
        <p className="text-xs text-slate-500 px-3 pt-2">{labelHint}</p>
      )}
      <EditorContent
        editor={editor}
        className="cms-rich-editor px-3 py-3 min-h-[280px] focus-within:outline-none [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:leading-relaxed [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold"
      />
    </div>
  );
}

function ToolbarBtn({ children, onClick, active }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${
        active
          ? "bg-brand text-white border-brand"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
