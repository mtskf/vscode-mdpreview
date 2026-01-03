import { describe, it, expect, vi } from 'vitest';
import * as vscode from 'vscode';
import * as path from 'path';
import { isPathInWorkspace } from '../path-validation';

// Mock vscode
vi.mock('vscode', () => ({
  Uri: {
    file: (path: string) => ({ fsPath: path, scheme: 'file' }),
  },
}));

describe('isPathInWorkspace', () => {
  const mockWorkspaceFolders = [
    {
      uri: { fsPath: '/Users/user/workspace' },
      name: 'workspace',
      index: 0
    }
  ] as unknown as vscode.WorkspaceFolder[];

  it('returns true for file inside workspace', () => {
    const filePath = '/Users/user/workspace/style.css';
    expect(isPathInWorkspace(filePath, mockWorkspaceFolders)).toBe(true);
  });

  it('returns true for file in subdirectory', () => {
    const filePath = '/Users/user/workspace/css/style.css';
    expect(isPathInWorkspace(filePath, mockWorkspaceFolders)).toBe(true);
  });

  it('returns false for file outside workspace', () => {
    const filePath = '/Users/user/other/style.css';
    expect(isPathInWorkspace(filePath, mockWorkspaceFolders)).toBe(false);
  });

  it('returns false for parent directory traversal using ..', () => {
    const filePath = '/Users/user/workspace/../secret.txt';
    // isPathInWorkspace expects absolute resolved paths usually,
    // but if we pass a path with .., path.relative might handle it.
    // However, best practice is to resolve it first.
    // Let's assume input is normalized absolute path for this helper.
    // If input is literally '/Users/user/workspace/../secret.txt',
    // path.relative('/Users/user/workspace', '/Users/user/workspace/../secret.txt')
    // -> '../secret.txt' -> startsWith('..') -> false.
    expect(isPathInWorkspace(filePath, mockWorkspaceFolders)).toBe(false);
  });

  it('returns false for similar named directories (prefix match prevention)', () => {
    const filePath = '/Users/user/workspace-backup/style.css';
    expect(isPathInWorkspace(filePath, mockWorkspaceFolders)).toBe(false);
  });

  it('returns false if no workspace folders', () => {
    const filePath = '/Users/user/workspace/style.css';
    expect(isPathInWorkspace(filePath, undefined)).toBe(false);
  });
});
