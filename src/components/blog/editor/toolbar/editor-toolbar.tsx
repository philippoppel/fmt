"use client";

import { type Editor } from "@tiptap/react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Save,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkDialog } from "./link-dialog";
import { ImageDialog } from "./image-dialog";

interface EditorToolbarProps {
  editor: Editor;
  onSave?: () => void;
}

export function EditorToolbar({ editor, onSave }: EditorToolbarProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const setLink = useCallback(
    (url: string) => {
      if (!url) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
    [editor]
  );

  const addImage = useCallback(
    (url: string, alt?: string) => {
      if (!url) return;
      editor.chain().focus().setImage({ src: url, alt: alt || "" }).run();
    },
    [editor]
  );

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-muted text-foreground"
      )}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );

  const Separator = () => <div className="w-px h-6 bg-border mx-1" />;

  return (
    <>
      <div className="border-b bg-muted/30 p-1 flex flex-wrap items-center gap-0.5">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Rückgängig (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Wiederholen (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Separator />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Überschrift 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Überschrift 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Überschrift 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator />

        {/* Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Fett (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Kursiv (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Durchgestrichen"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Separator />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Aufzählung"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Nummerierte Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Zitat"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Trennlinie"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Separator />

        {/* Link */}
        {editor.isActive("link") ? (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            isActive
            title="Link entfernen"
          >
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
        ) : (
          <ToolbarButton
            onClick={() => setShowLinkDialog(true)}
            title="Link einfügen"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
        )}

        {/* Image */}
        <ToolbarButton
          onClick={() => setShowImageDialog(true)}
          title="Bild einfügen"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* Save Button (if provided) */}
        {onSave && (
          <>
            <div className="flex-1" />
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onSave}
              className="h-8"
            >
              <Save className="h-4 w-4 mr-1" />
              Speichern
            </Button>
          </>
        )}
      </div>

      {/* Dialogs */}
      <LinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onSubmit={setLink}
        initialUrl={editor.getAttributes("link").href}
      />
      <ImageDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onSubmit={addImage}
      />
    </>
  );
}
