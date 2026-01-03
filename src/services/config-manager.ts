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

  public async resolveCustomCssUris(document: vscode.TextDocument): Promise<vscode.Uri[]> {
    const config = vscode.workspace.getConfiguration('antigravity', document.uri);
    const customCssPaths: string[] = config.get('customCss') || [];
    const validUris: vscode.Uri[] = [];
    const docWorkspace = vscode.workspace.getWorkspaceFolder(document.uri);

    for (const cssPath of customCssPaths) {
      let cssUri: vscode.Uri | undefined;

      if (path.isAbsolute(cssPath)) {
        // Check if absolute path is within any workspace folder
        if (isPathInWorkspace(cssPath, vscode.workspace.workspaceFolders)) {
          cssUri = vscode.Uri.file(cssPath);
        } else {
          vscode.window.showWarningMessage(`Custom CSS rejected (outside workspace): ${cssPath}`);
          continue;
        }
      } else if (docWorkspace) {
        cssUri = vscode.Uri.joinPath(docWorkspace.uri, cssPath);
      } else if (vscode.workspace.workspaceFolders?.[0]) {
        cssUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, cssPath);
      }

      if (cssUri) {
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
