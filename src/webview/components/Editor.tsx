import React from 'react';
import Editor, { OnChange } from '@monaco-editor/react';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<EditorProps> = ({ content, onChange }) => {
  const handleEditorChange: OnChange = (value, _event) => {
    onChange(value || '');
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      theme="vs-dark"
      value={content}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        wordWrap: 'on',
        padding: { top: 20 },
      }}
    />
  );
};

export default MarkdownEditor;
