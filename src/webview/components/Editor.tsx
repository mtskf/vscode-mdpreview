import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import Editor, { OnChange } from '@monaco-editor/react';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  onPasteImage?: (file: File) => void;
}

export interface EditorHandle {
  insertAtCursor: (text: string) => void;
}

const MarkdownEditor = forwardRef<EditorHandle, EditorProps>(({ content, onChange, onPasteImage }, ref) => {
  const editorRef = useRef<any>(null);

  const handleEditorChange: OnChange = (value, _event) => {
    onChange(value || '');
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
      editorRef.current = editor;
      const container = editor.getContainerDomNode();
      container.addEventListener('paste', (event: ClipboardEvent) => {
          const items = event.clipboardData?.items;
          if (items) {
              for (const item of items) {
                  if (item.type.indexOf('image') !== -1) {
                      const file = item.getAsFile();
                      if (file && onPasteImage) {
                          event.preventDefault();
                          onPasteImage(file);
                          return;
                      }
                  }
              }
          }
      });
  };

  useImperativeHandle(ref, () => ({
    insertAtCursor: (text: string) => {
      const editor = editorRef.current;
      if (editor) {
        const selection = editor.getSelection();
        const id = { major: 1, minor: 1 };
        const op = {identifier: id, range: selection, text: text, forceMoveMarkers: true};
        editor.executeEdits("my-source", [op]);
      }
    }
  }));

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      theme="vs-dark"
      value={content}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        wordWrap: 'on',
        padding: { top: 20 },
      }}
    />
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
