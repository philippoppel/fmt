"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useCallback, useEffect } from "react";
import { EditorToolbar } from "./toolbar/editor-toolbar";
import { cn } from "@/lib/utils";

interface TipTapEditorProps {
  content?: unknown;
  onChange: (content: unknown) => void;
  onSave?: () => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  autofocus?: boolean;
}

export function TipTapEditor({
  content,
  onChange,
  onSave,
  placeholder = "Schreiben Sie hier oder drücken Sie '/' für Befehle...",
  editable = true,
  className,
  autofocus = false,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 hover:text-primary/80",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:h-0 before:pointer-events-none",
      }),
      CharacterCount,
    ],
    content: content as Parameters<typeof useEditor>[0]["content"],
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-lg dark:prose-invert max-w-none",
          "prose-headings:font-semibold prose-headings:tracking-tight",
          "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
          "prose-p:leading-relaxed",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-blockquote:border-l-primary prose-blockquote:not-italic",
          "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-muted prose-pre:text-foreground",
          "focus:outline-none min-h-[400px] px-4 py-3"
        ),
      },
    },
  });

  // Keyboard shortcut for save
  useEffect(() => {
    if (!editor || !onSave) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, onSave]);

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content && !editor.isFocused) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      if (currentContent !== newContent) {
        editor.commands.setContent(content as Parameters<typeof editor.commands.setContent>[0]);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="border rounded-lg p-4">
        <div className="h-12 bg-muted animate-pulse rounded mb-4" />
        <div className="h-[400px] bg-muted/50 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      <EditorToolbar editor={editor} onSave={onSave} />
      <EditorContent
        editor={editor}
        className="min-h-[400px]"
      />
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between">
        <span>
          {editor.storage.characterCount.words()} Wörter
        </span>
        <span>
          {editor.storage.characterCount.characters()} Zeichen
        </span>
      </div>
    </div>
  );
}

// Export editor type for external use
export type { Editor };
