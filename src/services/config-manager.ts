import * as vscode from 'vscode';
import * as path from 'path';
import { isPathInWorkspace } from '../utils/path-validation';

export class ConfigManager {
  private static instance: ConfigManager;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public static resetInstance(): void {
    ConfigManager.instance = undefined as any;
  }

  public async resolveCustomCssUris(document: vscode.TextDocument): Promise<vscode.Uri[]> {
    const config = vscode.workspace.getConfiguration('antigravity', document.uri);
    const customCssPaths: string[] = config.get('customCss') || [];
    const validUris: vscode.Uri[] = [];
    const docWorkspace = vscode.workspace.getWorkspaceFolder(document.uri);

    for (const cssPath of customCssPaths) {
      let cssUri: vscode.Uri | undefined;

      if (path.isAbsolute(cssPath)) {
        cssUri = vscode.Uri.file(cssPath);
      } else if (docWorkspace) {
        cssUri = vscode.Uri.joinPath(docWorkspace.uri, cssPath);
      } else if (vscode.workspace.workspaceFolders?.[0]) {
        cssUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, cssPath);
      }

      if (cssUri) {
        // Security Check: Ensure the resolved path is inside the workspace
        if (!isPathInWorkspace(cssUri.fsPath, vscode.workspace.workspaceFolders)) {
             vscode.window.showWarningMessage(`Custom CSS rejected (outside workspace): ${cssPath}`);
             continue;
        }

        // Check if file exists
        try {
          await vscode.workspace.fs.stat(cssUri);
          validUris.push(cssUri);
        } catch {
          vscode.window.showWarningMessage(`Custom CSS not found: ${cssPath}`);
        }
      } else {
        vscode.window.showWarningMessage(`Custom CSS skipped (no workspace): ${cssPath}`);
      }
    }
    return validUris;
  }
}
