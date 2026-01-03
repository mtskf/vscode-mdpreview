import { vi } from 'vitest';

export const Uri = {
  file: (path: string) => ({ fsPath: path, scheme: 'file', toString: () => `file://${path}` }),
  joinPath: (uri: any, ...segments: string[]) => ({
    fsPath: [uri.fsPath, ...segments].join('/'),
    scheme: 'file',
    toString: () => `file://${[uri.fsPath, ...segments].join('/')}`
  }),
};

export const workspace = {
  getConfiguration: vi.fn(),
  getWorkspaceFolder: vi.fn(),
  fs: {
    stat: vi.fn(),
  },
  workspaceFolders: [],
};

export const window = {
  showWarningMessage: vi.fn(),
};
