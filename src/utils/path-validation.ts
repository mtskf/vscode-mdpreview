import * as vscode from 'vscode';
import * as path from 'path';

export function isPathInWorkspace(absolutePath: string, workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined): boolean {
  if (!workspaceFolders) return false;

  return workspaceFolders.some(folder => {
    const relative = path.relative(folder.uri.fsPath, absolutePath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  });
}
