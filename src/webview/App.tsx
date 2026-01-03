import React, { useState, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toc from './components/Toc';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { WebviewToExtensionMessage, ExtensionToWebviewMessage } from '../shared-types';
import { EditorHandle } from './components/Editor';
import { useDebounce } from './hooks/useDebounce';

declare global {
  interface Window {
    acquireVsCodeApi(): {
      postMessage: (message: WebviewToExtensionMessage) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
  }
}

// Ensure VS Code API exists for local/testing environments.
function getVsCodeApi() {
  if (typeof window.acquireVsCodeApi === 'undefined') {
    window.acquireVsCodeApi = () => ({
      postMessage: (msg: WebviewToExtensionMessage) => console.log('postMessage:', msg),
      getState: () => ({}),
      setState: (state: any) => console.log('setState:', state),
    });
  }
  return window.acquireVsCodeApi();
}

const vscode = getVsCodeApi();

// ...

function App() {
  const [content, setContent] = useState('');
  const [basePath, setBasePath] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorHandle>(null);

  // Track the last content received from extension to avoid echo loops
  const lastRemoteContent = useRef('');

  // Debounce content updates to extension
  const debouncedContent = useDebounce(content, 300);

  // Send updates to extension when debounced content changes
  useEffect(() => {
    // Don't send update if it matches what we just received from extension
    // This also handles the initial render (both empty)
    if (debouncedContent === lastRemoteContent.current) {
        return;
    }

    const msg: WebviewToExtensionMessage = {
      type: 'update',
      text: debouncedContent
    };
    vscode.postMessage(msg);
  }, [debouncedContent]);

  // Handle messages from extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtensionToWebviewMessage>) => {
      const message = event.data;
      if (message.type === 'update') {
        const newText = message.text;
        lastRemoteContent.current = newText;
        setContent(newText);
        if (message.base) {
          setBasePath(message.base);
        }
      } else if (message.type === 'toggle') {
        setIsEditMode(prev => !prev);
      } else if (message.type === 'insert-image') {
        // Insert markdown into editor at cursor
        if (editorRef.current) {
          editorRef.current.insertAtCursor(message.text);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Removed immediate postMessage, handled by useEffect
  };

  const handlePasteImage = async (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
          const base64 = reader.result?.toString().split(',')[1];
          if (base64) {
              const msg: WebviewToExtensionMessage = {
                  type: 'paste-image',
                  data: base64,
                  fileName: file.name
              };
              vscode.postMessage(msg);
          }
      };
      reader.onerror = (error) => {
          console.error('FileReader error:', error);
      };
      reader.readAsDataURL(file);
  };

  const handleTocNavigate = (id: string) => {
    const element = previewRef.current?.querySelector(`#${id}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTaskToggle = (lineIndex: number, checked: boolean) => {
    const lines = content.split('\n');
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      // Replace [ ] with [x] or vice versa
      if (checked) {
        lines[lineIndex] = line.replace(/\[\s\]/, '[x]');
      } else {
        lines[lineIndex] = line.replace(/\[x\]/i, '[ ]');
      }
      const newContent = lines.join('\n');
      setContent(newContent);
      // Debounce effect will handle the update
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground dark">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
          <h1 className="text-sm font-medium opacity-80">Markdown Preview</h1>
          <div className="flex items-center space-x-2">
            <Label htmlFor="mode-toggle" className="text-xs">Preview</Label>
            <Switch
                id="mode-toggle"
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
            />
            <Label htmlFor="mode-toggle" className="text-xs">Edit</Label>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {isEditMode ? (
          <div className="flex-1 overflow-auto">
            <Editor
              ref={editorRef}
              content={content}
              onChange={handleContentChange}
              onPasteImage={handlePasteImage}
            />
          </div>
        ) : (
          <>
            <div ref={previewRef} className="flex-1 overflow-auto">
              <Preview content={content} basePath={basePath} onTaskToggle={handleTaskToggle} />
            </div>
            {content && (
              <div className="hidden lg:block w-64 overflow-auto bg-muted/30">
                <Toc content={content} onNavigate={handleTocNavigate} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
