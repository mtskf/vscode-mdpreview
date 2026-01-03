import { describe, it, expect } from 'vitest';
import * as vscode from 'vscode';

describe('vscode mock', () => {
  it('creates file and joinPath URIs with toString', () => {
    const fileUri = vscode.Uri.file('/tmp/file.css');
    expect(fileUri.fsPath).toBe('/tmp/file.css');
    expect(fileUri.toString()).toBe('file:///tmp/file.css');

    const joined = vscode.Uri.joinPath(fileUri, 'assets', 'theme.css');
    expect(joined.fsPath).toBe('/tmp/file.css/assets/theme.css');
    expect(joined.toString()).toBe('file:///tmp/file.css/assets/theme.css');
  });
});
