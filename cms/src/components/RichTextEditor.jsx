import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useMemo } from "react";

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
  const config = useMemo(
    () => ({
      placeholder: placeholder || "",
      toolbar: {
        items: [
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "link",
          "|",
          "bulletedList",
          "numberedList",
          "|",
          "blockQuote",
          "insertTable",
          "|",
          "undo",
          "redo",
        ],
        shouldNotGroupWhenFull: true,
      },
      heading: {
        options: [
          { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
          { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
          { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
        ],
      },
      link: {
        decorators: {
          openInNewTab: {
            mode: "manual",
            label: "Open in a new tab",
            defaultValue: false,
            attributes: {
              target: "_blank",
              rel: "noopener noreferrer",
            },
          },
        },
      },
      table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
      },
    }),
    [placeholder]
  );

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      {labelHint && (
        <p className="text-xs text-slate-500 px-3 pt-2">{labelHint}</p>
      )}
      <div className="cms-rich-editor px-3 py-2 min-h-[280px]">
        <CKEditor
          editor={ClassicEditor}
          disabled={Boolean(disabled)}
          config={config}
          data={value || ""}
          onChange={(_, editor) => onChange(editor.getData())}
        />
      </div>
    </div>
  );
}
