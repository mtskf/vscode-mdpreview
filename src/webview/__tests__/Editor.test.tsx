import { describe, it, expect, vi } from 'vitest';
import React, { createRef } from 'react';
import { render } from '@testing-library/react';
import Editor, { EditorHandle } from '../components/Editor';

let lastContainer: HTMLElement | null = null;
let disposeHandler: (() => void) | null = null;
let executeEditsMock: ReturnType<typeof vi.fn> | null = null;

vi.mock('@monaco-editor/react', () => {
  const React = require('react');
  return {
    default: ({ onMount }: any) => {
      React.useEffect(() => {
        const container = document.createElement('div');
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        container.addEventListener = addEventListener as unknown as typeof container.addEventListener;
        container.removeEventListener = removeEventListener as unknown as typeof container.removeEventListener;

        executeEditsMock = vi.fn();
        lastContainer = container;
        disposeHandler = null;

        const mockEditor = {
          getContainerDomNode: () => container,
          getSelection: () => null,
          executeEdits: executeEditsMock,
          onDidDispose: (cb: () => void) => {
            disposeHandler = cb;
          },
        };

        if (onMount) {
          onMount(mockEditor, {});
        }
      }, [onMount]);

      return <div />;
    },
  };
});

describe('Editor Component', () => {
  it('removes paste listener on dispose', () => {
    render(<Editor content="" onChange={vi.fn()} />);

    expect(lastContainer).not.toBeNull();
    expect(disposeHandler).not.toBeNull();

    disposeHandler?.();

    expect(lastContainer?.removeEventListener).toHaveBeenCalledWith(
      'paste',
      expect.any(Function)
    );
  });

  it('does not execute edits when selection is null', () => {
    const ref = createRef<EditorHandle>();
    render(<Editor ref={ref} content="" onChange={vi.fn()} />);

    ref.current?.insertAtCursor('test');

    expect(executeEditsMock).not.toHaveBeenCalled();
  });

  it('handles paste events correctly', () => {
    const onPasteImage = vi.fn();
    render(<Editor content="" onChange={vi.fn()} onPasteImage={onPasteImage} />);

    // Get the paste handler registered
    const addListenerMock = lastContainer!.addEventListener as unknown as ReturnType<typeof vi.fn>;
    const pasteCall = addListenerMock.mock.calls.find((call) => call[0] === 'paste');
    expect(pasteCall).toBeDefined();
    const pasteHandler = pasteCall![1] as EventListener;

    // Test 1: Paste with no items
    const eventNoItems = { clipboardData: { items: [] }, preventDefault: vi.fn() } as unknown as ClipboardEvent;
    pasteHandler(eventNoItems);
    expect(onPasteImage).not.toHaveBeenCalled();

    // Test 2: Paste with non-image item
    const eventText = {
        clipboardData: {
            items: [{ type: 'text/plain', getAsFile: () => null }]
        },
        preventDefault: vi.fn()
    } as unknown as ClipboardEvent;
    pasteHandler(eventText);
    expect(onPasteImage).not.toHaveBeenCalled();

    // Test 3: Paste with image
    const file = new File([''], 'test.png', { type: 'image/png' });
    const eventImage = {
        clipboardData: {
            items: [{ type: 'image/png', getAsFile: () => file }]
        },
        preventDefault: vi.fn()
    } as unknown as ClipboardEvent;
    pasteHandler(eventImage);
    expect(eventImage.preventDefault).toHaveBeenCalled();
    expect(onPasteImage).toHaveBeenCalledWith(file);
  });
});
