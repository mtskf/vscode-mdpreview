import * as vscode from 'vscode';
import { MarkdownEditorProvider } from './EditorProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(MarkdownEditorProvider.register(context));
  context.subscriptions.push(vscode.commands.registerCommand('antigravity.markdown.toggle', () => {
    MarkdownEditorProvider.toggle();
  }));
}

export function deactivate() {}
