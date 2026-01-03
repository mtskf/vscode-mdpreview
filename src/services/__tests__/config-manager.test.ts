import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vscode from 'vscode';
import { ConfigManager } from '../config-manager';
import { isPathInWorkspace } from '../../utils/path-validation';



// Mock path-validation
vi.mock('../../utils/path-validation', () => ({
  isPathInWorkspace: vi.fn(),
}));

describe('ConfigManager', () => {
    let configManager: ConfigManager;
    const mockGetConfiguration = vscode.workspace.getConfiguration as any;
    const mockStat = vscode.workspace.fs.stat as any;
    const mockShowWarningMessage = vscode.window.showWarningMessage as any;

    beforeEach(() => {
        vi.clearAllMocks();
        ConfigManager.resetInstance();
        configManager = ConfigManager.getInstance();

        // Default mocks
        mockGetConfiguration.mockReturnValue({
            get: () => [],
        });
        mockStat.mockResolvedValue({}); // File exists by default
        (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/workspace' } }];
        (isPathInWorkspace as any).mockReturnValue(true);
    });

    it('returns empty array if no custom CSS paths are configured', async () => {
        const uris = await configManager.resolveCustomCssUris({ uri: {} } as any);
        expect(uris).toEqual([]);
    });

    it('resolves absolute path in workspace', async () => {
        mockGetConfiguration.mockReturnValue({ get: () => ['/workspace/style.css'] });
        (isPathInWorkspace as any).mockReturnValue(true);

        const uris = await configManager.resolveCustomCssUris({ uri: {} } as any);
        expect(uris).toHaveLength(1);
        expect(uris[0].fsPath).toBe('/workspace/style.css');
    });

    it('rejects absolute path outside workspace', async () => {
        mockGetConfiguration.mockReturnValue({ get: () => ['/outside/style.css'] });
        (isPathInWorkspace as any).mockReturnValue(false);

        const uris = await configManager.resolveCustomCssUris({ uri: {} } as any);
        expect(uris).toHaveLength(0);
        expect(mockShowWarningMessage).toHaveBeenCalledWith(expect.stringContaining('rejected'));
    });

    it('resolves relative path against document workspace', async () => {
        mockGetConfiguration.mockReturnValue({ get: () => ['style.css'] });
        (vscode.workspace.getWorkspaceFolder as any).mockReturnValue({ uri: { fsPath: '/doc-workspace' } });

        const uris = await configManager.resolveCustomCssUris({ uri: {} } as any);
        expect(uris).toHaveLength(1);
        expect(uris[0].fsPath).toBe('/doc-workspace/style.css');
    });

    it('warns if file does not exist', async () => {
        mockGetConfiguration.mockReturnValue({ get: () => ['/workspace/missing.css'] });
        (isPathInWorkspace as any).mockReturnValue(true);
        mockStat.mockRejectedValue(new Error('File not found'));

        const uris = await configManager.resolveCustomCssUris({ uri: {} } as any);
        expect(uris).toHaveLength(0);
        expect(mockShowWarningMessage).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });

    it('rejects relative path escaping workspace', async () => {
        mockGetConfiguration.mockReturnValue({ get: () => ['../outside.css'] });
        (vscode.workspace.getWorkspaceFolder as any).mockReturnValue({ uri: { fsPath: '/workspace/inner' } });
        (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/workspace' } }];
        mockStat.mockResolvedValue({});

        // Mock isPathInWorkspace to reject the resolved path
        (isPathInWorkspace as any).mockImplementation((p: string) => {
            return !p.includes('outside');
        });

        const uris = await configManager.resolveCustomCssUris({ uri: {} } as any);

        // Should be rejected by security check
        expect(uris).toHaveLength(0);
        expect(mockShowWarningMessage).toHaveBeenCalledWith(expect.stringContaining('rejected'));
    });
});
